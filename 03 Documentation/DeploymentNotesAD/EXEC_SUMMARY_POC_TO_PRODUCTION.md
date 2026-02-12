# Executive Summary: B2C Autowartungs-App — From PoC to Production

## Purpose of This Document

This document assesses the current B2C Autowartungs-App as a **Proof of Concept (PoC)** and outlines what is required to integrate it into Ronya's enterprise product stack. It maps the application's current state against the organization's Non-Functional Requirements (NFRs) and evaluates the path toward a production-grade system built on the enterprise tech stack (C# / .NET Aspire / Azure).

**Audience:** CTO, Tech Leadership, C-Suite

---

## 1. What the PoC Delivers

The PoC is a fully functional car maintenance booking platform covering the end-to-end business process across four portals (Customer, Jockey, Workshop, Admin). It demonstrates:

- Complete booking lifecycle with state machine (15+ states)
- Dynamic pricing by vehicle type and service
- Stripe payment integration (intents, webhooks, refunds, extensions)
- Concierge service (Hol- und Bringservice) with jockey assignment and tracking
- Multi-language support (DE/EN, 1000+ i18n keys)
- Push notifications (Firebase Cloud Messaging)
- File uploads with image processing
- Role-based access control (Customer, Jockey, Workshop, Admin)
- 45+ E2E test scenarios, 15+ unit/API tests

**The PoC's value is in validating the business model and workflows, not in being production-ready software.**

---

## 2. Current Tech Stack vs. Enterprise Target

| Layer | PoC (Current) | Enterprise Target | Gap |
|---|---|---|---|
| **Backend** | Node.js 20 / Express 4.21 / TypeScript | **C# / .NET 9 / ASP.NET Core** | Full rewrite |
| **App Framework** | — | **.NET Aspire** (orchestration, service defaults, observability) | New |
| **Frontend** | Next.js 16 / React 19 / TypeScript | Next.js or Blazor (decision needed) | Retain or rewrite |
| **Database** | PostgreSQL 16 / Prisma ORM | PostgreSQL / **Entity Framework Core** | ORM migration |
| **API Style** | REST (Express routes) | REST / **Minimal APIs or Controllers** | Rewrite |
| **Auth** | Custom JWT + Magic Links | **Ronya Identity Provider** | Rewrite |
| **Application Messaging** | Direct HTTP calls | **Azure Service Bus** (async, decoupled) | New |
| **File Storage** | **Azure Blob Storage** | **Azure Blob Storage** | SDK swap |
| **Payments** | Stripe (Node SDK) | Stripe (.NET SDK) | SDK swap |
| **Email** | Nodemailer / Resend | **Postmark** | SDK swap |
| **Push Notifications** | Firebase Admin (Node) | Firebase Admin (.NET) or **Twillio or similar service** | SDK swap |
| **Observability** | Winston (basic logging) | **OpenTelemetry + Application Insights** (built into Aspire) | Major uplift |
| **CI/CD** | **Azure DevOps Pipelines** | **Azure DevOps Pipelines** | enhanced |
| **IaC** | **Terraform** | **Terraform** | New |
| **Containerization** | Dev-only Dockerfiles | **Production containers via Aspire** | Rebuild |

---

## 3. NFR Gap Analysis

### 3.1 Reliability

| NFR | Target | PoC Status | Gap Severity |
|---|---|---|---|
| **Availability** | 99.50% for customer-facing features | No HA, single-instance, no health monitoring | **Critical** |
| **Availability** | Basic HA supported by all components | No HA configuration at any layer | **Critical** |
| **Availability** | Staged HA & Recovery (1 AZ → multi-AZ → multi-region) | Not addressed | **Critical** |
| **Availability** | Monitoring for unavailability and errors | No monitoring infrastructure | **Critical** |
| **Fault tolerance** | No data loss when writing to databases | No transaction guarantees beyond Prisma defaults | **High** |
| **Observability** | Structured logging (JSON), RED metrics, correlation IDs, distributed tracing, health/readiness endpoints, PII-free logs, centralized alerts with runbooks | Winston console logging only, no correlation IDs, no tracing, no RED metrics, PII in logs not addressed | **Critical** |
| **Recoverability** | Backup & recovery strategy for DBs, runtimes, API Mgmt | No backup strategy defined | **Critical** |
| **RPO** | 24h (initial) → 4h (target) | No backups configured | **Critical** |
| **RTO** | 48h (initial) → 12h (target) | No recovery procedures, no runbooks | **Critical** |

**.NET Aspire advantage:** Built-in health checks, structured logging via `ILogger`, OpenTelemetry integration out-of-the-box, service discovery, and orchestrated startup/readiness — addressing most observability NFRs by default.

### 3.2 Security & Privacy

| NFR | Target | PoC Status | Gap Severity |
|---|---|---|---|
| **Confidentiality** | Rights & role concept, data access restricted to authorized users/services | Basic RBAC exists, but no service-to-service auth, hardcoded dev secrets | **High** |
| **Confidentiality** | Data persisted on processing-need principle only | Not audited, no data classification | **High** |
| **Confidentiality** | Logs must NOT contain sensitive data on PROD | Not enforced, no PII masking | **High** |
| **Integrity** | Data at rest encrypted (disk, DB, or application level) | Not configured (depends on infra) | **High** |
| **Integrity** | Data in transport encrypted (SSL/TLS) | HTTPS not enforced, no Helmet headers, no CSP | **High** |
| **Non-repudiation** | Logging of business-critical processing steps | Partial — basic booking events logged, no audit trail | **Medium** |
| **Accountability** | Actions traceable to entity | JWT-based identity, but no structured audit log | **Medium** |
| **Authenticity** | External interfaces must authenticate users | JWT auth on API, but no CSRF protection, insecure JWT_SECRET fallback | **High** |

**.NET Aspire advantage:** ASP.NET Core has built-in middleware for HTTPS redirection, HSTS, CSRF (anti-forgery tokens), authentication/authorization pipelines, and data protection APIs. Integration with **Microsoft Entra ID** provides enterprise-grade identity management.

### 3.3 Performance & Efficiency

| NFR | Target | PoC Status | Gap Severity |
|---|---|---|---|
| **Time behavior** | Data processing sub-second (ideally <250 ms) | No benchmarks, unknown | **Medium** |
| **Time behavior** | Non-bulk REST API calls <250 ms | No load testing performed | **Medium** |
| **Time behavior** | Bulk REST API calls <5 seconds | No load testing performed | **Medium** |
| **Time behavior** | UI interactions <2 seconds | No performance profiling | **Medium** |
| **Resource utilization** | TBD | No resource monitoring | **Low** (TBD) |
| **Capacity** | Quantity model TBD | No capacity planning | **Low** (TBD) |

**.NET Aspire advantage:** .NET consistently outperforms Node.js in throughput benchmarks (TechEmpower). ASP.NET Core Minimal APIs are among the fastest web frameworks. Aspire provides built-in metrics dashboards for resource utilization monitoring.

### 3.4 Maintainability

| NFR | Target | PoC Status | Gap Severity |
|---|---|---|---|
| **Modularity** | Microservice architecture, avoid monoliths | Monolithic Express app (single process) | **Critical** |
| **Analysability** | Modular components with well-defined interfaces | Layered (controllers/services/repos) but single deployable | **High** |
| **Testability** | Unit tests, automated API tests, automated UI tests | 45+ E2E tests, 15+ unit tests — good foundation but tests are Node.js-specific | **Medium** |
| **Reusability** | TBD | Business logic tightly coupled to Express/Prisma | **High** |
| **Modifyability** | TBD | TypeScript codebase, but no API versioning | **Medium** |

**.NET Aspire advantage:** Aspire is designed for distributed applications from the start. Each service (booking, payment, notification, auth) becomes a separate .NET project with its own deployment lifecycle. Service discovery and orchestration are built-in.

