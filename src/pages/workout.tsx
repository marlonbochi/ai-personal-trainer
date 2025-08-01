// pages/workout.tsx
'use client'
import { useState } from 'react';
import axios from 'axios';

interface WorkoutResponse {
	workout: {
		[day: string]: {
		name: string;
		description: string;
		image: string;
		}[];
	};
}

export default function Workout() {
    const [workout, setWorkout] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerateWorkout = async () => {
        setLoading(true);

        try {
            const result = await axios.post<WorkoutResponse>('/api/workout');
            setWorkout(result.data.workout);
        } catch (error) {
            console.error('Error calling API:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1>Gemini Workout Plan</h1>
            <button onClick={handleGenerateWorkout} disabled={loading}>
                {loading ? 'Loading...' : 'Generate Workout'}
            </button>
            {workout && (
                <div>
                    {Object.keys(workout).map((day) => (
                        <div key={day}>
                            <br />
                            <h2>{day}</h2>
                            <br />
                            {workout[day].map((exercise: any, index: number) => (
                                <div key={index}>
                                    <h3>{exercise.name}</h3>
                                    <br />
                                    <p>{exercise.description}</p>
                                    <br />
                                    <img src={exercise.image} alt={exercise.name} style={{ maxWidth: '200px' }} />
                                    <br />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}