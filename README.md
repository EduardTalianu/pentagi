# PentAGI

<div align="center" style="font-size: 1.5em; margin: 20px 0;">
    <strong>P</strong>enetration testing <strong>A</strong>rtificial <strong>G</strong>eneral <strong>I</strong>ntelligence
</div>

## 📖 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Quick Start](#-quick-start)
- [Advanced Setup](#-advanced-setup)
- [Development](#-development)
- [Building](#%EF%B8%8F-building)
- [Credits](#-credits)
- [License](#-license)

## 🎯 Overview

PentAGI is an innovative tool for automated security testing that leverages cutting-edge artificial intelligence technologies. The project is designed for information security professionals, researchers, and enthusiasts who need a powerful and flexible solution for conducting penetration tests.

You can watch the video **PentAGI overview**:
[![PentAGI Overview Video](https://github.com/user-attachments/assets/0828dc3e-15f1-4a1d-858e-9696a146e478)](https://youtu.be/R70x5Ddzs1o)

## ✨ Features

- 🛡️ Secure & Isolated. All operations are performed in a sandboxed Docker environment with complete isolation.
- 🤖 Fully Autonomous. AI-powered agent that automatically determines and executes penetration testing steps.
- 🔬 Professional Pentesting Tools. Built-in suite of 20+ professional security tools including nmap, metasploit, sqlmap, and more.
- 🧠 Smart Memory System. Long-term storage of research results and successful approaches for future use.
- 🔍 Web Intelligence. Built-in browser via [scraper](https://hub.docker.com/r/vxcontrol/scraper) for gathering latest information from web sources.
- 🔎 External Search Systems. Integration with advanced search APIs including [Tavily](https://tavily.com), [Traversaal](https://traversaal.ai), and [Google Custom Search](https://programmablesearchengine.google.com/) for comprehensive information gathering.
- 👥 Team of Specialists. Delegation system with specialized AI agents for research, development, and infrastructure tasks.
- 📊 Comprehensive Monitoring. Detailed logging and integration with Grafana/Prometheus for real-time system observation.
- 📝 Detailed Reporting. Generation of thorough vulnerability reports with exploitation guides.
- 📦 Smart Container Management. Automatic Docker image selection based on specific task requirements.
- 📱 Modern Interface. Clean and intuitive web UI for system management and monitoring.
- 🔌 API Integration. Support for REST and GraphQL APIs for seamless external system integration.
- 💾 Persistent Storage. All commands and outputs are stored in PostgreSQL with [pgvector](https://hub.docker.com/r/vxcontrol/pgvector) extension.
- 🎯 Scalable Architecture. Microservices-based design supporting horizontal scaling.
- 🏠 Self-Hosted Solution. Complete control over your deployment and data.
- 🔑 Flexible Authentication. Support for various LLM providers ([OpenAI](https://platform.openai.com/), [Anthropic](https://www.anthropic.com/), [Deep Infra](https://deepinfra.com/), [OpenRouter](https://openrouter.ai/)) and custom configurations.
- ⚡ Quick Deployment. Easy setup through [Docker Compose](https://docs.docker.com/compose/) with comprehensive environment configuration.

## 🏗️ Architecture

### System Context

```mermaid
flowchart TB
    classDef person fill:#08427B,stroke:#073B6F,color:#fff
    classDef system fill:#1168BD,stroke:#0B4884,color:#fff
    classDef external fill:#666666,stroke:#0B4884,color:#fff
    
    pentester["👤 Security Engineer
    (User of the system)"]
    
    pentagi["✨ PentAGI
    (Autonomous penetration testing system)"]
    
    target["🎯 target-system
    (System under test)"]
    llm["🧠 llm-provider
    (OpenAI/Anthropic/Custom)"]
    search["🔍 search-systems
    (Google/Tavily/Traversaal)"]
    langfuse["📊 langfuse-ui
    (LLM Observability Dashboard)"]
    grafana["📈 grafana
    (System Monitoring Dashboard)"]
    
    pentester --> |Uses HTTPS| pentagi
    pentester --> |Monitors AI HTTPS| langfuse
    pentester --> |Monitors System HTTPS| grafana
    pentagi --> |Tests Various protocols| target
    pentagi --> |Queries HTTPS| llm
    pentagi --> |Searches HTTPS| search
    pentagi --> |Reports HTTPS| langfuse
    pentagi --> |Reports HTTPS| grafana
    
    class pentester person
    class pentagi system
    class target,llm,search,langfuse,grafana external
    
    linkStyle default stroke:#ffffff,color:#ffffff
```

<details>
<summary><b>🔄 Container Architecture</b> (click to expand)</summary>

```mermaid
graph TB
    subgraph Core Services
        UI[Frontend UI<br/>React + TypeScript]
        API[Backend API<br/>Go + GraphQL]
        DB[(Vector Store<br/>PostgreSQL + pgvector)]
        MQ[Task Queue<br/>Async Processing]
        Agent[AI Agents<br/>Multi-Agent System]
    end

    subgraph Monitoring
        Grafana[Grafana<br/>Dashboards]
        VictoriaMetrics[VictoriaMetrics<br/>Time-series DB]
        Jaeger[Jaeger<br/>Distributed Tracing]
        Loki[Loki<br/>Log Aggregation]
        OTEL[OpenTelemetry<br/>Data Collection]
    end

    subgraph Analytics
        Langfuse[Langfuse<br/>LLM Analytics]
        ClickHouse[ClickHouse<br/>Analytics DB]
        Redis[Redis<br/>Cache + Rate Limiter]
        MinIO[MinIO<br/>S3 Storage]
    end

    subgraph Security Tools
        Scraper[Web Scraper<br/>Isolated Browser]
        PenTest[Security Tools<br/>20+ Pro Tools<br/>Sandboxed Execution]
    end

    UI --> |HTTP/WS| API
    API --> |SQL| DB
    API --> |Events| MQ
    MQ --> |Tasks| Agent
    Agent --> |Commands| Tools
    Agent --> |Queries| DB
    
    API --> |Telemetry| OTEL
    OTEL --> |Metrics| VictoriaMetrics
    OTEL --> |Traces| Jaeger
    OTEL --> |Logs| Loki
    
    Grafana --> |Query| VictoriaMetrics
    Grafana --> |Query| Jaeger
    Grafana --> |Query| Loki
    
    API --> |Analytics| Langfuse
    Langfuse --> |Store| ClickHouse
    Langfuse --> |Cache| Redis
    Langfuse --> |Files| MinIO

    classDef core fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    classDef monitoring fill:#bbf,stroke:#333,stroke-width:2px,color:#000
    classDef analytics fill:#bfb,stroke:#333,stroke-width:2px,color:#000
    classDef tools fill:#fbb,stroke:#333,stroke-width:2px,color:#000
    
    class UI,API,DB,MQ,Agent core
    class Grafana,VictoriaMetrics,Jaeger,Loki,OTEL monitoring
    class Langfuse,ClickHouse,Redis,MinIO analytics
    class Scraper,PenTest tools
```

</details>

<details>
<summary><b>📊 Entity Relationship</b> (click to expand)</summary>

```mermaid
erDiagram
    Flow ||--o{ Task : contains
    Task ||--o{ SubTask : contains
    SubTask ||--o{ Action : contains
    Action ||--o{ Artifact : produces
    Action ||--o{ Memory : stores
    
    Flow {
        string id PK
        string name "Flow name"
        string description "Flow description"
        string status "active/completed/failed"
        json parameters "Flow parameters"
        timestamp created_at
        timestamp updated_at
    }
    
    Task {
        string id PK
        string flow_id FK
        string name "Task name"
        string description "Task description"
        string status "pending/running/done/failed"
        json result "Task results"
        timestamp created_at
        timestamp updated_at
    }
    
    SubTask {
        string id PK
        string task_id FK
        string name "Subtask name"
        string description "Subtask description"
        string status "queued/running/completed/failed"
        string agent_type "researcher/developer/executor"
        json context "Agent context"
        timestamp created_at
        timestamp updated_at
    }
    
    Action {
        string id PK
        string subtask_id FK
        string type "command/search/analyze/etc"
        string status "success/failure"
        json parameters "Action parameters"
        json result "Action results"
        timestamp created_at
    }

    Artifact {
        string id PK
        string action_id FK
        string type "file/report/log"
        string path "Storage path"
        json metadata "Additional info"
        timestamp created_at
    }

    Memory {
        string id PK
        string action_id FK
        string type "observation/conclusion"
        vector embedding "Vector representation"
        text content "Memory content"
        timestamp created_at
    }
```

</details>

<details>
<summary><b>🤖 Agent Interaction</b> (click to expand)</summary>

```mermaid
sequenceDiagram
    participant O as Orchestrator
    participant R as Researcher
    participant D as Developer
    participant E as Executor
    participant VS as Vector Store
    participant KB as Knowledge Base
    
    Note over O,KB: Flow Initialization
    O->>VS: Query similar tasks
    VS-->>O: Return experiences
    O->>KB: Load relevant knowledge
    KB-->>O: Return context
    
    Note over O,R: Research Phase
    O->>R: Analyze target
    R->>VS: Search similar cases
    VS-->>R: Return patterns
    R->>KB: Query vulnerabilities
    KB-->>R: Return known issues
    R->>VS: Store findings
    R-->>O: Research results
    
    Note over O,D: Planning Phase
    O->>D: Plan attack
    D->>VS: Query exploits
    VS-->>D: Return techniques
    D->>KB: Load tools info
    KB-->>D: Return capabilities
    D-->>O: Attack plan
    
    Note over O,E: Execution Phase
    O->>E: Execute plan
    E->>KB: Load tool guides
    KB-->>E: Return procedures
    E->>VS: Store results
    E-->>O: Execution status
```

</details>

<details>
<summary><b>🧠 Memory System</b> (click to expand)</summary>

```mermaid
graph TB
    subgraph "Long-term Memory"
        VS[(Vector Store<br/>Embeddings DB)]
        KB[Knowledge Base<br/>Domain Expertise]
        Tools[Tools Knowledge<br/>Usage Patterns]
    end
    
    subgraph "Working Memory"
        Context[Current Context<br/>Task State]
        Goals[Active Goals<br/>Objectives]
        State[System State<br/>Resources]
    end
    
    subgraph "Episodic Memory"
        Actions[Past Actions<br/>Commands History]
        Results[Action Results<br/>Outcomes]
        Patterns[Success Patterns<br/>Best Practices]
    end
    
    Context --> |Query| VS
    VS --> |Retrieve| Context
    
    Goals --> |Consult| KB
    KB --> |Guide| Goals
    
    State --> |Record| Actions
    Actions --> |Learn| Patterns
    Patterns --> |Store| VS
    
    Tools --> |Inform| State
    Results --> |Update| Tools
    
    VS --> |Enhance| KB
    KB --> |Index| VS

    classDef ltm fill:#f9f,stroke:#333,stroke-width:2px,color:#000
    classDef wm fill:#bbf,stroke:#333,stroke-width:2px,color:#000
    classDef em fill:#bfb,stroke:#333,stroke-width:2px,color:#000
    
    class VS,KB,Tools ltm
    class Context,Goals,State wm
    class Actions,Results,Patterns em
```

</details>

The architecture of PentAGI is designed to be modular, scalable, and secure. Here are the key components:

1. **Core Services**
   - Frontend UI: React-based web interface with TypeScript for type safety
   - Backend API: Go-based REST and GraphQL APIs for flexible integration
   - Vector Store: PostgreSQL with pgvector for semantic search and memory storage
   - Task Queue: Async task processing system for reliable operation
   - AI Agent: Multi-agent system with specialized roles for efficient testing

2. **Monitoring Stack**
   - OpenTelemetry: Unified observability data collection and correlation
   - Grafana: Real-time visualization and alerting dashboards
   - VictoriaMetrics: High-performance time-series metrics storage
   - Jaeger: End-to-end distributed tracing for debugging
   - Loki: Scalable log aggregation and analysis

3. **Analytics Platform**
   - Langfuse: Advanced LLM observability and performance analytics
   - ClickHouse: Column-oriented analytics data warehouse
   - Redis: High-speed caching and rate limiting
   - MinIO: S3-compatible object storage for artifacts

4. **Security Tools**
   - Web Scraper: Isolated browser environment for safe web interaction
   - Pentesting Tools: Comprehensive suite of 20+ professional security tools
   - Sandboxed Execution: All operations run in isolated containers

5. **Memory Systems**
   - Long-term Memory: Persistent storage of knowledge and experiences
   - Working Memory: Active context and goals for current operations
   - Episodic Memory: Historical actions and success patterns
   - Knowledge Base: Structured domain expertise and tool capabilities

The system uses Docker containers for isolation and easy deployment, with separate networks for core services, monitoring, and analytics to ensure proper security boundaries. Each component is designed to scale horizontally and can be configured for high availability in production environments.

## 🚀 Quick Start

### System Requirements

- Docker and Docker Compose
- Minimum 4GB RAM
- 10GB free disk space
- Internet access for downloading images and updates

### Basic Installation

1. Create a working directory or clone the repository:

```bash
mkdir pentagi && cd pentagi
```

2. Copy `.env.example` to `.env` or download it:

```bash
curl -o .env https://raw.githubusercontent.com/vxcontrol/pentagi/master/.env.example
```

3. Fill in the required API keys in `.env` file.

```bash
# Required: At least one of these LLM providers
OPEN_AI_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key

# Optional: Additional search capabilities
GOOGLE_API_KEY=your_google_key
GOOGLE_CX_KEY=your_google_cx
TAVILY_API_KEY=your_tavily_key
TRAVERSAAL_API_KEY=your_traversaal_key
```

4. Change all security related environment variables in `.env` file to improve security.

<details>
    <summary>Security related environment variables</summary>

### Main Security Settings
- `COOKIE_SIGNING_SALT` - Salt for cookie signing, change to random value
- `PUBLIC_URL` - Public URL of your server (eg. `https://pentagi.example.com`)
- `SERVER_SSL_CRT` and `SERVER_SSL_KEY` - Custom paths to your existing SSL certificate and key for HTTPS (these paths should be used in the docker-compose.yml file to mount as volumes)

### Scraper Access
- `SCRAPER_PUBLIC_URL` - Public URL for scraper if you want to use different scraper server for public URLs
- `SCRAPER_PRIVATE_URL` - Private URL for scraper (local scraper server in docker-compose.yml file to access it to local URLs)

### Access Credentials
- `PENTAGI_POSTGRES_USER` and `PENTAGI_POSTGRES_PASSWORD` - PostgreSQL credentials

</details>

5. Remove all inline comments from `.env` file if you want to use it in VSCode or other IDEs as a envFile option:

```bash
perl -i -pe 's/\s+#.*$//' .env
```

6. Run the PentAGI stack:

```bash
curl -O https://raw.githubusercontent.com/vxcontrol/pentagi/master/docker-compose.yml
docker compose up -d
```

Visit [localhost:8443](https://localhost:8443) to access PentAGI Web UI (default is `admin@pentagi.com` / `admin`)

> [!NOTE]
> If you caught an error about `pentagi-network` or `observability-network` or `langfuse-network` you need to run `docker-compose.yml` firstly to create these networks and after that run `docker-compose-langfuse.yml` and `docker-compose-observability.yml` to use Langfuse and Observability services.
> 
> You have to set at least one Language Model provider (OpenAI or Anthropic) to use PentAGI. Additional API keys for search engines are optional but recommended for better results.
> 
> `LLM_SERVER_*` environment variables are experimental feature and will be changed in the future. Right now you can use them to specify custom LLM server URL and one model for all agent types.
> 
> `PROXY_URL` is a global proxy URL for all LLM providers and external search systems. You can use it for isolation from external networks.
>
> The `docker-compose.yml` file runs the PentAGI service as root user because it needs access to docker.sock for container management. If you're using TCP/IP network connection to Docker instead of socket file, you can remove root privileges and use the default `pentagi` user for better security.

For advanced configuration options and detailed setup instructions, please visit our [documentation](https://docs.pentagi.com).

## 🔧 Advanced Setup

### Langfuse Integration

Langfuse provides advanced capabilities for monitoring and analyzing AI agent operations.

1. Configure Langfuse environment variables in existing `.env` file.

<details>
    <summary>Langfuse valuable environment variables</summary>

### Database Credentials
- `LANGFUSE_POSTGRES_USER` and `LANGFUSE_POSTGRES_PASSWORD` - Langfuse PostgreSQL credentials
- `LANGFUSE_CLICKHOUSE_USER` and `LANGFUSE_CLICKHOUSE_PASSWORD` - ClickHouse credentials
- `LANGFUSE_REDIS_AUTH` - Redis password

### Encryption and Security Keys
- `LANGFUSE_SALT` - Salt for hashing in Langfuse Web UI
- `LANGFUSE_ENCRYPTION_KEY` - Encryption key (32 bytes in hex)
- `LANGFUSE_NEXTAUTH_SECRET` - Secret key for NextAuth

### Admin Credentials
- `LANGFUSE_INIT_USER_EMAIL` - Admin email
- `LANGFUSE_INIT_USER_PASSWORD` - Admin password
- `LANGFUSE_INIT_USER_NAME` - Admin username

### API Keys and Tokens
- `LANGFUSE_INIT_PROJECT_PUBLIC_KEY` - Project public key (used from PentAGI side too)
- `LANGFUSE_INIT_PROJECT_SECRET_KEY` - Project secret key (used from PentAGI side too)

### S3 Storage
- `LANGFUSE_S3_ACCESS_KEY_ID` - S3 access key ID
- `LANGFUSE_S3_SECRET_ACCESS_KEY` - S3 secret access key

</details>

2. Enable integration with Langfuse for PentAGI service in `.env` file.

```bash
LANGFUSE_BASE_URL=http://langfuse-web:3000
LANGFUSE_PROJECT_ID= # default: value from ${LANGFUSE_INIT_PROJECT_ID}
LANGFUSE_PUBLIC_KEY= # default: value from ${LANGFUSE_INIT_PROJECT_PUBLIC_KEY}
LANGFUSE_SECRET_KEY= # default: value from ${LANGFUSE_INIT_PROJECT_SECRET_KEY}
```

3. Run the Langfuse stack:

```bash
curl -O https://raw.githubusercontent.com/vxcontrol/pentagi/master/docker-compose-langfuse.yml
docker compose -f docker-compose.yml -f docker-compose-langfuse.yml up -d
```

Visit [localhost:4000](http://localhost:4000) to access Langfuse Web UI with credentials from `.env` file:

- `LANGFUSE_INIT_USER_EMAIL` - Admin email
- `LANGFUSE_INIT_USER_PASSWORD` - Admin password

### Monitoring and Observability

For detailed system operation tracking, integration with monitoring tools is available.

1. Enable integration with OpenTelemetry and all observability services for PentAGI in `.env` file.

```bash
OTEL_HOST=otelcol:8148
```

2. Run the observability stack:

```bash
curl -O https://raw.githubusercontent.com/vxcontrol/pentagi/master/docker-compose-observability.yml
docker compose -f docker-compose.yml -f docker-compose-observability.yml up -d
```

Visit [localhost:3000](http://localhost:3000) to access Grafana Web UI.

> [!NOTE]
> If you want to use Observability stack with Langfuse, you need to enable integration in `.env` file to set `LANGFUSE_OTEL_EXPORTER_OTLP_ENDPOINT` to `http://otelcol:4318`.
> 
> And you need to run both stacks `docker compose -f docker-compose.yml -f docker-compose-langfuse.yml -f docker-compose-observability.yml up -d` to have all services running.
> 
> Also you can register aliases for these commands in your shell to run it faster:
>
> ```bash
> alias pentagi="docker compose -f docker-compose.yml -f docker-compose-langfuse.yml -f docker-compose-observability.yml"
> alias pentagi-up="docker compose -f docker-compose.yml -f docker-compose-langfuse.yml -f docker-compose-observability.yml up -d"
> alias pentagi-down="docker compose -f docker-compose.yml -f docker-compose-langfuse.yml -f docker-compose-observability.yml down"```

### GitHub and Google OAuth Integration

OAuth integration with GitHub and Google allows users to authenticate using their existing accounts on these platforms. This provides several benefits:

- Simplified login process without need to create separate credentials
- Enhanced security through trusted identity providers
- Access to user profile information from GitHub/Google accounts
- Seamless integration with existing development workflows

For using GitHub OAuth you need to create a new OAuth application in your GitHub account and set the `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` in `.env` file.

For using Google OAuth you need to create a new OAuth application in your Google account and set the `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env` file.

## 💻 Development

### Development Requirements

- golang
- nodejs
- docker
- postgres
- commitlint

### Environment Setup

#### Backend Setup

Run once `cd backend && go mod download` to install needed packages.

For generating swagger files have to run 

```bash
swag init -g ../../pkg/server/router.go -o pkg/server/docs/ --parseDependency --parseInternal --parseDepth 2 -d cmd/pentagi
```

before installing `swag` package via 

```bash
go install github.com/swaggo/swag/cmd/swag@v1.8.7
```

For generating graphql resolver files have to run 

```bash
go run github.com/99designs/gqlgen --config ./gqlgen/gqlgen.yml
```

after that you can see the generated files in `pkg/graph` folder.

For generating ORM methods (database package) from sqlc configuration

```bash
docker run --rm -v $(pwd):/src -w /src --network pentagi-network -e DATABASE_URL="{URL}" sqlc/sqlc generate -f sqlc/sqlc.yml
```

For generating Langfuse SDK from OpenAPI specification

```bash
fern generate --local
```

and to install fern-cli

```bash
npm install -g fern-api
```

#### Testing

For running tests `cd backend && go test -v ./...`

#### Frontend Setup

Run once `cd frontend && npm install` to install needed packages.

For generating graphql files have to run `npm run graphql:generate` which using `graphql-codegen.ts` file.

Be sure that you have `graphql-codegen` installed globally:

```bash
npm install -g graphql-codegen
```

After that you can run:
* `npm run prettier` to check if your code is formatted correctly
* `npm run prettier:fix` to fix it
* `npm run lint` to check if your code is linted correctly
* `npm run lint:fix` to fix it

For generating SSL certificates you need to run `npm run ssl:generate` which using `generate-ssl.ts` file or it will be generated automatically when you run `npm run dev`.

#### Backend Configuration

Edit the configuration for `backend` in `.vscode/launch.json` file:
- `DATABASE_URL` - PostgreSQL database URL (eg. `postgres://postgres:postgres@localhost:5432/pentagidb?sslmode=disable`)
- `DOCKER_HOST` - Docker SDK API (eg. for macOS `DOCKER_HOST=unix:///Users/<my-user>/Library/Containers/com.docker.docker/Data/docker.raw.sock`) [more info](https://stackoverflow.com/a/62757128/5922857)

Optional:
- `SERVER_PORT` - Port to run the server (default: `8443`)
- `SERVER_USE_SSL` - Enable SSL for the server (default: `false`)

#### Frontend Configuration

Edit the configuration for `frontend` in `.vscode/launch.json` file:
- `VITE_API_URL` - Backend API URL. *Omit* the URL scheme (e.g., `localhost:8080` *NOT* `http://localhost:8080`)
- `VITE_USE_HTTPS` - Enable SSL for the server (default: `false`)
- `VITE_PORT` - Port to run the server (default: `8000`)
- `VITE_HOST` - Host to run the server (default: `0.0.0.0`)

### Running the Application

#### Backend

Run the command(s) in `backend` folder:
- Use `.env` file to set environment variables like a `source .env`
- Run `go run cmd/pentagi/main.go` to start the server

> [!NOTE]
> The first run can take a while as dependencies and docker images need to be downloaded to setup the backend environment.

#### Frontend

Run the command(s) in `frontend` folder:
- Run `npm install` to install the dependencies
- Run `npm run dev` to run the web app
- Run `npm run build` to build the web app

Open your browser and visit the web app URL.

## 🏗️ Building

### Building Docker Image

```bash
docker build -t local/pentagi:latest .
```

> [!NOTE]
> You can use `docker buildx` to build the image for different platforms like a `docker buildx build --platform linux/amd64 -t local/pentagi:latest .`
>
> You need to change image name in docker-compose.yml file to `local/pentagi:latest` and run `docker compose up -d` to start the server or use `build` key option in [docker-compose.yml](docker-compose.yml) file.

## 👏 Credits

This project is made possible thanks to the following research and developments:
- [Emerging Architectures for LLM Applications](https://lilianweng.github.io/posts/2023-06-23-agent)
- [A Survey of Autonomous LLM Agents](https://arxiv.org/abs/2403.08299)

## 📄 License

Copyright (c) PentAGI Development Team. [MIT License](https://github.com/vxcontrol/pentagi/blob/master/LICENSE)
