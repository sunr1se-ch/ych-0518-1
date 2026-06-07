from datetime import date
from flask import Blueprint, request, jsonify, send_file
from sqlalchemy import func
from dateutil import parser as date_parser
import io

from app import SessionLocal
from app.models import Profile, Sample
from app.schemas import FilterParams
from app.services import StatisticsService, NeighborService, ImportExportService

api_bp = Blueprint('api', __name__)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def parse_filter_params() -> FilterParams:
    aspects = request.args.getlist('aspects')
    start_date_str = request.args.get('startDate')
    end_date_str = request.args.get('endDate')
    
    start_date = None
    end_date = None
    
    if start_date_str:
        try:
            start_date = date_parser.parse(start_date_str).date()
        except (ValueError, TypeError):
            pass
    
    if end_date_str:
        try:
            end_date = date_parser.parse(end_date_str).date()
        except (ValueError, TypeError):
            pass
    
    return FilterParams(
        aspects=aspects if aspects else None,
        start_date=start_date,
        end_date=end_date
    )

@api_bp.route('/profiles', methods=['GET'])
def get_profiles():
    db = next(get_db())
    params = parse_filter_params()
    
    query = db.query(Profile)
    if params.aspects:
        query = query.filter(Profile.aspect.in_(params.aspects))
    
    profiles = query.order_by(Profile.aspect, Profile.altitude).all()
    return jsonify({
        'code': 200,
        'data': [p.to_dict() for p in profiles]
    })

@api_bp.route('/aspects', methods=['GET'])
def get_aspects():
    db = next(get_db())
    aspects = db.query(Profile.aspect).distinct().order_by(Profile.aspect).all()
    return jsonify({
        'code': 200,
        'data': [a[0] for a in aspects]
    })

@api_bp.route('/date-range', methods=['GET'])
def get_date_range():
    db = next(get_db())
    result = db.query(
        func.min(Sample.sample_date),
        func.max(Sample.sample_date)
    ).first()
    
    min_date = result[0].isoformat() if result[0] else None
    max_date = result[1].isoformat() if result[1] else None
    
    return jsonify({
        'code': 200,
        'data': {
            'minDate': min_date,
            'maxDate': max_date
        }
    })

@api_bp.route('/samples', methods=['GET'])
def get_samples():
    db = next(get_db())
    params = parse_filter_params()
    
    query = db.query(Sample).join(Profile, Sample.profile_no == Profile.profile_no)
    
    conditions = []
    if params.aspects:
        conditions.append(Profile.aspect.in_(params.aspects))
    if params.start_date:
        conditions.append(Sample.sample_date >= params.start_date)
    if params.end_date:
        conditions.append(Sample.sample_date <= params.end_date)
    
    if conditions:
        from sqlalchemy import and_
        query = query.filter(and_(*conditions))
    
    samples = query.order_by(Sample.sample_date, Sample.profile_no).all()
    return jsonify({
        'code': 200,
        'data': [s.to_dict() for s in samples]
    })

@api_bp.route('/statistics/daily', methods=['GET'])
def get_daily_statistics():
    db = next(get_db())
    params = parse_filter_params()
    
    service = StatisticsService(db)
    profile_stats, daily_data = service.get_daily_stats(params)
    
    return jsonify({
        'code': 200,
        'data': {
            'profileStats': [ps.to_dict() for ps in profile_stats],
            'dailyData': [ds.to_dict() for ds in daily_data]
        }
    })

@api_bp.route('/statistics/neighbor-diff', methods=['GET'])
def get_neighbor_diff():
    db = next(get_db())
    params = parse_filter_params()
    
    service = NeighborService(db)
    diffs = service.get_neighbor_diffs(params)
    
    return jsonify({
        'code': 200,
        'data': [d.to_dict() for d in diffs]
    })

@api_bp.route('/statistics/summary', methods=['GET'])
def get_summary():
    db = next(get_db())
    params = parse_filter_params()
    
    stats_service = StatisticsService(db)
    profile_stats, _ = stats_service.get_daily_stats(params)
    
    if not profile_stats:
        return jsonify({
            'code': 200,
            'data': {
                'profileCount': 0,
                'avgThickness': 0,
                'avgTempDiff': 0,
                'totalSamples': 0
            }
        })
    
    total_samples = sum(ps.sample_count for ps in profile_stats)
    avg_thickness = sum(ps.period_avg_thickness for ps in profile_stats) / len(profile_stats)
    avg_temp_diff = sum(ps.period_avg_temp_diff for ps in profile_stats) / len(profile_stats)
    
    return jsonify({
        'code': 200,
        'data': {
            'profileCount': len(profile_stats),
            'avgThickness': round(avg_thickness, 2),
            'avgTempDiff': round(avg_temp_diff, 2),
            'totalSamples': total_samples
        }
    })

@api_bp.route('/samples/import', methods=['POST'])
def import_samples():
    db = next(get_db())
    
    if 'file' not in request.files:
        return jsonify({
            'code': 400,
            'message': '未找到上传文件'
        }), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({
            'code': 400,
            'message': '未选择文件'
        }), 400
    
    content = file.read()
    service = ImportExportService(db)
    result = service.import_samples_from_file(content, file.filename)
    
    return jsonify({
        'code': 200,
        'data': result.to_dict()
    })

@api_bp.route('/export', methods=['GET'])
def export_data():
    db = next(get_db())
    params = parse_filter_params()
    
    service = ImportExportService(db)
    filename, content = service.export_data(params)
    
    return send_file(
        io.BytesIO(content),
        mimetype='text/csv; charset=utf-8-sig',
        as_attachment=True,
        download_name=filename
    )
