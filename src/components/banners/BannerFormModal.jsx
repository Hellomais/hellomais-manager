import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  Building2, 
  Upload 
} from 'lucide-react';
import { useEvent } from '../contexts/EventContext';
import toast from 'react-hot-toast';

// Constantes
const LANGUAGES = [
  { code: 'pt-BR', name: 'Português' },
  { code: 'en-US', name: 'English' },
  { code: 'es-ES', name: 'Español' }
];

const BANNER_TYPES = [
  { value: 'HERO', label: 'Banner Principal' },
  { value: 'SECONDARY', label: 'Banner Secundário' },
  { value: 'POPUP', label: 'Pop-up' }
];

export default function BannerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { selectedEvent } = useEvent();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');
  
  // Estado inicial do banner
  const [bannerData, setBannerData] = useState({
    type: 'HERO',
    active: true,
    imageUrl: '',
    translations: LANGUAGES.reduce((acc, lang) => ({
      ...acc,
      [lang.code]: {
        title: '',
        description: '',
        linkUrl: ''
      }
    }), {})
  });

  // Estado para upload de imagem
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Carregar dados do banner para edição
  useEffect(() => {
    const fetchBannerDetails = async () => {
      if (!id || id === 'new') return;

      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`https://dev-api.hellomais.com.br/banners/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          }
        });

        if (!response.ok) throw new Error('Falha ao carregar dados do banner');

        const data = await response.json();
        
        // Garantir que todas as traduções estejam presentes
        const completeTranslations = LANGUAGES.reduce((acc, lang) => ({
          ...acc,
          [lang.code]: {
            title: data.translations?.[lang.code]?.title || '',
            description: data.translations?.[lang.code]?.description || '',
            linkUrl: data.translations?.[lang.code]?.linkUrl || ''
          }
        }), {});

        setBannerData({
          ...data,
          translations: completeTranslations
        });

        // Se já tiver imagem, definir preview
        if (data.imageUrl) {
          setImagePreview(data.imageUrl);
        }
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBannerDetails();
  }, [id, selectedEvent]);

  // Handler para mudança de imagem
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de imagem
  const uploadImage = async () => {
    if (!imageFile) return bannerData.imageUrl;

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://dev-api.hellomais.com.br/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-event-id': selectedEvent.id.toString()
        },
        body: formData
      });

      if (!response.ok) throw new Error('Falha no upload da imagem');

      const data = await response.json();
      return data.url;
    } catch (error) {
      toast.error(error.message);
      return null;
    }
  };

  // Salvar banner
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem('token');
      
      // Fazer upload da imagem, se houver
      const imageUrl = await uploadImage();

      // Preparar dados para envio
      const formattedData = {
        type: bannerData.type,
        active: bannerData.active,
        imageUrl: imageUrl || bannerData.imageUrl,
        translations: Object.keys(bannerData.translations).map(lang => ({
          language: lang,
          title: bannerData.translations[lang].title,
          description: bannerData.translations[lang].description,
          linkUrl: bannerData.translations[lang].linkUrl
        }))
      };

      const response = await fetch(
        id && id !== 'new'
          ? `https://dev-api.hellomais.com.br/banners/${id}`
          : 'https://dev-api.hellomais.com.br/banners',
        {
          method: id && id !== 'new' ? 'PATCH' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'x-event-id': selectedEvent.id.toString()
          },
          body: JSON.stringify(formattedData)
        }
      );

      if (!response.ok) throw new Error('Falha ao salvar banner');

      toast.success(id && id !== 'new' ? 'Banner atualizado com sucesso!' : 'Banner criado com sucesso!');
      navigate('/dashboard/banners');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler para mudança de tradução
  const handleTranslationChange = (lang, field, value) => {
    setBannerData(prev => ({
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

  if (isLoading) {
    return (
      <div className="p-6 flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <div className="flex items-center space-x-2 text-gray-500 mb-6">
        <button 
          onClick={() => navigate('/dashboard/banners')}
          className="flex items-center hover:text-gray-700"
        >
          <ChevronLeft size={20} className="mr-1" />
          Voltar para Banners
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Coluna da Imagem */}
        <div className="md:col-span-1 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Imagem do Banner</h2>
          
          <div className="mb-4">
            <input 
              type="file" 
              id="banner-image" 
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
            <label 
              htmlFor="banner-image"
              className="cursor-pointer"
            >
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Banner Preview" 
                  className="w-full h-48 object-cover rounded-lg"
                />
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center flex-col">
                  <Upload size={32} className="text-gray-500 mb-2" />
                  <p className="text-gray-500">Carregar Imagem</p>
                </div>
              )}
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Banner
            </label>
            <select
              value={bannerData.type}
              onChange={(e) => setBannerData(prev => ({ ...prev, type: e.target.value }))}
              className="block w-full rounded-md border border-gray-300 px-3 py-2"
            >
              {BANNER_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex items-center">
            <input 
              type="checkbox"
              id="banner-active"
              checked={bannerData.active}
              onChange={(e) => setBannerData(prev => ({ ...prev, active: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="banner-active" className="text-sm">
              Banner Ativo
            </label>
          </div>
        </div>

        {/* Coluna de Tradução */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-6">
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

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título ({LANGUAGES.find(l => l.code === selectedLanguage).name})
              </label>
              <input
                type="text"
                value={bannerData.translations[selectedLanguage].title}
                onChange={(e) => handleTranslationChange(selectedLanguage, 'title', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`Título em ${LANGUAGES.find(l => l.code === selectedLanguage).name}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição ({LANGUAGES.find(l => l.code === selectedLanguage).name})
              </label>
              <textarea
                value={bannerData.translations[selectedLanguage].description}
                onChange={(e) => handleTranslationChange(selectedLanguage, 'description', e.target.value)}
                rows={3}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`Descrição em ${LANGUAGES.find(l => l.code === selectedLanguage).name}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de Link ({LANGUAGES.find(l => l.code === selectedLanguage).name})
              </label>
              <input
                type="url"
                value={bannerData.translations[selectedLanguage].linkUrl}
                onChange={(e) => handleTranslationChange(selectedLanguage, 'linkUrl', e.target.value)}
                className="block w-full rounded-md border border-gray-300 px-3 py-2"
                placeholder={`URL de link em ${LANGUAGES.find(l => l.code === selectedLanguage).name}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => navigate('/dashboard/banners')}
          className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? (
            <div className="flex items-center">
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
              Salvando...
            </div>
          ) : (id && id !== 'new' ? 'Atualizar' : 'Criar') + ' Banner'}
        </button>
      </div>
    </div>
  );
}