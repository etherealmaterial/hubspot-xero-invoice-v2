import 'express-session';

declare module 'express-session' {
    interface Session {
        hubspotToken?: any; // You can replace `any` with a more specific type if you know it
        xeroToken?: any; // Same here, replace `any` with the specific type if known
    }
}