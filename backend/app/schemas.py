from datetime import date
from typing import List, Optional
from dataclasses import dataclass

@dataclass
class FilterParams:
    aspects: Optional[List[str]] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None

@dataclass
class DailyStatsItem:
    profile_no: str
    date: date
    avg_thickness: float
    avg_temp_diff: float
    
    def to_dict(self):
        return {
            'profileNo': self.profile_no,
            'date': self.date.isoformat(),
            'avgThickness': round(self.avg_thickness, 2),
            'avgTempDiff': round(self.avg_temp_diff, 2)
        }

@dataclass
class ProfileStatsItem:
    profile_no: str
    aspect: str
    altitude: int
    period_avg_thickness: float
    period_avg_temp_diff: float
    sample_count: int
    
    def to_dict(self):
        return {
            'profileNo': self.profile_no,
            'aspect': self.aspect,
            'altitude': self.altitude,
            'periodAvgThickness': round(self.period_avg_thickness, 2),
            'periodAvgTempDiff': round(self.period_avg_temp_diff, 2),
            'sampleCount': self.sample_count
        }

@dataclass
class NeighborDiffItem:
    profile_no1: str
    profile_no2: str
    aspect: str
    altitude_diff: int
    thickness_diff: float
    altitude1: int
    altitude2: int
    thickness1: float
    thickness2: float
    
    def to_dict(self):
        return {
            'profileNo1': self.profile_no1,
            'profileNo2': self.profile_no2,
            'aspect': self.aspect,
            'altitudeDiff': self.altitude_diff,
            'thicknessDiff': round(self.thickness_diff, 2),
            'altitude1': self.altitude1,
            'altitude2': self.altitude2,
            'thickness1': round(self.thickness1, 2),
            'thickness2': round(self.thickness2, 2)
        }

@dataclass
class ImportResult:
    success: int
    failed: int
    errors: List[str]
    
    def to_dict(self):
        return {
            'success': self.success,
            'failed': self.failed,
            'errors': self.errors
        }
