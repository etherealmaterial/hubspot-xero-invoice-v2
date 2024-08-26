import express from 'express';
import { createInvoiceInXero } from './controllers/invoiceController';

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Route to handle HubSpot webhook or API call
app.post('/hubspot-to-xero', createInvoiceInXero);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});