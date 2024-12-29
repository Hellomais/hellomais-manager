import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useEvent } from '../../../contexts/EventContext';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' }
];

export default function SchedulesTab() {
  const { id: roomId } = useParams();
  const { selectedEvent } = useEvent();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  // Estado do formulário do modal
  const [formData, setFormData] = useState({
    startDateTime: '',
    endDateTime: '',
    translations: {
      'pt-BR': { title: '', description: '' },
      'en-US': { title: '', description: '' },
      'es-ES': { title: '', description: '' }
    }
  });

  // Estado para armazenar múltiplas traduções ao editar
  const [translationsData, setTranslationsData] = useState({});

  // Carregar programações
  useEffect(() => {
    fetchSchedules();
  }, [roomId, selectedEvent]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${roomId}/schedules`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) throw new Error('Falha ao carregar programações');

      const data = await response.json();
      // Converte o objeto schedules em um array plano
      const schedulesArray = Object.values(data.schedules || {}).flat();
      setSchedules(schedulesArray);
    } catch (error) {
      console.error('Erro ao carregar programações:', error);
      toast.error('Erro ao carregar programações');
      setSchedules([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://dev-api.hellomais.com.br/rooms/${roomId}/schedule/${scheduleId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          },
          body: JSON.stringify({ status: newStatus })
        }
      );

      if (!response.ok) throw new Error('Falha ao alterar status');

      toast.success('Status alterado com sucesso');
      fetchSchedules();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `https://dev-api.hellomais.com.br/rooms/${roomId}/schedules/${scheduleId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        }
      );

      if (!response.ok) throw new Error('Falha ao excluir programação');

      toast.success('Programação excluída com sucesso');
      fetchSchedules();
    } catch (error) {
      toast.error('Erro ao excluir programação');
    }
  };

  const handleSaveSchedule = async () => {
    try {
      const token = localStorage.getItem('token');
      const method = editingSchedule?.id ? 'PUT' : 'POST';
      const url = editingSchedule?.id
        ? `https://dev-api.hellomais.com.br/rooms/${roomId}/schedules/${editingSchedule.id}`
        : `https://dev-api.hellomais.com.br/rooms/${roomId}/schedules`;

      // Formata os dados conforme esperado pela API
      const formattedData = {
        startDateTime: formData.startDateTime || "",
        endDateTime: formData.endDateTime || "",
        translations: editingSchedule?.id 
          // Para edição: objeto com chaves de idioma
          ? {
              [selectedLanguage]: {
                title: formData.translations[selectedLanguage]?.title || "",
                description: formData.translations[selectedLanguage]?.description || ""
              }
            }
          // Para criação: array com objeto de tradução
          : [{
              language: selectedLanguage,
              title: formData.translations[selectedLanguage]?.title || "",
              description: formData.translations[selectedLanguage]?.description || ""
            }]
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: JSON.stringify(formattedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message?.join(', ') || 'Erro ao salvar programação');
      }

      toast.success(editingSchedule?.id ? 'Programação atualizada!' : 'Programação criada!');
      setIsModalOpen(false);
      fetchSchedules();
    } catch (error) {
      toast.error(editingSchedule?.id ? 'Erro ao atualizar' : 'Erro ao criar');
    }
  };

  const openModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      
      // Usa as traduções existentes ou cria objeto vazio para cada idioma
      const translations = LANGUAGES.reduce((acc, lang) => {
        acc[lang.code] = schedule.translations?.[lang.code] || { title: '', description: '' };
        return acc;
      }, {});

      setFormData({
        startDateTime: schedule.startDateTime || '',
        endDateTime: schedule.endDateTime || '',
        translations
      });

      // Define o idioma como pt-BR ou o primeiro idioma disponível
      const availableLanguage = schedule.translations?.['pt-BR'] ? 'pt-BR' : 
                               Object.keys(schedule.translations || {})[0] || 'pt-BR';
      setSelectedLanguage(availableLanguage);
    } else {
      setEditingSchedule(null);
      setFormData({
        startDateTime: '',
        endDateTime: '',
        translations: {
          'pt-BR': { title: '', description: '' },
          'en-US': { title: '', description: '' },
          'es-ES': { title: '', description: '' }
        }
      });
      setSelectedLanguage('pt-BR');
    }
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold">Programações</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <PlusCircle size={16} className="mr-2" />
          Nova Programação
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data/Hora Início
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Data/Hora Fim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {(Array.isArray(schedules) ? schedules : []).map((schedule) => {
              if (!schedule) return null; // Pula itens inválidos
              
              return (
                <tr key={schedule.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.translations?.['pt-BR']?.title || schedule.translations?.['es-ES']?.title || ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.startDateTime ? new Date(schedule.startDateTime).toLocaleString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {schedule.endDateTime ? new Date(schedule.endDateTime).toLocaleString() : ''}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={schedule.status || 'WAITING'}
                      onChange={(e) => handleStatusChange(schedule.id, e.target.value)}
                      className={`text-sm rounded-full px-2.5 py-1.5 font-medium border-0
                        ${schedule.status === 'ONLINE' 
                          ? 'bg-green-100 text-green-800'
                          : schedule.status === 'WAITING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'}`}
                    >
                      <option value="ONLINE">ONLINE</option>
                      <option value="WAITING">WAITING</option>
                      <option value="FINISHED">FINISHED</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => openModal(schedule)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(schedule.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingSchedule ? 'Editar' : 'Nova'} Programação
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            {/* Seletor de Idioma */}
            <div className="mb-4 flex space-x-2">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`
                    px-4 py-2 rounded-md transition-colors
                    ${selectedLanguage === lang.code 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                  `}
                >
                  {lang.name}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora Início
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.startDateTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      startDateTime: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data/Hora Fim
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.endDateTime}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      endDateTime: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título
                </label>
                <input
                  type="text"
                  value={formData.translations[selectedLanguage]?.title || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      [selectedLanguage]: {
                        ...prev.translations[selectedLanguage],
                        title: e.target.value
                      }
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
                </label>
                <textarea
                  value={formData.translations[selectedLanguage]?.description || ''}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    translations: {
                      ...prev.translations,
                      [selectedLanguage]: {
                        ...prev.translations[selectedLanguage],
                        description: e.target.value
                      }
                    }
                  }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveSchedule}
                className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                {editingSchedule ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}