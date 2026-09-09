from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.database import get_db, StudyPlan, StudyTask, User
from backend.models import StudyPlanCreateRequest, StudyPlanResponse
from backend.services.tools import tool_create_study_plan

router = APIRouter(prefix="/api/study-plans", tags=["Study Plans"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=List[StudyPlanResponse])
def list_study_plans(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    plans = db.query(StudyPlan).filter(StudyPlan.user_id == user.id).order_by(StudyPlan.created_at.desc()).all()

    results = []
    for p in plans:
        tasks = db.query(StudyTask).filter(StudyTask.plan_id == p.id).order_by(StudyTask.day_number.asc()).all()
        completed_count = sum(1 for t in tasks if t.is_completed)
        pct = round((completed_count / len(tasks) * 100), 1) if tasks else 0.0

        results.append({
            "id": p.id,
            "subject": p.subject,
            "title": p.title,
            "duration_days": p.duration_days,
            "difficulty": p.difficulty,
            "status": p.status,
            "completion_percentage": pct,
            "tasks": [
                {
                    "id": t.id,
                    "day_number": t.day_number,
                    "topic": t.topic,
                    "subtopics": t.subtopics,
                    "duration_minutes": t.duration_minutes,
                    "activity_type": t.activity_type,
                    "task_details": t.task_details,
                    "is_completed": t.is_completed
                } for t in tasks
            ]
        })
    return results

@router.post("/generate", response_model=StudyPlanResponse)
def generate_plan(data: StudyPlanCreateRequest, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    res = tool_create_study_plan(
        db=db,
        user_id=user.id,
        subject=data.subject,
        duration_days=data.duration_days or 7,
        difficulty=data.current_knowledge or "Intermediate",
        target_topics=data.target_topics
    )
    plan_id = res["plan_id"]
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id).first()
    tasks = db.query(StudyTask).filter(StudyTask.plan_id == plan_id).order_by(StudyTask.day_number.asc()).all()

    return {
        "id": plan.id,
        "subject": plan.subject,
        "title": plan.title,
        "duration_days": plan.duration_days,
        "difficulty": plan.difficulty,
        "status": plan.status,
        "completion_percentage": 0.0,
        "tasks": [
            {
                "id": t.id,
                "day_number": t.day_number,
                "topic": t.topic,
                "subtopics": t.subtopics,
                "duration_minutes": t.duration_minutes,
                "activity_type": t.activity_type,
                "task_details": t.task_details,
                "is_completed": t.is_completed
            } for t in tasks
        ]
    }

@router.patch("/tasks/{task_id}/toggle")
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(StudyTask).filter(StudyTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    db.commit()
    db.refresh(task)

    # Recalculate plan completion
    plan = db.query(StudyPlan).filter(StudyPlan.id == task.plan_id).first()
    tasks = db.query(StudyTask).filter(StudyTask.plan_id == plan.id).all()
    completed_count = sum(1 for t in tasks if t.is_completed)
    pct = round((completed_count / len(tasks) * 100), 1) if tasks else 0.0

    if pct == 100.0:
        plan.status = "completed"
        db.commit()

    return {"task_id": task.id, "is_completed": task.is_completed, "plan_completion_percentage": pct}

@router.delete("/{plan_id}")
def delete_plan(plan_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    plan = db.query(StudyPlan).filter(StudyPlan.id == plan_id, StudyPlan.user_id == user.id).first()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Study plan deleted successfully"}
