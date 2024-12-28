import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Building2, 
  Calendar, 
  Settings, 
  PlusCircle, 
  Edit2, 
  Trash2 
} from 'lucide-react';

// Constantes
const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' }
];

const STATUS_OPTIONS = [
  { value: 'ONLINE', label: 'Online' },
  { value: 'WAITING', label: 'Aguardando' },
  { value: 'FINISHED', label: 'Fechado' }
];

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
  const [activeTab, setActiveTab] = useState('room-info');
  const [roomData, setRoomData] = useState({
    status: 'WAITING',
    translations: LANGUAGES.reduce((acc, lang) => ({
      ...acc,
      [lang.code]: {
        title: '',
        streamUrl: ''
      }
    }), {})
  });
  const [schedules, setSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  const [scheduleLanguage, setScheduleLanguage] = useState('pt-BR');

  // Handlers para navegação e formulário
  const handleBack = () => navigate('/dashboard/rooms');

  const handleStatusChange = (e) => {
    setRoomData(prev => ({ ...prev, status: e.target.value }));
  };

  const handleTranslationChange = (lang, field, value) => {
    setRoomData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  // Handlers para programações
  const handleAddSchedule = () => {
    setEditingSchedule({
      startDateTime: '',
      endDateTime: '',
      translations: LANGUAGES.reduce((acc, lang) => ({
        ...acc,
        [lang.code]: {
          title: '',
          description: ''
        }
      }), {})
    });
    setScheduleLanguage('pt-BR');
  };

  const handleSaveSchedule = () => {
    if (editingSchedule) {
      if (editingSchedule.id) {
        // Atualizar programação existente
        setSchedules(prev => 
          prev.map(schedule => 
            schedule.id === editingSchedule.id ? editingSchedule : schedule
          )
        );
      } else {
        // Adicionar nova programação
        setSchedules(prev => [...prev, { 
          ...editingSchedule, 
          id: Date.now() // Temporário
        }]);
      }
      setEditingSchedule(null);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setScheduleLanguage('pt-BR');
  };

  const handleDeleteSchedule = (scheduleId) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  const handleScheduleTranslationChange = (lang, field, value) => {
    setEditingSchedule(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [lang]: {
          ...prev.translations[lang],
          [field]: value
        }
      }
    }));
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <button 
          onClick={handleBack} 
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
          isActive={activeTab === 'room-info'}
          onClick={() => setActiveTab('room-info')}
        />
        <TabButton
          label="Programações"
          icon={Calendar}
          isActive={activeTab === 'schedules'}
          onClick={() => setActiveTab('schedules')}
        />
        <TabButton
          label="Configurações"
          icon={Settings}
          isActive={activeTab === 'settings'}
          onClick={() => setActiveTab('settings')}
        />
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'room-info' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Detalhes da Sala</h2>
          
          {/* Seletor de Idioma */}
          <div className="mb-4 flex space-x-2">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={`
                  px-4 py-2 rounded-md
                  ${selectedLanguage === lang.code 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-700'}
                `}
              >
                {lang.name}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título ({LANGUAGES.find(l => l.code === selectedLanguage).name})
              </label>
              <input
                type="text"
                value={roomData.translations[selectedLanguage].title}
                onChange={(e) => handleTranslationChange(selectedLanguage, 'title', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`Título em ${LANGUAGES.find(l => l.code === selectedLanguage).name}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL do Stream ({LANGUAGES.find(l => l.code === selectedLanguage).name})
              </label>
              <input
                type="text"
                value={roomData.translations[selectedLanguage].streamUrl}
                onChange={(e) => handleTranslationChange(selectedLanguage, 'streamUrl', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`URL do stream em ${LANGUAGES.find(l => l.code === selectedLanguage).name}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status Global da Sala
              </label>
              <select
                value={roomData.status}
                onChange={handleStatusChange}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {activeTab === 'schedules' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Programações</h2>
            <button
              onClick={handleAddSchedule}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle size={16} />
              <span>Nova Programação</span>
            </button>
          </div>

          {/* Tabela de Programações */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 text-left">Título (PT-BR)</th>
                <th className="p-3 text-left">Data Início</th>
                <th className="p-3 text-left">Data Fim</th>
                <th className="p-3 text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    {schedule.translations?.['pt-BR']?.title || 'Sem título'}
                  </td>
                  <td className="p-3">{schedule.startDateTime}</td>
                  <td className="p-3">{schedule.endDateTime}</td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button 
                        onClick={() => handleEditSchedule(schedule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteSchedule(schedule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Modal/Formulário de Edição de Programação */}
          {editingSchedule !== null && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-semibold mb-4">
                  {editingSchedule.id ? 'Editar' : 'Nova'} Programação
                </h3>

                {/* Seletor de Idioma para Programação */}
                <div className="mb-4 flex space-x-2">
                  {LANGUAGES.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setScheduleLanguage(lang.code)}
                      className={`
                        px-4 py-2 rounded-md
                        ${scheduleLanguage === lang.code 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700'}
                      `}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título ({LANGUAGES.find(l => l.code === scheduleLanguage).name})
                    </label>
                    <input
                      type="text"
                      value={editingSchedule.translations[scheduleLanguage].title}
                      onChange={(e) => handleScheduleTranslationChange(
                        scheduleLanguage, 
                        'title', 
                        e.target.value
                      )}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data/Hora Início
                      </label>
                      <input
                        type="datetime-local"
                        value={editingSchedule.startDateTime || ''}
                        onChange={(e) => setEditingSchedule(prev => ({
                          ...prev,
                          startDateTime: e.target.value
                        }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Data/Hora Fim
                      </label>
                      <input
                        type="datetime-local"
                        value={editingSchedule.endDateTime || ''}
                        onChange={(e) => setEditingSchedule(prev => ({
                          ...prev,
                          endDateTime: e.target.value
                        }))}
                        className="block w-full rounded-md border border-gray-300 px-3 py-2"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descrição ({LANGUAGES.find(l => l.code === scheduleLanguage).name})
                    </label>
                    <textarea
                      value={editingSchedule.translations[scheduleLanguage].description}
                      onChange={(e) => handleScheduleTranslationChange(
                        scheduleLanguage, 
                        'description', 
                        e.target.value
                      )}
                      rows={3}
                      className="block w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setEditingSchedule(null)}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveSchedule}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Configurações */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-6">Configurações Avançadas</h2>
          <p>Configurações avançadas serão implementadas aqui.</p>
        </div>
      )}
    </div>
  );
}