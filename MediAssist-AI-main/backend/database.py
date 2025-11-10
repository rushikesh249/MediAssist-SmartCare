from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import hashlib
import secrets

# Create the database engine. This will create a file named "mediassist.db"
SQLALCHEMY_DATABASE_URL = "sqlite:///./mediassist.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)

# A base class for our models
Base = declarative_base()

# The database session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# User model for authentication and data ownership
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_type = Column(String, default="patient")  # 'patient' or 'doctor'
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationship with submissions
    submissions = relationship("Submission", back_populates="user")
    
    def set_password(self, password: str):
        """Hash and set password"""
        salt = secrets.token_hex(32)
        self.password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex() + ':' + salt
    
    def check_password(self, password: str) -> bool:
        """Check if provided password matches stored hash"""
        try:
            stored_hash, salt = self.password_hash.split(':')
            password_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000).hex()
            return password_hash == stored_hash
        except:
            return False

# Enhanced submission model with user ownership
class Submission(Base):
    __tablename__ = "submissions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Link to user
    type = Column(String, index=True)  # 'audio' or 'prescription'
    transcribed_text = Column(Text)
    doctor_summary = Column(Text)
    extracted_text = Column(Text)
    patient_instructions = Column(Text)
    status = Column(String, default="pending")  # Add a new status field
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship with user
    user = relationship("User", back_populates="submissions")

# Session model for user authentication
class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_token = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)

# Function to create the database tables
def create_db_and_tables():
    Base.metadata.create_all(bind=engine)