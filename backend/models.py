from pydantic import BaseModel, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# Auth Schemas
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = "Alex Student"
    preferred_learning_style: Optional[str] = "Visual & Practical"
    target_exam: Optional[str] = "Computer Science Semester Finals"
    target_exam_date: Optional[str] = "2026-10-15"

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserProfileResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    preferred_learning_style: str
    target_exam: str
    target_exam_date: str
    available_hours_per_day: float

# Document Schemas
class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    subject: str
    file_size: int
    page_count: int
    status: str
    chunk_count: int
    created_at: str

class ChunkResponse(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    page_number: int
    section_name: str
    content: str

# Memory Schemas
class MemoryCreate(BaseModel):
    category: str
    key: str
    value: str

class MemoryResponse(BaseModel):
    id: int
    category: str
    key: str
    value: str
    confidence: float
    created_at: str

# Agent & Chat Schemas
class ChatQueryRequest(BaseModel):
    message: str
    conversation_id: Optional[int] = None
    subject_filter: Optional[str] = None

class SourceCitation(BaseModel):
    document_name: str
    page_number: int
    section_name: str
    snippet: str
    relevance_score: float

class ChatQueryResponse(BaseModel):
    response: str
    conversation_id: int
    tool_used: Optional[str] = None
    sources: List[SourceCitation] = []
    memories_saved: List[str] = []

# Study Plan Schemas
class StudyPlanCreateRequest(BaseModel):
    subject: str
    exam_date: Optional[str] = "2026-10-15"
    available_hours: Optional[float] = 2.5
    current_knowledge: Optional[str] = "Intermediate"
    target_topics: Optional[List[str]] = []
    duration_days: Optional[int] = 7

class StudyTaskResponse(BaseModel):
    id: int
    day_number: int
    topic: str
    subtopics: Optional[str]
    duration_minutes: int
    activity_type: str
    task_details: Optional[str]
    is_completed: bool

class StudyPlanResponse(BaseModel):
    id: int
    subject: str
    title: str
    duration_days: int
    difficulty: str
    status: str
    completion_percentage: float
    tasks: List[StudyTaskResponse]

# Quiz Schemas
class QuizCreateRequest(BaseModel):
    subject: str
    topic: Optional[str] = "All Topics"
    num_questions: Optional[int] = 5
    difficulty: Optional[str] = "Medium"
    question_type: Optional[str] = "Multiple Choice"

class QuizQuestionResponse(BaseModel):
    id: int
    question_text: str
    options: Optional[List[str]] = None
    correct_answer: Optional[str] = None # Masked during active quiz if specified
    explanation: Optional[str] = None
    source_material: Optional[str] = None

class QuizResponse(BaseModel):
    id: int
    subject: str
    topic: str
    difficulty: str
    question_type: str
    total_questions: int
    questions: List[QuizQuestionResponse]

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: Dict[int, str] # question_id -> user answer

class QuizResultResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    score: int
    total_questions: int
    percentage: float
    detailed_feedback: List[Dict[str, Any]]
    weak_topics: List[str]
    performance_analysis: str

# Flashcard Schemas
class FlashcardCreateRequest(BaseModel):
    subject: str
    topic: Optional[str] = "All Topics"
    num_cards: Optional[int] = 6

class FlashcardResponse(BaseModel):
    id: int
    front_prompt: str
    back_answer: str
    source_ref: Optional[str]

class FlashcardDeckResponse(BaseModel):
    id: int
    subject: str
    title: str
    cards: List[FlashcardResponse]

# Progress Analytics Schemas
class ProgressResponse(BaseModel):
    overall_completion_percentage: float
    completed_topics_count: int
    remaining_topics_count: int
    total_study_hours: float
    average_quiz_score: float
    learning_streak_days: int
    subject_progress: List[Dict[str, Any]]
    strong_topics: List[str]
    weak_topics: List[str]
    recommended_topics: List[str]
