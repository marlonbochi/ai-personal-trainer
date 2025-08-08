// pages/api/nutrition.ts
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

type DietGoal = 'weight_loss' | 'muscle_gain' | 'maintenance' | 'endurance';

interface NutritionRequestBody {
    language?: 'en' | 'pt';
    dietGoal: DietGoal;
    caloriesPerDay: number;
    budgetPerWeek: number;
    mealsPerDay: number;
    dietaryRestrictions: string[];
    allergies: string[];
    preferredCuisines: string[];
    additionalNotes: string;
    age: number;
    gender: 'male' | 'female';
}

// Main handler function
async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const { 
            language = 'en',
            dietGoal = 'maintenance',
            caloriesPerDay = 2000,
            budgetPerWeek = 100,
            mealsPerDay = 3,
            dietaryRestrictions = [],
            allergies = [],
            preferredCuisines = [],
            additionalNotes = '',
            age = 30,
            gender = 'male'
        } = req.body as NutritionRequestBody;
        
        // Define weekdays in both languages for meal planning
        const weekdays = {
            en: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            pt: ['Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado', 'Domingo']
        };
        
        // Get the weekdays list in the correct language
        const weekdaysList = language === 'pt' ? weekdays.pt : weekdays.en;

        // Build the nutrition prompt with user preferences
        const languagePrompt = language === 'pt' 
            ? 'O plano alimentar deve estar em português do Brasil. Use nomes populares para os alimentos e refeições. Certifique-se de que todo o conteúdo esteja em português.'
            : 'The meal plan should be in English. Use common names for foods and meals. Make sure all content is in English.';
            
        const ageGenderPrompt = language === 'pt'
            ? `Esta pessoa tem ${age} anos e é do sexo ${gender === 'male' ? 'masculino' : 'feminino'}.`
            : `This person is ${age} years old and ${gender === 'male' ? 'male' : 'female'}.`;
            
        const goalPrompt = language === 'pt'
            ? `Objetivo: ${{
                weight_loss: 'Perda de peso',
                muscle_gain: 'Ganho de massa muscular',
                maintenance: 'Manutenção',
                endurance: 'Resistência'
            }[dietGoal]}.`
            : `Goal: ${dietGoal.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}.`;
            
        const caloriesPrompt = language === 'pt'
            ? `Meta de calorias diárias: ${caloriesPerDay} kcal.`
            : `Daily calorie goal: ${caloriesPerDay} kcal.`;
            
        const budgetPrompt = language === 'pt'
            ? `Orçamento semanal: ${budgetPerWeek} BRL.`
            : `Weekly budget: ${budgetPerWeek} USD.`;
                
        const restrictionsPrompt = dietaryRestrictions.length > 0
            ? language === 'pt'
                ? `Restrições alimentares: ${dietaryRestrictions.join(', ')}.`
                : `Dietary restrictions: ${dietaryRestrictions.join(', ')}.`
            : '';
            
        const allergiesPrompt = allergies.length > 0
            ? language === 'pt'
                ? `Alergias: ${allergies.join(', ')}.`
                : `Allergies: ${allergies.join(', ')}.`
            : '';
            
        const cuisinesPrompt = preferredCuisines.length > 0
            ? language === 'pt'
                ? `Cozinhas preferidas: ${preferredCuisines.join(', ')}.`
                : `Preferred cuisines: ${preferredCuisines.join(', ')}.`
            : '';
            
        const notesPrompt = additionalNotes
            ? language === 'pt'
                ? `Notas adicionais: ${additionalNotes}.`
                : `Additional notes: ${additionalNotes}.`
            : '';

        // Build the complete nutrition prompt
        const prompt = `Generate a ${language === 'pt' ? 'plano alimentar' : 'meal plan'} for 7 days with ${mealsPerDay} ${language === 'pt' ? 'refeições por dia' : 'meals per day'}.
        
        ${languagePrompt}
        ${ageGenderPrompt}
        ${goalPrompt}
        ${caloriesPrompt}
        ${budgetPrompt}
        ${restrictionsPrompt}
        ${allergiesPrompt}
        ${cuisinesPrompt}
        ${notesPrompt}

        ${language === 'pt' 
            ? 'O plano deve incluir café da manhã, almoço, jantar e lanches conforme necessário.'
            : 'The plan should include breakfast, lunch, dinner, and snacks as needed.'
        }

        ${language === 'pt'
            ? 'A resposta deve ser um objeto JSON válido onde cada chave é um dia da semana e o valor é um objeto com as refeições do dia.\n            \nPara cada dia, inclua as seguintes refeições: café da manhã, almoço, jantar e lanches.\nPara cada refeição, inclua o nome, lista de ingredientes e instruções de preparo.\n\nO plano deve ser equilibrado, saboroso e adequado para o objetivo e restrições fornecidos.\nInclua o total de calorias e macronutrientes para cada refeição.'
            : 'The response should be a valid JSON object where each key is a weekday and the value is an object with the day\'s meals.\n            \nFor each day, include the following meals: breakfast, lunch, dinner, and snacks.\nFor each meal, include the name, list of ingredients, and preparation instructions.\n\nThe plan should be balanced, tasty, and appropriate for the provided goal and restrictions.\nInclude total calories and macronutrients for each meal.'
        }

        ${language === 'pt'
            ? 'Exemplo de formato:'
            : 'Example format:'
        }
        {
            "${language === 'pt' ? 'segunda' : 'monday'}": {
                "breakfast": {
                    "name": "${language === 'pt' ? 'Omelete de Espinafre' : 'Spinach Omelet'}",
                    "ingredients": [
                        "2 ovos",
                        "1 xícara de espinafre fresco",
                        "1 colher de chá de azeite",
                        "Sal e pimenta a gosto"
                    ],
                    "instructions": "${language === 'pt' 
                        ? '1. Aqueça o azeite em uma frigideira antiaderente.\n2. Adicione o espinafre e refogue até murchar.\n3. Bata os ovos com sal e pimenta.\n4. Despeje os ovos sobre o espinafre e cozinhe em fogo médio até firmar.\n5. Dobre a omelete ao meio e sirva quente.'
                        : '1. Heat olive oil in a non-stick pan.\n2. Add spinach and sauté until wilted.\n3. Whisk eggs with salt and pepper.\n4. Pour eggs over spinach and cook over medium heat until set.\n5. Fold the omelet in half and serve hot.'
                    }",
                    "nutrition": {
                        "calories": 280,
                        "protein": 18,
                        "carbs": 4,
                        "fat": 22
                    }
                },
                "lunch": {
                    // Similar structure for lunch
                },
                "dinner": {
                    // Similar structure for dinner
                },
                "snacks": [
                    // Array of snack objects with similar structure
                ]
            },
            "${language === 'pt' ? 'terca' : 'tuesday'}": {
                // Next day's meals
            }
        }

        ${language === 'pt'
            ? 'Certifique-se de que o plano alimentar seja equilibrado, variado e atenda às necessidades nutricionais diárias. Inclua uma variedade de frutas, vegetais, proteínas magras, grãos integrais e gorduras saudáveis.'
            : 'Make sure the meal plan is balanced, varied, and meets daily nutritional needs. Include a variety of fruits, vegetables, lean proteins, whole grains, and healthy fats.'
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
                const responseData = geminiResponse.mealPlan || geminiResponse
				
                console.log('Sending response:', responseData);
                return res.status(200).json(responseData);
            } catch (parseError) {
                console.error('Error parsing Gemini response:', parseError);
                console.error('Raw response:', geminiResponseText);
                throw new Error('Failed to parse Gemini API response');
            }
        } catch (error) {
            console.error('Error generating workout plan:', error);
            res.status(500).json({ error: req.body.language === 'pt' ? 'Falha ao gerar o plano alimentar' : 'Failed to generate meal plan' });
        }
    } else {
        res.status(405).json({ error: req.method === 'POST' && req.body.language === 'pt' ? 'Método não permitido' : 'Method not allowed' });
    }
}

// Export the handler with origin validation
export default withOriginValidation(handler);