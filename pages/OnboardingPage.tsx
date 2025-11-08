import React, { useEffect } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { Card, Button } from '../components';

export const OnboardingLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const steps = ['/onboarding/anamnese', '/onboarding/objetivo', '/onboarding/preferencias'];
    const currentStepIndex = steps.indexOf(location.pathname);

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                {currentStepIndex !== -1 && (
                    <div className="flex justify-center space-x-2 mb-8">
                        {Array.from({ length: steps.length }).map((_, index) => (
                            <div key={index} className={`w-10 h-2 rounded-full ${index <= currentStepIndex ? 'bg-brand-600' : 'bg-gray-300'}`}></div>
                        ))}
                    </div>
                )}
                {children}
            </Card>
        </div>
    );
};

export const AnamnesePage: React.FC = () => (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Anamnese</h2>
        <p className="text-center text-gray-500 mb-6">Vamos começar com algumas perguntas básicas.</p>
        <div className="space-y-4">
            <div><label className="text-sm font-medium">Idade</label><input type="number" className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700" /></div>
            <div><label className="text-sm font-medium">Altura (cm)</label><input type="number" className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700" /></div>
            <div><label className="text-sm font-medium">Peso (kg)</label><input type="number" className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700" /></div>
        </div>
        <Link to="/onboarding/objetivo">
            <Button className="w-full mt-8">Continuar</Button>
        </Link>
    </div>
);

export const ObjetivoPage: React.FC = () => (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Qual seu principal objetivo?</h2>
        <div className="space-y-3">
            {["Perder Gordura", "Ganhar Massa Muscular", "Recomposição Corporal", "Manter o Peso"].map(obj => (
                 <Link to="/onboarding/preferencias" key={obj} className="block">
                    <button className="w-full text-left p-4 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{obj}</button>
                </Link>
            ))}
        </div>
    </div>
);

export const PreferenciasPage: React.FC = () => (
    <div>
        <h2 className="text-xl font-semibold mb-4 text-center">Preferências Alimentares</h2>
        <p className="text-center text-gray-500 mb-6">Selecione alimentos que você não consome.</p>
        <div className="grid grid-cols-2 gap-3">
            {["Carne Vermelha", "Frango", "Peixe", "Lactose", "Glúten", "Ovos"].map(food => (
                <button key={food} className="p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">{food}</button>
            ))}
        </div>
        <Link to="/onboarding/gerando">
            <Button className="w-full mt-8">Finalizar</Button>
        </Link>
    </div>
);

export const GerandoPage: React.FC = () => {
    const context = useOutletContext<{ onComplete: () => void }>();
    const onComplete = context?.onComplete;
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
            if (onComplete) {
                onComplete();
            }
            navigate('/dashboard', { replace: true });
        }, 2000);
        return () => clearTimeout(timer);
    }, [onComplete, navigate]);

    return (
        <div className="text-center">
            <div className="w-12 h-12 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold">Gerando seu plano...</h2>
            <p className="text-gray-500">Isso levará apenas um momento.</p>
        </div>
    );
};
