import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { setAuthRoutes } from './routes/auth.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:3000', credentials: false }));
app.use(bodyParser.json());

setAuthRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});