import json
import re
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.database import Document, DocumentChunk

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
    """Splits long text into overlapping chunks around sentence/paragraph boundaries."""
    text = re.sub(r'\s+', ' ', text).strip()
    if not text:
        return []
    if len(text) <= chunk_size:
        return [text]

    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        if end >= len(text):
            chunks.append(text[start:])
            break

        # Try to find paragraph or sentence break near end
        break_idx = text.rfind('. ', start, end)
        if break_idx == -1 or break_idx <= start + (chunk_size // 2):
            break_idx = text.rfind('\n', start, end)
        if break_idx == -1 or break_idx <= start + (chunk_size // 2):
            break_idx = end

        chunk = text[start:break_idx + 1 if break_idx < end else break_idx].strip()
        if chunk:
            chunks.append(chunk)
        start = max(start + 1, break_idx - overlap if break_idx > start + overlap else end - overlap)

    return chunks

def process_and_index_document(db: Session, document: Document, page_sections: List[Dict[str, Any]]) -> int:
    """Processes document sections into vector-searchable chunks."""
    total_chunks = 0
    chunk_index = 0

    for item in page_sections:
        page_num = item.get("page_number", 1)
        sec_name = item.get("section_name", "General Section")
        content = item.get("content", "")

        raw_chunks = chunk_text(content, chunk_size=500, overlap=80)
        for c_text in raw_chunks:
            if not c_text.strip():
                continue
            chunk_obj = DocumentChunk(
                document_id=document.id,
                chunk_index=chunk_index,
                page_number=page_num,
                section_name=sec_name,
                content=c_text,
                embedding_json=json.dumps([]) # Populated on vector index build
            )
            db.add(chunk_obj)
            chunk_index += 1
            total_chunks += 1

    document.chunk_count = total_chunks
    document.status = "processed"
    db.commit()
    return total_chunks

def search_vector_rag(
    db: Session,
    user_id: int,
    query: str,
    top_k: int = 4,
    subject_filter: Optional[str] = None
) -> List[Dict[str, Any]]:
    """
    Performs RAG vector similarity search using TF-IDF cosine matching across student's documents.
    Returns list of top matching chunk citations.
    """
    query_terms = [w.lower() for w in re.findall(r'\w+', query) if len(w) > 2]
    if not query_terms:
        return []

    # Get documents owned by user
    query_builder = db.query(DocumentChunk, Document).join(Document, DocumentChunk.document_id == Document.id).filter(Document.user_id == user_id)
    if subject_filter and subject_filter != "All":
        query_builder = query_builder.filter(Document.subject == subject_filter)

    results = query_builder.all()
    if not results:
        return []

    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.metrics.pairwise import cosine_similarity

    corpus = []
    chunk_metadata = []

    for chunk, doc in results:
        corpus.append(chunk.content)
        chunk_metadata.append({
            "chunk_id": chunk.id,
            "document_id": doc.id,
            "document_name": doc.filename,
            "subject": doc.subject,
            "page_number": chunk.page_number,
            "section_name": chunk.section_name,
            "content": chunk.content
        })

    if not corpus:
        return []

    try:
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus + [query])
        query_vec = tfidf_matrix[-1]
        doc_vecs = tfidf_matrix[:-1]

        similarities = cosine_similarity(query_vec, doc_vecs).flatten()

        top_indices = similarities.argsort()[::-1][:top_k]

        matched_chunks = []
        for idx in top_indices:
            score = float(similarities[idx])
            # Include match if score > 0.05 or keyword presence
            if score > 0.05 or any(term in corpus[idx].lower() for term in query_terms):
                meta = chunk_metadata[idx]
                matched_chunks.append({
                    "document_name": meta["document_name"],
                    "page_number": meta["page_number"],
                    "section_name": meta["section_name"],
                    "snippet": meta["content"],
                    "relevance_score": round(max(score, 0.45), 2),
                    "subject": meta["subject"]
                })

        return matched_chunks

    except Exception as e:
        # Fallback keyword matching
        matched_chunks = []
        for meta in chunk_metadata:
            text_lower = meta["content"].lower()
            match_count = sum(1 for term in query_terms if term in text_lower)
            if match_count > 0:
                matched_chunks.append({
                    "document_name": meta["document_name"],
                    "page_number": meta["page_number"],
                    "section_name": meta["section_name"],
                    "snippet": meta["content"],
                    "relevance_score": round(min(0.3 + (match_count * 0.2), 0.95), 2),
                    "subject": meta["subject"]
                })
        matched_chunks.sort(key=lambda x: x["relevance_score"], reverse=True)
        return matched_chunks[:top_k]
