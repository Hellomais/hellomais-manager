import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import ScheduleHeader from '../components/schedule/ScheduleHeader';
import DateTabs from '../components/schedule/DateTabs';
import ScheduleCard from '../components/schedule/ScheduleCard';
import ScheduleEditModal from '../components/schedule/ScheduleEditModal';
import { Event } from '../types';
import toast from 'react-hot-toast';

interface Schedule {
  id: number;
  startDateTime: string;
  endDateTime: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  translations: {
    'pt-BR': {
      id: number;
      title: string;
      description: string;
    };
    'es-ES': {
      id: number;
      title: string;
      description: string;
    };
  };
  speakers: Array<{
    id: number;
    name: string;
    position: string;
  }>;
}

interface Room {
  id: number;
  title: string;
  eventId: number;
  status: string;
  schedules: {
    [key: string]: Schedule[];
  };
}

function SchedulePage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const token = localStorage.getItem('token');

  const fetchRoomSchedule = async (roomId: number) => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/rooms/${roomId}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar programação');
      }

      const roomData = await response.json();
      setSelectedRoom(roomData);
      
      if (roomData.schedules && Object.keys(roomData.schedules).length > 0) {
        setSelectedDate(Object.keys(roomData.schedules)[0]);
      }
      
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar programação');
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchRooms = async () => {
      if (!selectedEvent || !token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`https://api.hellomais.com.br/rooms?eventId=${selectedEvent.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao buscar salas');
        }

        const roomsData = await response.json();
        
        if (roomsData.length === 0) {
          setError('Nenhuma sala encontrada para este evento');
          setLoading(false);
          return;
        }

        setRooms(roomsData);
        await fetchRoomSchedule(roomsData[0].id);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erro ao carregar dados');
        setLoading(false);
      }
    };

    fetchRooms();
  }, [selectedEvent, token]);

  const handleSaveSchedule = async (scheduleId: number, data: {
    startDateTime: string;
    endDateTime: string;
    translations: Array<{
      language: string;
      title: string;
      description: string;
    }>;
    speakers: Array<{
      name: string;
      position: string;
    }>;
  }) => {
    if (!selectedRoom) return;

    try {
      // Ensure we have both PT-BR and ES-ES translations
      const hasRequiredTranslations = data.translations.some(t => t.language === 'pt-BR') && 
                                    data.translations.some(t => t.language === 'es-ES');
      
      if (!hasRequiredTranslations) {
        throw new Error('É necessário fornecer traduções em Português e Espanhol');
      }

      if (isCreating) {
        // Create new schedule
        const response = await fetch(`https://api.hellomais.com.br/rooms/${selectedRoom.id}/schedules`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            translations: data.translations,
            speakers: data.speakers
          })
        });

        if (!response.ok) {
          throw new Error('Falha ao criar programação');
        }

        toast.success('Programação criada com sucesso!');
      } else {
        // Update existing schedule
        const response = await fetch(`https://api.hellomais.com.br/rooms/${selectedRoom.id}/schedules/${scheduleId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'accept': '*/*'
          },
          body: JSON.stringify({
            startDateTime: data.startDateTime,
            endDateTime: data.endDateTime,
            translations: data.translations,
            speakers: data.speakers
          })
        });

        if (!response.ok) {
          throw new Error('Falha ao atualizar programação');
        }

        toast.success('Programação atualizada com sucesso!');
      }

      await fetchRoomSchedule(selectedRoom.id);
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao salvar programação');
      throw error;
    }
  };

  const handleCreateSchedule = () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

    setIsCreating(true);
    setEditingSchedule({
      id: 0, // temporary ID for new schedule
      startDateTime: now.toISOString().slice(0, 16),
      endDateTime: oneHourLater.toISOString().slice(0, 16),
      date: now.toISOString().split('T')[0],
      startTime: now.toTimeString().slice(0, 5),
      endTime: oneHourLater.toTimeString().slice(0, 5),
      status: 'WAITING',
      translations: {
        'pt-BR': {
          id: 0,
          title: '',
          description: ''
        },
        'es-ES': {
          id: 0,
          title: '',
          description: ''
        }
      },
      speakers: []
    });
  };

  return (
    <div className="p-8">
      <ScheduleHeader
        selectedEvent={selectedEvent}
        selectedRoom={selectedRoom}
        rooms={rooms}
        onEventChange={setSelectedEvent}
        onRoomChange={fetchRoomSchedule}
      />

      {selectedRoom && selectedRoom.schedules && (
        <>
          <div className="flex items-center justify-between mb-6">
            <DateTabs
              dates={Object.keys(selectedRoom.schedules)}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
            <button
              onClick={handleCreateSchedule}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nova Programação
            </button>
          </div>

          <div className="space-y-4">
            {selectedDate && selectedRoom.schedules[selectedDate]?.map((schedule) => (
              <ScheduleCard
                key={schedule.id}
                schedule={schedule}
                onEdit={(schedule) => {
                  setIsCreating(false);
                  setEditingSchedule(schedule);
                }}
              />
            ))}
          </div>
        </>
      )}

      {!selectedRoom && (
        <div className="text-center text-gray-500 mt-8">
          Selecione uma sala para visualizar a programação
        </div>
      )}

      {editingSchedule && (
        <ScheduleEditModal
          isOpen={true}
          onClose={() => {
            setEditingSchedule(null);
            setIsCreating(false);
          }}
          schedule={editingSchedule}
          onSave={handleSaveSchedule}
        />
      )}
    </div>
  );
}

export default SchedulePage;