// pages/page.tsx
import Workout from "../pages/workout";

export default function Home() {
  return (
    <div className="p-5">
      <h1 className="text-3xl font-bold mb-4">Welcome to the Workout App</h1>
      <Workout />
    </div>
  );
}