# Keyloop Technical Assessment

This repository contains a document aggregation solution composed of three services:

1. `data-aggregator` (NestJS, main API on port `8000`)
2. `sales-system` (Node/Express mock source API on port `8001`)
3. `service-system` (Python/FastAPI mock source API on port `8002`)

The aggregator queries `sales-system` and `service-system`, merges results, and returns a unified response.

## System Document

Full architecture and design decisions are documented in `SYSTEM_DOCUMENT.md`.

See: [Unified Document Aggregator - System Document](SYSTEM_DOCUMENT.md)

## Prerequisites

`data-aggregator`

- Node 22.14.0

`sales-system`

- Compatible with Node 20+

`service-system`

- Uses Python 3.11.4

Database dependencies:

- PostgreSQL
- Redis

Note: The aggregator has sensible defaults for local development, but production-like behavior expects PostgreSQL and Redis.

## Build Instructions

### 1. Build `data-aggregator`

```bash
cd data-aggregator
pnpm install
pnpm build
```

### 2. Install `sales-system`

```bash
cd sales-system
npm install
```

### 3. Install `service-system`

```bash
cd service-system
python -m venv .venv
# Windows PowerShell:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate
pip install -r requirements.txt
```

## Run Instructions

Start all services in separate terminals.

### Terminal 1: start `sales-system` (port 8001)

```bash
cd sales-system
npm start
```

### Terminal 2: start `service-system` (port 8002)

```bash
cd service-system
python -m venv .venv
# .venv\Scripts\activate
source .venv/bin/activate
python main.py
```

### Terminal 3: start `data-aggregator` (port 8000)

```bash
cd data-aggregator
pnpm start
```

Swagger docs for the aggregator:

- `http://localhost:8000/docs`

## Test Instructions

### Automated tests (`data-aggregator`)

```bash
cd data-aggregator
pnpm test:e2e
```

### Mock APIs

`sales-system` and `service-system` currently do not define automated test scripts in this repository. Validate them manually using their documented endpoints.

## Quick Smoke Test

After all three services are running, create an aggregator definition, then execute it.

### 1. Create aggregation definition

```bash
curl -X POST "http://localhost:8000/aggregators" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "unified-document-view-by-vin",
    "description": "Unified Document View By VIN",
    "status": "active",
    "params": ["vin"],
    "sources": [
      {
        "name": "Sales System API",
        "method": "GET",
        "url": "http://localhost:8001/api/sales-system/search?q={{vin}}&pageSize=5&mimeType=pdf",
        "fn": "return value?.data?.map(x => ({ url: x.url, mimeType: x.mimeType, source: 'Sales System' })) ?? [];"
      },
      {
        "name": "Service System API",
        "method": "POST",
        "url": "http://localhost:8002/api/service-system/download-documents",
        "headers": "{'X-API-KEY': 'admin'}",
        "body": "{VIN: {{vin}}}",
        "fn": "return value?.results?.map(x => ({ url: x.URL, mimeType: x.mime_type, source: 'Service System' })) ?? [];"
      }
    ],
    "fn": "return value.slice(0, 10);",
    "shouldRemoveDuplicates": true,
    "createdBy": "admin"
  }'
```

Expected result:

- HTTP `201`
- Response includes the saved aggregator definition.

### 2. Execute aggregation

```bash
curl -X POST "http://localhost:8000/aggregators/unified-document-view-by-vin" \
  -H "Content-Type: application/json" \
  -d '{"vin":"101"}'
```

Expected result:

- HTTP `201`
- Response contains `sources` and merged `data` entries from both systems.
