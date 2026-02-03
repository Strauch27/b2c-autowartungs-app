---
name: odoo-integration
description: Odoo ERP integration patterns for accounting and operations. Reference when integrating with Odoo.
user-invocable: false
---

# Odoo Integration

Integration patterns for connecting the B2C app with Odoo for accounting and operations.

## Architecture

```
B2C App → Queue (Redis/RabbitMQ) → Odoo Connector → Odoo ERP
              ↓
          Database (sync status)
```

### Why Queue-Based?

- **Reliability**: Retry failed operations
- **Decoupling**: App doesn't wait for Odoo
- **Resilience**: App works even if Odoo is down
- **Batching**: Optimize Odoo API calls

## Odoo API Connection

### Authentication

```typescript
import Odoo from 'odoo-xmlrpc';

const odoo = new Odoo({
  url: process.env.ODOO_URL,
  port: process.env.ODOO_PORT || 443,
  db: process.env.ODOO_DATABASE,
  username: process.env.ODOO_USERNAME,
  password: process.env.ODOO_API_KEY
});

// Authenticate
async function connectOdoo(): Promise<number> {
  return new Promise((resolve, reject) => {
    odoo.connect((err, uid) => {
      if (err) {
        reject(new Error(`Odoo connection failed: ${err.message}`));
      }
      resolve(uid);
    });
  });
}
```

### Connection Pool

```typescript
class OdooConnectionPool {
  private connections: Odoo[] = [];
  private maxConnections = 5;

  async getConnection(): Promise<Odoo> {
    // Return available connection or create new one
    if (this.connections.length < this.maxConnections) {
      const conn = new Odoo(config);
      await connectOdoo(conn);
      this.connections.push(conn);
      return conn;
    }

    // Wait for available connection
    return this.waitForConnection();
  }

  releaseConnection(conn: Odoo): void {
    // Return connection to pool
  }
}
```

## Data Synchronization

### Customer Creation

When user registers, create customer in Odoo:

```typescript
async function syncCustomerToOdoo(user: User): Promise<number> {
  const uid = await connectOdoo();

  const customerId = await new Promise<number>((resolve, reject) => {
    odoo.execute_kw(
      process.env.ODOO_DATABASE,
      uid,
      process.env.ODOO_API_KEY,
      'res.partner',
      'create',
      [{
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        street: user.address?.street,
        zip: user.address?.postalCode,
        city: user.address?.city,
        country_id: 57, // Germany
        customer_rank: 1,
        // Custom fields
        x_b2c_user_id: user.id,
        x_b2c_registered_at: user.createdAt.toISOString(),
      }],
      (err, customerId) => {
        if (err) reject(err);
        resolve(customerId);
      }
    );
  });

  // Store Odoo ID in our database
  await prisma.user.update({
    where: { id: user.id },
    data: { odooCustomerId: customerId }
  });

  return customerId;
}
```

### Invoice Creation

After successful payment, create invoice in Odoo:

```typescript
interface InvoiceData {
  bookingId: string;
  customerId: number; // Odoo customer ID
  lineItems: InvoiceLineItem[];
  totalAmount: number;
  paymentDate: Date;
  paymentReference: string; // Stripe payment intent ID
}

interface InvoiceLineItem {
  productId: number; // Odoo product ID
  description: string;
  quantity: number;
  priceUnit: number;
  taxIds: number[];
}

async function createInvoiceInOdoo(data: InvoiceData): Promise<number> {
  const uid = await connectOdoo();

  // Create invoice
  const invoiceId = await new Promise<number>((resolve, reject) => {
    odoo.execute_kw(
      process.env.ODOO_DATABASE,
      uid,
      process.env.ODOO_API_KEY,
      'account.move',
      'create',
      [{
        partner_id: data.customerId,
        move_type: 'out_invoice',
        invoice_date: new Date().toISOString().split('T')[0],
        invoice_line_ids: data.lineItems.map(item => [0, 0, {
          product_id: item.productId,
          name: item.description,
          quantity: item.quantity,
          price_unit: item.priceUnit / 100, // Convert cents to euros
          tax_ids: [[6, 0, item.taxIds]]
        }]),
        // Mark as paid
        payment_state: 'paid',
        // Custom fields
        x_b2c_booking_id: data.bookingId,
        x_payment_reference: data.paymentReference,
        x_payment_method: 'stripe'
      }],
      (err, invoiceId) => {
        if (err) reject(err);
        resolve(invoiceId);
      }
    );
  });

  // Post invoice (validate)
  await postInvoice(uid, invoiceId);

  // Register payment
  await registerPayment(uid, invoiceId, data);

  return invoiceId;
}

async function postInvoice(uid: number, invoiceId: number): Promise<void> {
  return new Promise((resolve, reject) => {
    odoo.execute_kw(
      process.env.ODOO_DATABASE,
      uid,
      process.env.ODOO_API_KEY,
      'account.move',
      'action_post',
      [[invoiceId]],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}

async function registerPayment(
  uid: number,
  invoiceId: number,
  data: InvoiceData
): Promise<void> {
  return new Promise((resolve, reject) => {
    odoo.execute_kw(
      process.env.ODOO_DATABASE,
      uid,
      process.env.ODOO_API_KEY,
      'account.payment',
      'create',
      [{
        payment_type: 'inbound',
        partner_type: 'customer',
        partner_id: data.customerId,
        amount: data.totalAmount / 100,
        date: data.paymentDate.toISOString().split('T')[0],
        journal_id: 7, // Bank journal ID
        ref: data.paymentReference,
        invoice_ids: [[6, 0, [invoiceId]]]
      }],
      (err) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
}
```

