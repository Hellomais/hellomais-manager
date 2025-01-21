import React from 'react';
import { BarChart3 } from 'lucide-react';

interface ReactionTimelineProps {
  data: Array<{
    date: string;
    total: number;
  }>;
  loading: boolean;
  error: string | null;
}

function ReactionTimeline({ data, loading, error }: ReactionTimelineProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        <BarChart3 className="h-5 w-5 inline-block mr-2 text-gray-500" />
        Total de Reações por Data
      </h2>
      <div className="h-64 overflow-hidden">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded"></div>
            ))}
          </div>
        ) : error ? (
          <p className="text-gray-500 text-center">Cálculo em desenvolvimento. Disponível em breve.</p>
        ) : data.length > 0 ? (
          <div className="space-y-4">
            {data.map((item, index) => (
              <div key={index} className="flex items-center">
                <span className="w-32 text-sm text-gray-600">
                  {new Date(item.date).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex-1 h-6 bg-blue-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 rounded-full"
                    style={{ 
                      width: `${(item.total / Math.max(...data.map(d => d.total))) * 100}%` 
                    }}
                  />
                </div>
                <span className="w-16 text-sm text-gray-600 text-right">{item.total}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center">Nenhuma reação registrada</p>
        )}
      </div>
    </div>
  );
}

export default ReactionTimeline;