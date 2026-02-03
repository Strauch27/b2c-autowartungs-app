# B2C Workshop Booking - Plugin System Dokumentation

## Übersicht

Dieses Projekt nutzt ein umfassendes Plugin-System mit spezialisierten Agents, Skills, Hooks und Commands für die B2C Werkstatt-Terminbuchungs-App.

## Projektstruktur

```
/Users/stenrauch/Downloads/B2C App/
├── .claude-plugin/
│   └── plugin.json                    # Zentrale Plugin-Definition
├── .claude/
│   ├── agents/                        # Spezialisierte Agents (7)
│   │   ├── fullstack-engineer.md
│   │   ├── qa-test-engineer.md
│   │   ├── security-privacy-engineer.md
│   │   ├── tech-lead-architect.md
│   │   ├── ux-ui-designer.md
│   │   ├── product-manager.md
│   │   └── data-analytics-engineer.md
│   ├── skills/                        # Wiederverwendbare Skills (4)
│   │   ├── security-validation.md
│   │   ├── gdpr-compliance-check.md
│   │   ├── frontend-design.md
│   │   └── code-review.md
│   ├── hooks/                         # Event Hooks (1)
│   │   └── security-pre-commit.md
│   ├── commands/                      # Slash Commands (1)
│   │   └── commit.md
│   └── settings.local.json            # Lokale Einstellungen
└── docs/                              # Projekt-Dokumentation
```

## Agents (7 spezialisierte Rollen)

### 1. fullstack-engineer
**Zweck**: Vollständige App-Implementierung (Frontend + Backend + DB)

**Verantwortlichkeiten**:
- Frontend: Next.js Pages, React Components, UI/UX
- Backend: API Routes, Business Logic, Validation
- Database: Prisma Schema, Migrations, Queries
- Auth: Magic Links, Guest Booking
- Terminlogik: Slot-Findung, Race Condition Prevention
- Notifications: Email/SMS Integration
- Testing: Unit, Integration, E2E Tests

**Ausgestattete Skills**:
- `frontend-design`: UI-Entwicklung Best Practices
- `security-validation`: Automatische Security Checks
- `code-quality-check`: Code Quality Validierung
- `performance-optimization`: Performance Tuning

**Arbeitet mit**: qa-test-engineer, security-privacy-engineer, ux-ui-designer

### 2. qa-test-engineer
**Zweck**: Quality Assurance und umfassende Testing-Strategie

**Verantwortlichkeiten**:
- Test-Strategie entwickeln
- Unit Tests schreiben (>80% Coverage)
- Integration Tests (API + DB)
- E2E Tests (Playwright)
- Bug Detection & Reporting
- Regression Testing

**Ausgestattete Skills**:
- `code-review`: Comprehensive Code Review
- `test-coverage-analysis`: Coverage Gap Analysis
- `bug-detection`: Automated Bug Detection

**Arbeitet mit**: fullstack-engineer, tech-lead-architect

### 3. security-privacy-engineer
**Zweck**: Security Auditing und GDPR Compliance

**Verantwortlichkeiten**:
- Security Audits (OWASP Top 10)
- GDPR Compliance Validierung
- Penetration Testing
- Vulnerability Scanning
- Security Documentation
- Incident Response Planning

**Ausgestattete Skills**:
- `security-audit`: Deep Security Analysis
- `gdpr-compliance-check`: GDPR Validierung
- `vulnerability-scan`: Automated Vulnerability Detection

**Arbeitet mit**: fullstack-engineer, tech-lead-architect

### 4. tech-lead-architect
**Zweck**: System-Architektur und technische Führung

**Verantwortlichkeiten**:
- System Architecture Design
- Technology Stack Auswahl
- API Contract Definition
- Architecture Decision Records (ADRs)
- Code Review (Architecture Level)
- Technical Guidance für Team

**Ausgestattete Skills**:
- `architecture-review`: Architecture Validation
- `technical-guidance`: Best Practice Enforcement
- `code-quality-check`: High-Level Code Review

**Arbeitet mit**: Alle Agents (Koordination)

### 5. ux-ui-designer
**Zweck**: User Experience und Interface Design

**Verantwortlichkeiten**:
- User Research & Personas
- Wireframes & Mockups
- Design System Entwicklung
- Component Specifications
- Accessibility (WCAG 2.1 AA)
- Responsive Design (Mobile-First)
- Usability Testing

