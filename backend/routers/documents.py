import os
import shutil
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.config import UPLOAD_DIR
from backend.database import get_db, Document, DocumentChunk, User
from backend.services.extractor import extract_text_from_file
from backend.services.rag import process_and_index_document, search_vector_rag
from backend.models import DocumentResponse, ChunkResponse

router = APIRouter(prefix="/api/documents", tags=["Documents"])

def get_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.username == "alex").first()
    if not user:
        user = User(username="alex", email="alex@studymate.ai", hashed_password="pw", full_name="Alex Student")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

@router.get("", response_model=List[DocumentResponse])
def list_documents(db: Session = Depends(get_db)):
    user = get_demo_user(db)
    docs = db.query(Document).filter(Document.user_id == user.id).order_by(Document.created_at.desc()).all()
    return [
        {
            "id": d.id,
            "filename": d.filename,
            "file_type": d.file_type,
            "subject": d.subject,
            "file_size": d.file_size,
            "page_count": d.page_count,
            "status": d.status,
            "chunk_count": d.chunk_count,
            "created_at": d.created_at.strftime("%Y-%m-%d %H:%M")
        } for d in docs
    ]

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    subject: Optional[str] = Form("General"),
    db: Session = Depends(get_db)
):
    user = get_demo_user(db)
    allowed_exts = [".pdf", ".docx", ".doc", ".pptx", ".ppt", ".txt"]
    ext = os.path.splitext(file.filename)[1].lower()

    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: {', '.join(allowed_exts)}")

    save_path = UPLOAD_DIR / file.filename
    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = os.path.getsize(save_path)

    # Create Document record
    doc = Document(
        user_id=user.id,
        filename=file.filename,
        file_type=ext.strip("."),
        filepath=str(save_path),
        subject=subject or "General",
        file_size=file_size,
        status="processing"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Extraction & RAG Indexing
    try:
        sections = extract_text_from_file(str(save_path), doc.file_type)
        doc.page_count = len(sections)
        chunk_cnt = process_and_index_document(db, doc, sections)
    except Exception as e:
        doc.status = "error"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to process document: {str(e)}")

    return {
        "id": doc.id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "subject": doc.subject,
        "file_size": doc.file_size,
        "page_count": doc.page_count,
        "status": doc.status,
        "chunk_count": doc.chunk_count,
        "created_at": doc.created_at.strftime("%Y-%m-%d %H:%M")
    }

@router.get("/{doc_id}/chunks", response_model=List[ChunkResponse])
def get_document_chunks(doc_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    chunks = db.query(DocumentChunk).filter(DocumentChunk.document_id == doc_id).all()
    return chunks

@router.post("/search")
def search_documents(query: str, subject: Optional[str] = None, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    citations = search_vector_rag(db, user_id=user.id, query=query, top_k=5, subject_filter=subject)
    return {"query": query, "matches": citations}

@router.delete("/{doc_id}")
def delete_document(doc_id: int, db: Session = Depends(get_db)):
    user = get_demo_user(db)
    doc = db.query(Document).filter(Document.id == doc_id, Document.user_id == user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if os.path.exists(doc.filepath):
        try:
            os.remove(doc.filepath)
        except Exception:
            pass
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
