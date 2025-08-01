// pages/api/gemini.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface GeminiRequest {
    contents: {
        parts: {
            text: string;
        }[];
    }[];
}

interface GeminiResponse {
    candidates: {
        content: {
            parts: {
                text: string;
            }[];
        };
    }[];
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const prompt = `Generate a 5-day workout plan, with 3 exercises per day. For each exercise, include the name, description, and a relevant image URL with free use images. The name and description should be in Portuguese. Format the response as a JSON object, with the following structure:
		{
			'workout': {
				'monday': [
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' }
				],
				'tuesday': [
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' }
				],
				'wednesday': [
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' }
				],
				'thursday': [
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' }
				],
				'friday': [
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' },
				{ 'name': '...', 'description': '...', 'image': '...' }
				]
			}
		}`;

		const urlGemini = `${API_URL}?key=${API_KEY}`;

        try {
            const requestData: GeminiRequest = {
                contents: [{
                    parts: [{ text: prompt }]
                }]
            };
            const response = await axios.post<GeminiResponse>(
                urlGemini,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );

			let geminiResponseText = response.data.candidates[0].content.parts[0].text;

            // Remove as tags `json e ` do início e do final da resposta
            geminiResponseText = geminiResponseText.replace('```json', '').replace('```', '').trim();

            const geminiResponse = JSON.parse(geminiResponseText);
            res.status(200).json(geminiResponse);
        } catch (error) {
            console.error('Error fetching Gemini API:', error);
            res.status(500).json({ error: 'Error fetching Gemini API' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}