**Ausgestattete Skills**:
- `frontend-design`: UI Implementation Guidance
- `accessibility-check`: WCAG Compliance Validation
- `responsive-design-validation`: Responsive Testing

**Arbeitet mit**: fullstack-engineer, product-manager

### 6. product-manager
**Zweck**: Product Strategy und Requirements Management

**Verantwortlichkeiten**:
- Product Requirements definieren (PRS)
- User Stories schreiben
- Backlog Management
- Acceptance Criteria Definition
- Stakeholder Communication
- Sprint Planning
- Feature Priorisierung

**Ausgestattete Skills**:
- `requirements-analysis`: Requirements Breakdown
- `user-story-writing`: User Story Generation
- `acceptance-criteria-definition`: AC Definition

**Arbeitet mit**: ux-ui-designer, tech-lead-architect

### 7. data-analytics-engineer
**Zweck**: Data Analysis und Business Intelligence

**Verantwortlichkeiten**:
- Analytics Setup (Google Analytics, Mixpanel)
- KPI Tracking (Booking Rate, No-Show Rate, etc.)
- Data Warehouse Design
- Reporting Dashboards
- A/B Testing Setup
- Data-Driven Insights

**Ausgestattete Skills**:
- `data-analysis`: Analytics Implementation
- `metrics-tracking`: KPI Monitoring
- `reporting`: Dashboard Creation

**Arbeitet mit**: product-manager, fullstack-engineer

## Skills (4 wiederverwendbare Fähigkeiten)

### 1. security-validation
**Zweck**: Automatische Security-Validierung vor Code-Änderungen

**Prüft**:
- SQL Injection (String Interpolation in Queries)
- XSS (innerHTML ohne Sanitization)
- Command Injection (Shell Command Interpolation)
- Hardcoded Secrets (API Keys, Passwords)
- Path Traversal (User Input in File Paths)
- Weak Crypto (MD5, SHA1 für Passwords)
- Missing Authentication (Unprotected API Routes)
- Insufficient Input Validation (No Zod Schemas)

**Auto-Invoke bei**:
- API Endpoints
- Database Queries
- User Input Handling
- Authentication/Authorization

**Output**: Severity-basierte Warnings (Critical, High, Medium) mit Fix-Vorschlägen

### 2. gdpr-compliance-check
**Zweck**: GDPR Compliance Validierung

**Prüft**:
- Lawfulness & Transparency (Explicit Consent)
- Purpose Limitation (Data Usage Purpose)
- Data Minimization (Necessary Fields Only)
- Storage Limitation (24-Month Retention)
- User Rights (Access, Rectification, Erasure, Portability)
- Security (HTTPS, Encryption, No PII in Logs)

**Auto-Invoke bei**:
- User Data Collection
- Consent Management
- Third-Party Integrations
- Email/SMS Communication

**Output**: GDPR Compliance Status mit Remediation Steps

### 3. frontend-design
**Zweck**: Production-Grade Frontend Implementation

**Prüft**:
- Component Architecture (Atomic Design)
- Accessibility (WCAG 2.1 AA, Keyboard Navigation, ARIA)
- Responsive Design (Mobile-First, Breakpoints)
- Form UX (Validation, Error Messages, Loading States)
- Performance (Code Splitting, Image Optimization, Memoization)
- State Management (Zustand, SWR, useState)
- Error Handling (Error Boundaries, Empty States, Loading States)
- Design System Consistency (Colors, Typography, Spacing)

**Auto-Invoke bei**:
- Component Creation
- Page Implementation
- Form Design
- UI Interactions

**Output**: Design Review mit Accessibility/Performance Recommendations

### 4. code-review
**Zweck**: Comprehensive Code Quality Review

**Prüft**:
- Code Quality & Readability (Naming, Comments, Function Size)
- Type Safety (TypeScript, No `any`, Zod Validation)
- Error Handling (Custom Errors, Logging, HTTP Status Codes)
- Testing Coverage (Unit, Integration, E2E, Edge Cases)
- Performance (N+1 Queries, Pagination, Indexing)
- Security (Quick Check for Auth, Validation, SQL Injection)
- Architecture (Separation of Concerns, DRY, File Size)
- Documentation (JSDoc, README, API Docs)

