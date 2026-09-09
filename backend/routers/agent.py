import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, Conversation, ChatMessage, User
from backend.models import ChatQueryRequest, ChatQueryResponse
from backend.services.agent import run_study_agent

router = APIRouter(prefix="/api/agent", tags=["Agent Chat"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.post("/chat", response_model=ChatQueryResponse)
def agent_chat(data: ChatQueryRequest, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    res = run_study_agent(
        db=db,
        user_id=user.id,
        user_message=data.message,
        conversation_id=data.conversation_id,
        subject_filter=data.subject_filter
    )
    return res

@router.get("/conversations")
def list_conversations(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    convs = db.query(Conversation).filter(Conversation.user_id == user.id).order_by(Conversation.created_at.desc()).all()
    return [{"id": c.id, "title": c.title, "created_at": c.created_at.strftime("%Y-%m-%d %H:%M")} for c in convs]

@router.get("/conversations/{conv_id}")
def get_conversation_messages(conv_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv_id).order_by(ChatMessage.created_at.asc()).all()

    formatted = []
    for m in messages:
        formatted.append({
            "id": m.id,
            "sender": m.sender,
            "content": m.content,
            "tool_used": m.tool_used,
            "sources": json.loads(m.sources_json) if m.sources_json else [],
            "created_at": m.created_at.strftime("%H:%M")
        })
    return {"conversation": {"id": conv.id, "title": conv.title}, "messages": formatted}

@router.delete("/conversations/{conv_id}")
def delete_conversation(conv_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    conv = db.query(Conversation).filter(Conversation.id == conv_id, Conversation.user_id == user.id).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted"}
