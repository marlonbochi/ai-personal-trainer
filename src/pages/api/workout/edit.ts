import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { withOriginValidation } from '../../../middleware/validateOrigin';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
	console.error('GEMINI_API_KEY is not set in environment variables');
	throw new Error('GEMINI_API_KEY is not configured');
}

const API_URL = process.env.GEMINI_API_URL;
if (!API_URL) {
	console.error('GEMINI_API_URL is not set in environment variables');
	throw new Error('GEMINI_API_URL is not configured');
}

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

interface WorkoutEditRequestBody {
    nameWorkout: string;
    descriptionWorkout: string;
    language: 'en' | 'pt';
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
		const { 
            nameWorkout = 'en',
			descriptionWorkout = 'en',
			language = 'en'
        } = req.body as WorkoutEditRequestBody;

        const urlGemini = `${API_URL}`;

        try {
            const requestData: GeminiRequest = {
                contents: [{
                    parts: [{ text: `Replace for the same workout plan: ${nameWorkout}. ${descriptionWorkout}. ${language}` }]
                }]
            };
            const response = await axios.post<GeminiResponse>(
                urlGemini,
                requestData,
                {
                    headers: {
                        'Content-Type': 'application/json',
						'x-goog-api-key': API_KEY
                    },
                }
            );

            if (!response.data.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid response format from Gemini API');
            }

            let geminiResponseText = response.data.candidates[0].content.parts[0].text;

            try {
                // Remove code block markers if present
                geminiResponseText = geminiResponseText
                    .replace(/^```(json)?/g, '')
                    .replace(/```$/g, '')
                    .trim();

                const geminiResponse = JSON.parse(geminiResponseText);
                // Ensure the response has the expected structure
                const responseData = geminiResponse.workout || geminiResponse;

                // console.log('Sending response:', responseData);
                return res.status(200).json(responseData);
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                console.error('Raw response:', geminiResponseText);
                throw new Error('Failed to parse Gemini API response');
            }
        } catch (error) {
            console.error('Error generating workout plan:', error);
            res.status(500).json({ error: 'Failed to generate workout plan' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

export default withOriginValidation(handler);
