import React from 'react';
import { Event } from '../types';

interface EventSelectorProps {
  selectedEvent: Event | null;
  onEventChange: (event: Event) => void;
}

function EventSelector({ selectedEvent, onEventChange }: EventSelectorProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const events = user.events || [];

  return (
    <select
      value={selectedEvent?.id || ''}
      onChange={(e) => {
        const event = events.find(evt => evt.id === Number(e.target.value));
        if (event) onEventChange(event);
      }}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    >
      <option value="">Selecione um evento</option>
      {events.map((event: Event) => (
        <option key={event.id} value={event.id}>
          {event.title}
        </option>
      ))}
    </select>
  );
}

export default EventSelector;