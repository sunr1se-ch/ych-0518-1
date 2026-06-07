import os
import csv
import io
from datetime import date
from typing import List, Tuple, Dict, Optional
from collections import defaultdict

import pandas as pd
from sqlalchemy import and_
from dateutil import parser as date_parser

from app.models import Profile, Sample
from app.schemas import (
    FilterParams,
    DailyStatsItem,
    ProfileStatsItem,
    NeighborDiffItem,
    ImportResult
)

SEED_DATA_DIR = os.path.join(os.path.dirname(__file__), 'seed_data')

class StatisticsService:
    def __init__(self, db):
        self.db = db

    def _build_query(self, params: FilterParams):
        query = self.db.query(Sample).join(Profile, Sample.profile_no == Profile.profile_no)
        
        conditions = []
        if params.aspects:
            conditions.append(Profile.aspect.in_(params.aspects))
        if params.start_date:
            conditions.append(Sample.sample_date >= params.start_date)
        if params.end_date:
            conditions.append(Sample.sample_date <= params.end_date)
        
        if conditions:
            query = query.filter(and_(*conditions))
        
        return query

    def get_daily_stats(self, params: FilterParams) -> Tuple[List[ProfileStatsItem], List[DailyStatsItem]]:
        query = self._build_query(params)
        samples = query.all()
        
        if not samples:
            return [], []
        
        data = []
        for s in samples:
            data.append({
                'profile_no': s.profile_no,
                'aspect': s.profile.aspect,
                'altitude': s.profile.altitude,
                'sample_date': s.sample_date,
                'active_layer_thickness': s.active_layer_thickness,
                'temp_diff': s.temp_50cm - s.temp_20cm
            })
        
        df = pd.DataFrame(data)
        
        daily_grouped = df.groupby(['profile_no', 'aspect', 'altitude', 'sample_date']).agg({
            'active_layer_thickness': 'mean',
            'temp_diff': 'mean'
        }).reset_index()
        
        daily_stats = []
        for _, row in daily_grouped.iterrows():
            daily_stats.append(DailyStatsItem(
                profile_no=row['profile_no'],
                date=row['sample_date'],
                avg_thickness=row['active_layer_thickness'],
                avg_temp_diff=row['temp_diff']
            ))
        
        profile_grouped = df.groupby(['profile_no', 'aspect', 'altitude']).agg({
            'active_layer_thickness': 'mean',
            'temp_diff': 'mean',
            'sample_date': 'count'
        }).reset_index()
        
        profile_stats = []
        for _, row in profile_grouped.iterrows():
            profile_stats.append(ProfileStatsItem(
                profile_no=row['profile_no'],
                aspect=row['aspect'],
                altitude=row['altitude'],
                period_avg_thickness=row['active_layer_thickness'],
                period_avg_temp_diff=row['temp_diff'],
                sample_count=row['sample_date']
            ))
        
        return profile_stats, daily_stats

class NeighborService:
    def __init__(self, db):
        self.db = db
        self.stats_service = StatisticsService(db)

    def get_neighbor_diffs(self, params: FilterParams) -> List[NeighborDiffItem]:
        profile_stats, _ = self.stats_service.get_daily_stats(params)
        
        if not profile_stats:
            return []
        
        aspect_groups: Dict[str, List[ProfileStatsItem]] = defaultdict(list)
        for ps in profile_stats:
            aspect_groups[ps.aspect].append(ps)
        
        result = []
        for aspect, profiles in aspect_groups.items():
            sorted_profiles = sorted(profiles, key=lambda x: x.altitude)
            
            for i in range(len(sorted_profiles) - 1):
                p1 = sorted_profiles[i]
                p2 = sorted_profiles[i + 1]
                
                result.append(NeighborDiffItem(
                    profile_no1=p1.profile_no,
                    profile_no2=p2.profile_no,
                    aspect=aspect,
                    altitude_diff=p2.altitude - p1.altitude,
                    thickness_diff=p2.period_avg_thickness - p1.period_avg_thickness,
                    altitude1=p1.altitude,
                    altitude2=p2.altitude,
                    thickness1=p1.period_avg_thickness,
                    thickness2=p2.period_avg_thickness
                ))
        
        return result

