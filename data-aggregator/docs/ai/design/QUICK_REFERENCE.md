# System Design - Quick Reference Guide

## 🎯 One-Page System Overview

### What This System Does
Aggregates documents from multiple dealership systems (Sales & Service) by VIN, returning a unified view with source attribution.

### Key Workflow
```
VIN Input → Check Cache → If Miss: Parallel API Calls → Transform & Merge → Deduplicate → Store Cache → Return Response
```

### Core Statistics
- **Request Latency:** < 2 sec (P99)
- **Cache Hit Ratio:** > 80% (target)
- **API Success Rate:** > 99.5%
- **Result Limit:** 10 documents per aggregation

---

## 🏗️ Architecture Layers (Clean Architecture)

### 1️⃣ Presentation (HTTP Entry)
**Files:** `src/presentation/controllers/`, `src/presentation/dto/`

What it does:
- Accepts HTTP requests
- Validates DTOs (Request/Response objects)
- Returns JSON responses
- Handles authentication via JWT

Key classes:
- `AggregatorController` - Main API endpoints
- `HealthController` - Health checks
- `AggregatorResponseDto` - Response format

### 2️⃣ Application (Business Logic)
**Files:** `src/application/services/`

What it does:
- Orchestrates the aggregation workflow
- Calls infrastructure components
- Transforms data
- Applies business rules

Key classes:
- `AggregatorService` - Main business logic
- `JwtService` - Authentication
- `HealthService` - System health

### 3️⃣ Domain (Core Models)
**Files:** `src/domain/entities/`, `src/domain/interfaces/`

What it does:
- Defines business entities
- Declares service contracts (interfaces)
- No dependencies on frameworks

Key classes:
- `AggregatorEntity` - Configuration model
- `AggregatorSource` - API source definition
- `BaseEntity` - Audit fields (created/updated/deleted)

### 4️⃣ Infrastructure (External Concerns)
**Files:** `src/infrastructure/`

What it does:
- Communicates with external systems
- Manages databases and caches
- Logs and monitors

Key components:
- `ExternalApiClient` - HTTP requests to Sales/Service APIs
- `AggregatorRepository` - PostgreSQL access via TypeORM
- `RedisClient` - Cache operations
- `LoggingService` - Winston logger
- `ApmService` - Elastic APM integration

---

## 🔌 API Endpoints

| Method | Endpoint | Purpose | Auth |
|---|---|---|---|
| POST | `/api/aggregators` | Save/update aggregator definition | ✓ |
| GET | `/api/aggregators/get-all` | List all aggregators | ✓ |
| GET | `/api/aggregators/:id` | Get one aggregator | ✓ |
| POST | `/api/aggregators/execute/:name` | **Execute aggregation** | ✓ |
| DELETE | `/api/aggregators/:id` | Soft delete aggregator | ✓ |
| GET | `/health` | Liveness probe | ✗ |
| GET | `/health/ready` | Readiness probe | ✗ |

**Authentication:** Bearer Token in `Authorization` header

---

## 💾 Data Models

### Aggregator Definition (PostgreSQL)
```typescript
{
  id: number;
  name: string;                    // e.g., "unified-document-view-by-vin"
  description?: string;
  status: "active" | "inactive";
  params: string[];                // Input parameters, e.g., ["vin"]
  sources: AggregatorSource[];     // Array of API sources
  fn?: string;                     // Custom JavaScript aggregation function
  shouldRemoveDuplicates: boolean;
  createdBy: string;
  createdAt: Date;
  updatedBy: string;
  updatedAt: Date;
  deletedAt?: Date;                // Soft delete marker
}
```

### Aggregator Source
```typescript
{
  name: string;                    // e.g., "Sales System API"
  method: "GET" | "POST" | "PUT";
  url: string;                     // With template vars: {{vin}}
  headers?: object;
  body?: object;
  fn?: string;                     // Per-source transformation
}
```

