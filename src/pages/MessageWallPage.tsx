import React, { useState, useEffect } from 'react';
import { Check, X, Loader2 } from 'lucide-react';
import EventSelector from '../components/EventSelector';
import { Event } from '../types';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  businessUnit: string;
  photo: string | null;
  hasLoggedIn: boolean;
  highlight: boolean;
}

interface Message {
  id: number;
  content: string;
  approved: boolean;
  rejected: boolean;
  rejectedAt: string | null;
  createdAt: string;
  user: User;
}

function MessageWallPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });

  const token = localStorage.getItem('token');

  const fetchMessages = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.hellomais.com.br/message-wall', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString(),
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar mensagens');
      }

      const data = await response.json();
      setMessages(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar mensagens');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [selectedEvent]);

  const handleAction = async (messageId: number, action: 'approve' | 'reject') => {
    if (processingIds.has(messageId)) return;

    setProcessingIds(prev => new Set(prev).add(messageId));

    try {
      const response = await fetch(
        `https://api.hellomais.com.br/message-wall/${action}/${messageId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Falha ao ${action === 'approve' ? 'aprovar' : 'rejeitar'} mensagem`);
      }

      await fetchMessages();
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Ocorreu um erro ao processar a ação');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(messageId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Mural de Mensagens</h1>
          <div className="w-64">
            <EventSelector
              selectedEvent={selectedEvent}
              onEventChange={(event) => {
                localStorage.setItem('selectedEvent', JSON.stringify(event));
                setSelectedEvent(event);
              }}
            />
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mensagem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Carregando...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : messages.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                      Nenhuma mensagem encontrada
                    </td>
                  </tr>
                ) : (
                  messages.map((message) => (
                    <tr key={message.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.user.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {message.content}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {message.approved ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Aprovado
                          </span>
                        ) : message.rejected ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Rejeitado
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleAction(message.id, 'approve')}
                            disabled={processingIds.has(message.id)}
                            className={`inline-flex items-center p-1 rounded-full ${
                              processingIds.has(message.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : message.approved
                                ? 'bg-green-100 text-green-600 opacity-50'
                                : 'bg-green-100 text-green-600 hover:bg-green-200'
                            }`}
                            title={message.approved ? 'Já aprovado' : 'Aprovar'}
                          >
                            {processingIds.has(message.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(message.id, 'reject')}
                            disabled={processingIds.has(message.id)}
                            className={`inline-flex items-center p-1 rounded-full ${
                              processingIds.has(message.id)
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : message.rejected
                                ? 'bg-red-100 text-red-600 opacity-50'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            title={message.rejected ? 'Já rejeitado' : 'Rejeitar'}
                          >
                            {processingIds.has(message.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecione um evento para visualizar as mensagens
        </div>
      )}
    </div>
  );
}

export default MessageWallPage;