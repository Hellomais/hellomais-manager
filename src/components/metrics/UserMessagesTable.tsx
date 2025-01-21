import React from 'react';
import { MessageSquare } from 'lucide-react';

interface UserMessagesTableProps {
  data: Array<{
    name: string;
    total: number;
  }>;
  loading: boolean;
  error: string | null;
}

function UserMessagesTable({ data, loading, error }: UserMessagesTableProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        <MessageSquare className="h-5 w-5 inline-block mr-2 text-gray-500" />
        Mensagens por Usuário
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Usuário
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total de Mensagens
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              [...Array(3)].map((_, i) => (
                <tr key={i}>
                  <td colSpan={2} className="px-6 py-4">
                    <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  Cálculo em desenvolvimento. Disponível em breve.
                </td>
              </tr>
            ) : data.length > 0 ? (
              data.map((item, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.total}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                  Nenhuma mensagem registrada
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserMessagesTable;