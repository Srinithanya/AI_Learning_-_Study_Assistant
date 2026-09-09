from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, MemoryItem, User
from backend.models import MemoryCreate, MemoryResponse
from backend.services.memory import get_student_memories, save_student_memory, delete_student_memory, clear_all_memories

router = APIRouter(prefix="/api/memory", tags=["Student Memory"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=List[MemoryResponse])
def list_memories(category: Optional[str] = None, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    mems = get_student_memories(db, user_id=user.id, category=category)
    return [
        {
            "id": m.id,
            "category": m.category,
            "key": m.key,
            "value": m.value,
            "confidence": m.confidence,
            "created_at": m.created_at.strftime("%Y-%m-%d %H:%M")
        } for m in mems
    ]

@router.post("", response_model=MemoryResponse)
def create_memory(data: MemoryCreate, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    m = save_student_memory(
        db,
        user_id=user.id,
        category=data.category,
        key=data.key,
        value=data.value
    )
    return {
        "id": m.id,
        "category": m.category,
        "key": m.key,
        "value": m.value,
        "confidence": m.confidence,
        "created_at": m.created_at.strftime("%Y-%m-%d %H:%M")
    }

@router.delete("/{memory_id}")
def delete_memory(memory_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    success = delete_student_memory(db, user_id=user.id, memory_id=memory_id)
    if not success:
        raise HTTPException(status_code=404, detail="Memory item not found")
    return {"message": "Memory item deleted successfully"}

@router.delete("/clear/all")
def clear_memories(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    count = clear_all_memories(db, user_id=user.id)
    return {"message": f"Cleared {count} memory items"}
