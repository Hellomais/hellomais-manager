import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../../../contexts/EventContext';
import toast from 'react-hot-toast';

// Constantes
const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' }
];

export default function InfoTab() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedEvent } = useEvent();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  const [formData, setFormData] = useState({
    title: '',
    streamUrl: '',
    schedules: []
  });

  // Carregar dados quando for edição
  useEffect(() => {
    const fetchRoom = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/rooms/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) throw new Error('Falha ao carregar dados da sala');

        const data = await response.json();
        setFormData(data);
      } catch (error) {
        toast.error('Erro ao carregar dados da sala');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, selectedEvent]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        id 
          ? `https://dev-api.hellomais.com.br/rooms/${id}` 
          : 'https://dev-api.hellomais.com.br/rooms',
        {
          method: id ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          },
          body: JSON.stringify(formData)
        }
      );

      if (!response.ok) throw new Error();

      toast.success(id ? 'Sala atualizada com sucesso!' : 'Sala criada com sucesso!');
      navigate('/dashboard/rooms');
    } catch (error) {
      toast.error(id ? 'Erro ao atualizar sala' : 'Erro ao criar sala');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
      {/* Seletor de Idioma */}
      <div className="flex space-x-2">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            URL do Stream
          </label>
          <input
            type="text"
            value={formData.streamUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, streamUrl: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Salvando...
            </>
          ) : (
            id ? 'Atualizar' : 'Criar'
          )}
        </button>
      </div>
    </form>
  );
}