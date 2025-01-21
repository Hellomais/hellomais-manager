import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import EventSelector from '../components/EventSelector';
import BannerModal from '../components/banners/BannerModal';
import { Event } from '../types';
import { Banner } from '../types/banner';

function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(() => {
    const savedEvent = localStorage.getItem('selectedEvent');
    return savedEvent ? JSON.parse(savedEvent) : null;
  });

  const token = localStorage.getItem('token');

  const fetchBanners = async () => {
    if (!selectedEvent) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.hellomais.com.br/banners', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': 'application/json',
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao carregar banners');
      }

      const data = await response.json();
      setBanners(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erro ao carregar banners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, [selectedEvent]);

  const handleSaveBanner = async (data: FormData) => {
    if (!selectedEvent) return;

    try {
      if (selectedBanner) {
        // Update existing banner
        const response = await fetch(`https://api.hellomais.com.br/banners/${selectedBanner.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*'
          },
          body: data
        });

        if (!response.ok) {
          throw new Error('Falha ao atualizar banner');
        }
      } else {
        // Create new banner
        const response = await fetch('https://api.hellomais.com.br/banners', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'accept': '*/*',
            'x-event-id': selectedEvent.id.toString()
          },
          body: data
        });

        if (!response.ok) {
          throw new Error('Falha ao criar banner');
        }
      }

      await fetchBanners();
      setIsModalOpen(false);
      setSelectedBanner(null);
    } catch (error) {
      throw error;
    }
  };

  const handleDeleteBanner = async (bannerId: number) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;

    try {
      const response = await fetch(`https://api.hellomais.com.br/banners/${bannerId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir banner');
      }

      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Erro ao excluir banner');
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Banners</h1>
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <EventSelector
                selectedEvent={selectedEvent}
                onEventChange={(event) => {
                  localStorage.setItem('selectedEvent', JSON.stringify(event));
                  setSelectedEvent(event);
                }}
              />
            </div>
            {selectedEvent && (
              <button
                onClick={() => {
                  setSelectedBanner(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-5 w-5 mr-2" />
                Novo Banner
              </button>
            )}
          </div>
        </div>
      </div>

      {selectedEvent ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">
              {error}
            </div>
          ) : banners.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Nenhum banner encontrado
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Título
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Posição
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Criado por
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {banners.map((banner) => (
                    <tr key={banner.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {banner.translations['pt-BR'].title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.position === 'header' ? 'Header' : 'Middle'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          banner.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {banner.isActive ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {banner.createdBy.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(banner.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setSelectedBanner(banner);
                              setIsModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Editar"
                          >
                            <Pencil className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(banner.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          Selecione um evento para visualizar os banners
        </div>
      )}

      {isModalOpen && (
        <BannerModal
          banner={selectedBanner}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedBanner(null);
          }}
          onSave={handleSaveBanner}
        />
      )}
    </div>
  );
}

export default BannersPage;