type Nutrition = {
	calories: number;
	protein: number;
	carbs: number;
	fat: number;
};

type Meal = {
	name: string;
	ingredients: string[];
	instructions: string;
	nutrition: Nutrition;
};

type DayPlan = {
	breakfast: Meal;
	lunch: Meal;
	dinner: Meal;
	snacks: Meal[];
};

type Days = {
	monday: DayPlan;
	tuesday: DayPlan;
	wednesday: DayPlan;
	thursday: DayPlan;
	friday: DayPlan;
	saturday: DayPlan;
	sunday: DayPlan;
};

type WeekPlan = {
	days: Days;
	dietGoal: string;
	mealsPerDay: number;
	dailyCalories: number;
	weeklyBudget: number;
};

export default WeekPlan;