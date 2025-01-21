import React from 'react';
import { Users } from 'lucide-react';

interface TotalUsersCardProps {
  total: number;
  loading: boolean;
  error: string | null;
}

function TotalUsersCard({ total, loading, error }: TotalUsersCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <Users className="h-8 w-8 text-blue-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Total de Usuários</p>
          {loading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          ) : error ? (
            <p className="text-sm text-gray-500">Cálculo em desenvolvimento. Disponível em breve.</p>
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{total}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default TotalUsersCard;