**Invoke manuell**: Vor Pull Request Merge

**Output**: Severity-basierte Issues (Blocker, Major, Minor, Suggestion)

## Hooks (1 automatisierter Event Handler)

### security-pre-commit (PreToolUse Hook)
**Zweck**: Security Validierung VOR jeder Code-Änderung

**Triggert bei Tools**:
- `Bash`: Command Execution
- `Write`: File Creation
- `Edit`: File Modification

**Verhaltensweisen**:
- **Critical Issues**: Blockiert Execution, Fix erforderlich
- **High Issues**: Warning, explizites Override nötig
- **Medium Issues**: Warning, continue by default

**Detektiert**:
- Command Injection
- Hardcoded Secrets
- SQL Injection
- XSS Vulnerabilities
- Path Traversal
- Weak Cryptography
- Insecure Deserialization
- Missing Authentication
- Insufficient Input Validation

**Integration**: Invoked automatisch `security-validation` Skill

## Commands (1 Slash Command)

### /commit
**Zweck**: Smart Git Commit mit Conventional Commits Format

**Workflow**:
1. **Pre-Commit Validation**:
   - Run tests (`npm run test`)
   - Run linting (`npm run lint`)
   - Type check (`npm run type-check`)
   - Security scan (secrets detection)

2. **Git Status Analysis**:
   - Analysiere geänderte Dateien
   - Erkenne File Categories (API, UI, DB, config, tests)

3. **Generate Commit Message**:
   - Type: feat, fix, refactor, docs, test, chore, perf, style
   - Scope: api, ui, db, auth, booking, admin
   - Subject: Concise (<50 chars), imperative mood
   - Body: Why the change (optional)
   - Footer: Co-authored-by Claude

4. **Stage Files**:
   - Intelligentes Staging (include: src, tests, docs)
   - Exclude: .env, node_modules, build artifacts

5. **Create Commit**:
   - Conventional Commits Format
   - Co-authored-by Footer

6. **Post-Commit**:
   - Display commit hash
   - Suggest next steps

**Beispiel**:
```bash
$ /commit

feat(booking): add vehicle data optional form

User can now optionally provide vehicle information during booking.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>
```

**Blocked Commits bei**:
- Tests fail
- Linting errors
- TypeScript errors
- Secrets detected

## Configuration

### .claude-plugin/plugin.json
Zentrale Plugin-Definition mit:
- Agents (7 spezialisierte Rollen)
- Skills (4 wiederverwendbare Fähigkeiten)
- Hooks (1 security pre-commit)
- Commands (1 /commit)
- Settings (defaultModel, autoInvokeSkills, etc.)

### .claude/settings.local.json
Lokale Einstellungen:
```json
{
  "permissions": {
    "defaultMode": "bypassPermissions",
    "allow": ["*"]
  }
}
```

**`defaultMode: "bypassPermissions"`**: Keine Permission-Prompts mehr

## Usage Examples

### Agent Invocation
```bash
# Starte Fullstack Engineer für Feature-Implementierung
/agents fullstack-engineer "Implement vehicle data optional form"

# Starte QA Engineer für Testing
/agents qa-test-engineer "Write comprehensive tests for booking flow"

# Starte Security Engineer für Audit
/agents security-privacy-engineer "Audit GDPR compliance of booking system"
```

### Skill Invocation (Auto oder Manual)
```bash
# Auto-invoked bei Code-Änderungen
# (security-validation bei API endpoints)
# (gdpr-compliance-check bei user data handling)

# Manual invocation
/skills frontend-design "Review WorkshopCard component"
/skills code-review "Review app/api/bookings/route.ts"
```

### Command Invocation
```bash
# Smart Git Commit
/commit

# Code Review
/code-review

# Deploy Check
/deploy-check
```

## Integration mit Entwicklungs-Workflow

### Sprint Planning
1. **product-manager**: Erstellt User Stories aus PRS
2. **tech-lead-architect**: Reviewed Architecture für Stories
3. **ux-ui-designer**: Erstellt Wireframes & Design System

### Implementation
1. **fullstack-engineer**: Implementiert Features
2. **security-pre-commit hook**: Auto-Validierung bei jedem Write/Edit
3. **qa-test-engineer**: Schreibt Tests parallel

