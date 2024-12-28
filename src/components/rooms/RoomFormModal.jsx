import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { PlusCircle, Trash2 } from 'lucide-react';
import { useEvent } from '../../contexts/EventContext';
import toast from 'react-hot-toast';

export default function RoomFormModal({ isOpen, onClose, room = null, onSuccess }) {
  const { selectedEvent } = useEvent();
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    const fetchRoomDetails = async () => {
      if (!room) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${room.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados da sala');
        }

        const roomData = await response.json();
        
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
  }, [room, selectedEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, i) => 
        i === index 
          ? { ...schedule, [field]: value }
          : schedule
      )
    }));
  };

  const handleTranslationChange = (scheduleIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.map((schedule, i) => 
        i === scheduleIndex 
          ? {
              ...schedule,
              translations: [
                {
                  ...schedule.translations[0],
                  [field]: value
                }
              ]
            }
          : schedule
      )
    }));
  };

  const addSchedule = () => {
    setFormData(prev => ({
      ...prev,
      schedules: [
        ...prev.schedules,
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
    }));
  };

  const removeSchedule = (index) => {
    setFormData(prev => ({
      ...prev,
      schedules: prev.schedules.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const loadingToast = toast.loading(room ? 'Atualizando sala...' : 'Criando sala...');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(room 
        ? `https://dev-api.hellomais.com.br/rooms/${room.id}`
        : 'https://dev-api.hellomais.com.br/rooms', {
        method: room ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(room ? 'Erro ao atualizar sala' : 'Erro ao criar sala');
      }

      toast.success(
        room ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!', 
        { id: loadingToast }
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error(
        error.message || 'Ocorreu um erro inesperado', 
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
          <DialogDescription>
            {room 
              ? 'Faça as alterações necessárias nos dados da sala.' 
              : 'Preencha os dados para criar uma nova sala.'}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Título da Sala
              </label>
              <input
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                URL do Stream
              </label>
              <input
                name="streamUrl"
                type="text"
                required
                value={formData.streamUrl}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                  Agendamentos
                </label>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="flex items-center px-2 py-1 text-sm text-blue-600 hover:text-blue-700"
                >
                  <PlusCircle size={16} className="mr-1" />
                  Adicionar
                </button>
              </div>

              {formData.schedules.map((schedule, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Agendamento {index + 1}</span>
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeSchedule(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Data/Hora Início
                      </label>
                      <input
                        type="datetime-local"
                        value={schedule.startDateTime}
                        onChange={(e) => handleScheduleChange(index, 'startDateTime', e.target.value)}
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
                        onChange={(e) => handleScheduleChange(index, 'endDateTime', e.target.value)}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título do Agendamento
                    </label>
                    <input
                      type="text"
                      value={schedule.translations[0].title}
                      onChange={(e) => handleTranslationChange(index, 'title', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição do Agendamento
                    </label>
                    <textarea
                      value={schedule.translations[0].description}
                      onChange={(e) => handleTranslationChange(index, 'description', e.target.value)}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processando...
                  </>
                ) : room ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}