from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import hashlib
import base64
import bcrypt
from app.config import settings

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # 1. Try verifying with SHA-256 pre-hashing (digest -> base64)
    try:
        digest = hashlib.sha256(plain_password.encode('utf-8')).digest()
        password_hash_b64 = base64.b64encode(digest)
        if bcrypt.checkpw(password_hash_b64, hashed_password.encode('utf-8')):
            return True
    except Exception:
        pass
        
    # 2. Fallback: Try verifying raw password (legacy support)
    try:
        # Ensure we catch potential length errors here too for legacy long passwords
        if bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8')):
            return True
    except ValueError:
        # "password too long" or other bcrypt errors
        pass
    except Exception:
        pass
        
    return False

def get_password_hash(password: str) -> str:
    # Always pre-hash to avoid bcrypt's 72-byte limit
    digest = hashlib.sha256(password.encode('utf-8')).digest()
    password_hash_b64 = base64.b64encode(digest)
    # Generate bcrypt hash (returns bytes, need to decode for storage)
    return bcrypt.hashpw(password_hash_b64, bcrypt.gensalt()).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta if expires_delta else timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    return encoded_jwt

def verify_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        email = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        return None

