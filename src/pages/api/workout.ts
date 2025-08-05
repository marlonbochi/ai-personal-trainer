// pages/api/workout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    console.error('GEMINI_API_KEY is not set in environment variables');
    throw new Error('GEMINI_API_KEY is not configured');
}

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

interface WorkoutRequestBody {
    language?: 'en' | 'pt';
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    goal?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength';
    duration?: '15_min' | '30_min' | '45_min' | '60_min';
    daysPerWeek?: number;
    availableEquipment?: string[];
    specificFocusAreas?: string[];
    injuries?: string;
    additionalNotes?: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { 
            language = 'en',
            fitnessLevel = 'intermediate',
            goal = 'muscle_gain',
            duration = '30_min',
            daysPerWeek = 3,
            availableEquipment = [],
            specificFocusAreas = [],
            injuries = '',
            additionalNotes = ''
        } = req.body as WorkoutRequestBody;
        
        // Define weekdays in both languages
        const weekdays = {
            en: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            pt: ['segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado', 'domingo']
        };

        // Limit days to the requested number, but at least 2 and at most 7
        const numDays = Math.min(Math.max(2, daysPerWeek), 7);
        const selectedWeekdays = language === 'pt' 
            ? weekdays.pt.slice(0, numDays)
            : weekdays.en.slice(0, numDays);

        // Build the prompt with user preferences
        const languagePrompt = language === 'pt' 
            ? 'O nome e a descrição devem estar em português do Brasil. Use dias da semana em português (segunda-feira, terça-feira, etc.) e certifique-se de que todo o conteúdo esteja em português.'
            : 'The name and description should be in English. Use weekdays in English (Monday, Tuesday, etc.) and make sure all content is in English.';
            
        const levelPrompt = language === 'pt'
            ? `Nível de condicionamento: ${{
                beginner: 'Iniciante',
                intermediate: 'Intermediário',
                advanced: 'Avançado'
            }[fitnessLevel]}.`
            : `Fitness level: ${fitnessLevel.charAt(0).toUpperCase() + fitnessLevel.slice(1)}.`;
            
        const goalPrompt = language === 'pt'
            ? `Objetivo: ${{
                weight_loss: 'Perda de peso',
                muscle_gain: 'Ganho de massa muscular',
                endurance: 'Resistência',
                strength: 'Força'
            }[goal]}.`
            : `Goal: ${goal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}.`;
            
        const durationPrompt = language === 'pt'
            ? `Duração do treino: ${duration.replace('_', ' ')}.`
            : `Workout duration: ${duration.replace('_', ' ')}.`;
            
        const equipmentPrompt = availableEquipment.length > 0
            ? language === 'pt'
                ? `Equipamentos disponíveis: ${availableEquipment.join(', ')}.`
                : `Available equipment: ${availableEquipment.join(', ')}.`
            : language === 'pt'
                ? 'Nenhum equipamento disponível. Use exercícios que não precisam de equipamentos.'
                : 'No equipment available. Use exercises that require no equipment.';
                
        const focusPrompt = specificFocusAreas.length > 0
            ? language === 'pt'
                ? `Áreas de foco: ${specificFocusAreas.join(', ')}.`
                : `Focus areas: ${specificFocusAreas.join(', ')}.`
            : '';
            
        const injuriesPrompt = injuries
            ? language === 'pt'
                ? `Considerações sobre lesões: ${injuries}.`
                : `Injury considerations: ${injuries}.`
            : '';
            
        const notesPrompt = additionalNotes
            ? language === 'pt'
                ? `Notas adicionais: ${additionalNotes}.`
                : `Additional notes: ${additionalNotes}.`
            : '';

        // Generate a workout for each selected day of the week
        const workoutPlan: Record<string, any> = {};
        for (const day of selectedWeekdays) {
            // We'll let the AI generate the actual workout based on the detailed prompt
            // This is just a fallback in case the AI doesn't return a valid response
            workoutPlan[day] = [
                {
                    name: language === 'pt' ? 'Agachamento' : 'Squat',
                    description: language === 'pt' 
                        ? '3 séries de 12 repetições. Mantenha as costas retas e os joelhos alinhados com os pés.' 
                        : '3 sets of 12 reps. Keep your back straight and knees aligned with your feet.',
                    image: 'https://example.com/squat.jpg'
                },
                {
                    name: language === 'pt' ? 'Flexão' : 'Push-up',
                    description: language === 'pt'
                        ? '3 séries de 10 repetições. Mantenha o corpo reto e desça até o peito quase tocar o chão.'
                        : '3 sets of 10 reps. Keep your body straight and lower until your chest almost touches the ground.',
                    image: 'https://example.com/pushup.jpg'
                }
            ];
        }

        const prompt = `Generate a personalized workout plan based on the following preferences:
        ${languagePrompt}
        ${levelPrompt}
        ${goalPrompt}
        ${durationPrompt}
        ${equipmentPrompt}
        ${focusPrompt}
        ${injuriesPrompt}
        ${notesPrompt}

        The response should be a valid JSON object where each key is a weekday and the value is an array of exercises for that day.
        Each exercise should have a name, description, and an image URL.
        
        For each exercise, provide detailed instructions including sets, reps, rest periods, and proper form tips.
        The workout should be appropriate for the specified fitness level and goal.
        
        Example format (in English):
        {
            "monday": [
                {
                    "name": "Push-ups",
                    "description": "3 sets of 12 reps with 60 seconds rest between sets. Keep your body in a straight line from head to heels, engage your core, and lower your chest to the floor while keeping your elbows at a 45-degree angle from your body.",
                    "image": "https://example.com/pushups.jpg"
                },
                ...
            ],
            "tuesday": [...],
            ...
        }
        
        The image URLs should be direct links to relevant exercise images.
        Make sure the workout is balanced and targets all major muscle groups throughout the week.`;

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
                return res.status(200).json(geminiResponse);
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                console.error('Raw response:', geminiResponseText);
                throw new Error('Failed to parse Gemini API response');
            }
        } catch (error) {
            console.error('Error in workout API:', error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            res.status(500).json({ 
                error: 'Failed to generate workout',
                details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
            });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}