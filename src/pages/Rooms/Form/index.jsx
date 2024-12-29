import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Building2, Calendar } from 'lucide-react';
import InfoTab from './InfoTab';
import SchedulesTab from './SchedulesTab';

// Componente de Tab
const TabButton = ({ label, icon: Icon, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center space-x-2 px-4 py-2 
      ${isActive 
        ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' 
        : 'text-gray-600 hover:bg-gray-100'}
    `}
  >
    {Icon && <Icon size={16} />}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

export default function RoomForm() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('info');

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <button 
          onClick={() => navigate('/dashboard/rooms')} 
          className="flex items-center hover:text-gray-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Voltar para Salas
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b flex space-x-2 mb-6">
        <TabButton
          label="Informações da Sala"
          icon={Building2}
          isActive={activeTab === 'info'}
          onClick={() => setActiveTab('info')}
        />
        <TabButton
          label="Programação"
          icon={Calendar}
          isActive={activeTab === 'schedules'}
          onClick={() => setActiveTab('schedules')}
        />
      </div>

      {/* Conteúdo */}
      {activeTab === 'info' && <InfoTab />}
      {activeTab === 'schedules' && <SchedulesTab />}
    </div>
  );
}