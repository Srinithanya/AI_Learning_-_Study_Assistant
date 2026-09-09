import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import SAMPLE_DIR, UPLOAD_DIR
from backend.database import init_db, SessionLocal, User, Document, MemoryItem, StudyPlan, StudyTask, Quiz
from backend.services.extractor import extract_text_from_file
from backend.services.rag import process_and_index_document
from backend.services.tools import tool_create_study_plan, tool_generate_quiz
from backend.services.memory import save_student_memory
from backend.routers import auth, documents, agent, study_plan, quiz, flashcards, memory, progress

app = FastAPI(
    title="StudyMate AI – Intelligent Learning & Study Assistant",
    description="API server featuring RAG, Memory, Agentic Tools, and Analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(agent.router)
app.include_router(study_plan.router)
app.include_router(quiz.router)
app.include_router(flashcards.router)
app.include_router(memory.router)
app.include_router(progress.router)

@app.on_event("startup")
def startup_event():
    init_db()
    db = SessionLocal()
    try:
        # Seed default user if missing
        user = db.query(User).filter(User.username == "alex").first()
        if not user:
            user = User(
                username="alex",
                email="alex@studymate.ai",
                hashed_password="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW", # "password123"
                full_name="Alex Student",
                preferred_learning_style="Visual & Practical",
                target_exam="Computer Science Semester Finals",
                target_exam_date="2026-10-15"
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        # Seed sample documents if missing
        sample_files = [
            ("Operating_Systems_Notes.txt", "Operating Systems"),
            ("Computer_Networks_Notes.txt", "Computer Networks"),
            ("Data_Structures_Notes.txt", "Data Structures")
        ]

        for filename, subject in sample_files:
            existing = db.query(Document).filter(Document.user_id == user.id, Document.filename == filename).first()
            if not existing:
                src = SAMPLE_DIR / filename
                dst = UPLOAD_DIR / filename
                if src.exists():
                    import shutil
                    shutil.copy(src, dst)
                    file_size = dst.stat().st_size

                    doc = Document(
                        user_id=user.id,
                        filename=filename,
                        file_type="txt",
                        filepath=str(dst),
                        subject=subject,
                        file_size=file_size,
                        status="processing"
                    )
                    db.add(doc)
                    db.commit()
                    db.refresh(doc)

                    sections = extract_text_from_file(str(dst), "txt")
                    process_and_index_document(db, doc, sections)

        # Seed initial memories if missing
        if db.query(MemoryItem).filter(MemoryItem.user_id == user.id).count() == 0:
            save_student_memory(db, user.id, "goal", "Target Exam", "Computer Science Semester Finals (Target: 95%+)")
            save_student_memory(db, user.id, "weak_topic", "Weak Area: Subnetting", "Student requested extra subnetting practice questions.")
            save_student_memory(db, user.id, "preferred_style", "Learning Preference", "Prefers concise bulleted explanations and source citations.")

        # Seed initial study plan if missing
        if db.query(StudyPlan).filter(StudyPlan.user_id == user.id).count() == 0:
            tool_create_study_plan(db, user.id, subject="Operating Systems", duration_days=5)

        # Seed initial quiz if missing
        if db.query(Quiz).filter(Quiz.user_id == user.id).count() == 0:
            tool_generate_quiz(db, user.id, subject="Operating Systems", topic="Deadlock", num_questions=5)

    finally:
        db.close()

@app.get("/")
def root():
    return {
        "app": "StudyMate AI Backend Server",
        "status": "online",
        "version": "1.0.0",
        "docs_url": "/docs"
    }
