from flask import Flask
from flask_cors import CORS
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base

from config import Config

Base = declarative_base()
engine = None
SessionLocal = None

def create_app():
    global engine, SessionLocal
    
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'], echo=False)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    from app import models
    Base.metadata.create_all(bind=engine)
    
    from app.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    @app.route('/api/health')
    def health_check():
        return {'status': 'ok', 'message': '冻土监测API服务运行正常'}
    
    return app
