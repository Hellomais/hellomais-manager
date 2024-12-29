import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Image as ImageIcon 
} from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import toast from 'react-hot-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '../components/ui/dialog';

export default function BannerList() {
  const navigate = useNavigate();
  const { selectedEvent } = useEvent();
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deletingBanner, setDeletingBanner] = useState(null);

  // Fetch banners
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('https://dev-api.hellomais.com.br/banners', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) throw new Error('Falha ao carregar banners');

        const data = await response.json();
        setBanners(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBanners();
  }, [selectedEvent]);

  // Delete banner
  const handleDeleteBanner = async () => {
    if (!deletingBanner) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://dev-api.hellomais.com.br/banners/${deletingBanner.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        }
      });

      if (!response.ok) throw new Error('Falha ao excluir banner');

      setBanners(prev => prev.filter(banner => banner.id !== deletingBanner.id));
      toast.success('Banner excluído com sucesso');
      setDeletingBanner(null);
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Banners</h1>
        <button
          onClick={() => navigate('/dashboard/banners/new')}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusCircle size={16} />
          <span>Novo Banner</span>
        </button>
      </div>

      {/* Tabela de Banners */}
      <div className="bg-white rounded-lg shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-3 text-left">Imagem</th>
              <th className="p-3 text-left">Título (PT-BR)</th>
              <th className="p-3 text-left">Tipo</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner.id} className="border-b hover:bg-gray-50">
                <td className="p-3">
                  {banner.imageUrl ? (
                    <img 
                      src={banner.imageUrl} 
                      alt={banner.translations?.['pt-BR']?.title || 'Banner'}
                      className="w-16 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-16 h-10 bg-gray-200 flex items-center justify-center rounded">
                      <ImageIcon size={16} className="text-gray-500" />
                    </div>
                  )}
                </td>
                <td className="p-3">
                  {banner.translations?.['pt-BR']?.title || 'Sem título'}
                </td>
                <td className="p-3">{banner.type || 'N/A'}</td>
                <td className="p-3">
                  <span className={`
                    px-2 py-1 rounded text-xs
                    ${banner.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  `}>
                    {banner.active ? 'Ativo' : 'Inativo'}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    <button 
                      onClick={() => navigate(`/dashboard/banners/${banner.id}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeletingBanner(banner)}
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

        {banners.length === 0 && (
          <div className="p-6 text-center text-gray-500">
            Nenhum banner encontrado
          </div>
        )}
      </div>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={!!deletingBanner} onOpenChange={() => setDeletingBanner(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Banner</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir este banner? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-3 mt-4">
            <button
              onClick={() => setDeletingBanner(null)}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteBanner}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Excluir
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}