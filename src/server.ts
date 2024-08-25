import express from 'express';
import session from 'express-session';
import oauthRoutes from './routes/oauthRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(session({
    secret: process.env.SESSION_SECRET || 'defaultsecret',
    resave: false,
    saveUninitialized: true,
}));

app.use('/', oauthRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});