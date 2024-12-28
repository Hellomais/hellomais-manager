// src/contexts/EventContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const EventContext = createContext();

export function EventProvider({ children }) {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Carregar eventos do localStorage quando o componente montar
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
      const parsedEvents = JSON.parse(storedEvents);
      setEvents(parsedEvents);
      // Se não houver evento selecionado, selecionar o primeiro
      if (!selectedEvent && parsedEvents.length > 0) {
        setSelectedEvent(parsedEvents[0]);
      }
    }
  }, []);

  useEffect(() => {
    // Quando o usuário fizer login, o Login.jsx salva os eventos no localStorage
    // Este efeito observa mudanças no localStorage
    const handleStorageChange = () => {
      const storedEvents = localStorage.getItem('events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        setEvents(parsedEvents);
        if (!selectedEvent && parsedEvents.length > 0) {
          setSelectedEvent(parsedEvents[0]);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [selectedEvent]);

  return (
    <EventContext.Provider value={{ 
      selectedEvent, 
      setSelectedEvent, 
      events, 
      setEvents 
    }}>
      {children}
    </EventContext.Provider>
  );
}

export function useEvent() {
  return useContext(EventContext);
}