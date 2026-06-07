import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Date, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship

from app import Base

def generate_uuid():
    return str(uuid.uuid4())

class Profile(Base):
    __tablename__ = 'profile'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_no = Column(String(50), unique=True, nullable=False)
    altitude = Column(Integer, nullable=False)
    aspect = Column(String(20), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    samples = relationship('Sample', back_populates='profile', cascade='all, delete-orphan')
    
    __table_args__ = (
        Index('idx_aspect', 'aspect'),
        Index('idx_altitude', 'altitude'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileNo': self.profile_no,
            'altitude': self.altitude,
            'aspect': self.aspect,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }

class Sample(Base):
    __tablename__ = 'sample'
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    profile_no = Column(String(50), ForeignKey('profile.profile_no', ondelete='CASCADE'), nullable=False)
    sample_date = Column(Date, nullable=False)
    active_layer_thickness = Column(Float, nullable=False)
    temp_20cm = Column(Float, nullable=False)
    temp_50cm = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    profile = relationship('Profile', back_populates='samples')
    
    __table_args__ = (
        Index('idx_profile_date', 'profile_no', 'sample_date'),
        Index('idx_sample_date', 'sample_date'),
    )
    
    def to_dict(self):
        return {
            'id': self.id,
            'profileNo': self.profile_no,
            'sampleDate': self.sample_date.isoformat() if self.sample_date else None,
            'activeLayerThickness': self.active_layer_thickness,
            'temp20cm': self.temp_20cm,
            'temp50cm': self.temp_50cm,
            'createdAt': self.created_at.isoformat() if self.created_at else None
        }
