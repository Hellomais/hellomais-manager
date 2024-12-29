import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { PinIcon, Send, Clock, EyeOff, Eye } from 'lucide-react';

export default function RoomAdministration() {
  const { id: roomId } = useParams();
  const [newMessage, setNewMessage] = useState('');
  const [hiddenMessages, setHiddenMessages] = useState(new Set());
  const [pinnedMessages, setPinnedMessages] = useState(new Set());

  // Dados mockados para exemplo
  const viewers = [
    { id: 1, name: 'João Silva', watchTime: '45:22', joinedAt: '10:15' },
    { id: 2, name: 'Maria Santos', watchTime: '1:12:33', joinedAt: '09:45' },
    { id: 3, name: 'Pedro Alves', watchTime: '22:15', joinedAt: '10:30' },
  ];

  const messages = [
    { id: 1, user: 'João Silva', message: 'Excelente apresentação!', time: '10:15' },
    { id: 2, user: 'Admin', message: 'Obrigado a todos pela participação!', time: '10:16', isManager: true },
    { id: 3, user: 'Maria Santos', message: 'Quando teremos a próxima live?', time: '10:17' },
  ];

  // Separar mensagens pinadas e não pinadas
  const pinnedMessagesList = messages.filter(msg => pinnedMessages.has(msg.id));
  const regularMessagesList = messages.filter(msg => !pinnedMessages.has(msg.id));

  const handleSendMessage = (e) => {
    e.preventDefault();
    // Lógica para enviar mensagem
    setNewMessage('');
  };

  const handlePinMessage = (messageId) => {
    setPinnedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  const handleToggleMessageVisibility = (messageId) => {
    setHiddenMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Componente de Mensagem para evitar duplicação de código
  const MessageComponent = ({ message, isPinned = false }) => (
    <div
      className={`p-3 rounded-lg ${
        isPinned ? 'bg-yellow-50 border border-yellow-200' :
        message.isManager ? 'bg-blue-50' : 'bg-gray-50'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`font-medium ${message.isManager ? 'text-blue-600' : 'text-gray-900'}`}>
          {message.user}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">{message.time}</span>
          {!message.isManager && (
            <>
              <button
                onClick={() => handleToggleMessageVisibility(message.id)}
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  hiddenMessages.has(message.id) ? 'text-red-500' : 'text-gray-400'
                }`}
                title={hiddenMessages.has(message.id) ? "Mensagem oculta" : "Ocultar mensagem"}
              >
                {hiddenMessages.has(message.id) ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => handlePinMessage(message.id)}
                className={`p-1 rounded hover:bg-gray-200 transition-colors ${
                  pinnedMessages.has(message.id) ? 'text-yellow-500' : 'text-gray-400'
                }`}
                title={pinnedMessages.has(message.id) ? "Mensagem fixada" : "Fixar mensagem"}
              >
                <PinIcon size={14} className={pinnedMessages.has(message.id) ? 'rotate-45' : ''} />
              </button>
            </>
          )}
        </div>
      </div>
      <p className="text-sm text-gray-700">{message.message}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
      {/* Módulo de Visualizadores */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-lg font-semibold">Visualizadores</h2>
            <button
              onClick={() => {/* Lógica para download do Excel */}}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center text-sm"
            >
              BAIXAR EXCEL
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usuário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Entrada
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Tempo Assistido
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {viewers.map((viewer) => (
                  <tr key={viewer.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{viewer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{viewer.joinedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock size={16} className="mr-2" />
                        {viewer.watchTime}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Módulo de Chat */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm h-full flex flex-col">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Chat</h2>
          </div>

          {/* Container de Mensagens */}
          <div className="flex-1 overflow-y-auto max-h-[600px]">
            {/* Seção de Mensagens Pinadas */}
            {pinnedMessagesList.length > 0 && (
              <div className="bg-yellow-50/50 p-4 border-b border-yellow-200">
                <div className="flex items-center gap-2 text-yellow-600 mb-2">
                  <PinIcon size={16} className="rotate-45" />
                  <span className="text-sm font-medium">Mensagens Fixadas</span>
                </div>
                <div className="space-y-2">
                  {pinnedMessagesList.map(message => (
                    <MessageComponent key={message.id} message={message} isPinned={true} />
                  ))}
                </div>
              </div>
            )}

            {/* Mensagens Regulares */}
            <div className="p-4 space-y-4">
              {regularMessagesList.map(message => (
                <MessageComponent key={message.id} message={message} />
              ))}
            </div>
          </div>

          {/* Input de mensagem */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}