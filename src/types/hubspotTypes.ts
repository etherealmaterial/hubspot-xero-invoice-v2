export interface IHubSpotQuote {
    id: string;
    properties: {
        lineItems: Array<{
            name: string;
            quantity: number;
            amount: number;
        }>;
        [key: string]: any; // To allow additional properties
    };
}

export interface IHubSpotDeal {
    id: string;
    properties: {
        dealname: string;
        hubspot_owner_id: string;
        [key: string]: any; // To allow additional properties
    }}