import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown, PlusCircle, Pencil, Trash2, Settings } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import DeleteRoomDialog from '../components/rooms/DeleteRoomDialog';
import toast from 'react-hot-toast';

function Rooms() {
  const navigate = useNavigate();
  const { selectedEvent } = useEvent();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, [selectedEvent]);

  const fetchRooms = async () => {
    if (!selectedEvent) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev-api.hellomais.com.br/rooms', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar salas');
      }

      const data = await response.json();
      setRooms(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
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

      if (!response.ok) {
        throw new Error('Falha ao alterar status da sala');
      }

      toast.success('Status alterado com sucesso!');
      fetchRooms();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleAdminRoom = (roomId) => {
    // Implementar redirecionamento para a página de administração da sala
    console.log('Administrar sala:', roomId);
  };

  const filteredAndSortedRooms = rooms
    .filter(room => 
      room.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!a[sortConfig.key] || !b[sortConfig.key]) return 0;
      
      const compareResult = a[sortConfig.key].toLowerCase().localeCompare(b[sortConfig.key].toLowerCase());
      return sortConfig.direction === 'asc' ? compareResult : -compareResult;
    });

  const SortIcon = ({ column }) => {
    if (sortConfig.key !== column) return <ChevronUp className="opacity-0 group-hover:opacity-50" size={16} />;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="opacity-100" size={16} /> : 
      <ChevronDown className="opacity-100" size={16} />;
  };

  if (!selectedEvent) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Selecione um evento para visualizar as salas.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-semibold text-gray-800">Salas</h1>
          <button
            onClick={() => navigate('/dashboard/rooms/new')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Nova Sala
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar salas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={20} />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('title')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Título</span>
                      <SortIcon column="title" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idioma
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAndSortedRooms.map((room) => (
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
                      <div className="text-sm text-gray-900">
                        {Object.keys(room.schedules?.[Object.keys(room.schedules)[0]]?.[0]?.translations || {}).join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => navigate(`/dashboard/rooms/${room.id}/edit`)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar sala"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRoom(room);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir sala"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => handleAdminRoom(room.id)}
                          className="text-purple-600 hover:text-purple-800 transition-colors"
                          title="Administrar sala"
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
      )}
      
      <DeleteRoomDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRoom(null);
        }}
        room={selectedRoom}
        onSuccess={fetchRooms}
      />
    </div>
  );
}

export default Rooms;