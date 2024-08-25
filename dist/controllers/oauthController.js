"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleXeroCallback = exports.initiateXeroAuth = exports.handleHubSpotCallback = exports.initiateHubSpotAuth = void 0;
const axios_1 = __importDefault(require("axios"));
const querystring_1 = __importDefault(require("querystring"));
// HubSpot OAuth Controller
const initiateHubSpotAuth = (req, res) => {
    const authUrl = `https://app.hubspot.com/oauth/authorize?${querystring_1.default.stringify({
        client_id: process.env.HUBSPOT_CLIENT_ID,
        redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
        scope: 'contacts',
        response_type: 'code',
    })}`;
    res.redirect(authUrl);
};
exports.initiateHubSpotAuth = initiateHubSpotAuth;
const handleHubSpotCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code not found');
    }
    try {
        const response = yield axios_1.default.post('https://api.hubapi.com/oauth/v1/token', querystring_1.default.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.HUBSPOT_CLIENT_ID,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET,
            redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
            code,
        }));
        req.session.hubspotToken = response.data;
        res.send('HubSpot OAuth successful');
    }
    catch (error) {
        res.status(500).send('Error during HubSpot OAuth');
    }
});
exports.handleHubSpotCallback = handleHubSpotCallback;
// Xero OAuth Controller
const initiateXeroAuth = (req, res) => {
    const authUrl = `https://login.xero.com/identity/connect/authorize?${querystring_1.default.stringify({
        client_id: process.env.XERO_CLIENT_ID,
        redirect_uri: process.env.XERO_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email accounting.transactions',
    })}`;
    res.redirect(authUrl);
};
exports.initiateXeroAuth = initiateXeroAuth;
const handleXeroCallback = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const code = req.query.code;
    if (!code) {
        return res.status(400).send('Authorization code not found');
    }
    try {
        const response = yield axios_1.default.post('https://identity.xero.com/connect/token', querystring_1.default.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.XERO_CLIENT_ID,
            client_secret: process.env.XERO_CLIENT_SECRET,
            redirect_uri: process.env.XERO_REDIRECT_URI,
            code,
        }));
        // Store the token in the session
        req.session.xeroToken = response.data;
        res.send('Xero OAuth successful');
    }
    catch (error) {
        res.status(500).send('Error during Xero OAuth');
    }
});
exports.handleXeroCallback = handleXeroCallback;
//# sourceMappingURL=oauthController.js.map