### Cache Key Format
```
aggregator:{aggregator_name}:{parameter_hash}
Example: aggregator:unified-document-view-by-vin:abc123def456
TTL: 5 minutes (configurable)
```

---

## 🔄 Request Processing Steps

### Step 1: Validation
```typescript
// Controller validates:
- JWT token validity
- DTO structure and types
- Required parameters present
```

### Step 2: Cache Check
```typescript
const cacheKey = "aggregator:unified-document-view-by-vin";
const cached = await redis.get(cacheKey);
if (cached) return cached;  // Fast path
```

### Step 3: Load Configuration
```typescript
const config = await repo.findByName("unified-document-view-by-vin");
// Returns:
// {
//   sources: [
//     {url: "localhost:8001/api/sales-system/search?q={{vin}}", ...},
//     {url: "localhost:8002/api/service-system/...", ...}
//   ],
//   fn: "return value.slice(0,10);"
// }
```

### Step 4: Parallel API Calls
```typescript
const results = await Promise.all([
  externalApiClient.request("GET", "localhost:8001/api/...?q=ABC123"),
  externalApiClient.request("POST", "localhost:8002/api/...", {VIN: "ABC123"})
]);
// Results: [{data: [...]}, {results: [...]}]
```

### Step 5: Transform Per Source
```typescript
// Sales System transformation
const salesResults = results[0].data.map(x => ({
  url: x.url,
  mimeType: x.mimeType,
  source: 'Sales System'
}));

// Service System transformation
const serviceResults = results[1].results.map(x => ({
  url: x.URL,
  mimeType: x.mime_type,
  source: 'Service System'
}));
```

### Step 6: Merge Results
```typescript
const merged = [...salesResults, ...serviceResults];
```

### Step 7: Deduplicate (if enabled)
```typescript
const seen = new Set();
const deduplicated = merged.filter(doc => {
  const hash = md5(doc.url);
  if (seen.has(hash)) return false;
  seen.add(hash);
  return true;
});
```

### Step 8: Apply Aggregation Function
```typescript
// fn: "return value.slice(0,10);"
const final = eval(aggregator.fn)(deduplicated);
// Result: Max 10 documents
```

### Step 9: Cache Result
```typescript
await redis.set(cacheKey, final, { ttl: 300 });  // 5 minutes
```

### Step 10: Return Response
```json
{
  "sources": [
    {"name": "Sales System", "status": "success", "totalItem": 5},
    {"name": "Service System", "status": "success", "totalItem": 6}
  ],
  "data": [ {...}, {...}, ... ],
  "pageNumber": 1,
  "pageSize": 10,
  "totalItem": 11,
  "hasNextPage": true
}
```

---

## 🔍 Observability Quick Reference

### Logging Levels
```typescript
logger.error("Exception occurred", error);      // Errors
logger.warn("Cache miss on aggregator");        // Warnings
logger.info("Aggregation executed in 250ms");   // Info
logger.debug("Parameter values: {vin}");        // Debug (dev only)
logger.trace("Entering transform phase");       // Trace (dev only)
```

### APM Tracing
```typescript
// Automatically tracked spans:
- HTTP request handling
- Database queries
- External API calls
- Cache operations
- Custom functions

// Custom metrics:
apmService.recordMetric('aggregation.latency', 250);
apmService.recordMetric('documents.aggregated', 11);
apmService.recordMetric('cache.hit', 1);
```

### Health Checks
```bash
# Liveness (is app running?)
curl http://localhost:8000/health

# Readiness (can it handle requests?)
curl http://localhost:8000/health/ready

# Response includes: Database, Redis, External API status
```

---

## 📊 Performance Targets

| Metric | Target | Alert if |
|---|---|---|
| **Aggregation Latency (P99)** | < 2 sec | > 5 sec |
| **Cache Hit Ratio** | > 80% | < 60% |
| **API Success Rate** | > 99.5% | < 99% |
| **DB Query Latency (P99)** | < 100ms | > 500ms |
| **Error Rate** | < 0.5% | > 1% |
| **Memory Usage** | < 512MB | > 1GB |

