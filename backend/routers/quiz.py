import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, Quiz, QuizQuestion, QuizAttempt, User
from backend.models import QuizCreateRequest, QuizResponse, QuizSubmitRequest, QuizResultResponse
from backend.services.tools import tool_generate_quiz
from backend.services.memory import save_student_memory

router = APIRouter(prefix="/api/quizzes", tags=["Quizzes"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=List[QuizResponse])
def list_quizzes(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    quizzes = db.query(Quiz).filter(Quiz.user_id == user.id).order_by(Quiz.created_at.desc()).all()

    res = []
    for q in quizzes:
        questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == q.id).all()
        res.append({
            "id": q.id,
            "subject": q.subject,
            "topic": q.topic,
            "difficulty": q.difficulty,
            "question_type": q.question_type,
            "total_questions": len(questions),
            "questions": [
                {
                    "id": qn.id,
                    "question_text": qn.question_text,
                    "options": json.loads(qn.options_json) if qn.options_json else [],
                    "correct_answer": qn.correct_answer,
                    "explanation": qn.explanation,
                    "source_material": qn.source_material
                } for qn in questions
            ]
        })
    return res

@router.post("/generate", response_model=QuizResponse)
def generate_quiz_endpoint(data: QuizCreateRequest, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    tool_res = tool_generate_quiz(
        db=db,
        user_id=user.id,
        subject=data.subject,
        topic=data.topic or "All Topics",
        num_questions=data.num_questions or 5,
        difficulty=data.difficulty or "Medium",
        question_type=data.question_type or "Multiple Choice"
    )
    quiz_id = tool_res["quiz_id"]
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()

    return {
        "id": quiz.id,
        "subject": quiz.subject,
        "topic": quiz.topic,
        "difficulty": quiz.difficulty,
        "question_type": quiz.question_type,
        "total_questions": len(questions),
        "questions": [
            {
                "id": qn.id,
                "question_text": qn.question_text,
                "options": json.loads(qn.options_json) if qn.options_json else [],
                "correct_answer": qn.correct_answer,
                "explanation": qn.explanation,
                "source_material": qn.source_material
            } for qn in questions
        ]
    }

@router.post("/{quiz_id}/submit", response_model=QuizResultResponse)
def submit_quiz_attempt(quiz_id: int, data: QuizSubmitRequest, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz_id).all()
    correct_count = 0
    detailed_feedback = []
    weak_topics = []

    for qn in questions:
        user_ans = data.answers.get(qn.id, "No Answer")
        is_correct = user_ans.strip().lower() == qn.correct_answer.strip().lower()
        if is_correct:
            correct_count += 1
        else:
            weak_topics.append(quiz.topic if quiz.topic != "All Topics" else quiz.subject)

        detailed_feedback.append({
            "question_id": qn.id,
            "question": qn.question_text,
            "user_answer": user_ans,
            "correct_answer": qn.correct_answer,
            "is_correct": is_correct,
            "explanation": qn.explanation,
            "source_material": qn.source_material
        })

    pct = round((correct_count / len(questions) * 100), 1) if questions else 0.0
    unique_weak_topics = list(set(weak_topics))

    # Auto Save to Memory if score < 80%
    if pct < 80.0 and unique_weak_topics:
        for w_top in unique_weak_topics:
            save_student_memory(
                db,
                user_id=user.id,
                category="weak_topic",
                key=f"Weak Topic: {w_top}",
                value=f"Scored {pct}% on {quiz.subject} ({w_top}) quiz. Requires review."
            )

    # Performance analysis summary
    if pct >= 80:
        analysis = f"Outstanding performance! You scored {pct}%. You demonstrated strong mastery of {quiz.subject} concepts."
    elif pct >= 60:
        analysis = f"Good effort! You scored {pct}%. Review the incorrect answers and study the flagged topics."
    else:
        analysis = f"Score: {pct}%. We've flagged weak concepts ({', '.join(unique_weak_topics) if unique_weak_topics else quiz.subject}) and saved them to your Learning Memory for priority revision."

    attempt = QuizAttempt(
        quiz_id=quiz_id,
        user_id=user.id,
        score=correct_count,
        total_questions=len(questions),
        percentage=pct,
        user_answers_json=json.dumps(data.answers),
        weak_topics_json=json.dumps(unique_unique_weak_topics := unique_weak_topics)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    return {
        "attempt_id": attempt.id,
        "quiz_id": quiz_id,
        "score": correct_count,
        "total_questions": len(questions),
        "percentage": pct,
        "detailed_feedback": detailed_feedback,
        "weak_topics": unique_weak_topics,
        "performance_analysis": analysis
    }

@router.get("/attempts/history")
def list_attempts(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    attempts = db.query(QuizAttempt, Quiz).join(Quiz, QuizAttempt.quiz_id == Quiz.id).filter(QuizAttempt.user_id == user.id).order_by(QuizAttempt.completed_at.desc()).all()

    return [
        {
            "attempt_id": a.id,
            "quiz_id": q.id,
            "subject": q.subject,
            "topic": q.topic,
            "score": a.score,
            "total_questions": a.total_questions,
            "percentage": a.percentage,
            "weak_topics": json.loads(a.weak_topics_json) if a.weak_topics_json else [],
            "completed_at": a.completed_at.strftime("%Y-%m-%d %H:%M")
        } for a, q in attempts
    ]
