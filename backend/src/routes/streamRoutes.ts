import { Router } from 'express';
import { onPublish, onPublishDone } from '../controllers/streamController';

const router = Router();

// These routes are called by Nginx RTMP server
router.post('/on_publish', onPublish);
router.post('/on_publish_done', onPublishDone);

export default router;



