import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronRight, PlusCircle, Trash2 } from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import toast from 'react-hot-toast';

// Status options
const STATUS_OPTIONS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'WAITING', label: 'Aguardando' },
  { value: 'CLOSED', label: 'Fechado' }
];

// Language options
const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' }
];

export default function RoomForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedEvent } = useEvent();
  const [loading, setLoading] = useState(false);
  const [expandedProgramming, setExpandedProgramming] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    streamUrl: '',
    schedules: [
      {
        startDateTime: '',
        endDateTime: '',
        translations: [
          {
            language: 'pt-BR',
            title: '',
            description: ''
          }
        ]
      }
    ]
  });

  // Update schedule status for an existing room
  const updateScheduleStatus = async (roomId, scheduleId, status) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://dev-api.hellomais.com.br/rooms/${roomId}/schedule/${scheduleId}/status`, 
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          },
          body: JSON.stringify({ status })
        }
      );

      if (!response.ok) {
        throw new Error('Erro ao atualizar status da programação');
      }

      toast.success('Status da programação atualizado com sucesso!');
    } catch (error) {
      toast.error(error.message || 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  // Fetch room details for editing
  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados da sala');
        }

        const roomData = await response.json();
        
        // Format schedules
        const formattedSchedules = Object.values(roomData.schedules || {}).flat().map(schedule => ({
          startDateTime: new Date(schedule.startDateTime).toISOString().slice(0, 16),
          endDateTime: new Date(schedule.endDateTime).toISOString().slice(0, 16),
          translations: [
            {
              language: Object.keys(schedule.translations)[0] || 'pt-BR',
              title: schedule.translations['pt-BR']?.title || '',
              description: schedule.translations['pt-BR']?.description || ''
            }
          ]
        }));

        setFormData({
          title: roomData.title || '',
          streamUrl: roomData.streamUrl || '',
          schedules: formattedSchedules.length > 0 ? formattedSchedules : [{
            startDateTime: '',
            endDateTime: '',
            translations: [
              {
                language: 'pt-BR',
                title: '',
                description: ''
              }
            ]
          }]
        });
      } catch (error) {
        toast.error('Erro ao carregar dados da sala');
      } finally {
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id, selectedEvent]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading(id ? 'Atualizando sala...' : 'Criando sala...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        id 
          ? `https://dev-api.hellomais.com.br/rooms/${id}`
          : 'https://dev-api.hellomais.com.br/rooms', 
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) {
        throw new Error(id ? 'Erro ao atualizar sala' : 'Erro ao criar sala');
      }

      toast.success(id ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!');
      navigate('/dashboard/rooms');
    } catch (error) {
      toast.error(error.message || 'Ocorreu um erro inesperado');
    } finally {
      setLoading(false);
      toast.dismiss(loadingToast);
    }
  };

  // Navigate back to rooms list
  const handleBack = () => {
    navigate('/dashboard/rooms');
  };

  return (
    <div className="p-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <button 
          onClick={handleBack} 
          className="flex items-center hover:text-gray-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Voltar para Salas
        </button>
        <ChevronRight size={16} />
        <span className="text-gray-900">{id ? 'Editar' : 'Nova'} Sala</span>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        {/* Room Information Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações da Sala</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL do Stream
              </label>
              <input
                type="text"
                value={formData.streamUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                required
              />
            </div>
          </div>
        </div>

        {/* Schedule Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <button
              type="button"
              onClick={() => setExpandedProgramming(!expandedProgramming)}
              className="flex items-center text-lg font-semibold"
            >
              <ChevronDown
                size={20}
                className={`mr-2 transform transition-transform ${
                  expandedProgramming ? 'rotate-0' : '-rotate-90'
                }`}
              />
              Programação
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  schedules: [
                    ...prev.schedules,
                    {
                      startDateTime: '',
                      endDateTime: '',
                      translations: [{ 
                        language: 'pt-BR', 
                        title: '', 
                        description: '' 
                      }]
                    }
                  ]
                }));
              }}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700"
            >
              <PlusCircle size={16} className="mr-1" />
              Adicionar Programação
            </button>
          </div>

          {expandedProgramming && (
            <div className="space-y-6">
              {formData.schedules.map((schedule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">Programação {index + 1}</h3>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            schedules: prev.schedules.filter((_, i) => i !== index)
                          }));
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data/Hora Início
                      </label>
                      <input
                        type="datetime-local"
                        value={schedule.startDateTime}
                        onChange={(e) => {
                          const newSchedules = [...formData.schedules];
                          newSchedules[index] = {
                            ...newSchedules[index],
                            startDateTime: e.target.value
                          };
                          setFormData(prev => ({ ...prev, schedules: newSchedules }));
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data/Hora Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={schedule.endDateTime}
                        onChange={(e) => {
                          const newSchedules = [...formData.schedules];
                          newSchedules[index] = {
                            ...newSchedules[index],
                            endDateTime: e.target.value
                          };
                          setFormData(prev => ({ ...prev, schedules: newSchedules }));
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Status selector for existing rooms */}
                  {id && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <div className="flex items-center space-x-2">
                          <select
                            onChange={(e) => {
                              updateScheduleStatus(id, `${index}`, e.target.value);
                            }}
                            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                            required
                          >
                            {STATUS_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Language selector */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Idioma
                      </label>
                      <select
                        value={schedule.translations[0].language}
                        onChange={(e) => {
                          const newSchedules = [...formData.schedules];
                          newSchedules[index] = {
                            ...newSchedules[index],
                            translations: [
                              {
                                ...newSchedules[index].translations[0],
                                language: e.target.value
                              }
                            ]
                          };
                          setFormData(prev => ({ ...prev, schedules: newSchedules }));
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      >
                        {LANGUAGES.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Title and Description */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Título
                      </label>
                      <input
                        type="text"
                        value={schedule.translations[0].title}
                        onChange={(e) => {
                          const newSchedules = [...formData.schedules];
                          newSchedules[index] = {
                            ...newSchedules[index],
                            translations: [
                              {
                                ...newSchedules[index].translations[0],
                                title: e.target.value
                              }
                            ]
                          };
                          setFormData(prev => ({ ...prev, schedules: newSchedules }));
                        }}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Descrição
                      </label>
                      <textarea
                        value={schedule.translations[0].description}
                        onChange={(e) => {
                          const newSchedules = [...formData.schedules];
                          newSchedules[index] = {
                            ...newSchedules[index],
                            translations: [
                              {
                                ...newSchedules[index].translations[0],
                                description: e.target.value
                              }
                            ]
                          };
                          setFormData(prev => ({ ...prev, schedules: newSchedules }));
                        }}
                        rows={3}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Processando...' : id ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </div>
  );
}