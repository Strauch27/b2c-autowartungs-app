---
name: commit
description: Create standardized Git commits using Conventional Commits format
disable-model-invocation: true
argument-hint: [commit message]
allowed-tools: Bash(git *)
---

# Git Commit Workflow

Create a standardized Git commit following the Conventional Commits specification.

## Commit Format

```
<type>(<scope>): <subject>

<body>

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring without feature changes
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Build process, dependencies, tooling

## Scopes (Project-specific)

- **api**: API endpoints and business logic
- **ui**: Frontend components and UI
- **payment**: Payment integration
- **concierge**: Concierge service logic
- **auth**: Authentication and authorization
- **booking**: Booking system
- **db**: Database schema and migrations
- **odoo**: Odoo integration

## Workflow

1. Run `git status` to see staged and unstaged changes
2. Run `git diff` to review changes
3. Review recent commits with `git log --oneline -10` for style consistency
4. Stage relevant files with `git add`
5. Create commit with descriptive message
6. Verify with `git status`

## Examples

```
feat(booking): add slot management for concierge service

Implement time slot selection with availability checking.
Prevents double-booking by validating existing appointments.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

```
fix(payment): handle payment failures gracefully

Add proper error handling for declined transactions.
Display user-friendly error messages.

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

## Usage

If arguments are provided, use them as the commit message. Otherwise, analyze staged changes and create an appropriate commit message.

**Arguments provided**: `$ARGUMENTS`
