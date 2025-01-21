import React from 'react';
import { Activity } from 'lucide-react';

interface AccessRateCardProps {
  rate: number;
  loading: boolean;
  error: string | null;
}

function AccessRateCard({ rate, loading, error }: AccessRateCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <Activity className="h-8 w-8 text-yellow-500" />
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">Taxa de Acesso</p>
          {loading ? (
            <div className="animate-pulse h-8 w-24 bg-gray-200 rounded"></div>
          ) : error ? (
            <p className="text-sm text-gray-500">Cálculo em desenvolvimento. Disponível em breve.</p>
          ) : (
            <p className="text-2xl font-semibold text-gray-900">
              {rate.toFixed(1)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AccessRateCard;