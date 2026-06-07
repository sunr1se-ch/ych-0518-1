import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from app.services import ImportExportService

app = create_app()

def init_seed_data():
    from app import SessionLocal
    db = SessionLocal()
    try:
        service = ImportExportService(db)
        service.import_seed_data()
        print("种子数据导入完成")
    except Exception as e:
        print(f"种子数据导入异常: {e}")
    finally:
        db.close()

if __name__ == '__main__':
    init_seed_data()
    app.run(host='127.0.0.1', port=5001, debug=True)
