import { Request, Response } from 'express';
import axios from 'axios';
import querystring from 'querystring';

// HubSpot OAuth Controller
export const initiateHubSpotAuth = (req: Request, res: Response) => {
    const authUrl = `https://app.hubspot.com/oauth/authorize?${querystring.stringify({
        client_id: process.env.HUBSPOT_CLIENT_ID,
        redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
        scope: 'contacts',
        response_type: 'code',
    })}`;
    res.redirect(authUrl);
};

export const handleHubSpotCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Authorization code not found');
    }

    try {
        const response = await axios.post('https://api.hubapi.com/oauth/v1/token', querystring.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.HUBSPOT_CLIENT_ID,
            client_secret: process.env.HUBSPOT_CLIENT_SECRET,
            redirect_uri: process.env.HUBSPOT_REDIRECT_URI,
            code,
        }));

        req.session.hubspotToken = response.data;
        res.send('HubSpot OAuth successful');
    } catch (error) {
        res.status(500).send('Error during HubSpot OAuth');
    }
};

// Xero OAuth Controller
export const initiateXeroAuth = (req: Request, res: Response) => {
    const authUrl = `https://login.xero.com/identity/connect/authorize?${querystring.stringify({
        client_id: process.env.XERO_CLIENT_ID,
        redirect_uri: process.env.XERO_REDIRECT_URI,
        response_type: 'code',
        scope: 'openid profile email accounting.transactions',
    })}`;
    res.redirect(authUrl);
};

export const handleXeroCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).send('Authorization code not found');
    }

    try {
        const response = await axios.post('https://identity.xero.com/connect/token', querystring.stringify({
            grant_type: 'authorization_code',
            client_id: process.env.XERO_CLIENT_ID,
            client_secret: process.env.XERO_CLIENT_SECRET,
            redirect_uri: process.env.XERO_REDIRECT_URI,
            code,
        }));

        // Store the token in the session
        req.session.xeroToken = response.data;
        res.send('Xero OAuth successful');
    } catch (error) {
        res.status(500).send('Error during Xero OAuth');
    }
};