### 3.5 Portability

| NFR | Target | PoC Status | Gap Severity |
|---|---|---|---|
| **Installability** | "Pets vs cattle" — IaC for app code, config, credentials | Dev-only Docker, no IaC, manual setup | **Critical** |
| **Replaceability** | Follow architecture guidelines for component selection | Current stack (Node.js) not aligned with enterprise stack (.NET) | **Critical** |
| **Adaptability** | TBD | Single-cloud dependencies not abstracted | **Medium** |

---

## 4. Strategic Options

### Option A: Deploy PoC As-Is to Azure (Quick Win)
- Deploy the Node.js/Next.js app to Azure App Service (as per existing `AZURE_DEPLOYMENT_PLAN.md`)
- Use for PoC demos, stakeholder validation, and learning
- **Timeline:** 2-4 weeks
- **Cost:** ~$425/month
- **NFR compliance:** Minimal — acceptable for PoC phase only
- **Risk:** Technical debt accumulates if this becomes the "real" system

### Option B: Rebuild Backend on .NET Aspire, Retain Frontend (Recommended)
- **Retain:** Next.js frontend (mature, good UX, i18n working), Prisma schema as EF Core migration blueprint, E2E test scenarios as acceptance criteria, business logic / state machine as specification
- **Rebuild:** Backend as .NET Aspire distributed application with proper microservices
- **New:** Azure Service Bus for async messaging, Entra ID for auth, OpenTelemetry for observability
- **Timeline:** 3-5 months (backend rebuild + integration)
- **Cost:** Higher initial investment, lower long-term operational cost
- **NFR compliance:** Full compliance achievable
- **Risk:** Requires .NET engineering capacity

### Option C: Full Rewrite (Backend + Frontend)
- Rebuild everything on .NET stack (ASP.NET Core backend + Blazor frontend)
- Maximum alignment with enterprise stack
- **Timeline:** 5-8 months
- **Cost:** Highest initial investment
- **NFR compliance:** Full compliance
- **Risk:** Loss of validated UX, longer time to market, requires Blazor expertise

---

## 5. Recommended Approach: Option B — Hybrid Migration

### What We Keep from the PoC
| Asset | Reuse How |
|---|---|
| **Business logic & workflows** | Specification for .NET services (booking FSM, pricing, extensions) |
| **Database schema** | Blueprint for EF Core entity model (Prisma → EF Core migration) |
| **Next.js frontend** | Retain as-is, point to new .NET API |
| **E2E test scenarios** | Acceptance criteria for the rebuilt system |
| **i18n translations** | Reuse 1000+ translation keys directly |
| **Stripe integration logic** | Port to Stripe .NET SDK (same API concepts) |
| **UX/UI design** | Retain all component designs and user flows |

### Target Architecture (.NET Aspire)

```
                    Azure Front Door (CDN + WAF)
                              |
              +---------------+----------------+
              |                                |
    Next.js Frontend              .NET Aspire App Host
    (Azure App Service)                   |
              |               +-----------+-----------+
              |               |           |           |
          REST API      Booking      Payment     Notification
          Gateway       Service      Service      Service
         (YARP)        (.NET)       (.NET)        (.NET)
              |               |           |           |
              +-------+-------+-----------+-----------+
                      |                   |
              Azure Service Bus    PostgreSQL (EF Core)
                                          |
                                   Azure Blob Storage
```

### .NET Aspire Services Breakdown

| Service | Responsibility | Key Tech |
|---|---|---|
| **API Gateway** | Routing, rate limiting, auth validation | YARP reverse proxy |
| **Booking Service** | Booking lifecycle, FSM, scheduling | ASP.NET Core, EF Core |
| **Payment Service** | Stripe intents, webhooks, refunds | Stripe .NET SDK |
| **Notification Service** | Email, push, SMS | Azure Communication Services |
| **Identity Service** | Auth, RBAC, Magic Links | Microsoft Entra ID / ASP.NET Identity |
| **Upload Service** | File storage, image processing | Azure Blob SDK, ImageSharp |
| **Analytics Service** | Metrics, reporting | Application Insights SDK |

