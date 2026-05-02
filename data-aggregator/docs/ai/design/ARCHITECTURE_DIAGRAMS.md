# Architecture Diagrams

## High-Level System Architecture

```mermaid
graph TB
    Client["👤 Client/Frontend<br/>(VIN Search UI)"]
    
    subgraph API["🔷 API Layer (Presentation)"]
        Controller["Controller<br/>POST /aggregators/execute/:name<br/>GET /aggregators/get-all"]
        HealthCtrl["Health Controller<br/>GET /health<br/>GET /health/ready"]
    end
    
    subgraph AppLogic["🟢 Application Logic"]
        AggregatorSvc["AggregatorService<br/>- Execute aggregation<br/>- Transform data<br/>- Remove duplicates"]
        JwtSvc["JwtService<br/>- Token validation<br/>- Auth enforcement"]
        HealthSvc["HealthService<br/>- Connectivity checks"]
    end
    
    subgraph Domain["🔵 Domain Models"]
        AggregatorEntity["AggregatorEntity<br/>- Configuration storage<br/>- Audit trail"]
        Interfaces["Interfaces & Contracts<br/>- IAggregatorRepository<br/>- IAggregatorService"]
    end
    
    subgraph Infrastructure["🟠 Infrastructure Layer"]
        subgraph Data["Data Layer"]
            PostgreSQL["🗄️ PostgreSQL<br/>(Aggregator definitions)"]
            Redis["⚡ Redis<br/>(2-5 min TTL cache)"]
        end
        
        subgraph External["External APIs"]
            SalesAPI["Sales System API<br/>GET /search?vin={{vin}}"]
            ServiceAPI["Service System API<br/>POST /download-documents"]
        end
        
        subgraph Observability["Observability"]
            Logger["Winston Logger<br/>(Structured JSON)"]
            APM["Elastic APM<br/>(Tracing & Metrics)"]
        end
    end
    
    Client -->|HTTP Request| Controller
    Controller -->|Validate Auth| JwtSvc
    Controller -->|Exec Aggregation| AggregatorSvc
    
    AggregatorSvc -->|Load Config| PostgreSQL
    AggregatorSvc -->|Check Cache| Redis
    
    AggregatorSvc -->|Parallel Requests| SalesAPI
    AggregatorSvc -->|Parallel Requests| ServiceAPI
    
    AggregatorSvc -->|Transform & Merge| AggregatorSvc
    AggregatorSvc -->|Store Results| Redis
    
    AggregatorSvc -->|Log Events| Logger
    AggregatorSvc -->|Record Metrics| APM
    
    HealthCtrl -->|Check Status| PostgreSQL
    HealthCtrl -->|Check Status| Redis
    HealthCtrl -->|Check Status| SalesAPI
    HealthCtrl -->|Check Status| ServiceAPI
    
    style Client fill:#e3f2fd
    style API fill:#fff3e0
    style AppLogic fill:#e8f5e9
    style Domain fill:#f3e5f5
    style Infrastructure fill:#fce4ec
    style Data fill:#e0f2f1
    style External fill:#ffebee
    style Observability fill:#fff9c4
```

## Request Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Controller
    participant Service as AggregatorService
    participant Cache as Redis Cache
    participant Repo as Repository
    participant SalesAPI as Sales API
    participant ServiceAPI as Service API
    participant Logger as Logging
    participant APM as APM

    Client->>Controller: POST /aggregators/execute/:name<br/>{vin: "ABC123"}
    
    activate Controller
    Controller->>Controller: Validate JWT Token
    Controller->>Service: Execute aggregator
    deactivate Controller
    
    activate Service
    Service->>Logger: [INFO] Aggregation started
    
    Service->>Cache: Get from cache
    activate Cache
    alt Cache Hit
        Cache-->>Service: Return cached result
        Service->>Logger: [INFO] Cache hit
    else Cache Miss
        Cache-->>Service: null
        Service->>Logger: [INFO] Cache miss
        
        Service->>Repo: Load aggregator config
        activate Repo
        Repo-->>Service: {sources: [...]}
        deactivate Repo
        
        Service->>SalesAPI: GET /search?q=ABC123
        Service->>ServiceAPI: POST /download-documents {VIN: ABC123}
        
        activate SalesAPI
        activate ServiceAPI
        
        SalesAPI-->>Service: [{url, mimeType}, ...]
        ServiceAPI-->>Service: [{URL, mime_type}, ...]
        
        deactivate SalesAPI
        deactivate ServiceAPI
        
        Service->>Service: Transform & merge results
        Service->>Service: Remove duplicates
        Service->>Service: Apply aggregation fn()
        
        Service->>Cache: Store result (5min TTL)
        Cache-->>Service: OK
    end
    
    deactivate Cache
    
    Service->>APM: Record metrics
    Note over APM: - Aggregation duration<br/>- Documents count<br/>- Cache hit ratio<br/>- API latencies
    
    Service->>Logger: [INFO] Aggregation completed
    
    Service-->>Controller: {sources: [...], data: [...], paging: {...}}
    deactivate Service
    
    Controller-->>Client: HTTP 200 (JSON response)
