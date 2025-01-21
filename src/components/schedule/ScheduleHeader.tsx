import React from 'react';
import EventSelector from '../EventSelector';
import { Event } from '../../types';

interface Room {
  id: number;
  title: string;
  eventId: number;
}

interface ScheduleHeaderProps {
  selectedEvent: Event | null;
  selectedRoom: Room | null;
  rooms: Room[];
  onEventChange: (event: Event) => void;
  onRoomChange: (roomId: number) => void;
}

function ScheduleHeader({ selectedEvent, selectedRoom, rooms, onEventChange, onRoomChange }: ScheduleHeaderProps) {
  // Filtra as salas pelo evento selecionado
  const filteredRooms = selectedEvent 
    ? rooms.filter(room => room.eventId === selectedEvent.id)
    : [];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Programação</h1>
        <div className="flex items-center space-x-4">
          <div className="w-64">
            <EventSelector
              selectedEvent={selectedEvent}
              onEventChange={(event) => {
                localStorage.setItem('selectedEvent', JSON.stringify(event));
                onEventChange(event);
              }}
            />
          </div>
          {selectedEvent && (
            <select
              value={selectedRoom?.id || ''}
              onChange={(e) => {
                const roomId = Number(e.target.value);
                if (roomId) {
                  onRoomChange(roomId);
                }
              }}
              className="block w-64 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="">Selecione uma sala</option>
              {filteredRooms.map((room) => (
                <option key={room.id} value={room.id}>
                  {room.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScheduleHeader;