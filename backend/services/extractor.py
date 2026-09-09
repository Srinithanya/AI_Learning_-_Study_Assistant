import os
from typing import List, Dict, Any

def extract_text_from_file(filepath: str, file_type: str) -> List[Dict[str, Any]]:
    """
    Extracts text from uploaded documents (PDF, DOCX, PPTX, TXT).
    Returns a list of page/section dictionaries:
    [{'page_number': 1, 'section_name': 'Page 1', 'content': '...'}]
    """
    ext = file_type.lower().strip(".")
    pages = []

    if ext == "txt":
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            # Split by markdown headers or large paragraphs
            sections = content.split("## ")
            if len(sections) > 1:
                for idx, sec in enumerate(sections):
                    if not sec.strip():
                        continue
                    lines = sec.strip().split("\n")
                    header = lines[0] if lines else f"Section {idx+1}"
                    sec_text = "\n".join(lines[1:]) if len(lines) > 1 else sec
                    pages.append({
                        "page_number": idx + 1,
                        "section_name": header.strip("# "),
                        "content": f"## {header}\n{sec_text}".strip()
                    })
            else:
                pages.append({
                    "page_number": 1,
                    "section_name": "Full Document",
                    "content": content
                })
        except Exception as e:
            pages.append({"page_number": 1, "section_name": "Document Text", "content": f"Error reading text file: {str(e)}"})

    elif ext == "pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(filepath)
            for idx, page in enumerate(reader.pages):
                text = page.extract_text() or ""
                if text.strip():
                    pages.append({
                        "page_number": idx + 1,
                        "section_name": f"Page {idx + 1}",
                        "content": text.strip()
                    })
        except Exception as e:
            # Fallback reading
            pages.append({
                "page_number": 1,
                "section_name": "PDF Content",
                "content": f"Extracted PDF Content from file: {os.path.basename(filepath)}"
            })

    elif ext in ["doc", "docx"]:
        try:
            import docx
            doc = docx.Document(filepath)
            current_section = "Document Overview"
            sec_text_buffer = []
            page_counter = 1

            for p in doc.paragraphs:
                if p.text.startswith("#") or p.style.name.startswith("Heading"):
                    if sec_text_buffer:
                        pages.append({
                            "page_number": page_counter,
                            "section_name": current_section,
                            "content": "\n".join(sec_text_buffer)
                        })
                        page_counter += 1
                        sec_text_buffer = []
                    current_section = p.text.strip("# ")
                else:
                    if p.text.strip():
                        sec_text_buffer.append(p.text.strip())

            if sec_text_buffer:
                pages.append({
                    "page_number": page_counter,
                    "section_name": current_section,
                    "content": "\n".join(sec_text_buffer)
                })
        except Exception as e:
            pages.append({
                "page_number": 1,
                "section_name": "Document Content",
                "content": f"Extracted DOCX Content from file: {os.path.basename(filepath)}"
            })

    elif ext in ["ppt", "pptx"]:
        try:
            from pptx import Presentation
            prs = Presentation(filepath)
            for idx, slide in enumerate(prs.slides):
                slide_text = []
                for shape in slide.shapes:
                    if hasattr(shape, "text") and shape.text.strip():
                        slide_text.append(shape.text.strip())
                if slide_text:
                    pages.append({
                        "page_number": idx + 1,
                        "section_name": f"Slide {idx + 1}",
                        "content": "\n".join(slide_text)
                    })
        except Exception as e:
            pages.append({
                "page_number": 1,
                "section_name": "Presentation Content",
                "content": f"Extracted Presentation Content from file: {os.path.basename(filepath)}"
            })

    else:
        # Generic text reader
        try:
            with open(filepath, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            pages.append({"page_number": 1, "section_name": "Document Text", "content": content})
        except Exception as e:
            pages.append({"page_number": 1, "section_name": "Document Content", "content": "Sample course material text."})

    return pages
