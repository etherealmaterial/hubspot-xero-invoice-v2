"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const oauthController_1 = require("../controllers/oauthController");
const router = (0, express_1.Router)();
router.get('/auth/hubspot', oauthController_1.initiateHubSpotAuth);
router.get('/auth/hubspot/callback', oauthController_1.handleHubSpotCallback);
router.get('/auth/xero', oauthController_1.initiateXeroAuth);
router.get('/auth/xero/callback', oauthController_1.handleXeroCallback);
exports.default = router;
//# sourceMappingURL=oauthRoutes.js.map