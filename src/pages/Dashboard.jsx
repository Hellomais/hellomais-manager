import React, { useState, useEffect } from 'react';
import { useNavigate, Link, Outlet } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  ImagePlus, 
  Instagram, 
  MessageSquare,
  Menu,
  LogOut,
  X
} from 'lucide-react';
import { useEvent } from '../contexts/EventContext';

function Dashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const { selectedEvent, setSelectedEvent, events, setEvents } = useEvent();

  useEffect(() => {
    // Carregar eventos do localStorage
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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('events');
    navigate('/');
  };

  const handleEventChange = (e) => {
    const eventId = e.target.value;
    const event = events.find(evt => evt.id.toString() === eventId);
    setSelectedEvent(event);
  };

  const menuItems = [
    { icon: Users, label: 'Usuários', path: '/dashboard/users' },
    { icon: Calendar, label: 'Salas', path: '/dashboard/rooms' },
    { icon: ImagePlus, label: 'Banners', path: '/dashboard/banners' },
    { icon: Instagram, label: 'Instagram', path: '/dashboard/instagram' },
    { icon: MessageSquare, label: 'Mural', path: '/dashboard/mural' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* TopBar */}
      <div className="bg-white shadow-md fixed top-0 left-0 right-0 h-16 z-30">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-semibold ml-4">Dashboard</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Select de Eventos */}
            <select
              value={selectedEvent?.id || ''}
              onChange={handleEventChange}
              className="block w-64 px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="" disabled>
                Selecione um evento
              </option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                </option>
              ))}
            </select>

            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut size={20} className="mr-2" />
              Sair
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 bottom-0 bg-white w-64 shadow-lg transition-transform duration-300 z-20 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="py-4">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`pt-16 ${
          isSidebarOpen ? 'ml-64' : 'ml-0'
        } transition-margin duration-300`}
      >
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;