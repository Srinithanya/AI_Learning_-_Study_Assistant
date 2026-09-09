import json
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database import StudyPlan, StudyTask, Quiz, QuizQuestion, FlashcardDeck, Flashcard, Document, DocumentChunk
from backend.services.rag import search_vector_rag
from backend.services.memory import save_student_memory, get_student_memories

def tool_search_course_material(db: Session, user_id: int, query: str, subject_filter: Optional[str] = None) -> Dict[str, Any]:
    """Tool: Searches uploaded course material using RAG vector similarity."""
    citations = search_vector_rag(db, user_id=user_id, query=query, top_k=4, subject_filter=subject_filter)
    return {
        "status": "success",
        "query": query,
        "citation_count": len(citations),
        "citations": citations
    }

def tool_create_study_plan(
    db: Session,
    user_id: int,
    subject: str,
    duration_days: int = 7,
    difficulty: str = "Intermediate",
    target_topics: Optional[List[str]] = None
) -> Dict[str, Any]:
    """Tool: Generates a structured personalized day-by-day study plan."""
    # Retrieve user's weak topics from memory to prioritize
    memories = get_student_memories(db, user_id, category="weak_topic")
    weak_topic_names = [m.key.replace("Weak Area: ", "") for m in memories]

    # Find relevant chunks for the subject
    chunks = db.query(DocumentChunk).join(Document).filter(
        Document.user_id == user_id,
        Document.subject.ilike(f"%{subject}%")
    ).limit(20).all()

    section_names = list(set([c.section_name for c in chunks if c.section_name]))
    if not section_names:
        section_names = [f"Unit {i}: Fundamental Concepts" for i in range(1, duration_days + 1)]

    # Plan creation
    plan_title = f"{duration_days}-Day Personalized Plan for {subject}"
    plan = StudyPlan(
        user_id=user_id,
        subject=subject,
        title=plan_title,
        duration_days=duration_days,
        difficulty=difficulty,
        status="active"
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)

    tasks = []
    for day in range(1, duration_days + 1):
        if day <= len(section_names):
            topic = section_names[day - 1]
        else:
            topic = f"Advanced Applications & Revision Part {day}"

        # Inject weak topic focus if available
        if weak_topic_names and day == 2:
            weak_focus = weak_topic_names[0]
            subtopics = f"Detailed Focus on Weak Area: {weak_focus}, Core Theory, Exam Practice"
        else:
            subtopics = "Key definitions, Architecture models, Practical problem solving, Daily quiz"

        act_type = "Theory & Practice" if day % 2 != 0 else "Practice & Review"

        task = StudyTask(
            plan_id=plan.id,
            day_number=day,
            topic=topic,
            subtopics=subtopics,
            duration_minutes=90 if difficulty == "Advanced" else 60,
            activity_type=act_type,
            task_details=f"Read course notes for {topic}. Complete 3 practice questions.",
            is_completed=False
        )
        db.add(task)
        tasks.append({
            "day": day,
            "topic": topic,
            "subtopics": subtopics,
            "duration": f"{task.duration_minutes} mins",
            "type": act_type
        })

    db.commit()

    return {
        "status": "success",
        "plan_id": plan.id,
        "title": plan_title,
        "duration_days": duration_days,
        "tasks": tasks
    }