---

## 6. Key Actions to Address NFRs

### Reliability
- **High Availability & Recovery** — Deploy across availability zones, configure health probes and auto-restart for all services, establish backup strategy targeting RPO 4h / RTO 12h
- **Observability** — Implement OpenTelemetry with structured JSON logging, RED metrics, correlation IDs across sync and async boundaries, and centralized alert dashboards with runbooks
- **Fault tolerance** — Use database transactions for all multi-step business operations (bookings, payments, extensions)

### Security & Privacy
- **Identity** — Integrate Ronya Identity Provider, replacing custom JWT auth; add service-to-service auth via Managed Identity
- **Encryption** — Enforce TLS 1.2+ for all transport; enable encryption at rest on database and storage; add HSTS and CSRF protection
- **Data governance** — Implement PII masking in logs, audit trails for business-critical actions, and data minimization policies (GDPR)

### Performance & Efficiency
- **Baselines & budgets** — Load-test all customer-facing APIs against NFR targets (<250 ms non-bulk, <5s bulk); enforce SLOs in CI/CD
- **Optimization** — Add caching for frequently read data (pricing, slots), optimize database queries with proper indexing

### Maintainability
- **Microservice decomposition** — Split the monolith into bounded-context services (Booking, Payment, Notification, Identity, Upload) with versioned OpenAPI contracts
- **Test pyramid** — Unit tests (>80% coverage on business logic), integration tests, contract tests between services, E2E tests for critical paths

### Portability
- **Infrastructure as Code** — All Azure resources, configuration, DNS, and secrets provisioned via Terraform; fully reproducible environments ("cattle not pets")
- **Cloud abstraction** — Use interfaces for storage, messaging, and email providers so implementations can be swapped without rewriting services

---

## 7. NFR Compliance Roadmap (Summary)

| Phase | Timeline | NFR Coverage |
|---|---|---|
| **Phase 0: PoC on Azure** | Now + 2-4 weeks | Deploy current app for demos. Minimal NFR compliance. |
| **Phase 1: Foundation** | Month 1-2 | Aspire project scaffolding, EF Core schema, Entra ID auth, CI/CD pipelines, IaC (Terraform). Addresses: **Installability, Authenticity, Confidentiality**. |
| **Phase 2: Core Services** | Month 2-4 | Booking + Payment + Notification services. Service Bus integration. Addresses: **Modularity, Analysability, Fault tolerance**. |
| **Phase 3: Observability & Security** | Month 3-4 | OpenTelemetry, structured logging, PII masking, audit trails, encryption at rest. Addresses: **Observability, Integrity, Non-repudiation, Accountability**. |
| **Phase 4: Resilience & Performance** | Month 4-5 | HA configuration, backup strategy, load testing, performance tuning. Addresses: **Availability (99.5%), RPO/RTO, Time behavior, Capacity**. |
| **Phase 5: Production Launch** | Month 5 | DNS, monitoring alerts, runbooks, staged HA rollout. Addresses: **Recoverability, staged HA & Recovery**. |

---

## 8. Key Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| PoC becomes the "real" system | Tech debt locks in non-enterprise stack, NFR gaps persist | Clear communication that PoC is temporary; set sunset date |
| .NET engineering capacity not available | Rebuild timeline extends | Hire or upskill early; leverage Aspire's opinionated defaults to accelerate |
| Frontend/backend contract breaks during migration | Regressions in user experience | Keep API contract stable; run PoC E2E tests against new backend as validation |
| Scope creep during rebuild | Timeline and budget overrun | Rebuild only what the PoC validated; no new features until parity |
| Business stakeholders lose patience during rebuild | Pressure to ship PoC to production | Keep PoC running on Azure for demos; parallel track rebuild |