### Code Review
1. **code-review skill**: Automated Pre-Review
2. **security-privacy-engineer**: Security Audit
3. **tech-lead-architect**: Architecture Review

### Deployment
1. **deploy-check command**: Pre-Deployment Validation
2. **fullstack-engineer**: Deploy to Vercel
3. **data-analytics-engineer**: Setup Monitoring

## Benefits

### 1. Automatisierung
- Security Checks automatisch bei jedem Code Change
- GDPR Compliance automatisch validiert
- Code Review automatisiert

### 2. Consistency
- Alle Agents folgen gleichen Standards (Skills)
- Conventional Commits enforced (/commit)
- Design System automatisch validiert (frontend-design)

### 3. Quality Gates
- Security: Keine vulnerabilities im Code
- GDPR: Compliance sichergestellt
- Code Quality: Standards enforced
- Testing: Coverage > 80%

### 4. Developer Experience
- Keine Permission Prompts (bypassPermissions)
- Smart Commands (/commit)
- Auto-Invoke Skills (weniger manuelle Arbeit)
- Comprehensive Documentation

## Troubleshooting

### Permission Denied Errors
**Problem**: Rote Meldungen im Terminal
**Lösung**: `defaultMode: "bypassPermissions"` in `.claude/settings.local.json`

### Hooks nicht aktiv
**Problem**: security-pre-commit triggert nicht
**Lösung**: Prüfe `.claude-plugin/plugin.json` → `hooks` Konfiguration

### Skills nicht gefunden
**Problem**: Skill-Datei existiert nicht
**Lösung**: Erstelle `.claude/skills/<skill-name>.md`

### Agent nicht verfügbar
**Problem**: Agent wird nicht gefunden
**Lösung**: Prüfe `.claude/agents/<agent-name>.md` und plugin.json

## Best Practices

### 1. Agent Selection
- **Feature Implementation**: fullstack-engineer
- **Testing**: qa-test-engineer
- **Security Audit**: security-privacy-engineer
- **Architecture Decisions**: tech-lead-architect
- **UI/UX Design**: ux-ui-designer
- **Requirements**: product-manager
- **Analytics**: data-analytics-engineer

### 2. Skill Invocation
- **Auto-Invoke**: Lass Skills automatisch laufen (security, GDPR, frontend)
- **Manual Invoke**: Nur für deep-dive Reviews (code-review)

### 3. Hook Configuration
- **Critical Hooks**: security-pre-commit (immer aktiv)
- **Optional Hooks**: code-quality-gate (kann deaktiviert werden)

### 4. Command Usage
- **/commit**: Für jeden Commit nutzen (enforces standards)
- **/code-review**: Vor jedem PR
- **/deploy-check**: Vor jedem Deployment

## Maintenance

### Plugin Updates
```bash
# Update plugin.json mit neuen Skills/Agents
vi .claude-plugin/plugin.json

# Add new skill
mkdir -p .claude/skills
vi .claude/skills/new-skill.md

# Update plugin.json
{
  "skills": [
    // ... existing skills
    {
      "name": "new-skill",
      "path": ".claude/skills/new-skill.md",
      "description": "New skill description"
    }
  ]
}
```

### Agent Updates
```bash
# Update agent definition
vi .claude/agents/fullstack-engineer.md

# Add new agent
vi .claude/agents/new-agent.md

# Update plugin.json
{
  "agents": [
    // ... existing agents
    {
      "name": "new-agent",
      "path": ".claude/agents/new-agent.md",
      "description": "New agent description",
      "skills": ["skill1", "skill2"]
    }
  ]
}
```

## References

- Plugin System GitHub: https://github.com/anthropics/claude-code/tree/main/plugins
- Claude Code Documentation: https://claude.com/claude-code
- Conventional Commits: https://www.conventionalcommits.org/
- OWASP Top 10: https://owasp.org/Top10/
- GDPR: https://gdpr-info.eu/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

## Support

Bei Fragen oder Problemen:
1. Dokumentation prüfen (dieser File)
2. Plugin.json validieren
3. Agents/Skills/Hooks prüfen
4. Issue im Repository erstellen

---

**Version**: 1.0.0
**Last Updated**: 2026-01-13
**Maintainer**: B2C Workshop Booking Team
