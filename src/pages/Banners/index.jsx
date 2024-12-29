import React, { useState } from 'react';
import { Edit, Trash2, Plus, ToggleRight, ToggleLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// TODO: Replace with actual API call
const initialBanners = [
  {
    id: 15,
    position: "footer",
    translations: {
      "pt-BR": {
        title: "Banner Rodape 2",
        date: null,
        description: null,
        textButton: null,
        actionButton: null,
        images: {
          mobile: "https://dev-hellomais-storage.s3.amazonaws.com/banners/15/22397003-7d75-4b3f-8cf6-076135fc7fc2.jpg",
          desktop: "https://dev-hellomais-storage.s3.amazonaws.com/banners/15/3bd9acfa-96ae-4076-b0d4-51189679f755.jpg"
        }
      }
    },
    isActive: true,
    eventId: 39,
    createdBy: {
      id: 4,
      name: "Manager",
      email: "manager@manager.com"
    },
    createdAt: "2024-12-19T21:26:11.491Z",
    updatedAt: "2024-12-19T21:26:11.491Z"
  }
];

export default function BannersList() {
  const [banners, setBanners] = useState(initialBanners);
  const navigate = useNavigate();

  // When creating a new banner
  const handleCreateBanner = () => {
    navigate('/dashboard/banners/new');
  };
  
  // When editing a banner
  const handleEditBanner = (bannerId) => {
    navigate(`/dashboard/banners/${bannerId}/edit`);
  };
    
  const handleDeleteBanner = (bannerId) => {
    // TODO: Implement actual delete API call
    setBanners(banners.filter(banner => banner.id !== bannerId));
  };

  const handleToggleActive = (bannerId) => {
    // TODO: Implement actual toggle API call
    setBanners(banners.map(banner => 
      banner.id === bannerId 
        ? { ...banner, isActive: !banner.isActive } 
        : banner
    ));
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">Gestão de Banners</h2>
          <button
            onClick={() => navigate('/banners/form')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center text-sm"
          >
            <Plus size={16} className="mr-2" />
            NOVO BANNER
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
                  Posição
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
              {banners.map((banner) => (
                <tr key={banner.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {banner.translations["pt-BR"].title}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{banner.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      banner.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {banner.isActive ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(banner.id)}
                        className={`${
                          banner.isActive 
                            ? 'text-green-600 hover:text-green-900' 
                            : 'text-red-600 hover:text-red-900'
                        }`}
                      >
                        {banner.isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        onClick={() => navigate(`/banners/form/${banner.id}`)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
