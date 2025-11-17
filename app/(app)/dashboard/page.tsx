"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { userService } from '@/lib/services';
import type { UserProfile } from '@/lib/types';
import { Card, ChevronRightIcon, FlameIcon, DumbbellIcon, LineChartIcon, Skeleton } from '@/components';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { isImpersonating } from '@/lib/impersonation';

function useQuery<T>(queryFn: () => Promise<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let isMounted = true;
    queryFn().then(res => {
      if (isMounted) {
        setData(res);
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, [queryFn]);
  return { data, isLoading };
}

const QuickLinkCard: React.FC<{href: string, title: string, description: string, icon: React.ElementType}> = ({ href, title, description, icon: Icon }) => (
    <Link href={href} className="group">
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
);


export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  // Redireciona profissionais para a tela de alunos do profissional
  useEffect(() => {
    let mounted = true;
    (async () => {
      // Se estiver em modo de impersonação, NÃO redireciona (deve ver o app do aluno)
      if (typeof window !== "undefined" && isImpersonating()) {
        return;
      }
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!mounted || !user) return;
        const { data: aluno, error } = await supabase
          .from('alunos')
          .select('id, role')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        if (error) return;
        const role = (aluno?.role || '').toString().toLowerCase().trim();
        if (role && role !== 'aluno') {
          router.replace('/profissional/alunos');
          router.refresh();
        }
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: user, isLoading } = useQuery(userService.getProfile);

  if (isLoading) {
      return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <Skeleton className="h-10 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
                <div className="mt-8">
                    <Skeleton className="h-24 w-full" />
                </div>
            </div>
        </div>
      )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight text-green-900">Olá, {user?.name}!</h1>
            <p className="text-gray-500 mt-1 text-lg">Bem-vindo(a) de volta. Pronto para o seu dia?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickLinkCard 
                href="/dieta"
                title="Sua Dieta de Hoje"
                description="Veja suas refeições e macros."
                icon={FlameIcon}
            />
            <QuickLinkCard 
                href="/treino"
                title="Seu Treino de Hoje"
                description="Confira seus exercícios e séries."
                icon={DumbbellIcon}
            />
            <QuickLinkCard 
                href="/progresso"
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