---

## 🛡️ Error Handling Strategy

### Scenario: One API Fails
```
Status: Partial Failure (200 OK)
Response:
{
  sources: [
    {name: "Sales System", status: "success", totalItem: 5},
    {name: "Service System", status: "failed", error: "Timeout"}
  ],
  data: [ /* 5 items from Sales System */ ]
}
```

### Scenario: Both APIs Fail
```
Status: 503 Service Unavailable
Response:
{
  error: "Unable to aggregate: all sources failed"
}
```

### Scenario: Invalid Input
```
Status: 400 Bad Request
Response:
{
  message: "VIN parameter is required",
  error: "BadRequestException"
}
```

---

## 🚀 Common Development Tasks

### Add a New Aggregator
```bash
# 1. POST to save aggregator definition
curl -X POST http://localhost:8000/api/aggregators \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-aggregator",
    "description": "...",
    "params": ["vin"],
    "sources": [...],
    "createdBy": "admin"
  }'

# 2. Execute the aggregator
curl -X POST http://localhost:8000/api/aggregators/execute/my-aggregator \
  -H "Authorization: Bearer {token}" \
  -d '{"vin": "ABC123"}'
```

### Debug Slow Aggregation
1. Check APM traces for which span is slow
2. Check logs for API response times
3. Verify Redis cache is working (`cache.hit` metric)
4. Check external API status via `/health/ready`

### Add Custom Transformation
```typescript
// Update aggregator.fn:
{
  ...
  sources: [{
    fn: "return value?.data?.map(x => ({...})) ?? [];"
  }],
  fn: "return value.filter(x => x.url).slice(0, 10);"
}
```

---

## 🔗 File Navigation Guide

```
src/
├── app.module.ts                 # Main module, sets up layers
├── main.ts                       # Application entry point
├── presentation/
│  └── controllers/
│     └── aggregator.controller.ts ⭐ Main HTTP endpoints
├── application/
│  └── services/
│     └── aggregator.service.ts    ⭐ Business logic
├── domain/
│  ├── entities/
│  │  └── aggregator.entity.ts     ⭐ Data model
│  └── interfaces/
│     └── aggregator-service.interface.ts  ⭐ Service contract
├── infrastructure/
│  ├── external-apis/
│  │  └── external-api.client.ts   ⭐ HTTP client
│  ├── database/
│  │  └── repositories/
│  │     └── aggregator.repository.ts  ⭐ DB access
│  ├── redis/
│  │  └── redis.client.ts           ⭐ Cache
│  └── logging/
│     └── logging.service.ts        ⭐ Structured logs
└── common/
   ├── constants/                   ⭐ DI tokens, config names
   ├── enums/
   ├── exceptions/
   └── filters/                     ⭐ Global error filter
```

---

## ⚡ Performance Tips

1. **Cache Effective:** Verify cache TTL matches your use case
2. **Monitor Hit Ratio:** Use APM dashboard to track `cache.hit` metric
3. **Optimize Queries:** Ensure database has indexes on `aggregator.name`
4. **Parallel Calls:** System already uses `Promise.all()` for concurrent API calls
5. **Timeout Configuration:** Adjust in config if external APIs are slow
6. **Connection Pooling:** Redis/PostgreSQL use connection pools for efficiency

---

## 📚 For More Details

- **Full Architecture:** See `SYSTEM_DESIGN.md`
- **Diagrams:** See `ARCHITECTURE_DIAGRAMS.md`
- **Requirements:** See `docs/ai/requirements/`
- **Testing Strategy:** See `docs/ai/testing/`
- **Implementation Guide:** See `docs/ai/implementation/`

---

**Last Updated:** May 2, 2026  
**Audience:** Developers working on data-aggregator system
