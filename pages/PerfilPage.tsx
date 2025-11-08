import React, { useState, useEffect } from 'react';
import { userService } from '../services';
import type { UserProfile } from '../types';
import { Card, Button, Skeleton, Dialog } from '../components';

const ProfileInfoRow: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
        <span className="font-medium">{value}</span>
    </div>
);

const PerfilPage: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
  const [isGoalDialogOpen, setGoalDialogOpen] = useState(false);

  useEffect(() => {
    userService.getProfile().then(setUser);
  }, []);

  const renderSkeleton = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex flex-col items-center mb-6">
        <Skeleton className="h-24 w-24 rounded-full mb-4" />
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>
      <Card>
        <div className="space-y-4">
            {Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
        </div>
      </Card>
    </div>
  );

  if (!user) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        {renderSkeleton()}
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={user.avatarUrl} alt={user.name} className="h-24 w-24 rounded-full mb-4 ring-4 ring-offset-2 ring-offset-gray-100 dark:ring-offset-gray-900 ring-brand-500" />
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
        </div>
        
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                <Button variant="secondary" size="sm" onClick={() => setInfoDialogOpen(true)}>Editar</Button>
            </div>
            <ProfileInfoRow label="Idade" value={`${user.age} anos`} />
            <ProfileInfoRow label="Altura" value={`${user.height} cm`} />
            <ProfileInfoRow label="Peso Inicial" value={`${user.initialWeight} kg`} />
        </Card>
        
        <Card className="mt-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Seu Objetivo</h2>
                <Button variant="secondary" size="sm" onClick={() => setGoalDialogOpen(true)}>Editar</Button>
            </div>
            <ProfileInfoRow label="Meta de Peso" value={`${user.goalWeight} kg`} />
            <ProfileInfoRow label="Objetivo Principal" value={user.objective} />
        </Card>

        <Dialog
          isOpen={isInfoDialogOpen}
          onClose={() => setInfoDialogOpen(false)}
          title="Editar Informações Pessoais"
          footer={
            <>
              <Button variant="secondary" onClick={() => setInfoDialogOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setInfoDialogOpen(false)}>Salvar Alterações</Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label htmlFor="age" className="text-sm font-medium">Idade</label>
              <input id="age" type="number" defaultValue={user.age} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="height" className="text-sm font-medium">Altura (cm)</label>
              <input id="height" type="number" defaultValue={user.height} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="initialWeight" className="text-sm font-medium">Peso Inicial (kg)</label>
              <input id="initialWeight" type="number" step="0.1" defaultValue={user.initialWeight} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            </div>
          </form>
        </Dialog>

        <Dialog
          isOpen={isGoalDialogOpen}
          onClose={() => setGoalDialogOpen(false)}
          title="Editar Objetivo"
          footer={
            <>
              <Button variant="secondary" onClick={() => setGoalDialogOpen(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setGoalDialogOpen(false)}>Salvar Alterações</Button>
            </>
          }
        >
          <form className="space-y-4">
            <div>
              <label htmlFor="goalWeight" className="text-sm font-medium">Meta de Peso (kg)</label>
              <input id="goalWeight" type="number" step="0.1" defaultValue={user.goalWeight} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"/>
            </div>
            <div>
              <label htmlFor="objective" className="text-sm font-medium">Objetivo Principal</label>
              <select id="objective" defaultValue={user.objective} className="w-full mt-1 p-2 border rounded-md bg-gray-50 dark:bg-gray-700 appearance-none">
                <option>Perda de gordura e ganho de massa muscular</option>
                <option>Perder Gordura</option>
                <option>Ganhar Massa Muscular</option>
                <option>Manter o Peso</option>
              </select>
            </div>
          </form>
        </Dialog>
      </div>
    </div>
  );
};

export default PerfilPage;