```

## Data Flow During Aggregation

```mermaid
graph LR
    A["Input<br/>{vin}"] --> B["Validate<br/>params"]
    B --> C["Fetch config<br/>from cache/DB"]
    C --> D["Build request<br/>templates"]
    
    D --> E["Sales API<br/>GET req"]
    D --> F["Service API<br/>POST req"]
    
    E --> G["Parse Sales<br/>response"]
    F --> H["Parse Service<br/>response"]
    
    G --> I["Map to<br/>common schema"]
    H --> J["Map to<br/>common schema"]
    
    I --> K["Merge"]
    J --> K
    
    K --> L["Deduplicate<br/>by URL hash"]
    L --> M["Apply custom<br/>aggregation fn"]
    M --> N["Limit to<br/>max items"]
    N --> O["Format response<br/>with pagination"]
    O --> P["Cache results<br/>5 min TTL"]
    P --> Q["Return to<br/>client"]
    
    style A fill:#e3f2fd
    style Q fill:#c8e6c9
    style E fill:#ffebee
    style F fill:#ffebee
    style K fill:#f3e5f5
    style P fill:#ffe0b2
```

## Component Interaction Diagram

```mermaid
graph TB
    subgraph Controllers["Controllers (HTTP Entry Points)"]
        AC["AggregatorController<br/>- Save aggregator<br/>- Execute by name<br/>- List/Get/Delete"]
        HC["HealthController<br/>- Liveness probe<br/>- Readiness probe"]
    end
    
    subgraph Services["Services (Business Logic)"]
        AS["AggregatorService<br/>- Orchestration<br/>- Data transformation<br/>- Result caching"]
        HS["HealthService<br/>- Component status<br/>- Connectivity check"]
        JS["JwtService<br/>- Token generation<br/>- Token validation"]
    end
    
    subgraph Repos["Repositories (Data Access)"]
        AR["AggregatorRepository<br/>- TypeORM queries<br/>- Soft delete support"]
    end
    
    subgraph Clients["External Clients"]
        EAC["ExternalApiClient<br/>- HTTP requests<br/>- Retry logic<br/>- Template rendering"]
        RC["RedisClient<br/>- Cache get/set<br/>- TTL management"]
    end
    
    subgraph Infrastructure["Infrastructure"]
        PG["PostgreSQL<br/>- Aggregator configs<br/>- Audit trail"]
        Redis["Redis<br/>- Result cache<br/>- Session store"]
        SalesAPI["Sales System API<br/>(Mocked)"]
        ServiceAPI["Service System API<br/>(Mocked)"]
    end
    
    subgraph Observability["Observability"]
        Logger["Winston Logger<br/>- Structured logs"]
        APM["Elastic APM<br/>- Traces & metrics"]
    end
    
    AC -->|uses| AS
    AC -->|uses| JS
    AC -->|validates via| JS
    
    HC -->|uses| HS
    
    AS -->|uses| AR
    AS -->|uses| EAC
    AS -->|uses| RC
    AS -->|uses| Logger
    AS -->|sends metrics to| APM
    
    HS -->|checks| PG
    HS -->|checks| Redis
    HS -->|checks| SalesAPI
    HS -->|checks| ServiceAPI
    
    AR -->|queries| PG
    EAC -->|calls| SalesAPI
    EAC -->|calls| ServiceAPI
    RC -->|reads/writes| Redis
    
    Logger -->|aggregates| Observability
    APM -->|stores| Observability
    
    style Controllers fill:#fff3e0
    style Services fill:#e8f5e9
    style Repos fill:#f3e5f5
    style Clients fill:#fce4ec
    style Infrastructure fill:#e0f2f1
    style Observability fill:#fff9c4
```

## Cache Invalidation Strategy

```mermaid
graph TB
    subgraph Write["Write Operations"]
        Save["POST /aggregators<br/>(Save new config)"]
        Delete["DELETE /aggregators/:id<br/>(Soft delete)"]
        Update["PUT /aggregators/:id<br/>(Update config)"]
    end
    
    subgraph Invalidation["Cache Invalidation"]
        InvalidateSingle["Invalidate<br/>aggregator-specific<br/>cache keys"]
        InvalidateAll["Optionally invalidate<br/>all related caches"]
        LogEvent["Log invalidation<br/>event for audit"]
    end
    
    subgraph Cache["Cache Layer"]
        RedisCache["Redis<br/>aggregator:{name}:{hash}"]
        QueryCache["Query result<br/>cache"]
    end
    
    subgraph Fallback["Fallback Path"]
        DBQuery["Query<br/>PostgreSQL"]
        ExternalAPI["Call external<br/>APIs"]
        Rebuild["Rebuild<br/>cache"]
    end
    
    Save -->|triggers| InvalidateSingle
    Delete -->|triggers| InvalidateSingle
    Update -->|triggers| InvalidateSingle
    
    InvalidateSingle -->|clears keys| RedisCache
    InvalidateSingle -->|clears keys| QueryCache
    InvalidateSingle -->|logs| LogEvent
    
    RedisCache -->|miss| DBQuery
    QueryCache -->|miss| ExternalAPI
    
    DBQuery -->|cache result| Rebuild
    ExternalAPI -->|cache result| Rebuild
    Rebuild -->|store in| RedisCache
    
    style Write fill:#ffebee
    style Invalidation fill:#f3e5f5
    style Cache fill:#ffe0b2
    style Fallback fill:#e0f2f1
