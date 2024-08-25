const express = require('express');
const session = require('express-session');
const querystring = require('querystring');
const axios = require('axios');
require('dotenv').config();

const app = express();

// Middleware to handle sessions
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Route to initiate OAuth Flow with Xero
app.get('/auth/xero', (req, res) => {
    const authUrl = `https://login.xero.com/identity/connect/authorize?${querystring.stringify({
        response_type: 'code',
        client_id: process.env.XERO_CLIENT_ID,
        redirect_uri: process.env.XERO_REDIRECT_URI,
        scope: 'accounting.transactions offline_access',
        state: 'optional_custom_state',
    })}`;
    res.redirect(authUrl);
});

// Handle OAuth callback from Xero
app.get('/auth/xero/callback', async (req, res) => {
    console.log('Callback query parameters:', req.query); // Log the query parameters

    const { code } = req.query;

    if (!code) {
        return res.status(400).send('Authorization code not found');
    }

    try {
        const response = await axios.post('https://identity.xero.com/connect/token', querystring.stringify({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: process.env.XERO_REDIRECT_URI,
            client_id: process.env.XERO_CLIENT_ID,
            client_secret: process.env.XERO_CLIENT_SECRET,
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        });

        const { access_token, refresh_token, expires_in } = response.data;

        // Store tokens in session or database
        req.session.accessToken = access_token;
        req.session.refreshToken = refresh_token;

        res.send('Xero OAuth successful');
    } catch (error) {
        res.status(500).send('Error during Xero OAuth');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});