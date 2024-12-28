import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import toast from 'react-hot-toast';
import { useEvent } from '../../contexts/EventContext';

export default function EventFormModal({ isOpen, onClose, event = null, onSuccess }) {
  const { selectedEvent } = useEvent();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (!event) return;

      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/events/${event.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do evento');
        }

        const eventData = await response.json();
        setFormData({
          title: eventData.title || '',
          description: eventData.description || '',
          isActive: eventData.isActive || true
        });
      } catch (error) {
        toast.error('Erro ao carregar dados do evento');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchEventDetails();
  }, [event, selectedEvent]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading(
      event ? 'Atualizando evento...' : 'Criando evento...'
    );

    try {
      const token = localStorage.getItem('token');
      const url = event 
        ? `https://dev-api.hellomais.com.br/events/${event.id}`
        : 'https://dev-api.hellomais.com.br/events';

      const response = await fetch(url, {
        method: event ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || (event ? 'Erro ao atualizar evento' : 'Erro ao criar evento'));
      }

      toast.success(
        event ? 'Evento atualizado com sucesso!' : 'Evento criado com sucesso!', 
        { id: loadingToast }
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro na requisição:', error);
      toast.error(
        error.message || 'Ocorreu um erro inesperado', 
        { id: loadingToast }
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{event ? 'Editar Evento' : 'Novo Evento'}</DialogTitle>
          <DialogDescription>
            {event 
              ? 'Faça as alterações necessárias nos dados do evento.' 
              : 'Preencha os dados para criar um novo evento.'}
          </DialogDescription>
        </DialogHeader>
        
        {initialLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="title">
                Título
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700" htmlFor="description">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                value={formData.description}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Ativo</span>
              </label>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processando...
                  </>
                ) : event ? 'Atualizar' : 'Criar'}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}