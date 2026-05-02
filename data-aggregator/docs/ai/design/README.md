---
phase: design
title: System Design & Architecture
description: Define the technical architecture, components, and data models
---

# System Design & Architecture

## Architecture Overview
**What is the high-level system structure?**

- Include a mermaid diagram that captures the main components and their relationships. Example:
  ```mermaid
  graph TD
    Client -->|HTTPS| API
    API --> ServiceA
    API --> ServiceB
    ServiceA --> Database[(DB)]
  ```
- Key components and their responsibilities
- Technology stack choices and rationale

## Data Models
**What data do we need to manage?**

- Core entities and their relationships
- Data schemas/structures
- Data flow between components

## API Design
**How do components communicate?**

- External APIs (if applicable)
- Internal interfaces
- Request/response formats
- Authentication/authorization approach

## Component Breakdown
**What are the major building blocks?**

- Frontend components (if applicable)
- Backend services/modules
- Database/storage layer
- Third-party integrations

## Design Decisions
**Why did we choose this approach?**

- Key architectural decisions and trade-offs
- Alternatives considered
- Patterns and principles applied

## Non-Functional Requirements
**How should the system perform?**

- Performance targets
- Scalability considerations
- Security requirements
- Reliability/availability needs


# System Design & Architecture

## 📋 Complete Design Documentation

This directory contains comprehensive system design documentation for the **Unified Document Aggregator** project:

### Core Documents

1. **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md)** - **START HERE** 📄
  - Executive summary and project overview
  - Complete architecture overview with layered design
  - Detailed component breakdown (4 layers)
  - Data models and flow explanation
  - Complete technology stack with justifications
  - API design and endpoints
  - Comprehensive observability strategy
  - Design decisions and trade-offs
  - **GenAI assistance in the design phase**
  - Production-ready system design

2. **[ARCHITECTURE_DIAGRAMS.md](./ARCHITECTURE_DIAGRAMS.md)** - 🎨
  - High-level system architecture diagram
  - Request flow sequence diagram
  - Data flow during aggregation
  - Component interaction diagram
  - Cache invalidation strategy
  - Error handling & resilience flow
  - Deployment & scaling architecture

---

## 🎯 Quick Reference

### Architecture at a Glance

**4-Layer Clean Architecture:**
- **Presentation Layer** - HTTP endpoints, controllers, DTOs
- **Application Layer** - Business logic, service orchestration
- **Domain Layer** - Core entities, interfaces, business objects
- **Infrastructure Layer** - Database, cache, APIs, logging, APM

### Technology Stack

| Category | Technology | Purpose |
|---|---|---|
| **Backend** | NestJS 10.x + TypeScript | Enterprise Node.js framework |
| **Database** | PostgreSQL + TypeORM | Persistent storage for configurations |
| **Cache** | Redis | 2-5 minute TTL for aggregation results |
| **APIs** | Axios + @nestjs/axios | HTTP client for external systems |
| **Logging** | Winston | Structured JSON logging to ELK |
| **Monitoring** | Elastic APM | Distributed tracing & metrics |
| **Testing** | Jest | Unit & E2E tests |
| **Container** | Docker + PM2 | Production deployment |

### Core Features

✅ **Unified Search Interface** - Single VIN input  
✅ **Parallel API Aggregation** - Concurrent requests to Sales & Service systems  
✅ **Intelligent Caching** - Redis-backed 2-level caching  
✅ **Data Deduplication** - Remove duplicates by URL hash  
✅ **Custom Transformations** - Per-source and global JavaScript functions  
✅ **Comprehensive Logging** - Structured logs for all operations  
✅ **Distributed Tracing** - Full request visibility via APM  
✅ **Health Checks** - Liveness and readiness probes  
✅ **Error Handling** - Partial failure handling with graceful degradation  
✅ **JWT Authentication** - Bearer token-based security  

---

## 🔄 Request Flow Summary

```
1. Client sends POST /aggregators/execute/:name {vin: "ABC123"}
2. Controller validates JWT, passes to Service
3. Service checks Redis cache (fast path if hit)
4. On cache miss:
  - Load aggregator definition from PostgreSQL
  - Make parallel requests to Sales System & Service System APIs
  - Transform and merge results per source transformation functions
  - Apply global aggregation function (e.g., slice to 10 items)
  - Remove duplicates if enabled
  - Store in Redis (5 min TTL)
5. Return aggregated response with source metadata & pagination
6. Log all operations, record APM metrics
```

---

## 📊 Observability

### Logging Strategy
- **Format:** Structured JSON with timestamp, level, service, context
- **Transport:** Console (dev), rotating files + Elasticsearch (prod)
- **Key Events:** Aggregation start/end, API calls, cache hits/misses, errors

### Metrics & Tracing
- **Elastic APM:** Full request trace with span hierarchy
- **Key Metrics:** Aggregation latency, cache hit ratio, API response times, error rates
- **Dashboards:** Kibana for log visualization and trend analysis

### Health Checks
- `GET /health` - Liveness probe (app running?)
- `GET /health/ready` - Readiness probe (ready to serve traffic?)

---

## 🧠 GenAI Assistance

This design was created with significant assistance from AI:

- ✅ Architecture review and validation
- ✅ API design and contract definition
- ✅ Caching strategy recommendations
- ✅ Observability architecture (logging, metrics, tracing)
- ✅ Error handling and resilience patterns
- ✅ Security & authentication best practices
- ✅ Data model design with audit trails
- ✅ Code generation for common patterns (filters, interceptors, etc.)

See the **[SYSTEM_DESIGN.md](./SYSTEM_DESIGN.md#genai-assistance-in-design)** document for detailed examples and prompts used.

---

## 🚀 Key Design Decisions

| Decision | Rationale | Trade-offs |
|---|---|---|
| **Parallel API Calls** | ~60% latency reduction | Complex error handling |
| **Redis Caching** | Sub-millisecond response | Cache invalidation complexity |
| **Dynamic Config (DB)** | Flexible, no deployment needed | JavaScript eval security risk |
| **Clean Architecture** | Testability, maintainability | More files/abstraction |
| **Soft Deletes** | Audit trail, recovery | Queries must exclude deleted |
| **Template Variables** | Safe parameterization | More templating logic |

---

## 📚 Related Documentation

- **Requirements:** See `docs/ai/requirements/README.md`
- **Implementation:** See `docs/ai/implementation/README.md`
- **Testing Strategy:** See `docs/ai/testing/README.md`
- **Planning:** See `docs/ai/planning/README.md`

---

**Status:** Production Ready  
**Last Updated:** May 2, 2026

