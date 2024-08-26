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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvoiceInXero = createInvoiceInXero;
const api_client_1 = require("@hubspot/api-client");
const xero_node_1 = require("xero-node");
// Initialize HubSpot and Xero clients
const hubspotClient = new api_client_1.Client({ apiKey: process.env.HUBSPOT_API_KEY });
const xero = new xero_node_1.XeroClient({
    clientId: process.env.XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET,
    redirectUris: [process.env.XERO_REDIRECT_URI],
    scopes: ['openid', 'profile', 'email', 'accounting.transactions', 'offline_access'], // Scopes as an array
});
// Fetch quote details from HubSpot
function getQuoteDetails(quoteId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield hubspotClient.crm.quotes.basicApi.getById(quoteId);
            return response; // Type assertion to our custom interface
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error fetching quote details for quoteId ${quoteId}:`, error.message);
            }
            else {
                console.error(`Unknown error fetching quote details for quoteId ${quoteId}:`, error);
            }
            throw error; // Re-throw the error after logging it
        }
    });
}
// Fetch deal details from HubSpot
function getDealDetails(dealId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield hubspotClient.crm.deals.basicApi.getById(dealId);
            return response; // Type assertion to our custom interface
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(`Error fetching deal details for dealId ${dealId}:`, error.message);
            }
            else {
                console.error(`Unknown error fetching deal details for dealId ${dealId}:`, error);
            }
            throw error; // Re-throw the error after logging it
        }
    });
}
function createInvoiceInXero(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const { quoteId, dealId } = req.body;
        try {
            const tokenSet = yield xero.readTokenSet();
            yield xero.setTokenSet(tokenSet);
            const xeroTenantId = process.env.XERO_TENANT_ID;
            const summarizeErrors = true;
            const unitdp = 4; // Use up to 4 decimal places
            const idempotencyKey = `hubspot-xero-${dealId}`; // Unique key for this transaction
            const quoteDetails = yield getQuoteDetails(quoteId);
            const dealDetails = yield getDealDetails(dealId);
            const contact = {
                contactID: dealDetails.properties.hubspot_owner_id // Example: Adjust as needed
            };
            const lineItems = quoteDetails.properties.lineItems.map(item => ({
                description: item.name,
                quantity: item.quantity,
                unitAmount: item.amount,
                accountCode: "200", // Adjust the account code as needed
            }));
            const invoice = {
                type: xero_node_1.Invoice.TypeEnum.ACCREC,
                contact: contact,
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                lineItems: lineItems,
                reference: dealDetails.properties.dealname,
                status: xero_node_1.Invoice.StatusEnum.DRAFT
            };
            const invoices = {
                invoices: [invoice]
            };
            const response = yield xero.accountingApi.createInvoices(xeroTenantId, invoices, summarizeErrors, unitdp, idempotencyKey);
            console.log('Invoice created successfully:', response.body);
            res.status(200).json({
                status: 'success',
                invoiceId: (_b = (_a = response.body.invoices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.invoiceID
            });
        }
        catch (error) {
            if (error instanceof Error) {
                console.error('Error processing invoice creation:', error.message);
                res.status(500).json({ status: 'error', message: error.message });
            }
            else {
                console.error('Unknown error processing invoice creation:', error);
                res.status(500).json({ status: 'error', message: 'An unknown error occurred.' });
            }
        }
    });
}
