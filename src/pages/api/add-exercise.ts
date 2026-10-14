import type { NextApiRequest, NextApiResponse } from 'next';
import { withOriginValidation } from '../../middleware/validateOrigin';
import { withRateLimit } from '../../middleware/rateLimit';
import { buildAddPrompt, isValidAddBody } from '../../lib/addExercise';
import { requestExercise } from '../../lib/geminiExercise';

async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    if (!isValidAddBody(req.body)) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const exercise = await requestExercise(buildAddPrompt(req.body));
        return res.status(200).json(exercise);
    } catch (error) {
        console.error('Error adding exercise:', error instanceof Error ? error.message : 'unknown error');
        return res.status(500).json({ error: 'Failed to add exercise' });
    }
}

export default withRateLimit(withOriginValidation(handler), { name: 'add-exercise', limit: 20, windowMs: 60_000 });

export const config = {
    api: { bodyParser: { sizeLimit: '16kb' } },
};
