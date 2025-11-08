import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { dietService } from '../services';
import type { DailyDietSummary, Meal, WeeklyDietDay } from '../types';
import { Card, Button, Skeleton, Progress, Dialog } from '../components';
import { useQuery } from '../hooks';

const MacroProgress: React.FC<{ label: string; consumed: number; goal: number; unit: string }> = ({ label, consumed, goal, unit }) => (
  <div>
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <span className="text-sm text-gray-500 dark:text-gray-400">{consumed.toFixed(0)}{unit} / {goal.toFixed(0)}{unit}</span>
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
                <div className="space-y-4">
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
            <h2 className="text-lg font-semibold mb-4">Resumo do Dia</h2>
            <div className="space-y-4">
                <MacroProgress label="Calorias" consumed={summary.calories.consumed} goal={summary.calories.goal} unit="kcal" />
                <MacroProgress label="Proteínas" consumed={summary.protein.consumed} goal={summary.protein.goal} unit="g" />
                <MacroProgress label="Carboidratos" consumed={summary.carbs.consumed} goal={summary.carbs.goal} unit="g" />
                <MacroProgress label="Gorduras" consumed={summary.fats.consumed} goal={summary.fats.goal} unit="g" />
            </div>
        </Card>
    );
};

const MealCard: React.FC<{ meal: Meal; onViewDetails: () => void }> = ({ meal, onViewDetails }) => (
    <Card>
        <div className="flex justify-between items-center mb-3">
            <div>
                <h3 className="font-semibold">{meal.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</p>
            </div>
            <div className="text-right">
                <p className="font-semibold">{meal.calories} kcal</p>
            </div>
        </div>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 border-t pt-3 mt-3">
            {meal.items.map((item, index) => (
                <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="font-medium">{item.quantity}</span>
                </li>
            ))}
        </ul>
        <div className="mt-4 text-right">
             <Button variant="ghost" size="sm" onClick={onViewDetails}>Ver Detalhes</Button>
        </div>
    </Card>
);

export const DietaPage: React.FC = () => {
    const { data: meals, isLoading } = useQuery(dietService.getDailyMeals);
    const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold tracking-tight">Dieta</h1>
                    <Link to="/dieta/plano-semanal">
                        <Button variant="secondary">Ver Plano Semanal</Button>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <DailySummaryCard/>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-semibold">Refeições de Hoje</h2>
                        {isLoading ? (
                            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-40 w-full"/>)
                        ) : (
                            meals?.map(meal => <MealCard key={meal.id} meal={meal} onViewDetails={() => setSelectedMeal(meal)} />)
                        )}
                    </div>
                </div>
            </div>

            {selectedMeal && (
                <Dialog
                    isOpen={!!selectedMeal}
                    onClose={() => setSelectedMeal(null)}
                    title={`Detalhes de ${selectedMeal.name}`}
                    footer={
                        <Button variant="secondary" onClick={() => setSelectedMeal(null)}>Fechar</Button>
                    }
                >
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500">Calorias</p>
                                <p className="font-bold text-lg">{selectedMeal.calories} kcal</p>
                            </div>
                             <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500">Proteínas</p>
                                <p className="font-bold text-lg">{selectedMeal.protein} g</p>
                            </div>
                             <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500">Carboidratos</p>
                                <p className="font-bold text-lg">{selectedMeal.carbs} g</p>
                            </div>
                             <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <p className="text-sm text-gray-500">Gorduras</p>
                                <p className="font-bold text-lg">{selectedMeal.fats} g</p>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-2">Itens da Refeição</h4>
                            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 border-t pt-3">
                                {selectedMeal.items.map((item, index) => (
                                    <li key={index} className="flex justify-between p-2 rounded-md even:bg-gray-50 dark:even:bg-gray-700/50">
                                        <span>{item.name}</span>
                                        <span className="font-medium">{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

// Also refactor the weekly plan page to use the new hook for consistency.
export const PlanoSemanalDietaPage: React.FC = () => {
    const { data: plan, isLoading } = useQuery(dietService.getWeeklyPlan);
    const [selectedDay, setSelectedDay] = useState(0);

    const MealCardWeekly: React.FC<{ meal: Meal }> = ({ meal }) => (
        <Card>
            <div className="flex justify-between items-center mb-3">
                <div>
                    <h3 className="font-semibold">{meal.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{meal.time}</p>
                </div>
                <div className="text-right">
                    <p className="font-semibold">{meal.calories} kcal</p>
                </div>
            </div>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300 border-t pt-3 mt-3">
                {meal.items.map((item, index) => (
                    <li key={index} className="flex justify-between">
                        <span>{item.name}</span>
                        <span className="font-medium">{item.quantity}</span>
                    </li>
                ))}
            </ul>
        </Card>
    );
    
    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                    <Link to="/dieta" className="text-sm text-brand-600 hover:underline">&larr; Voltar para Dieta Diária</Link>
                    <h1 className="text-3xl font-bold tracking-tight mt-1">Plano Semanal</h1>
                </div>

                {isLoading ? (
                    <Skeleton className="h-96 w-full" />
                ) : plan ? (
                    <div>
                        <div className="flex space-x-2 overflow-x-auto pb-4 mb-6">
                        {plan.map((day, index) => (
                            <button key={day.day} onClick={() => setSelectedDay(index)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${selectedDay === index ? 'bg-brand-600 text-white' : 'bg-white dark:bg-gray-800'}`}>
                                {day.day}
                            </button>
                        ))}
                        </div>
                        <div className="space-y-6">
                            {plan[selectedDay].meals.map(meal => <MealCardWeekly key={meal.id} meal={meal} />)}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
};
