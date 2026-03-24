"""
Resume Parser — extracts plain text from uploaded PDF and DOCX files.
Uses pdfplumber for PDF and python-docx for DOCX files.
"""

import io
from fastapi import UploadFile, HTTPException


# Max resume size: 5 MB
MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
}

ALLOWED_EXTENSIONS = {".pdf", ".docx", ".doc"}


def _validate_file(filename: str, content_type: str, size: int) -> None:
    """Validate file type and size before parsing."""
    import os

    ext = os.path.splitext(filename.lower())[1]
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Please upload a PDF or DOCX file.",
        )

    if content_type not in ALLOWED_CONTENT_TYPES:
        # Some browsers send octet-stream; fall back to extension check
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail="Invalid content type. Please upload a PDF or DOCX file.",
            )

    if size > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=413,
            detail="File too large. Maximum allowed size is 5 MB.",
        )


def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file using pdfplumber."""
    try:
        import pdfplumber

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            pages_text = []
            for page in pdf.pages:
                text = page.extract_text()
                if text:
                    pages_text.append(text.strip())
        return "\n\n".join(pages_text)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="PDF parsing library not installed. Run: pip install pdfplumber",
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse PDF file: {str(e)}",
        )


def _extract_text_from_docx(file_bytes: bytes) -> str:
    """Extract text from a DOCX file using python-docx."""
    try:
        from docx import Document

        doc = Document(io.BytesIO(file_bytes))
        paragraphs = [p.text.strip() for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs)
    except ImportError:
        raise HTTPException(
            status_code=500,
            detail="DOCX parsing library not installed. Run: pip install python-docx",
        )
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse DOCX file: {str(e)}",
        )


async def parse_resume(file: UploadFile) -> str:
    """
    Parse an uploaded resume file (PDF or DOCX) and return extracted plain text.

    Args:
        file: FastAPI UploadFile object

    Returns:
        Extracted plain text content of the resume

    Raises:
        HTTPException: on validation failures or parse errors
    """
    import os

    file_bytes = await file.read()
    _validate_file(file.filename, file.content_type, len(file_bytes))

    ext = os.path.splitext(file.filename.lower())[1]

    if ext == ".pdf":
        text = _extract_text_from_pdf(file_bytes)
    elif ext in (".docx", ".doc"):
        text = _extract_text_from_docx(file_bytes)
    else:
        raise HTTPException(status_code=400, detail="Unsupported file type.")

    if not text or len(text.strip()) < 50:
        raise HTTPException(
            status_code=422,
            detail="Could not extract meaningful text from the resume. "
                   "Please ensure the file contains readable text (not a scanned image).",
        )

    return text.strip()
