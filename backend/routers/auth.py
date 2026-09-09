import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.database import get_db, User
from backend.models import UserRegister, UserLogin, TokenResponse, UserProfileResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str):
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str):
    return pwd_context.verify(plain_password, hashed_password)

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter((User.username == data.username) | (User.email == data.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=data.username,
        email=data.email,
        hashed_password=get_password_hash(data.password),
        full_name=data.full_name or "Alex Student",
        preferred_learning_style=data.preferred_learning_style or "Visual & Practical",
        target_exam=data.target_exam or "Computer Science Semester Finals",
        target_exam_date=data.target_exam_date or "2026-10-15"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = f"token-user-{user.id}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "target_exam": user.target_exam
        }
    }

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == data.username).first()
    if not user or not verify_password(data.password, user.hashed_password):
        # Demo fallback auto-accept for demo mode if user doesn't exist
        if data.username in ["alex", "demo"]:
            user = db.query(User).filter(User.username == "alex").first()
            if not user:
                user = User(
                    username="alex",
                    email="alex@studymate.ai",
                    hashed_password=get_password_hash("password123"),
                    full_name="Alex Student",
                    preferred_learning_style="Visual & Practical",
                    target_exam="Computer Science Semester Finals"
                )
                db.add(user)
                db.commit()
                db.refresh(user)
        else:
            raise HTTPException(status_code=401, detail="Invalid username or password")

    token = f"token-user-{user.id}"
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": user.full_name,
            "target_exam": user.target_exam
        }
    }

@router.get("/me", response_model=UserProfileResponse)
def get_current_user_profile(db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(
            username="alex",
            email="alex@studymate.ai",
            hashed_password=get_password_hash("password123"),
            full_name="Alex Student",
            preferred_learning_style="Visual & Practical",
            target_exam="Computer Science Semester Finals"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user
