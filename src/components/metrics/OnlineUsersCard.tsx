import React from 'react';
import { Users } from 'lucide-react';

interface OnlineUsersCardProps {
  total: number;
  loading: boolean;
  error: string | null;
}

function OnlineUsersCard({ total, loading, error }: OnlineUsersCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <Users className="h-8 w-8 text-purple-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Assistindo ao vivo</p>
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

export default OnlineUsersCard;