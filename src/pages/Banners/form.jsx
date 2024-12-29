import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Upload } from 'lucide-react';

export default function BannerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [banner, setBanner] = useState({
    position: "",
    translations: {
      "pt-BR": {
        title: "",
        date: null,
        description: null,
        textButton: null,
        actionButton: null,
        images: {
          mobile: null,
          desktop: null
        }
      }
    },
    isActive: true
  });

  useEffect(() => {
    // If an ID is provided, fetch the banner details
    if (id) {
      // TODO: Implement actual API call to fetch banner by ID
      console.log(`Fetching banner with ID: ${id}`);
      // Example:
      // fetchBannerById(id).then(fetchedBanner => setBanner(fetchedBanner));
    }
  }, [id]);

  const handleFileUpload = (type, file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setBanner(prev => ({
        ...prev,
        translations: {
          ...prev.translations,
          "pt-BR": {
            ...prev.translations["pt-BR"],
            images: {
              ...prev.translations["pt-BR"].images,
              [type]: reader.result
            }
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement actual API call to save banner
    console.log('Saving banner:', banner);
    navigate('/dashboard/banners');
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6">
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">
          {id ? 'Editar Banner' : 'Novo Banner'}
        </h2>

        <div className="space-y-4">
          {/* Position */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Posição do Banner
            </label>
            <select
              value={banner.position}
              onChange={(e) => setBanner({...banner, position: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Selecione uma posição</option>
              <option value="header">Header</option>
              <option value="middle">Meio</option>
              <option value="footer">Rodapé</option>
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título do Banner
            </label>
            <input
              type="text"
              value={banner.translations["pt-BR"].title}
              onChange={(e) => setBanner({
                ...banner,
                translations: {
                  ...banner.translations,
                  "pt-BR": {
                    ...banner.translations["pt-BR"],
                    title: e.target.value
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite o título do banner"
              required
            />
          </div>

          {/* Optional Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data (opcional)
              </label>
              <input
                type="text"
                value={banner.translations["pt-BR"].date || ''}
                onChange={(e) => setBanner({
                  ...banner,
                  translations: {
                    ...banner.translations,
                    "pt-BR": {
                      ...banner.translations["pt-BR"],
                      date: e.target.value || null
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 20 de janeiro de 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Texto do Botão (opcional)
              </label>
              <input
                type="text"
                value={banner.translations["pt-BR"].textButton || ''}
                onChange={(e) => setBanner({
                  ...banner,
                  translations: {
                    ...banner.translations,
                    "pt-BR": {
                      ...banner.translations["pt-BR"],
                      textButton: e.target.value || null
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Assistir Ao Vivo"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={banner.translations["pt-BR"].description || ''}
              onChange={(e) => setBanner({
                ...banner,
                translations: {
                  ...banner.translations,
                  "pt-BR": {
                    ...banner.translations["pt-BR"],
                    description: e.target.value || null
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Digite uma descrição opcional"
              rows={3}
            />
          </div>

          {/* Action Button */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Botão (opcional)
            </label>
            <input
              type="text"
              value={banner.translations["pt-BR"].actionButton || ''}
              onChange={(e) => setBanner({
                ...banner,
                translations: {
                  ...banner.translations,
                  "pt-BR": {
                    ...banner.translations["pt-BR"],
                    actionButton: e.target.value || null
                  }
                }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: https://exemplo.com/link"
            />
          </div>

          {/* Image Uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem Mobile
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload('mobile', e.target.files[0])}
                  className="hidden"
                  id="mobile-upload"
                />
                <label 
                  htmlFor="mobile-upload" 
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  <Upload size={16} className="mr-2" />
                  Carregar Mobile
                </label>
                {banner.translations["pt-BR"].images.mobile && (
                  <img 
                    src={banner.translations["pt-BR"].images.mobile} 
                    alt="Mobile" 
                    className="h-20 w-auto object-cover rounded"
                  />
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagem Desktop
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleFileUpload('desktop', e.target.files[0])}
                  className="hidden"
                  id="desktop-upload"
                />
                <label 
                  htmlFor="desktop-upload" 
                  className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200"
                >
                  <Upload size={16} className="mr-2" />
                  Carregar Desktop
                </label>
                {banner.translations["pt-BR"].images.desktop && (
                  <img 
                    src={banner.translations["pt-BR"].images.desktop} 
                    alt="Desktop" 
                    className="h-20 w-auto object-cover rounded"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={banner.isActive}
              onChange={(e) => setBanner({...banner, isActive: e.target.checked})}
              className="mr-2"
              id="banner-active"
            />
            <label htmlFor="banner-active" className="text-sm text-gray-700">
              Banner Ativo
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard/banners')}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            {id ? 'Atualizar Banner' : 'Criar Banner'}
          </button>
        </div>
      </form>
    </div>
  );
}