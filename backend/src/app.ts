import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { setAuthRoutes } from './routes/auth.routes';

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const HOST = '0.0.0.0';

app.use(cors({ origin: '*', credentials: false }));
app.use(bodyParser.json());

setAuthRoutes(app);

app.listen(PORT, HOST, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});