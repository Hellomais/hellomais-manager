import React, { useState, useEffect } from 'react';
import EventSelector from '../components/EventSelector';
import RoomEditModal from '../components/rooms/RoomEditModal';
import ModerationPage from '../components/rooms/ModerationPage';
import { Event } from '../types';

interface Room {
  id: number;
  title: string;
  status: 'ONLINE' | 'WAITING' | 'FINISHED';
  streamUrl: string;
  streamUrl_Es: string;
  eventId: number;
}

function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [moderatingRoomId, setModeratingRoomId] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });

  const token = localStorage.getItem('token');

  const fetchRooms = async () => {
    if (!selectedEvent) return;

    try {
      const response = await fetch(`https://api.hellomais.com.br/rooms?eventId=${selectedEvent.id}`, {
        headers: {
          'accept': '*/*',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }

      const data = await response.json();
      setRooms(data);
      setLoading(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch rooms');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedEvent]);

  const handleStatusChange = async (roomId: number, newStatus: string) => {
    try {
      const response = await fetch(`https://api.hellomais.com.br/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update room status');
      }

      setRooms(rooms.map(room => 
        room.id === roomId ? { ...room, status: newStatus as Room['status'] } : room
      ));
    } catch (error) {
      console.error('Error updating room status:', error);
    }
  };

  const handleEditClick = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleModerationClick = (roomId: number) => {
    setModeratingRoomId(roomId);
    setIsModerationOpen(true);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <EventSelector
            selectedEvent={selectedEvent}
            onEventChange={(event) => {
              localStorage.setItem('selectedEvent', JSON.stringify(event));
              setSelectedEvent(event);
            }}
          />
        </div>
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <EventSelector
            selectedEvent={selectedEvent}
            onEventChange={(event) => {
              localStorage.setItem('selectedEvent', JSON.stringify(event));
              setSelectedEvent(event);
            }}
          />
        </div>
        <div className="text-center text-red-600">
          {error}
        </div>
      </div>
    );
  }

  // Filtra as salas pelo evento selecionado
  const filteredRooms = selectedEvent 
    ? rooms.filter(room => room.eventId === selectedEvent.id)
    : [];

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Salas</h1>
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Título
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
              {filteredRooms.map((room) => (
                <tr key={room.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {room.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={room.status}
                      onChange={(e) => handleStatusChange(room.id, e.target.value)}
                      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="WAITING">WAITING</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEditClick(room)}
                      className="inline-flex items-center px-3 py-2 border border-blue-600 text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      EDITAR
                    </button>
                    <button
                      onClick={() => handleModerationClick(room.id)}
                      className="inline-flex items-center px-3 py-2 border border-green-600 text-sm font-medium rounded-md text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      MODERAÇÃO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecione um evento para visualizar as salas
        </div>
      )}

      {selectedRoom && (
        <RoomEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedRoom(null);
          }}
          room={selectedRoom}
          onSave={async (updatedRoom) => {
            try {
              const response = await fetch(`https://api.hellomais.com.br/rooms/${updatedRoom.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                  'accept': '*/*'
                },
                body: JSON.stringify({
                  title: updatedRoom.title,
                  streamUrl: updatedRoom.streamUrl,
                  streamUrl_Es: updatedRoom.streamUrl_Es
                })
              });

              if (!response.ok) {
                throw new Error('Failed to update room');
              }

              await fetchRooms();
              setIsEditModalOpen(false);
              setSelectedRoom(null);
            } catch (error) {
              console.error('Error updating room:', error);
            }
          }}
        />
      )}

      {isModerationOpen && moderatingRoomId && (
        <ModerationPage
          roomId={moderatingRoomId}
          onClose={() => {
            setIsModerationOpen(false);
            setModeratingRoomId(null);
          }}
        />
      )}
    </div>
  );
}

export default RoomsPage;