import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { withOriginValidation } from '../../middleware/validateOrigin';
import { buildReplacePrompt, isValidReplaceBody, parseReplacement } from '../../lib/replaceExercise';

dotenv.config();

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isValidReplaceBody(req.body)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    const API_URL = process.env.GEMINI_API_URL;
    if (!API_KEY || !API_URL) {
        console.error('GEMINI_API_KEY or GEMINI_API_URL is not configured');
        return res.status(500).json({ error: 'Failed to replace exercise' });
    }

    try {
        const response = await axios.post<any>(
            `${API_URL}?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: buildReplacePrompt(req.body) }] }],
                generationConfig: { responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
            },
            { headers: { 'Content-Type': 'application/json' }, timeout: 45000 }
        );

        const text: string | undefined = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const replacement = text ? parseReplacement(text) : null;
        if (!replacement) {
            throw new Error('Invalid response format from Gemini API');
        }
        return res.status(200).json(replacement);
    } catch (error) {
        console.error('Error replacing exercise:', error instanceof Error ? error.message : 'unknown error');
        return res.status(500).json({ error: 'Failed to replace exercise' });
    }
}

export default withOriginValidation(handler);