```

## Error Handling & Resilience Flow

```mermaid
graph TB
    Request["Incoming Request<br/>{vin}"] -->|validate| ValidateParams{"Input<br/>valid?"}
    
    ValidateParams -->|NO| Error400["Return 400<br/>Bad Request"]
    ValidateParams -->|YES| CheckAuth{"JWT valid?"}
    
    CheckAuth -->|NO| Error401["Return 401<br/>Unauthorized"]
    CheckAuth -->|YES| FetchConfig["Load aggregator<br/>config"]
    
    FetchConfig -->|error| Error404["Return 404<br/>Not Found"]
    FetchConfig -->|success| CheckCache{"Cache<br/>hit?"}
    
    CheckCache -->|YES| Return200["Return cached<br/>result"]
    CheckCache -->|NO| CallAPIs["Call parallel<br/>APIs"]
    
    CallAPIs -->|both OK| Transform["Transform &<br/>merge"]
    CallAPIs -->|one fails| PartialFail["Partial failure<br/>handling"]
    CallAPIs -->|both fail| Error503["Return 503<br/>Service Unavailable"]
    
    PartialFail -->|continue with<br/>partial data| Transform
    
    Transform -->|success| Cache["Cache result<br/>5 min TTL"]
    Transform -->|error| Error500["Return 500<br/>Internal Error"]
    
    Cache --> Return200
    
    Error400 --> LogError["Log error<br/>with context"]
    Error401 --> LogError
    Error404 --> LogError
    Error503 --> LogError
    Error500 --> LogError
    
    Return200 --> LogSuccess["Log success<br/>with metrics"]
    
    LogError -->|send to APM| Monitor["Monitor & Alert"]
    LogSuccess -->|send to APM| Monitor
    
    style Request fill:#e3f2fd
    style Return200 fill:#c8e6c9
    style Error400 fill:#ffcdd2
    style Error401 fill:#ffcdd2
    style Error404 fill:#ffcdd2
    style Error503 fill:#ffcdd2
    style Error500 fill:#ffcdd2
    style Monitor fill:#fff9c4
```

## Deployment & Scaling Diagram

```mermaid
graph TB
    subgraph LoadBalancer["Load Balancer"]
        LB["NGINX / AWS ALB<br/>Route by path<br/>Health check"]
    end
    
    subgraph Services["Service Instances<br/>(Horizontally Scalable)"]
        SVC1["Aggregator Service 1<br/>PM2 Cluster Mode"]
        SVC2["Aggregator Service 2<br/>PM2 Cluster Mode"]
        SVC3["Aggregator Service 3<br/>PM2 Cluster Mode"]
    end
    
    subgraph SharedServices["Shared Infrastructure"]
        PG["PostgreSQL<br/>(Primary)<br/>Read replicas"]
        Redis["Redis Cluster<br/>(High Availability)"]
        ES["Elasticsearch<br/>(Log Storage)"]
        APM["APM Server<br/>(Metrics)"]
    end
    
    subgraph ExternalSystems["External Systems"]
        SalesAPI["Sales System"]
        ServiceAPI["Service System"]
    end
    
    LB -->|Route| SVC1
    LB -->|Route| SVC2
    LB -->|Route| SVC3
    
    SVC1 -->|read/write| PG
    SVC2 -->|read/write| PG
    SVC3 -->|read/write| PG
    
    SVC1 -->|cache| Redis
    SVC2 -->|cache| Redis
    SVC3 -->|cache| Redis
    
    SVC1 -->|logs| ES
    SVC2 -->|logs| ES
    SVC3 -->|logs| ES
    
    SVC1 -->|metrics| APM
    SVC2 -->|metrics| APM
    SVC3 -->|metrics| APM
    
    SVC1 -->|API calls| SalesAPI
    SVC2 -->|API calls| SalesAPI
    SVC3 -->|API calls| SalesAPI
    
    SVC1 -->|API calls| ServiceAPI
    SVC2 -->|API calls| ServiceAPI
    SVC3 -->|API calls| ServiceAPI
    
    style LoadBalancer fill:#ffeb3b
    style Services fill:#4caf50
    style SharedServices fill:#2196f3
    style ExternalSystems fill:#f44336
```
