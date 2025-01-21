import React from 'react';
import { Users, ExternalLink } from 'lucide-react';

interface UsersWithAccessCardProps {
  total: number;
  loading: boolean;
  error: string | null;
  onShowDetails: () => void;
}

function UsersWithAccessCard({ total, loading, error, onShowDetails }: UsersWithAccessCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Users className="h-8 w-8 text-green-500" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Usuários que Acessaram</p>
            {loading ? (
              <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
            ) : error ? (
              <p className="text-sm text-gray-500">Cálculo em desenvolvimento. Disponível em breve.</p>
            ) : (
              <p className="text-2xl font-semibold text-gray-900">{total}</p>
            )}
          </div>
        </div>
        <button
          onClick={onShowDetails}
          className="text-blue-600 hover:text-blue-700 focus:outline-none"
          title="Ver detalhes"
        >
          <ExternalLink className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

export default UsersWithAccessCard;