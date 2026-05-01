# Service System

request

```sh
curl -X 'POST' \
  'http://localhost:8002/api/service-system/download-documents' \
  -H 'accept: application/json' \
  -H 'x-api-key: admin' \
  -H 'Content-Type: application/json' \
  -d '{
  "VIN": 101
}'
```

response

```json
{
  "status": "200",
  "results": [
    {
      "id": 1,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pdf",
      "created_at": "2026-04-30T08:22:09.000Z",
      "created_by": "system"
    },
    {
      "id": 2,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pptx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 3,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "docx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 4,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pdf",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 5,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pptx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 6,
      "VIN": 101,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "docx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 7,
      "VIN": 102,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pdf",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 8,
      "VIN": 102,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pptx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 9,
      "VIN": 102,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537700944-HU%C3%8C%C2%9BO%C3%8C%C2%9B%C3%8C%C2%81NG-DA%C3%8C%C2%82%C3%8C%C2%83N-THU-A%C3%8C%C2%82M-KIE%C3%8C%C2%82%C3%8C%C2%89M-THU%C3%8C%C2%9B%C3%8C%C2%89-HE%C3%8C%C2%A3%C3%8C%C2%82-THO%C3%8C%C2%82%C3%8C%C2%81NG-GIA-SU%C3%8C%C2%9B-AI.docx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082823Z&X-Amz-Expires=604800&X-Amz-Signature=4434d517a04422587e390afa9f22e84b7e6bb159ab2fc2a0a666654534d19d93&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "docx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 10,
      "VIN": 102,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537328537-Keyloop%20Coding%20Challange.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082209Z&X-Amz-Expires=604800&X-Amz-Signature=faa9657603ad3f22dfc8a08c132a79a2aae000056f6e78ba45494a9efb18bf44&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pdf",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    },
    {
      "id": 11,
      "VIN": 103,
      "URL": "https://s3-han02.fptcloud.com/ict-ai-dobai-nonprod/1777537614990-gia_su_AI_benchmarks.pptx?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=IZVSNXP9GNM5GRZZD4DA%2F20260430%2Fap-southeast-1%2Fs3%2Faws4_request&X-Amz-Date=20260430T082656Z&X-Amz-Expires=604800&X-Amz-Signature=6a870a01b9db59337b68fb53189f03bc1d6fe201035aa347ab68d80b46650223&X-Amz-SignedHeaders=host&x-amz-checksum-mode=ENABLED&x-id=GetObject",
      "mime_type": "pptx",
      "created_at": "2026-04-30T08:26:56.000Z",
      "created_by": "system"
    }
  ]
}
```

## run

```sh
python -m venv .venv
# .venv\Scripts\activate
source .venv/bin/activate
pip install -r requirements.txt
# python main.py
uvicorn main:app --port 8002
```
