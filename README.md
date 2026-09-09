# StudyMate AI – Intelligent Learning & Study Assistant

> **IBM AI Agent Internship Project**  
> An intelligent personal study assistant built using **AI Agents**, **RAG (Retrieval-Augmented Generation)**, **Structured Student Memory**, and **Autonomous Tool Calling**.

---

## 🌟 Project Overview

**StudyMate AI** allows students to upload their study materials (PDF textbooks, lecture notes, PPT/PPTX, DOC/DOCX, and Text files) and interact with an intelligent AI study agent. Rather than hallucinating general answers, StudyMate AI prioritizes the student's actual course syllabus, extracts exact page/section citations, creates personalized study plans, generates custom quizzes, and maintains a structured memory profile of student goals and weak topics.

---

## 🧠 Core AI Agent Capabilities

The application demonstrates four fundamental AI agent pillars:

1. **Retrieval-Augmented Generation (RAG)**:  
   Parses uploaded course documents, performs text chunking, builds TF-IDF/Vector similarity embeddings, and retrieves relevant course snippets to ground AI responses with document page/section citations.
2. **Structured Student Memory**:  
   Persists student goals, preferred learning styles, upcoming exams, quiz scores, and weak topics. Memory influences future study plan generation and AI responses.
3. **Agentic Decision Making & Tool Calling**:  
   The AI agent dynamically classifies student intent and invokes appropriate tools (`search_course_material`, `create_study_plan`, `generate_quiz`, `generate_flashcards`, `summarize_topic`, `save_memory`).
4. **Personalized Learning Analytics**:  
   Tracks topic mastery, study streaks, score metrics, and automatically prioritizes weak areas.

---

## 🏗️ System Architecture

```
                       ┌─────────────────────────┐
                       │   React Frontend (Vite) │
                       │  - Student Dashboard    │
                       │  - AI Tutor Chat        │
                       │  - Study Planner        │
                       │  - RAG Quiz Studio      │
                       │  - Memory Profile       │
                       └────────────┬────────────┘
                                    │ REST API
                       ┌────────────▼────────────┐
                       │   FastAPI Backend App   │
                       └────────────┬────────────┘
                                    │
    ┌───────────────────┼───────────────────┬───────────────────┐
    │                   │                   │                   │
┌───▼────────────┐  ┌───▼────────────┐  ┌───▼────────────┐  ┌───▼────────────┐
│   RAG Engine   │  │  Agent Router  │  │ Memory Service │  │  SQLite DB     │
│ - Text Chunk   │  │ - Tool Select  │  │ - Weak Topics  │  │ - Users/Docs   │
│ - Vector Search│  │ - Intent Logic │  │ - Exam Goals   │  │ - Plans/Quizzes│
│ - Source Citations│- Execution Trace│ │ - Auto-Extract │  │ - Memories     │
└────────────────┘  └────────────────┘  └────────────────┘  └────────────────┘
```

---

## 🛠️ Tool Definitions & Specifications

| Tool Name | Parameters | Purpose |
| :--- | :--- | :--- |
| `search_course_material` | `query`, `subject_filter` | Performs vector search over uploaded course materials and returns cited snippets. |
| `create_study_plan` | `subject`, `duration_days`, `difficulty` | Generates day-by-day learning schedule tailored to target exam date and weak areas. |
| `generate_quiz` | `subject`, `topic`, `num_questions`, `difficulty` | Synthesizes MCQs / practice questions grounded in indexed vector chunks. |
| `generate_flashcards` | `subject`, `topic`, `num_cards` | Produces Q&A flashcards for 3D flip card review. |
| `summarize_topic` | `subject`, `topic` | Generates concise section summaries with page references. |
| `save_memory` | `category`, `key`, `value` | Persists student insights (e.g., weak topics, goals) into the Memory store. |

---

## 🗄️ Database Schema (SQLite)

- **`users`**: Account info, preferred learning style, target exam, available study hours per day.
- **`documents`**: Filename, file type, file size, section/page count, processing status.
- **`document_chunks`**: Document ID, page number, section name, text content, vector embeddings.
- **`memories`**: Category (`goal`, `weak_topic`, `preferred_style`), key, value, confidence.
- **`study_plans` & `study_tasks`**: Duration, day number, topic, subtopics, duration minutes, completion status.
- **`quizzes` & `quiz_questions` & `quiz_attempts`**: Questions, options, correct answers, explanations, student score, weak topic flags.
- **`flashcard_decks` & `flashcards`**: Deck title, front prompt, back answer, source ref.
- **`conversations` & `chat_messages`**: Chat history, tool trace badges, RAG source citations.

---

## 🚀 Getting Started & Installation

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Setup

```bash
# Navigate to workspace
cd backend

# Install Dependencies
pip install -r requirements.txt

# Run FastAPI Backend Server
python -m uvicorn backend.main:app --port 8000 --reload
```
*Backend API docs available at: `http://localhost:8000/docs`*

### 2. Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install Node Modules
npm install

# Run Vite Dev Server
npm run dev
```
*Frontend Application accessible at: `http://localhost:5173/`*

---

## 🎬 Complete Demo Workflow (IBM AI Agent Internship Presentation)

1. **Student Login / Dashboard Launch**:
   Open `http://localhost:5173/`. Alex views his exam readiness (72.5%), study streak (5 days), and pre-loaded course notes (Operating Systems, Computer Networks, Data Structures).
2. **Document Upload**:
   Navigate to **My Materials**. Upload a new PDF/TXT file. Observe text extraction, chunking, and indexing into RAG vector chunks.
3. **Ask RAG Concept Question**:
   Open **AI Tutor**. Type: *"Explain deadlock from my OS notes."*
4. **Inspect RAG Answer & Sources**:
   Observe the structured response detailing Coffman deadlock conditions, exact page citations, and the `Agent Tool Execution: search_course_material` badge.
5. **Request AI Study Plan**:
   Type: *"Create a 5-day study plan for Computer Networks"*.
6. **Execute Agent Tool**:
   Observe the `create_study_plan` tool execution. View the generated schedule.
7. **Interactive Plan Tracking**:
   Navigate to **Study Plans**. Check off Day 1 and Day 2 tasks and watch overall plan completion update in real-time.
8. **AI Quiz Generation**:
   Navigate to **Quizzes**. Generate a 5-question quiz on Operating Systems (Deadlock).
9. **Interactive Quiz Player**:
   Select answers and submit the quiz.
10. **Performance Assessment**:
    Review the instant score report (e.g. 80%), detailed explanations, and source material links.
11. **Auto Memory Persistence**:
    Observe the warning badge: *"Saved to Memory Profile: Weak Topics Flagged - Subnetting / Deadlock"*.
12. **Manage Memory Profile**:
    Open **Learning Memory** tab. View remembered goals, weak topics, and learning preferences. Delete or add memory items manually.
13. **3D Flashcards Review**:
    Open **Flashcards**. Click cards to flip between front questions and back answers with source references.
14. **Learning Analytics**:
    Navigate to **Progress**. Review subject mastery progress bars, study streak counter, and recommended next steps.

---

## 🔮 Future Enhancements
- Multi-modal support for formula rendering (LaTeX KaTeX) and diagram recognition in lecture slides.
- Integration with external LLM APIs (OpenAI / Gemini / Ollama) via Settings page.
- Spaced repetition algorithm (SM-2) integration for flashcard scheduling.
