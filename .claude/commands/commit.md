# /commit Command

## Purpose
Smart git commit with conventional commits format, automatic staging, and validation.

## Usage
```bash
/commit
```

## What It Does

### 1. Pre-Commit Validation
- **Run tests**: `npm run test` (unit tests only)
- **Run linting**: `npm run lint`
- **Type check**: `npm run type-check`
- **Security scan**: Check for secrets in staged files

### 2. Git Status Analysis
```bash
git status --short
```
Analyzes:
- Modified files
- New files
- Deleted files
- File categories (API, UI, DB, config, tests)

### 3. Generate Commit Message
Based on changes, suggests:

**Type** (required):
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation only
- `test`: Adding/updating tests
- `chore`: Maintenance (dependencies, config)
- `perf`: Performance improvement
- `style`: Code style (formatting, no logic change)

**Scope** (optional):
- `api`: API endpoints
- `ui`: Frontend components
- `db`: Database changes
- `auth`: Authentication/Authorization
- `booking`: Booking flow
- `admin`: Admin features

**Message** (required):
- Concise summary (<50 chars)
- Imperative mood ("add", not "added" or "adds")

**Body** (optional):
- Why the change was made
- What problem it solves
- Any breaking changes

**Footer** (required):
- Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

### 4. Example Messages

```bash
# Simple feature
feat(booking): add vehicle data optional form

User can now optionally provide vehicle information (license plate, make,
model) during booking. Form includes validation and auto-formatting.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

# Bug fix
fix(api): prevent race condition in slot booking

Use pessimistic locking (SELECT FOR UPDATE) to prevent double bookings
when multiple users book the same slot concurrently.

Fixes #123

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

# Breaking change
feat(auth)!: migrate from OTP to magic links

BREAKING CHANGE: OTP authentication removed. Users now authenticate via
magic links sent to email. Existing OTP codes will stop working after
migration.

Migration: Run `npm run migrate:auth` to update database schema.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### 5. Stage Files
Intelligently stage files:
- **Include**: All source code, tests, docs, config
- **Exclude**:
  - `.env` files (secrets)
  - `node_modules/`
  - Build artifacts
  - IDE files

```bash
git add src/ tests/ docs/ package.json
```

### 6. Create Commit
```bash
git commit -m "$(cat <<'EOF'
feat(booking): add vehicle data optional form

User can now optionally provide vehicle information during booking.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

### 7. Post-Commit Actions
- Display commit hash
- Show commit message
- Suggest next steps:
  - `/commit-push-pr` to push and create PR
  - `git push` to push to remote
  - Continue working

## Interactive Prompts

If ambiguous, ask user:

```
📝 Commit Type:
1. feat - New feature
2. fix - Bug fix
3. refactor - Code refactoring
4. test - Adding tests
5. docs - Documentation
> Enter number: 1

📦 Scope (optional):
Detected changes in: booking, api, ui
> Enter scope (or press enter to skip): booking

✍️ Commit Message:
> Enter short description: add vehicle data optional form

📄 Body (optional):
> Enter detailed description (or press enter to skip):
User can now optionally provide vehicle information during booking.

✅ Commit Preview:
feat(booking): add vehicle data optional form

User can now optionally provide vehicle information during booking.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

Proceed? (Y/n):
```

## Validation Rules

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type**: Required, must be one of feat, fix, refactor, docs, test, chore, perf, style
**Scope**: Optional, lowercase, no spaces
**Subject**: Required, <50 chars, imperative mood, no period at end
**Body**: Optional, wrap at 72 chars
**Footer**: Must include Co-authored-by

### Blocked Commits
Commit will be **blocked** if:
- Tests fail
- Linting errors
- TypeScript errors
- Secrets detected in staged files
- Commit message doesn't follow format

### Warning (Can Override)
Commit will **warn** if:
- No tests added for new feature
- Large commit (>500 lines changed)
- Multiple types of changes mixed (feat + fix)

## Error Handling

```bash
# Tests fail
❌ Tests failed. Fix tests before committing.
npm run test

# Linting errors
❌ Linting errors detected. Run:
npm run lint --fix

# Secrets detected
❌ Potential secret detected in staged files:
- .env (line 5): DATABASE_PASSWORD=...
Remove secrets before committing.

# Invalid commit message
❌ Invalid commit message format.
Expected: <type>(<scope>): <subject>
Got: "updated stuff"
```

## Configuration

```json
{
  "commit": {
    "preCommitChecks": {
      "tests": true,
      "lint": true,
      "typeCheck": true,
      "secretScan": true
    },
    "autoStage": true,
    "requireScope": false,
    "requireBody": false,
    "maxSubjectLength": 50,
    "maxBodyLineLength": 72,
    "coauthorLine": "Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>"
  }
}
```

## Examples

### Feature Commit
```bash
$ /commit

📊 Analyzing changes...
✅ Tests passed (25/25)
✅ Linting passed
✅ Type check passed
✅ No secrets detected

📝 Detected changes:
- app/booking/vehicle/page.tsx (new)
- lib/validation/schemas.ts (modified)
- tests/booking/vehicle.test.tsx (new)

Suggested commit:
feat(booking): add vehicle data optional form

Created vehicle data form page with optional fields (license plate,
make, model, year). Includes validation and auto-formatting of
license plate to uppercase.

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

Proceed with this commit? (Y/n): y

✅ Committed: 3f7a2b9 feat(booking): add vehicle data optional form

Next steps:
- Run /commit-push-pr to create pull request
- Run git push to push changes
- Continue working
```

### Bug Fix
```bash
$ /commit

📊 Analyzing changes...
✅ All checks passed

Suggested commit:
fix(api): prevent double booking race condition

Use pessimistic locking (SELECT FOR UPDATE) in transaction to prevent
concurrent users from booking the same slot.

Fixes #42

Co-authored-by: Claude Sonnet 4.5 <noreply@anthropic.com>

Proceed? (Y/n): y

✅ Committed: 8a4f1c2 fix(api): prevent double booking race condition
```

## Integration

Works with:
- **Git hooks**: Pre-commit hook runs validations
- **CI/CD**: Commit message validated in CI pipeline
- **Changelog**: Auto-generate from conventional commits
- **Semantic versioning**: Determine version bump from commit type

## References
- Conventional Commits: https://www.conventionalcommits.org/
- Angular Commit Guidelines: https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit
