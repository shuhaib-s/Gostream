/**
 * Relay Routes
 * Routes for stream relay management
 */

import { Router } from 'express';
import { startRelay, stopRelay, getRelayStatus, getAllRelays } from '../controllers/relayController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// All relay routes require authentication
router.use(authMiddleware);

// Start relay to destination
router.post('/destinations/:destinationId/relay/start', startRelay);

// Stop relay to destination
router.post('/destinations/:destinationId/relay/stop', stopRelay);

// Get relay status for destination
router.get('/destinations/:destinationId/relay/status', getRelayStatus);

// Get all active relays
router.get('/relays', getAllRelays);

export default router;

