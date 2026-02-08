import { Router } from 'express';
import { e2eOnly } from '../middleware/e2eOnly.middleware';
import { resetDatabase, generateToken, advanceBooking } from '../controllers/test.controller';

const router = Router();

// All test routes require E2E_TEST=true
router.use(e2eOnly);

router.post('/reset', resetDatabase);
router.post('/token', generateToken);
router.post('/advance-booking', advanceBooking);

export default router;
