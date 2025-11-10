from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
from database import User, UserSession, SessionLocal
from typing import Optional

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_session_token(user_id: int, db: Session) -> str:
    """Create a new session token for a user"""
    # Generate a secure random token
    token = secrets.token_urlsafe(32)
    
    # Set expiration time (24 hours from now)
    expires_at = datetime.utcnow() + timedelta(hours=24)
    
    # Create session record
    session = UserSession(
        user_id=user_id,
        session_token=token,
        expires_at=expires_at
    )
    
    db.add(session)
    db.commit()
    
    return token

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get the current authenticated user from session token"""
    token = credentials.credentials
    
    # Find active session
    session = db.query(UserSession).filter(
        UserSession.session_token == token,
        UserSession.is_active.is_(True),
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Get user
    user = db.query(User).filter(User.id == session.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

def invalidate_session(token: str, db: Session) -> bool:
    """Invalidate a session token"""
    session = db.query(UserSession).filter(
        UserSession.session_token == token,
        UserSession.is_active.is_(True)
    ).first()
    
    if session:
        session.is_active = False  # type: ignore[assignment]
        db.commit()
        return True
    
    return False

def cleanup_expired_sessions(db: Session):
    """Clean up expired sessions"""
    expired_sessions = db.query(UserSession).filter(
        UserSession.expires_at < datetime.utcnow()
    ).all()
    
    for session in expired_sessions:
        session.is_active = False  # type: ignore[assignment]
    
    db.commit()
    return len(expired_sessions)