### Product Mapping

Map B2C services to Odoo products:

```typescript
const SERVICE_PRODUCT_MAPPING = {
  'oil-service': {
    compact: 101, // Odoo product ID
    midsize: 102,
    suv: 103,
    luxury: 104
  },
  'inspection': {
    compact: 201,
    midsize: 202,
    suv: 203,
    luxury: 204
  },
  'brake-service': {
    front: 301,
    rear: 302,
    complete: 303
  },
  'concierge-service': 401
};

function getOdooProductId(
  service: string,
  vehicleClass: string
): number {
  const mapping = SERVICE_PRODUCT_MAPPING[service];
  if (!mapping) {
    throw new Error(`Unknown service: ${service}`);
  }

  const productId = mapping[vehicleClass];
  if (!productId) {
    throw new Error(`Unknown vehicle class: ${vehicleClass}`);
  }

  return productId;
}
```

### Extension Invoice

For approved extensions:

```typescript
async function createExtensionInvoice(extension: Extension): Promise<number> {
  const booking = await prisma.booking.findUnique({
    where: { id: extension.bookingId },
    include: { user: true }
  });

  const lineItems = extension.items.map(item => ({
    productId: item.odooProductId,
    description: item.description,
    quantity: item.quantity,
    priceUnit: item.price,
    taxIds: [1] // 19% MwSt
  }));

  return createInvoiceInOdoo({
    bookingId: extension.bookingId,
    customerId: booking.user.odooCustomerId,
    lineItems,
    totalAmount: extension.totalAmount,
    paymentDate: extension.approvedAt,
    paymentReference: extension.stripePaymentIntentId
  });
}
```

## Queue System

### Job Queue

```typescript
import Bull from 'bull';

const odooQueue = new Bull('odoo-sync', {
  redis: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
  }
});

// Add job to queue
async function queueOdooSync(type: string, data: any): Promise<void> {
  await odooQueue.add(type, data, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
}

// Process jobs
odooQueue.process('create-customer', async (job) => {
  const { userId } = job.data;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return syncCustomerToOdoo(user);
});

odooQueue.process('create-invoice', async (job) => {
  const { bookingId } = job.data;
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { user: true }
  });
  return createInvoiceInOdoo(buildInvoiceData(booking));
});

odooQueue.process('create-credit-note', async (job) => {
  const { bookingId, reason } = job.data;
  return createCreditNote(bookingId, reason);
});

// Error handling
odooQueue.on('failed', (job, err) => {
  console.error(`Odoo sync failed for job ${job.id}:`, err);

  // Alert on critical failures
  if (job.attemptsMade >= job.opts.attempts) {
    alertTeam({
      type: 'odoo-sync-failed',
      jobId: job.id,
      data: job.data,
      error: err.message
    });
  }
});
```

### Sync Status Tracking

```typescript
interface SyncStatus {
  id: string;
  entityType: 'user' | 'booking' | 'invoice' | 'credit-note';
  entityId: string;
  odooId?: number;
  status: 'pending' | 'synced' | 'failed';
  lastSyncAttempt?: Date;
  syncError?: string;
  attempts: number;
}

async function trackSync(
  entityType: string,
  entityId: string,
  status: string,
  odooId?: number,
  error?: string
): Promise<void> {
  await prisma.odooSyncStatus.upsert({
    where: {
      entityType_entityId: {
        entityType,
        entityId
      }
    },
    create: {
      entityType,
      entityId,
      status,
      odooId,
      syncError: error,
      attempts: 1
    },
    update: {
      status,
      odooId,
      syncError: error,
      lastSyncAttempt: new Date(),
      attempts: { increment: 1 }
    }
  });
}
```

## Error Handling

### Retry Logic

