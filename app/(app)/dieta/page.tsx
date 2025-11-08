"use client";

import React, { useState, useEffect } from 'react';
import { dietService } from '../../../services';
import type { DailyDietSummary, Meal, WeeklyDietDay } from '../../../types';
import { Card, Button, Skeleton, Progress, Tabs } from '../../../components';

// useQuery hook re-implementado localmente para componentes de cliente
function useQuery<T>(queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    queryFn().then(res => {
      setData(res);
      setIsLoading(false);
    });
  }, [queryFn]);
  return { data, isLoading };
}


const MacroProgress: React.FC<{ label: string; consumed: number; goal: number; unit: string }> = ({ label, consumed, goal, unit }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      <span className="text-sm text-gray-500">{consumed.toFixed(0)}{unit} / {goal.toFixed(0)}{unit}</span>
    </div>
    <Progress value={(consumed / goal) * 100} />
  </div>
);

const DailySummaryCard: React.FC = () => {
    const { data: summary, isLoading } = useQuery(dietService.getDailySummary);

    if (isLoading) {
        return (
            <Card>
                <Skeleton className="h-6 w-1/3 mb-6"/>
                <div className="space-y-5">
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                    <Skeleton className="h-8 w-full"/>
                </div>
            </Card>
        );
    }
    
    if (!summary) return null;
    
    return (
        <Card>
            <h2 className="text-xl font-bold text-green-900 mb-4">Resumo do Dia</h2>
            <div className="space-y-5">
                <MacroProgress label="Calorias" consumed={summary.calories.consumed} goal={summary.calories.goal} unit="kcal" />
                <MacroProgress label="Proteínas" consumed={summary.protein.consumed} goal={summary.protein.goal} unit="g" />
                <MacroProgress label="Carboidratos" consumed={summary.carbs.consumed} goal={summary.carbs.goal} unit="g" />
                <MacroProgress label="Gorduras" consumed={summary.fats.consumed} goal={summary.fats.goal} unit="g" />
            </div>
        </Card>
    );
};

const MealCard: React.FC<{ meal: Meal }> = ({ meal }) => (
    <Card className="!scale-100 hover:!scale-[1.02]">
        <div className="flex justify-between items-start mb-4">
            <div>
                <h3 className="font-bold text-lg">{meal.name}</h3>
                <p className="text-sm text-gray-500">{meal.time}</p>
            </div>
            <div className="text-right">
                <p className="font-extrabold text-xl text-green-800">{meal.calories} kcal</p>
            </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3 text-center border-t border-gray-100 pt-4">
            <div>
                <p className="text-xs font-medium text-gray-500">Proteína</p>
                <p className="font-bold text-green-900">{meal.protein}g</p>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">Carbs</p>
                <p className="font-bold text-green-900">{meal.carbs}g</p>
            </div>
            <div>
                <p className="text-xs font-medium text-gray-500">Gordura</p>
                <p className="font-bold text-green-900">{meal.fats}g</p>
            </div>
        </div>
        
        <div className="border-t border-gray-100 mt-4 pt-4">
             <p className="text-sm text-gray-600">{meal.description}</p>
        </div>
    </Card>
);

const DailyDietView: React.FC = () => {
    const { data: meals, isLoading } = useQuery(dietService.getDailyMeals);
     return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
            <div className="lg:col-span-1">
                <DailySummaryCard/>
            </div>
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-xl font-bold text-green-900">Refeições de Hoje</h2>
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 w-full rounded-2xl"/>)
                ) : (
                    meals?.map(meal => <MealCard key={meal.id} meal={meal} />)
                )}
            </div>
        </div>
    )
}

const WeeklyDietView: React.FC = () => {
    const { data: plan, isLoading } = useQuery(dietService.getWeeklyPlan);
    const [selectedDay, setSelectedDay] = useState(0);
    
    return (
        <div className="mt-6">
            {isLoading ? (
                <Skeleton className="h-96 w-full rounded-2xl" />
            ) : plan ? (
                <div>
                    <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
                    {plan.map((day, index) => (
                        <button key={day.day} onClick={() => setSelectedDay(index)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${selectedDay === index ? 'bg-green-500 text-white shadow' : 'bg-white hover:bg-green-50'}`}>
                            {day.day}
                        </button>
                    ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {plan[selectedDay].meals.map(meal => <MealCard key={meal.id} meal={meal} />)}
                    </div>
                </div>
            ) : null}
        </div>
    );
};


export default function DietaPage() {
    const [activeTab, setActiveTab] = useState('Hoje');

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Sua Dieta</h1>
                    <p className="text-lg text-gray-500 mt-1">Acompanhe seu plano alimentar diário e semanal.</p>
                </div>
                
                <Tabs tabs={['Hoje', 'Plano Semanal']} activeTab={activeTab} onTabChange={setActiveTab} />
                
                {activeTab === 'Hoje' ? <DailyDietView /> : <WeeklyDietView />}
            </div>
        </div>
    );
};
