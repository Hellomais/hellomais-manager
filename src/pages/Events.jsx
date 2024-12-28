import React, { useState, useEffect } from 'react';
import { useEvent } from '../contexts/EventContext';
import { Search, ChevronUp, ChevronDown, PlusCircle, Pencil, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import EventFormModal from '../components/events/EventFormModal';
import DeleteEventDialog from '../components/events/DeleteEventDialog';
import toast from 'react-hot-toast';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { selectedEvent: contextEvent } = useEvent();

  useEffect(() => {
    fetchEvents();
  }, [contextEvent]);

  const fetchEvents = async () => {
    if (!contextEvent) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev-api.hellomais.com.br/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': contextEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar eventos');
      }

      const data = await response.json();
      setEvents(data);
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

  const toggleEventStatus = async (event) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev-api.hellomais.com.br/events/${event.id}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': contextEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar status do evento');
      }

      toast.success(`Evento ${event.isActive ? 'desativado' : 'ativado'} com sucesso!`);
      fetchEvents();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const filteredAndSortedEvents = events
    .filter(event => 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  if (!contextEvent) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Selecione um evento para continuar.
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
          <h1 className="text-2xl font-semibold text-gray-800">Eventos</h1>
          <button
            onClick={() => {
              setSelectedEvent(null);
              setIsFormModalOpen(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusCircle size={20} className="mr-2" />
            Novo Evento
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar eventos..."
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
                  <th 
                    className="group cursor-pointer px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Descrição</span>
                      <SortIcon column="description" />
                    </div>
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
                {filteredAndSortedEvents.map((event) => (
                  <tr key={event.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {event.title}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {event.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleEventStatus(event)}
                        className={`inline-flex items-center px-2.5 py-1.5 rounded-full text-xs font-medium
                          ${event.isActive 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 hover:bg-red-200'}`}
                      >
                        {event.isActive ? (
                          <ToggleRight className="mr-1" size={16} />
                        ) : (
                          <ToggleLeft className="mr-1" size={16} />
                        )}
                        {event.isActive ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsFormModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Editar evento"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Excluir evento"
                        >
                          <Trash2 size={18} />
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
      
      {/* Modal de Criação/Edição */}
      <EventFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={fetchEvents}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <DeleteEventDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        onSuccess={fetchEvents}
      />
    </div>
  );
}