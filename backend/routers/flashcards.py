from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, FlashcardDeck, Flashcard, User
from backend.models import FlashcardCreateRequest, FlashcardDeckResponse
from backend.services.tools import tool_generate_flashcards

router = APIRouter(prefix="/api/flashcards", tags=["Flashcards"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=List[FlashcardDeckResponse])
def list_flashcard_decks(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    decks = db.query(FlashcardDeck).filter(FlashcardDeck.user_id == user.id).order_by(FlashcardDeck.created_at.desc()).all()

    res = []
    for d in decks:
        cards = db.query(Flashcard).filter(Flashcard.deck_id == d.id).all()
        res.append({
            "id": d.id,
            "subject": d.subject,
            "title": d.title,
            "cards": [
                {
                    "id": c.id,
                    "front_prompt": c.front_prompt,
                    "back_answer": c.back_answer,
                    "source_ref": c.source_ref
                } for c in cards
            ]
        })
    return res

@router.post("/generate", response_model=FlashcardDeckResponse)
def generate_deck(data: FlashcardCreateRequest, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    tool_res = tool_generate_flashcards(
        db=db,
        user_id=user.id,
        subject=data.subject,
        topic=data.topic or "All Topics",
        num_cards=data.num_cards or 6
    )
    deck_id = tool_res["deck_id"]
    deck = db.query(FlashcardDeck).filter(FlashcardDeck.id == deck_id).first()
    cards = db.query(Flashcard).filter(Flashcard.deck_id == deck_id).all()

    return {
        "id": deck.id,
        "subject": deck.subject,
        "title": deck.title,
        "cards": [
            {
                "id": c.id,
                "front_prompt": c.front_prompt,
                "back_answer": c.back_answer,
                "source_ref": c.source_ref
            } for c in cards
        ]
    }
