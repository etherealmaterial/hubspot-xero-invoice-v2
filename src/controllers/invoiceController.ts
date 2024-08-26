import { Request, Response } from 'express';
import { Client as HubSpotClient } from '@hubspot/api-client';
import { XeroClient, Invoice, Invoices } from 'xero-node';
import { IHubSpotQuote, IHubSpotDeal } from '../types/hubspotTypes'; // Importing the interfaces

// Initialize HubSpot and Xero clients
const hubspotClient = new HubSpotClient({ apiKey: process.env.HUBSPOT_API_KEY });
const xero = new XeroClient({
    clientId: process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes: ['openid', 'profile', 'email', 'accounting.transactions', 'offline_access'], // Scopes as an array
});

// Fetch quote details from HubSpot
async function getQuoteDetails(quoteId: string): Promise<IHubSpotQuote> {
    try {
        const response = await hubspotClient.crm.quotes.basicApi.getById(quoteId);
        return response as unknown as IHubSpotQuote; // Type assertion to our custom interface
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching quote details for quoteId ${quoteId}:`, error.message);
        } else {
            console.error(`Unknown error fetching quote details for quoteId ${quoteId}:`, error);
        }
        throw error; // Re-throw the error after logging it
    }
}

// Fetch deal details from HubSpot
async function getDealDetails(dealId: string): Promise<IHubSpotDeal> {
    try {
        const response = await hubspotClient.crm.deals.basicApi.getById(dealId);
        return response as unknown as IHubSpotDeal; // Type assertion to our custom interface
    } catch (error) {
        if (error instanceof Error) {
            console.error(`Error fetching deal details for dealId ${dealId}:`, error.message);
        } else {
            console.error(`Unknown error fetching deal details for dealId ${dealId}:`, error);
        }
        throw error; // Re-throw the error after logging it
    }
}

export async function createInvoiceInXero(req: Request, res: Response): Promise<void> {
    const { quoteId, dealId } = req.body;

    try {
        const tokenSet = await xero.readTokenSet();
        await xero.setTokenSet(tokenSet);

        const xeroTenantId = process.env.XERO_TENANT_ID!;
        const summarizeErrors = true;
        const unitdp = 4; // Use up to 4 decimal places
        const idempotencyKey = `hubspot-xero-${dealId}`; // Unique key for this transaction

        const quoteDetails = await getQuoteDetails(quoteId);
        const dealDetails = await getDealDetails(dealId);

        const contact = {
            contactID: dealDetails.properties.hubspot_owner_id // Example: Adjust as needed
        };

        const lineItems = quoteDetails.properties.lineItems.map(item => ({
            description: item.name,
            quantity: item.quantity,
            unitAmount: item.amount,
            accountCode: "200", // Adjust the account code as needed
        }));

        const invoice: Invoice = {
            type: Invoice.TypeEnum.ACCREC,
            contact: contact,
            date: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            lineItems: lineItems,
            reference: dealDetails.properties.dealname,
            status: Invoice.StatusEnum.DRAFT
        };

        const invoices: Invoices = {
            invoices: [invoice]
        };

        const response = await xero.accountingApi.createInvoices(xeroTenantId, invoices, summarizeErrors, unitdp, idempotencyKey);
        console.log('Invoice created successfully:', response.body);

        res.status(200).json({
            status: 'success',
            invoiceId: response.body.invoices?.[0]?.invoiceID
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error processing invoice creation:', error.message);
            res.status(500).json({ status: 'error', message: error.message });
        } else {
            console.error('Unknown error processing invoice creation:', error);
            res.status(500).json({ status: 'error', message: 'An unknown error occurred.' });
        }
    }
}