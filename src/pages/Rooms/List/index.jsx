import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEvent } from '../../../contexts/EventContext';
import { PlusCircle, Edit, Trash2, Settings } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RoomsList() {
  const navigate = useNavigate();
  const { selectedEvent } = useEvent();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
  }, [selectedEvent]);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev-api.hellomais.com.br/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) throw new Error('Falha ao carregar salas');

      const data = await response.json();
      setRooms(data);
    } catch (error) {
      toast.error('Erro ao carregar salas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (roomId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) throw new Error('Falha ao alterar status');

      toast.success('Status alterado com sucesso');
      fetchRooms(); // Recarrega a lista
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) throw new Error('Falha ao excluir sala');

      toast.success('Sala excluída com sucesso');
      fetchRooms(); // Recarrega a lista
    } catch (error) {
      toast.error('Erro ao excluir sala');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Salas</h1>
        <button
          onClick={() => navigate('/dashboard/rooms/new')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={20} className="mr-2" />
          Nova Sala
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rooms.map((room) => (
              <tr key={room.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {room.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={room.status}
                    onChange={(e) => handleStatusChange(room.id, e.target.value)}
                    className={`text-sm rounded-full px-2.5 py-1.5 font-medium border-0
                      ${room.status === 'ONLINE' 
                        ? 'bg-green-100 text-green-800'
                        : room.status === 'WAITING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'}`}
                  >
                    <option value="ONLINE">ONLINE</option>
                    <option value="WAITING">WAITING</option>
                    <option value="FINISHED">FINISHED</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => navigate(`/dashboard/rooms/${room.id}/edit`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(room.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/rooms/${room.id}/administration`)}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <Settings size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}