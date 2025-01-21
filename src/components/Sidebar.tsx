import React from 'react';
import { LayoutDashboard, Users, MonitorPlay, Calendar, MessageSquare, Image, LogOut, Instagram } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.email === 'gabriel@manager.com' || user.email === 'caiorib.jesus@gmail.com';

  return (
    <div className="flex flex-col h-full bg-white border-r">
      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">Hello Mais</h2>
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <LayoutDashboard className="mr-3 h-5 w-5" />
          Dashboard
        </NavLink>

        {isAdmin && (
          <>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Users className="mr-3 h-5 w-5" />
              Usuários
            </NavLink>

            <NavLink
              to="/rooms"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <MonitorPlay className="mr-3 h-5 w-5" />
              Salas
            </NavLink>

            <NavLink
              to="/schedule"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Calendar className="mr-3 h-5 w-5" />
              Programação
            </NavLink>

            <NavLink
              to="/message-wall"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <MessageSquare className="mr-3 h-5 w-5" />
              Mural
            </NavLink>

            <NavLink
              to="/banners"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Image className="mr-3 h-5 w-5" />
              Banners
            </NavLink>

            <NavLink
              to="/instagram"
              className={({ isActive }) =>
                `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Instagram className="mr-3 h-5 w-5" />
              Instagram
            </NavLink>
          </>
        )}
      </nav>

      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Sair
        </button>
      </div>
    </div>
  );
}