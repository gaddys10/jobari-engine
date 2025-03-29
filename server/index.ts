import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import scrapeProfile from './scraper/scrapeProfile';

dotenv.config();

const app = express();
const port = parseInt(process.env.PORT || '5050');

app.use(cors());
app.use(express.json());

app.post('/api/scrape', async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Missing LinkedIn URL' });
    }

    try {
        const data = await scrapeProfile(url);
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error scraping profile:', error);
        return res.status(500).json({ error: 'Failed to scrape', details: (error as Error).message });
    }
    });

    app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});
