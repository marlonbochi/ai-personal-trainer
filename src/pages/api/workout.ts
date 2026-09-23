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

interface WorkoutRequestBody {
    language?: 'en' | 'pt';
    fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
    goal?: 'weight_loss' | 'muscle_gain' | 'endurance' | 'strength';
    duration?: '15_min' | '30_min' | '45_min' | '60_min' | '75_min' | '90_min' | '120_min';
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
            ? `Duração do treino: ${duration.replace('_', ' ')}. Ajuste o volume (número de exercícios, séries e circuitos/supersets) para preencher esse tempo - uma sessão de 90-120 minutos deve ter bem mais exercícios do que uma de 15-30 minutos.`
            : `Workout duration: ${duration.replace('_', ' ')}. Scale the volume (number of exercises, sets, and circuits/supersets) to fill that time - a 90-120 minute session should include noticeably more exercises than a 15-30 minute one.`;
            
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
            ? 'Dias de treino: ' + selectedWeekdays.join(', ') + '\nDias de descanso: ' + (restDays.length > 0 ? restDays.join(', ') : 'Nenhum - a pessoa optou por treinar em todos os dias disponíveis, sem folga.')
            : 'Workout days: ' + selectedWeekdays.join(', ') + '\nRest days: ' + (restDays.length > 0 ? restDays.join(', ') : 'None - the person chose to train on every available day, with no day off.')
        }

        ${language === 'pt'
            ? `REGRA OBRIGATÓRIA: TODOS os dias listados em "Dias de treino" (${selectedWeekdays.join(', ')}) DEVEM receber uma matriz de exercícios de verdade. NUNCA atribua uma mensagem de dia de descanso a um desses dias, mesmo que sejam muitos dias seguidos ou a semana inteira - a pessoa já escolheu explicitamente treinar nesses dias e não quer folga neles. A mensagem de dia de descanso só pode ser usada nos dias listados em "Dias de descanso" (se houver). Em vez de inserir descanso nos dias de treino, equilibre a carga dividindo o treino por grupos musculares ou tipo de treino ao longo da semana (ex: superior/inferior, push/pull/pernas, corpo inteiro alternado) para que cada grupo muscular tenha recuperação adequada através do próprio revezamento, não pela ausência de treino.`
            : `MANDATORY RULE: EVERY day listed in "Workout days" (${selectedWeekdays.join(', ')}) MUST receive a real array of exercises. NEVER assign a rest day message to one of those days, even if it's many days in a row or the entire week - the person has already explicitly chosen to train on those days and does not want a day off on them. The rest day message may only be used for days listed in "Rest days" (if any). Instead of inserting rest on a training day, balance the load by splitting the routine across muscle groups or workout types throughout the week (e.g. upper/lower body, push/pull/legs, alternating full body) so each muscle group gets adequate recovery through the rotation itself, not through skipping a day.`
        }

        ${language === 'pt'
            ? 'A resposta deve ser um objeto JSON válido onde cada chave é um dia da semana. Para os dias em "Dias de treino", o valor é sempre uma matriz de exercícios (nunca uma string). Para os dias em "Dias de descanso" (se houver), o valor é uma mensagem de dia de descanso.\n            \nPara cada exercício, forneça instruções detalhadas, incluindo séries, repetições, períodos de descanso e dicas de forma adequada.\nO treino deve ser apropriado para o nível de condicionamento físico e objetivo especificados.'
            : 'The response should be a valid JSON object where each key is a weekday. For days in "Workout days", the value is always an array of exercises (never a string). For days in "Rest days" (if any), the value is a rest day message.\n            \nFor each exercise, provide detailed instructions including sets, reps, rest periods, and proper form tips.\nThe workout should be appropriate for the specified fitness level and goal.'
        }

        ${language === 'pt'
            ? 'Exemplo de formato (todos os dias abaixo são exemplos de dias de TREINO - use este formato de matriz para cada dia em "Dias de treino"):'
            : 'Example format (all days below are WORKOUT day examples - use this array format for every day in "Workout days"):'
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
            "${language === 'pt' ? 'terca' : 'tuesday'}": [
                // ${language === 'pt' ? 'Outro dia de treino, com foco em grupos musculares diferentes de segunda-feira...' : 'Another training day, focusing on different muscle groups than Monday...'}
            ]
        }
        ${language === 'pt'
            ? `Se houver dias em "Dias de descanso", use este formato apenas para eles: "${restDays[0] ?? 'sabado'}": "Dia de descanso - Permita que seus músculos se recuperem"`
            : `If there are any days in "Rest days", use this format only for them: "${restDays[0] ?? 'saturday'}": "Rest day - Allow your muscles to recover"`
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
			console.error('API Gemini falhou', {
				error: error instanceof Error ? error.message : 'Erro desconhecido',
				url: API_URL,
				timestamp: new Date().toISOString()
			});
            res.status(500).json({ error: 'Failed to generate workout plan' });
        }
    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
}

// Export the handler with origin validation
export default withOriginValidation(handler);