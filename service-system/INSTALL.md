# Service System API

FastAPI implementation of the service document download API.

## Installation

Install dependencies:
```bash
pip install -r requirements.txt
```

## Running the Server

Start the server:
```bash
python main.py
```

Or using uvicorn directly:
```bash
uvicorn main:app --host 0.0.0.0 --port 8002 --reload
```

The server will start on `http://localhost:8002`

## API Documentation

- **Swagger UI**: http://localhost:8002/docs
- **ReDoc**: http://localhost:8002/redoc

## Usage Example

### Request
```bash
curl -X POST http://localhost:8002/api/service-system/download-documents \
  -H "X-API-KEY: admin" \
  -H "Content-Type: application/json" \
  -d '{"VIN": 101}'
```

### Response
```json
{
  "status": "200",
  "results": [
    {
      "id": 1,
      "VIN": 101,
      "URL": "https://...",
      "mime_type": "pdf",
      "created_at": "2026-04-30T08:22:09.000Z",
      "created_by": "system"
    }
  ]
}
```

## API Endpoints

### POST /api/service-system/download-documents

Download documents by VIN.

**Headers:**
- `X-API-KEY`: Authentication key (required, use: `admin`)

**Request Body:**
```json
{
  "VIN": 101
}
```

**Response:**
- `200`: Success
- `401`: Invalid or missing API key

## Testing

You can test the API using the Swagger UI at http://localhost:8002/docs