```typescript
async function executeWithRetry<T>(
  operation: () => Promise<T>,
  maxRetries = 3
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${i + 1} failed:`, error.message);

      // Don't retry on validation errors
      if (error.message.includes('ValidationError')) {
        throw error;
      }

      // Exponential backoff
      await new Promise(resolve =>
        setTimeout(resolve, Math.pow(2, i) * 1000)
      );
    }
  }

  throw lastError;
}
```

### Fallback Strategy

```typescript
async function syncWithFallback(operation: () => Promise<any>): Promise<void> {
  try {
    await operation();
  } catch (error) {
    // Log to database for manual reconciliation
    await prisma.failedOdooSync.create({
      data: {
        operation: operation.name,
        error: error.message,
        stackTrace: error.stack,
        payload: JSON.stringify(operation.arguments)
      }
    });

    // Continue app operation - don't block user
    console.error('Odoo sync failed, logged for manual reconciliation');
  }
}
```

## Operations Monitoring

### Health Checks

```typescript
async function checkOdooHealth(): Promise<boolean> {
  try {
    const uid = await connectOdoo();
    return uid > 0;
  } catch (error) {
    console.error('Odoo health check failed:', error);
    return false;
  }
}

// Run health check every 5 minutes
setInterval(async () => {
  const isHealthy = await checkOdooHealth();

  if (!isHealthy) {
    await alertTeam({
      type: 'odoo-unavailable',
      message: 'Odoo connection is down',
      severity: 'high'
    });
  }

  // Store metrics
  await prisma.odooHealthCheck.create({
    data: {
      isHealthy,
      checkedAt: new Date()
    }
  });
}, 5 * 60 * 1000);
```

### Sync Metrics

Track:
- Successful syncs per hour
- Failed syncs per hour
- Average sync duration
- Queue length
- Oldest pending sync

```typescript
async function collectSyncMetrics() {
  const now = new Date();
  const hourAgo = subHours(now, 1);

  const metrics = await prisma.odooSyncStatus.groupBy({
    by: ['status'],
    where: {
      lastSyncAttempt: { gte: hourAgo }
    },
    _count: true
  });

  return {
    successful: metrics.find(m => m.status === 'synced')?._count || 0,
    failed: metrics.find(m => m.status === 'failed')?._count || 0,
    pending: metrics.find(m => m.status === 'pending')?._count || 0
  };
}
```

## Manual Reconciliation

Dashboard for reviewing failed syncs:

```typescript
// Admin endpoint
app.get('/admin/odoo/failed-syncs', async (req, res) => {
  const failedSyncs = await prisma.failedOdooSync.findMany({
    where: { resolvedAt: null },
    orderBy: { createdAt: 'desc' },
    take: 100
  });

  res.json(failedSyncs);
});

// Retry failed sync
app.post('/admin/odoo/retry/:id', async (req, res) => {
  const { id } = req.params;

  const failedSync = await prisma.failedOdooSync.findUnique({
    where: { id }
  });

  // Retry operation
  try {
    await retryOperation(failedSync);

    await prisma.failedOdooSync.update({
      where: { id },
      data: {
        resolvedAt: new Date(),
        resolvedBy: req.user.id
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({
      error: {
        code: 'RETRY_FAILED',
        message: error.message
      }
    });
  }
});
```

## Best Practices

1. **Always use queue**: Never sync to Odoo synchronously
2. **Store Odoo IDs**: Keep mapping between app entities and Odoo entities
3. **Track sync status**: Monitor what's synced and what failed
4. **Retry with backoff**: Use exponential backoff for retries
5. **Don't block users**: App should work even if Odoo is down
6. **Alert on failures**: Notify team of persistent failures
7. **Manual reconciliation**: Provide tools to fix failed syncs
8. **Test thoroughly**: Integration tests with mock Odoo
9. **Document mappings**: Keep product/customer mappings up to date
10. **Version compatibility**: Document Odoo version requirements

## Testing

Mock Odoo for tests:

```typescript
jest.mock('../lib/odoo', () => ({
  connectOdoo: jest.fn(() => Promise.resolve(123)),
  createCustomer: jest.fn(() => Promise.resolve(456)),
  createInvoice: jest.fn(() => Promise.resolve(789)),
  postInvoice: jest.fn(() => Promise.resolve()),
  registerPayment: jest.fn(() => Promise.resolve())
}));
```

Integration test with real Odoo (test environment):

```typescript
describe('Odoo Integration', () => {
  beforeAll(async () => {
    // Connect to test Odoo instance
    await connectOdoo();
  });

  it('creates customer in Odoo', async () => {
    const user = await createTestUser();
    const odooId = await syncCustomerToOdoo(user);

    expect(odooId).toBeGreaterThan(0);

    // Verify in Odoo
    const customer = await fetchOdooCustomer(odooId);
    expect(customer.email).toBe(user.email);
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });
});
```

## Configuration

Environment variables:

```env
ODOO_URL=https://odoo.company.com
ODOO_PORT=443
ODOO_DATABASE=production
ODOO_USERNAME=api_user
ODOO_API_KEY=secret_api_key

# Redis for queue
REDIS_HOST=localhost
REDIS_PORT=6379

# Odoo product IDs
ODOO_PRODUCT_OIL_SERVICE_COMPACT=101
ODOO_PRODUCT_OIL_SERVICE_MIDSIZE=102
# ... etc
```
