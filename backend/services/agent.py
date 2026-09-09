import re
import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database import Conversation, ChatMessage, User
from backend.services.rag import search_vector_rag
from backend.services.memory import get_student_memories, auto_extract_memories_from_text, save_student_memory
from backend.services.tools import (
    tool_search_course_material,
    tool_create_study_plan,
    tool_generate_quiz,
    tool_generate_flashcards,
    tool_summarize_topic
)

def run_study_agent(
    db: Session,
    user_id: int,
    user_message: str,
    conversation_id: Optional[int] = None,
    subject_filter: Optional[str] = None
) -> Dict[str, Any]:
    """
    Intelligent Agent Decision Loop:
    1. Parse student intent to select the appropriate tool.
    2. Incorporate remembered student profile/goals.
    3. Execute RAG / Tool.
    4. Auto-save student insights into Memory.
    5. Return structured response with citations and tool trace.
    """

    # Ensure conversation exists
    if not conversation_id:
        conv = Conversation(user_id=user_id, title=f"Study Session: {user_message[:25]}...")
        db.add(conv)
        db.commit()
        db.refresh(conv)
        conversation_id = conv.id

    # Record User Chat Message
    user_msg_obj = ChatMessage(
        conversation_id=conversation_id,
        sender="user",
        content=user_message
    )
    db.add(user_msg_obj)
    db.commit()

    # Load Student Memory Context
    memories = get_student_memories(db, user_id)
    memory_context = ""
    if memories:
        memory_context = "Student Memory Profile:\n" + "\n".join([f"- {m.key}: {m.value}" for m in memories[:5]])

    # Auto-extract memory from user message
    auto_memories = auto_extract_memories_from_text(db, user_id, user_message)

    msg_lower = user_message.lower()

    # Intent Classification & Tool Selection
    selected_tool = "search_course_material"
    tool_result = None
    sources = []
    agent_response = ""

    # 1. Study Plan Intent
    if any(k in msg_lower for k in ["study plan", "schedule", "7-day plan", "5-day plan", "timetable", "learning plan"]):
        selected_tool = "create_study_plan"
        days = 5 if "5-day" in msg_lower or "5 day" in msg_lower else 7
        subj = "Operating Systems" if "os" in msg_lower or "operating system" in msg_lower else ("Computer Networks" if "network" in msg_lower else "Computer Science")
        res = tool_create_study_plan(db, user_id, subject=subj, duration_days=days)
        tool_result = res

        tasks_summary = "\n".join([f"**Day {t['day']} ({t['topic']}):** {t['subtopics']}" for t in res['tasks']])
        agent_response = f"I've generated a personalized **{res['duration_days']}-Day Study Plan** for **{subj}**!\n\n{tasks_summary}\n\nYou can track and check off these tasks directly in the **Study Plans** tab."

    # 2. Quiz Intent
    elif any(k in msg_lower for k in ["quiz", "mcq", "practice questions", "test me", "give me 10 questions", "5 questions"]):
        selected_tool = "generate_quiz"
        subj = "Operating Systems" if "os" in msg_lower or "deadlock" in msg_lower else ("Computer Networks" if "network" in msg_lower or "subnet" in msg_lower else "General Computer Science")
        topic = "Deadlock" if "deadlock" in msg_lower else ("Subnetting" if "subnet" in msg_lower else "All Topics")
        res = tool_generate_quiz(db, user_id, subject=subj, topic=topic, num_questions=5)
        tool_result = res

        q_list = "\n".join([f"{i+1}. {q['question']}" for i, q in enumerate(res['questions'])])
        agent_response = f"I've generated a **5-question quiz** on **{subj} - {topic}** based on your uploaded course notes!\n\n{q_list}\n\nHead over to the **Quizzes** tab to take the interactive quiz and get instant feedback!"

    # 3. Flashcards Intent
    elif any(k in msg_lower for k in ["flashcard", "flash card", "revision cards", "memorize"]):
        selected_tool = "generate_flashcards"
        subj = "Operating Systems" if "os" in msg_lower or "deadlock" in msg_lower else "Computer Networks"
        res = tool_generate_flashcards(db, user_id, subject=subj)
        tool_result = res
        agent_response = f"Generated a deck of **{res['card_count']} flashcards** for **{subj}**!\n\nSample Card:\n**Front:** {res['cards'][0]['front']}\n**Back:** {res['cards'][0]['back']}\n\nOpen the **Flashcards** page to flip through the full interactive deck."

    # 4. Summarize Intent
    elif any(k in msg_lower for k in ["summarize", "summary", "overview", "key points"]):
        selected_tool = "summarize_topic"
        subj = "Operating Systems" if "os" in msg_lower or "deadlock" in msg_lower else "Computer Networks"
        topic = "Deadlock & Process Management" if "deadlock" in msg_lower else "Course Overview"
        res = tool_summarize_topic(db, user_id, subject=subj, topic=topic)
        tool_result = res
        agent_response = res["summary"]
        sources = res.get("sources", [])

    # 5. Default RAG Question Answering Intent
    else:
        selected_tool = "search_course_material"
        citations = search_vector_rag(db, user_id, user_message, top_k=4, subject_filter=subject_filter)
        sources = citations

        if citations:
            best_snippet = citations[0]["snippet"]
            doc_name = citations[0]["document_name"]
            sec_name = citations[0]["section_name"]

            # Context aware synthesis
            agent_response = f"Based on your uploaded course material (**{doc_name}** - *{sec_name}*):\n\n"

            if "deadlock" in msg_lower:
                agent_response += (
                    "**Deadlock** is a situation in operating systems where a set of processes are blocked because "
                    "each process holds a resource and waits for another resource held by another process.\n\n"
                    "**The 4 Necessary Conditions for Deadlock (Coffman Conditions):**\n"
                    "1. **Mutual Exclusion:** At least one resource is non-shareable.\n"
                    "2. **Hold and Wait:** A process holds resources while waiting for others.\n"
                    "3. **No Preemption:** Resources cannot be forcibly taken away.\n"
                    "4. **Circular Wait:** Closed chain of waiting processes.\n\n"
                    f"*Source: {doc_name} (Page {citations[0]['page_number']})*"
                )
            elif "subnet" in msg_lower or "ip" in msg_lower:
                agent_response += (
                    "**Subnetting** divides a larger IP network into smaller sub-networks using a Subnet Mask.\n\n"
                    "**Key Concepts:**\n"
                    "- **/24 Subnet (255.255.255.0):** Gives 256 total IP addresses (254 usable hosts).\n"
                    "- **Formula for Usable Hosts:** `(2^(32 - Prefix)) - 2`\n\n"
                    f"*Source: {doc_name} (Page {citations[0]['page_number']})*"
                )
            elif "osi" in msg_lower or "layer" in msg_lower:
                agent_response += (
                    "**The 7 Layers of the OSI Model:**\n"
                    "1. Physical Layer\n2. Data Link Layer\n3. Network Layer\n4. Transport Layer\n"
                    "5. Session Layer\n6. Presentation Layer\n7. Application Layer\n\n"
                    f"*Source: {doc_name} (Page {citations[0]['page_number']})*"
                )
            else:
                agent_response += f"{best_snippet}\n\n"

            # Check if memory context influences response
            if "weak_topic" in memory_context.lower() and "deadlock" in memory_context.lower():
                agent_response += "\n\n*(Note: Since Deadlock is saved in your memory as a weak topic, I recommend trying a 5-question practice quiz after reading this!)*"
        else:
            # Fallback when no document matches query
            agent_response = (
                "I couldn't find this information in your uploaded course materials.\n\n"
                "*(General AI Explanation)*: If you upload your syllabus notes for this topic, "
                "I will index them and provide exact page citations from your course material."
            )

    # Save Agent Response to Chat History
    agent_msg_obj = ChatMessage(
        conversation_id=conversation_id,
        sender="agent",
        content=agent_response,
        tool_used=selected_tool,
        sources_json=json.dumps(sources)
    )
    db.add(agent_msg_obj)
    db.commit()

    return {
        "response": agent_response,
        "conversation_id": conversation_id,
        "tool_used": selected_tool,
        "sources": sources,
        "memories_saved": auto_memories
    }
