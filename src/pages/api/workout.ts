// pages/api/workout.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import * as dotenv from 'dotenv';
import { withOriginValidation } from '../../middleware/validateOrigin';

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
    selectedDays?: string[];
    trainerLocation?: string[];
    specificFocusAreas?: string[];
    injuries?: string;
    additionalNotes?: string;
    age?: number;
    gender?: 'male' | 'female';
}

// Main handler function
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { 
            language = 'en',
            fitnessLevel = 'intermediate',
            goal = 'muscle_gain',
            duration = '30_min',
            daysPerWeek = 3,
            selectedDays: rawSelectedDays = ['monday', 'wednesday', 'friday'],
            trainerLocation = [],
            specificFocusAreas = [],
            injuries = '',
            additionalNotes = '',
            age = 30,
            gender = 'male'
        } = req.body as WorkoutRequestBody;
        
        // Define weekdays in both languages
        const weekdays = {
            en: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            pt: ['segunda-feira', 'terca-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sabado', 'domingo']
        };
        
        // Get the weekdays list in the correct language
        const weekdaysList = language === 'pt' ? weekdays.pt : weekdays.en;
        
        // Map the selected days to the correct language if needed
        const selectedWeekdays = rawSelectedDays.map(day => {
            if (language === 'pt') {
                // If PT, map from English day names to Portuguese if needed
                const enIndex = weekdays.en.indexOf(day.toLowerCase());
                return enIndex >= 0 ? weekdays.pt[enIndex] : day;
            }
            // If EN, ensure day is in English
            const ptIndex = weekdays.pt.indexOf(day.toLowerCase());
            return ptIndex >= 0 ? weekdays.en[ptIndex] : day;
        });
        
        // Get the rest days (all days not in selectedWeekdays)
        const restDays = weekdaysList.filter(day => !selectedWeekdays.includes(day));
        
        // Ensure we have at least one workout day
        if (selectedWeekdays.length === 0) {
            selectedWeekdays.push(weekdaysList[0]); // Default to first day if none selected
            restDays.splice(0, 1); // Remove the first day from rest days
        }

        // Build the prompt with user preferences
        const languagePrompt = language === 'pt' 
            ? 'O nome e a descrição devem estar em português do Brasil. Use nomes populares para os exercícios. Use dias da semana em português (segunda-feira, terça-feira, etc.) e certifique-se de que todo o conteúdo esteja em português.'
            : 'The name and description should be in English. Use popular names for exercises. Use weekdays in English (Monday, Tuesday, etc.) and make sure all content is in English.';
            
        const ageGenderPrompt = language === 'pt'
            ? `Esta pessoa tem ${age} anos e é do sexo ${gender === 'male' ? 'masculino' : 'feminino'}.`
            : `This person is ${age} years old and ${gender === 'male' ? 'male' : 'female'}.`;
            
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
            
        const trainerLocationPrompt = language === 'pt'
            ? `Eu irei treinar em ${trainerLocation.join(', ')}.`
            : `I will train in ${trainerLocation.join(', ')}.`;
                
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

        // Build the complete prompt
        const prompt = `Generate a ${language === 'pt' ? 'plano de treino' : 'workout plan'} for ${selectedWeekdays.length} ${language === 'pt' ? 'dias por semana' : 'days per week'}.
        
        ${languagePrompt}
        ${ageGenderPrompt}
        ${levelPrompt}
        ${goalPrompt}
        ${durationPrompt}
        ${trainerLocationPrompt}
        ${focusPrompt}
        ${injuriesPrompt}
        ${notesPrompt}

        ${language === 'pt' 
            ? 'Dias de treino: ' + selectedWeekdays.join(', ') + '\nDias de descanso: ' + restDays.join(', ')
            : 'Workout days: ' + selectedWeekdays.join(', ') + '\nRest days: ' + restDays.join(', ')
        }

        ${language === 'pt'
            ? 'A resposta deve ser um objeto JSON válido onde cada chave é um dia da semana e o valor é uma matriz de exercícios para esse dia ou uma mensagem de dia de descanso.\n            \nPara dias de treino, inclua uma matriz de exercícios onde cada exercício tem um nome e descrição.\nPara dias de descanso, inclua uma mensagem de dia de descanso.\n\nPara cada exercício, forneça instruções detalhadas, incluindo séries, repetições, períodos de descanso e dicas de forma adequada.\nO treino deve ser apropriado para o nível de condicionamento físico e objetivo especificados.'
            : 'The response should be a valid JSON object where each key is a weekday and the value is either an array of exercises for that day or a rest day message.\n            \nFor workout days, include an array of exercises where each exercise has a name and description.\nFor rest days, include a rest day message.\n\nFor each exercise, provide detailed instructions including sets, reps, rest periods, and proper form tips.\nThe workout should be appropriate for the specified fitness level and goal.'
        }

        ${language === 'pt'
            ? 'Exemplo de formato:'
            : 'Example format:'
        }
        {
            "${language === 'pt' ? 'segunda' : 'monday'}": [
                {
                    "name": "${language === 'pt' ? 'Agachamento' : 'Squat'}",
                    "description": "${language === 'pt' 
                        ? '3 séries de 12 repetições com 60 segundos de descanso entre as séries. Mantenha as costas retas e desça até as coxas ficarem paralelas ao chão.'
                        : '3 sets of 12 reps with 60 seconds rest between sets. Keep your back straight and lower until your thighs are parallel to the ground.'
                    }"
                },
                {
                    "name": "${language === 'pt' ? 'Flexão' : 'Push-up'}",
                    "description": "${language === 'pt'
                        ? '3 séries de 12 repetições com 60 segundos de descanso entre as séries. Mantenha o corpo em linha reta da cabeça aos calcanhares, contraia o abdômen e desça o peito em direção ao chão, mantendo os cotovelos em um ângulo de 45 graus em relação ao corpo.'
                        : '3 sets of 12 reps with 60 seconds rest between sets. Keep your body in a straight line from head to heels, engage your core, and lower your chest to the floor while keeping your elbows at a 45-degree angle from your body.'
                    }"
                }
            ],
            "${language === 'pt' ? 'terca' : 'tuesday'}": "${language === 'pt' 
                ? 'Dia de descanso - Permita que seus músculos se recuperem' 
                : 'Rest day - Allow your muscles to recover'}",
            "${language === 'pt' ? 'quarta' : 'wednesday'}": [
                // Mais exercícios...
            ]
        }

        ${language === 'pt'
            ? 'Certifique-se de que o treino seja equilibrado e trabalhe todos os principais grupos musculares ao longo da semana.'
            : 'Make sure the workout is balanced and targets all major muscle groups throughout the week.'
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
                const responseData = geminiResponse.workout || geminiResponse
				
                console.log('Sending response:', responseData);
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

// Export the handler with origin validation
export default withOriginValidation(handler);