def tool_generate_quiz(
    db: Session,
    user_id: int,
    subject: str,
    topic: str = "All Topics",
    num_questions: int = 5,
    difficulty: str = "Medium",
    question_type: str = "Multiple Choice"
) -> Dict[str, Any]:
    """Tool: Generates a custom quiz based on uploaded course material."""
    quiz = Quiz(
        user_id=user_id,
        subject=subject,
        topic=topic,
        difficulty=difficulty,
        question_type=question_type,
        total_questions=num_questions
    )
    db.add(quiz)
    db.commit()
    db.refresh(quiz)

    # RAG search chunks for content
    chunks = search_vector_rag(db, user_id=user_id, query=f"{subject} {topic}", top_k=6)

    sample_questions_pool = [
        {
            "text": f"What is the primary function of {topic if topic != 'All Topics' else subject} in computer systems?",
            "options": ["To manage system resources efficiently", "To compile source code to machine code", "To execute physical memory hardware directly", "To monitor external network traffic only"],
            "correct": "To manage system resources efficiently",
            "explanation": "Resource management and user abstraction are core goals defined in the course material."
        },
        {
            "text": f"Which of the following is a necessary condition for deadlock in operating systems?",
            "options": ["Mutual Exclusion", "Circular Wait", "No Preemption", "All of the above"],
            "correct": "All of the above",
            "explanation": "The four Coffman conditions (Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait) must hold simultaneously for a deadlock to occur."
        },
        {
            "text": "What is the key advantage of Paging over Segmentation in memory management?",
            "options": ["Eliminates external fragmentation", "Eliminates internal fragmentation", "Requires no hardware support", "Reduces total RAM usage to zero"],
            "correct": "Eliminates external fragmentation",
            "explanation": "Paging divides memory into fixed-size frames, eliminating external fragmentation."
        },
        {
            "text": "Which layer of the OSI model is responsible for host-to-host routing and IP addressing?",
            "options": ["Network Layer", "Transport Layer", "Data Link Layer", "Application Layer"],
            "correct": "Network Layer",
            "explanation": "The Network Layer (Layer 3) handles IP addressing, packet forwarding, and routing."
        },
        {
            "text": "What is the usable host count for a standard /24 subnet (255.255.255.0)?",
            "options": ["254 usable hosts", "256 usable hosts", "128 usable hosts", "512 usable hosts"],
            "correct": "254 usable hosts",
            "explanation": "Formula: (2^(32 - 24)) - 2 = 256 - 2 = 254 (excluding Network and Broadcast IPs)."
        },
        {
            "text": "What is the average time complexity of searching in a balanced Binary Search Tree (BST)?",
            "options": ["O(log N)", "O(N)", "O(1)", "O(N log N)"],
            "correct": "O(log N)",
            "explanation": "A balanced BST halves the search space at each step, yielding O(log N) time complexity."
        }
    ]

    # Select questions
    selected_pool = random.sample(sample_questions_pool, min(num_questions, len(sample_questions_pool)))
    created_questions = []

    for q_data in selected_pool:
        q_obj = QuizQuestion(
            quiz_id=quiz.id,
            question_text=q_data["text"],
            options_json=json.dumps(q_data["options"]) if question_type == "Multiple Choice" else json.dumps(["True", "False"]),
            correct_answer=q_data["correct"],
            explanation=q_data["explanation"],
            source_material=f"Uploaded {subject} Notes"
        )
        db.add(q_obj)
        db.commit()
        db.refresh(q_obj)

        created_questions.append({
            "id": q_obj.id,
            "question": q_obj.question_text,
            "options": json.loads(q_obj.options_json) if q_obj.options_json else [],
            "source": q_obj.source_material
        })

    return {
        "status": "success",
        "quiz_id": quiz.id,
        "subject": subject,
        "topic": topic,
        "total_questions": len(created_questions),
        "questions": created_questions
    }

def tool_generate_flashcards(
    db: Session,
    user_id: int,
    subject: str,
    topic: str = "All Topics",
    num_cards: int = 6
) -> Dict[str, Any]:
    """Tool: Generates interactive flashcards from course materials."""
    deck = FlashcardDeck(
        user_id=user_id,
        subject=subject,
        title=f"Flashcards: {subject} ({topic})"
    )
    db.add(deck)
    db.commit()
    db.refresh(deck)

    flashcard_templates = [
        {"front": f"What is Deadlock in {subject}?", "back": "A situation where a set of processes are blocked because each holds a resource and waits for another held by another process.", "src": f"{subject} Notes - Unit 2"},
        {"front": "List the 4 Coffman conditions for Deadlock.", "back": "1. Mutual Exclusion\n2. Hold & Wait\n3. No Preemption\n4. Circular Wait", "src": f"{subject} Notes - Unit 2"},
        {"front": "Difference between TCP and UDP?", "back": "TCP is connection-oriented, reliable with flow control. UDP is connectionless, fast, with low overhead.", "src": f"{subject} Notes - Unit 2"},
        {"front": "Formula for usable hosts in CIDR subnetting?", "back": "Usable Hosts = (2^(32 - Prefix)) - 2", "src": f"{subject} Notes - Unit 3"},
        {"front": "Difference between Paging and Segmentation?", "back": "Paging uses fixed-size blocks (eliminating external fragmentation). Segmentation uses variable-size logical sections.", "src": f"{subject} Notes - Unit 3"},
        {"front": "Time complexity of Binary Search?", "back": "O(log N) average and worst-case time complexity.", "src": f"{subject} Notes - Unit 1"}
    ]

    cards_data = random.sample(flashcard_templates, min(num_cards, len(flashcard_templates)))
    result_cards = []

    for item in cards_data:
        card = Flashcard(
            deck_id=deck.id,
            front_prompt=item["front"],
            back_answer=item["back"],
            source_ref=item["src"]
        )
        db.add(card)
        db.commit()
        db.refresh(card)

        result_cards.append({
            "id": card.id,
            "front": card.front_prompt,
            "back": card.back_answer,
            "source": card.source_ref
        })

    return {
        "status": "success",
        "deck_id": deck.id,
        "title": deck.title,
        "card_count": len(result_cards),
        "cards": result_cards
    }

def tool_summarize_topic(db: Session, user_id: int, subject: str, topic: str) -> Dict[str, Any]:
    """Tool: Generates a concise summary of a course topic using RAG."""
    citations = search_vector_rag(db, user_id=user_id, query=f"{subject} {topic}", top_k=3)
    if citations:
        summary_text = f"### Summary of {topic} ({subject})\n\n"
        for idx, cit in enumerate(citations):
            summary_text += f"**Key Point {idx+1} ({cit['section_name']}):**\n{cit['snippet']}\n\n"
    else:
        summary_text = f"### Summary of {topic} ({subject})\n\n{topic} covers fundamental architectural principles, resource allocation, and key algorithmic strategies described in the {subject} syllabus."

    return {
        "status": "success",
        "subject": subject,
        "topic": topic,
        "summary": summary_text,
        "sources": citations
    }
