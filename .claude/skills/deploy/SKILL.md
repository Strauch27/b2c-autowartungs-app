---
name: deploy
description: Deploy the B2C app to production following the deployment checklist
disable-model-invocation: true
argument-hint: [environment]
allowed-tools: Bash
---

# Deployment Workflow

Deploy the B2C Autowartungs-App to the specified environment.

## Pre-Deployment Checklist

Before deploying, verify:

1. **All tests pass**
   ```bash
   npm test
   npm run test:e2e
   ```

2. **Code quality checks pass**
   ```bash
   npm run lint
   npm run type-check
   ```

3. **Security validation**
   - No exposed secrets in code
   - Environment variables configured
   - API keys secured

4. **Database migrations ready**
   - Migrations tested locally
   - Rollback plan prepared

5. **Payment integration tested**
   - Test transactions verified
   - Webhook endpoints configured

## Deployment Steps

### 1. Build Application

```bash
npm run build
```

### 2. Run Pre-Deployment Tests

```bash
npm run test:prod
```

### 3. Deploy to Target Environment

**Staging**: `$ARGUMENTS` = staging
**Production**: `$ARGUMENTS` = production

```bash
# Deploy command based on environment
npm run deploy:$ARGUMENTS
```

### 4. Post-Deployment Verification

- Health check endpoints respond
- Database connection successful
- Payment provider reachable
- Odoo integration functioning
- Monitoring alerts configured

### 5. Smoke Tests

- User registration works
- Booking flow completes
- Payment processing succeeds
- Concierge service schedulable

## Rollback Plan

If deployment fails:

```bash
npm run rollback:$ARGUMENTS
```

## Environment-Specific Notes

### Staging
- Test data populated
- Debug logging enabled
- Payment in test mode

### Production
- Monitoring active
- Backup completed
- Payment in live mode
- Rate limiting configured

## Monitoring

After deployment, monitor:
- Error rates
- Response times
- Payment success rate
- User registration rate
- Booking completion rate

## Usage

```
/deploy staging
/deploy production
```
