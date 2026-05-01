import time
from fastapi import FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field
from typing import List

app = FastAPI(
    title="Service System API",
    description="API for downloading service documents by VIN",
    version="1.0.0",
)


# Request model
class DownloadDocumentsRequest(BaseModel):
    VIN: int = Field(101, description="Vehicle Identification Number")
    wait_ms: int = 0


# Response models
class DocumentItem(BaseModel):
    id: int
    VIN: int
    URL: str
    mime_type: str
    created_at: str
    created_by: str


class DownloadDocumentsResponse(BaseModel):
    status: str
    results: List[DocumentItem]


# Mock data
MOCK_DOCUMENTS = [
    {
        "id": 1,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pdf",
        "created_at": "2026-04-30T08:22:09.000Z",
        "created_by": "system",
    },
    {
        "id": 2,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pptx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 3,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "docx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 4,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pdf",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 5,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pptx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 6,
        "VIN": 101,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "docx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 7,
        "VIN": 102,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pdf",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 8,
        "VIN": 102,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pptx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 9,
        "VIN": 102,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "docx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 10,
        "VIN": 102,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pdf",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
    {
        "id": 11,
        "VIN": 103,
        "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
        "mime_type": "pptx",
        "created_at": "2026-04-30T08:26:56.000Z",
        "created_by": "system",
    },
]


@app.post(
    "/api/service-system/download-documents",
    response_model=DownloadDocumentsResponse,
    summary="Download Documents",
    description="Retrieve documents associated with a specific VIN",
)
async def download_documents(
    request: DownloadDocumentsRequest,
    x_api_key: str = Header("admin", alias="x-api-key"),
):
    """
    Download documents by VIN.

    **Headers:**
    - X-API-KEY: API key for authentication (required: 'admin')

    **Request body:**
    - VIN: Vehicle Identification Number (integer)

    **Returns:**
    - status: HTTP status code
    - results: List of document objects
    """
    # Validate API key
    if x_api_key != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )

    # wait
    if request.wait_ms > 0:
        time.sleep(request.wait_ms / 1000)

    # Filter documents by VIN
    filtered_docs = [doc for doc in MOCK_DOCUMENTS if doc["VIN"] == request.VIN]

    return DownloadDocumentsResponse(status="200", results=filtered_docs)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8002)
