from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import os

from database import get_db
import models

# ── Configuration ────────────────────────────────────────────────
SECRET_KEY = "moneta-bank-super-secret-key-123" # Change in production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 2 # 2 days

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/token")

# ── Password Helpers ─────────────────────────────────────────────
def verify_password(plain_password, hashed_password):
    # Truncate to 72 characters to avoid passlib/bcrypt bug on some systems
    return pwd_context.verify(plain_password[:72], hashed_password)

def get_password_hash(password):
    # Truncate to 72 characters to avoid passlib/bcrypt bug on some systems
    return pwd_context.hash(password[:72])

# ── Token Helpers ────────────────────────────────────────────────
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# ── Dependencies ─────────────────────────────────────────────────
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    # Diagnostic logging
    # print(f"[DEBUG-AUTH] Received Token: {token[:10]}...")
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            print("[DEBUG-AUTH] No 'sub' in payload")
            raise credentials_exception
    except JWTError as e:
        print(f"[DEBUG-AUTH] JWT Decode Error: {e}")
        raise credentials_exception
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        print(f"[DEBUG-AUTH] User not found for email: {email}")
        raise credentials_exception
    return user
