import { Router } from 'express';
import {
    initiateHubSpotAuth,
    handleHubSpotCallback,
    initiateXeroAuth,
    handleXeroCallback,
} from '../controllers/oauthController';

const router = Router();

router.get('/auth/hubspot', initiateHubSpotAuth);
router.get('/auth/hubspot/callback', handleHubSpotCallback);

router.get('/auth/xero', initiateXeroAuth);
router.get('/auth/xero/callback', handleXeroCallback);

export default router;