---

## 9. Cost Comparison

| | PoC on Azure (Option A) | Aspire Rebuild (Option B) | Full Rewrite (Option C) |
|---|---|---|---|
| **Azure infra (monthly)** | ~$425 | ~$600-800 (more services) | ~$600-800 |
| **Dev effort** | 2-4 weeks (deploy only) | 3-5 months (2-3 engineers) | 5-8 months (3-4 engineers) |
| **NFR compliance** | Minimal | Full | Full |
| **Tech stack alignment** | None (.NET gap remains) | Backend aligned, frontend retained | Fully aligned |
| **Time to first demo** | 2-4 weeks | 2-3 months (MVP parity) | 4-6 months |
| **Long-term maintenance** | High (two tech stacks) | Medium (one backend stack) | Low (single stack) |

---

## 10. Five Recommended Actions After the PoC

### 1. Harvest Business Insights
- **Validate the revenue model** — Measure booking conversion rates, funnel drop-off points, and pricing acceptance across service types
- **Assess operational workflows** — Evaluate jockey handover timing, extension approval speed, and workshop capacity model against real-world patterns
- **Capture unit economics** — Calculate cost per booking, revenue per customer, and concierge margins to build the production investment case

### 2. Collect and Act on User Feedback
- **Run structured user testing** — Test with real customers, jockeys, and workshop staff; measure task completion, time-on-task, and error rates per portal
- **Prioritize UX fixes** — Identify screens where users hesitate or abandon flows; rank friction points by business impact for the production version
- **Validate localization and accessibility** — Confirm DE/EN coverage meets market needs; assess additional languages and WCAG 2.1 AA compliance

### 3. Define the Production Feature Scope
- **Triage features into launch tiers** — Classify as "must-have" (core booking, payment, concierge), "defer post-launch" (analytics, advanced scheduling), or "new from PoC feedback"
- **Capture capability gaps** — Document unmet needs surfaced during PoC: recurring bookings, fleet accounts, loyalty programs, workshop self-onboarding
- **Build a prioritized backlog** — Ground every item in validated PoC outcomes, not assumptions; a focused v1 reaches production faster

### 4. Adopt the Enterprise Tech Stack
- **Rebuild backend on C# / .NET Aspire** — Use the PoC's business logic, state machine, and Prisma schema as the specification for .NET services and EF Core models
- **Retain the Next.js frontend** — Reuse 30+ pages, 1000+ i18n keys, and Stripe UI; point it at the new .NET API with the same REST contract
- **Establish DevOps from day one** — Set up Azure DevOps pipelines, Terraform IaC, and production containers before writing business logic

### 5. Address Non-Functional Requirements
- **Close 11 critical reliability gaps** — Deploy across availability zones, implement OpenTelemetry observability, configure backups (RPO 4h / RTO 12h), decompose the monolith
- **Implement enterprise security** — Integrate Ronya Identity Provider, encrypt data at rest and in transit, add PII masking in logs and audit trails for business-critical actions
- **Establish performance baselines** — Load-test all APIs against NFR targets (<250 ms), set SLO budgets per service, and wire up monitoring with alerts and runbooks before go-live

---

## 11. Recommendation

**Deploy the PoC to Azure now (Option A)** for stakeholder demos and business validation, while **starting the .NET Aspire backend rebuild (Option B)** in parallel. This gives the organization:

1. **Immediate value** — a working demo to validate the business model with real users
2. **Enterprise alignment** — the production system is built on C# / .NET Aspire from day one
3. **NFR compliance** — the rebuild addresses all NFRs by design, not as retrofits
4. **Risk reduction** — the PoC's validated business logic serves as a specification, reducing rebuild uncertainty
5. **Frontend reuse** — the Next.js frontend (proven UX, i18n, Stripe integration) is retained, saving 30-40% of total effort

**The PoC has done its job: it proved the business works. Now build it right.**
