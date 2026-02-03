---
name: pr-summary
description: Generate comprehensive pull request summaries using GitHub CLI
disable-model-invocation: true
argument-hint: [pr-number]
context: fork
agent: Explore
allowed-tools: Bash(gh *)
---

# Pull Request Summary

Generate a comprehensive summary of pull request changes.

## Pull Request Context

- **PR Number**: $ARGUMENTS
- **Diff**: !`gh pr view $ARGUMENTS --json diff --jq '.diff'`
- **Metadata**: !`gh pr view $ARGUMENTS --json title,body,author,labels,reviewers`
- **Comments**: !`gh pr view $ARGUMENTS --comments`
- **Changed Files**: !`gh pr diff $ARGUMENTS --name-only`
- **Stats**: !`gh pr diff $ARGUMENTS --stat`

## Task

Analyze this pull request and create a comprehensive summary:

### 1. Overview
- What is the main purpose of this PR?
- What problem does it solve?
- Is it a feature, bugfix, refactor, or other?

### 2. Technical Changes

Organize by category:

**API Changes**
- New endpoints
- Modified endpoints
- Breaking changes

**Frontend Changes**
- New components
- Modified UI/UX
- Styling updates

**Database Changes**
- Schema modifications
- Migrations
- Data model updates

**Integration Changes**
- Payment provider updates
- Odoo integration changes
- Third-party services

**Infrastructure**
- Configuration changes
- Deployment updates
- Environment variables

### 3. Business Logic

- What new business rules are introduced?
- What workflows are affected?
- Impact on user experience?

### 4. Testing

- What tests were added/modified?
- Test coverage changes
- Manual testing requirements

### 5. Security & Privacy

- Authentication/authorization changes
- Data privacy considerations
- Security vulnerabilities addressed

### 6. Performance Impact

- Expected performance changes
- Database query optimization
- Frontend bundle size impact

### 7. Dependencies

- New dependencies added
- Dependency updates
- Potential conflicts

### 8. Breaking Changes

List any breaking changes with migration guide.

### 9. Review Checklist

- [ ] Code follows project conventions
- [ ] Tests pass and provide adequate coverage
- [ ] Documentation updated
- [ ] No security vulnerabilities introduced
- [ ] Performance impact acceptable
- [ ] Breaking changes documented
- [ ] Database migrations safe
- [ ] Error handling adequate
- [ ] Logging appropriate

### 10. Recommendations

- Suggestions for improvement
- Potential risks to watch
- Follow-up tasks needed

## Output Format

Use clear markdown with:
- Section headers
- Bullet points
- Code snippets where relevant
- File references with line numbers
- Links to related issues/PRs

Focus on helping reviewers understand:
1. **What changed** (the facts)
2. **Why it changed** (the motivation)
3. **How it works** (the implementation)
4. **What to watch for** (the risks)
