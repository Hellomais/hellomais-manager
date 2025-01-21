import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Event } from '../../types';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  onSave: () => void;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  position: string;
  businessUnit: string;
  events: Event[];
  hasLoggedIn: boolean;
  highlight: boolean;
}

function UserEditModal({ isOpen, onClose, userId, onSave }: UserEditModalProps) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    position: '',
    businessUnit: '',
    highlight: false,
    password: '',
    events: new Set<number>()
  });

  const token = localStorage.getItem('token');
  const selectedEvent = JSON.parse(localStorage.getItem('selectedEvent') || '{}');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const allEvents = user.events || [];

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (!token || !isOpen) return;

      try {
        const response = await fetch(`https://api.hellomais.com.br/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*',
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) {
          throw new Error('Falha ao carregar dados do usuário');
        }

        const data = await response.json();
        setUserData(data);
        setFormData({
          name: data.name,
          position: data.position || '',
          businessUnit: data.businessUnit || '',
          highlight: data.highlight || false,
          password: '',
          events: new Set(data.events.map((e: Event) => e.id))
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user:', error);
        setError(error instanceof Error ? error.message : 'Erro ao carregar usuário');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, isOpen, token, selectedEvent.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setSaving(true);
    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('position', formData.position);
    formDataToSend.append('businessUnit', formData.businessUnit);
    formDataToSend.append('highlight', formData.highlight.toString());
    if (formData.password) {
      formDataToSend.append('password', formData.password);
    }
    formDataToSend.append('events', Array.from(formData.events).join(','));

    try {
      const response = await fetch(`https://api.hellomais.com.br/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar usuário');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      setError(error instanceof Error ? error.message : 'Erro ao atualizar usuário');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Editar Usuário
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {loading ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">
              {error}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full rounded-md"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                    className="mt-1 block w-full rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Unidade de Negócio
                  </label>
                  <input
                    type="text"
                    value={formData.businessUnit}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessUnit: e.target.value }))}
                    className="mt-1 block w-full rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nova Senha (opcional)
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full rounded-md"
                    placeholder="Deixe em branco para manter a senha atual"
                  />
                </div>

                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.highlight}
                      onChange={(e) => setFormData(prev => ({ ...prev, highlight: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Destacar usuário</span>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eventos
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
                    {allEvents.map((event: Event) => (
                      <label key={event.id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.events.has(event.id)}
                          onChange={(e) => {
                            const newEvents = new Set(formData.events);
                            if (e.target.checked) {
                              newEvents.add(event.id);
                            } else {
                              newEvents.delete(event.id);
                            }
                            setFormData(prev => ({ ...prev, events: newEvents }));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{event.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar'
                  )}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserEditModal;