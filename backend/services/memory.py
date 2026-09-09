import re
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from backend.database import MemoryItem

def save_student_memory(db: Session, user_id: int, category: str, key: str, value: str) -> MemoryItem:
    """Saves or updates a memory item for a student."""
    existing = db.query(MemoryItem).filter(
        MemoryItem.user_id == user_id,
        MemoryItem.category == category,
        MemoryItem.key == key
    ).first()

    if existing:
        existing.value = value
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_memory = MemoryItem(
            user_id=user_id,
            category=category,
            key=key,
            value=value
        )
        db.add(new_memory)
        db.commit()
        db.refresh(new_memory)
        return new_memory

def get_student_memories(db: Session, user_id: int, category: Optional[str] = None) -> List[MemoryItem]:
    """Retrieves remembered student info."""
    query = db.query(MemoryItem).filter(MemoryItem.user_id == user_id)
    if category:
        query = query.filter(MemoryItem.category == category)
    return query.order_by(MemoryItem.created_at.desc()).all()

def delete_student_memory(db: Session, user_id: int, memory_id: int) -> bool:
    """Deletes a single memory item."""
    mem = db.query(MemoryItem).filter(MemoryItem.id == memory_id, MemoryItem.user_id == user_id).first()
    if mem:
        db.delete(mem)
        db.commit()
        return True
    return False

def clear_all_memories(db: Session, user_id: int) -> int:
    """Clears all memories for a user."""
    deleted_count = db.query(MemoryItem).filter(MemoryItem.user_id == user_id).delete()
    db.commit()
    return deleted_count

def auto_extract_memories_from_text(db: Session, user_id: int, text: str) -> List[str]:
    """
    Analyzes user chat or quiz feedback text to automatically save student insights
    (e.g., weak topics, target exams, learning goals).
    """
    saved_keys = []
    text_lower = text.lower()

    # Detect weak topics
    weak_match = re.search(r'(?:i am weak in|difficult for me|struggling with|confused about|hard to understand)\s+([a-zA-Z0-9\s_]{3,30})', text_lower)
    if weak_match:
        topic = weak_match.group(1).strip()
        save_student_memory(db, user_id, "weak_topic", f"Weak Area: {topic.title()}", f"Student expressed difficulty with {topic}.")
        saved_keys.append(f"Saved weak topic: {topic.title()}")

    # Detect upcoming exams
    exam_match = re.search(r'(?:exam in|test in|quiz in)\s+([a-zA-Z0-9\s_]{3,30})', text_lower)
    if exam_match:
        exam_subject = exam_match.group(1).strip()
        save_student_memory(db, user_id, "goal", f"Upcoming Exam", f"Target exam for {exam_subject.title()}.")
        saved_keys.append(f"Saved upcoming exam: {exam_subject.title()}")

    # Detect preferred learning style
    if "like visual" in text_lower or "diagrams" in text_lower:
        save_student_memory(db, user_id, "preferred_style", "Learning Style", "Prefers visual diagrams and quick bullet points.")
        saved_keys.append("Saved learning style: Visual & Diagrams")

    return saved_keys
