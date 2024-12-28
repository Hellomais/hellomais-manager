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

export default function UserFormModal({ isOpen, onClose, user = null, onSuccess }) {
  const { selectedEvent, events } = useEvent();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return; // Se não tiver user, é criação

      try {
        setInitialLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/users/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) {
          throw new Error('Erro ao carregar dados do usuário');
        }

        const userData = await response.json();
        
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          role: userData.role || 'user',
          highlight: userData.highlight || false,
          events: userData.events?.map(e => e.toString()) || []
        });
      } catch (error) {
        toast.error('Erro ao carregar dados do usuário');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchUserDetails();
  }, [user, selectedEvent]);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    highlight: user?.highlight || false,
    events: user?.events || []
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'events') {
      const eventId = value;
      setFormData(prev => ({
        ...prev,
        events: checked 
          ? [...prev.events, eventId]
          : prev.events.filter(e => e !== eventId)
      }));
    } else if (type === 'checkbox' && name === 'highlight') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loadingToast = toast.loading(
      user ? 'Atualizando usuário...' : 'Criando usuário...'
    );

    try {
      const token = localStorage.getItem('token');
      const url = user 
        ? `https://dev-api.hellomais.com.br/users/${user.id}`
        : 'https://dev-api.hellomais.com.br/users';

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('highlight', formData.highlight);
      formDataToSend.append('position', '');
      formDataToSend.append('businessUnit', '');
      formDataToSend.append('photo', '');
      formDataToSend.append('password', '');
      
      // Converter array de eventos em string separada por vírgula
      formDataToSend.append('events', formData.events.join(','));

      console.log('Enviando dados:', {
        url,
        method: user ? 'PATCH' : 'POST',
        body: Object.fromEntries(formDataToSend)
      });

      const response = await fetch(url, {
        method: user ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: formDataToSend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || (user ? 'Erro ao atualizar usuário' : 'Erro ao criar usuário'));
      }

      toast.success(
        user ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!', 
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
          <DialogTitle>{user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          <DialogDescription>
            {user 
              ? 'Faça as alterações necessárias nos dados do usuário.' 
              : 'Preencha os dados para criar um novo usuário.'}
          </DialogDescription>
        </DialogHeader>
      {initialLoading ? (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">
              Nome
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="role">
              Papel
            </label>
            <select
              id="role"
              name="role"
              required
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            >
              <option value="user">Usuário</option>
              <option value="manager">Gerente</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="highlight">
              Destaque
            </label>
            <input
              id="highlight"
              name="highlight"
              type="checkbox"
              checked={formData.highlight}
              onChange={handleChange}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Acesso aos Eventos
            </label>
            <div className="mt-2 space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {events.map((event) => (
                <div key={event.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`event-${event.id}`}
                    name="events"
                    value={event.id}
                    checked={formData.events.includes(event.id.toString())}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`event-${event.id}`}
                    className="ml-2 block text-sm text-gray-900"
                  >
                    {event.title}
                  </label>
                </div>
              ))}
            </div>
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
              ) : user ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      )}
      </DialogContent>
    </Dialog>
  );
}