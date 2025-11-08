
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userService } from '../services';
import type { UserProfile } from '../types';
import { useQuery } from '../hooks';
import { Card, Skeleton, ChevronRightIcon, FlameIcon, DumbbellIcon, LineChartIcon } from '../components';

const QuickLinkCard: React.FC<{to: string, title: string, description: string, icon: React.ElementType}> = ({ to, title, description, icon: Icon }) => (
    <Link to={to} className="group">
        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <div className="p-3 bg-green-100 rounded-xl inline-block mb-4">
                        <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-bold text-lg text-green-900">{title}</h3>
                    <p className="text-gray-500 text-sm">{description}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
            </div>
        </Card>
    </Link>
)

const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const data = await userService.getProfile();
      setUser(data);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
            <>
                <Skeleton className="h-10 w-3/4 mb-2" />
                <Skeleton className="h-6 w-1/2" />
            </>
        ) : (
            <div className="mb-8">
                <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Olá, {user?.name}!</h1>
                <p className="text-gray-500 mt-1 text-lg">Bem-vindo(a) de volta. Pronto para o seu dia?</p>
            </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickLinkCard 
                to="/dieta"
                title="Sua Dieta de Hoje"
                description="Veja suas refeições e macros."
                icon={FlameIcon}
            />
            <QuickLinkCard 
                to="/treino"
                title="Seu Treino de Hoje"
                description="Confira seus exercícios e séries."
                icon={DumbbellIcon}
            />
            <QuickLinkCard 
                to="/progresso"
                title="Seu Progresso"
                description="Analise seus gráficos e evolução."
                icon={LineChartIcon}
            />
        </div>

        <div className="mt-8">
            <Card>
                <h2 className="text-xl font-bold text-green-900 mb-4">Avisos e Dicas</h2>
                <p className="text-gray-600">
                    Lembre-se de manter a hidratação ao longo do dia. A meta de hoje é de 3 litros de água. Bons treinos!
                </p>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;