class ImportExportService:
    def __init__(self, db):
        self.db = db

    def import_seed_data(self):
        existing_profiles = self.db.query(Profile).count()
        if existing_profiles > 0:
            return
        
        profiles_file = os.path.join(SEED_DATA_DIR, 'profiles.csv')
        if os.path.exists(profiles_file):
            self._import_profiles_from_csv(profiles_file)
        
        samples_file = os.path.join(SEED_DATA_DIR, 'samples.csv')
        if os.path.exists(samples_file):
            self._import_samples_from_csv(samples_file)
        
        self.db.commit()

    def _import_profiles_from_csv(self, filepath: str):
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                profile = Profile(
                    profile_no=row['profile_no'],
                    altitude=int(row['altitude']),
                    aspect=row['aspect']
                )
                self.db.add(profile)

    def _import_samples_from_csv(self, filepath: str):
        with open(filepath, 'r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            for row in reader:
                sample = Sample(
                    profile_no=row['profile_no'],
                    sample_date=date_parser.parse(row['sample_date']).date(),
                    active_layer_thickness=float(row['active_layer_thickness']),
                    temp_20cm=float(row['temp_20cm']),
                    temp_50cm=float(row['temp_50cm'])
                )
                self.db.add(sample)

    def import_samples_from_file(self, file_content: bytes, filename: str) -> ImportResult:
        success = 0
        failed = 0
        errors = []
        
        try:
            content = file_content.decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(content))
            
            existing_profile_nos = {p.profile_no for p in self.db.query(Profile.profile_no).all()}
            
            for i, row in enumerate(reader, start=2):
                try:
                    profile_no = row.get('profile_no', '').strip()
                    if not profile_no:
                        errors.append(f"第{i}行: 缺少剖面号")
                        failed += 1
                        continue
                    
                    if profile_no not in existing_profile_nos:
                        errors.append(f"第{i}行: 剖面号 {profile_no} 不存在")
                        failed += 1
                        continue
                    
                    sample_date = date_parser.parse(row['sample_date']).date()
                    
                    sample = Sample(
                        profile_no=profile_no,
                        sample_date=sample_date,
                        active_layer_thickness=float(row['active_layer_thickness']),
                        temp_20cm=float(row['temp_20cm']),
                        temp_50cm=float(row['temp_50cm'])
                    )
                    self.db.add(sample)
                    success += 1
                except Exception as e:
                    errors.append(f"第{i}行: {str(e)}")
                    failed += 1
            
            self.db.commit()
        except Exception as e:
            errors.append(f"文件解析失败: {str(e)}")
        
        return ImportResult(success=success, failed=failed, errors=errors)

    def export_data(self, params: FilterParams) -> Tuple[str, bytes]:
        stats_service = StatisticsService(self.db)
        profile_stats, daily_stats = stats_service.get_daily_stats(params)
        neighbor_diffs = NeighborService(self.db).get_neighbor_diffs(params)
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        writer.writerow(['=== 剖面统计汇总 ==='])
        writer.writerow(['剖面号', '坡向', '海拔(米)', '平均厚度(cm)', '平均温差(℃)', '采样数'])
        for ps in profile_stats:
            writer.writerow([
                ps.profile_no, ps.aspect, ps.altitude,
                round(ps.period_avg_thickness, 2),
                round(ps.period_avg_temp_diff, 2),
                ps.sample_count
            ])
        
        writer.writerow([])
        writer.writerow(['=== 日均值统计 ==='])
        writer.writerow(['剖面号', '日期', '日平均厚度(cm)', '日平均温差(℃)'])
        for ds in daily_stats:
            writer.writerow([
                ds.profile_no, ds.date.isoformat(),
                round(ds.avg_thickness, 2),
                round(ds.avg_temp_diff, 2)
            ])
        
        writer.writerow([])
        writer.writerow(['=== 邻剖面厚度差值 ==='])
        writer.writerow(['剖面1', '剖面2', '坡向', '海拔差(米)', '厚度差(cm)', '剖面1厚度', '剖面2厚度'])
        for nd in neighbor_diffs:
            writer.writerow([
                nd.profile_no1, nd.profile_no2, nd.aspect,
                nd.altitude_diff, round(nd.thickness_diff, 2),
                round(nd.thickness1, 2), round(nd.thickness2, 2)
            ])
        
        filename = f"冻土分析结果_{date.today().isoformat()}.csv"
        return filename, output.getvalue().encode('utf-8-sig')
