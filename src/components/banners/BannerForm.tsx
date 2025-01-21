import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Banner, BannerFormData } from '../../types/banner';
import TranslationFields from './TranslationFields';
import ImageUpload from './ImageUpload';

interface BannerFormProps {
  banner?: Banner;
  onSubmit: (data: FormData) => Promise<void>;
  saving: boolean;
  onCancel: () => void;
}

function BannerForm({ banner, onSubmit, saving, onCancel }: BannerFormProps) {
  const [formData, setFormData] = useState<BannerFormData>({
    position: banner?.position || 'middle',
    isActive: banner?.isActive ?? true,
    translations: {
      'pt-BR': {
        title: banner?.translations['pt-BR']?.title || '',
        date: banner?.translations['pt-BR']?.date || '',
        description: banner?.translations['pt-BR']?.description || '',
        textButton: banner?.translations['pt-BR']?.textButton || '',
        actionButton: banner?.translations['pt-BR']?.actionButton || '',
        images: {
          desktop: banner?.translations['pt-BR']?.images?.desktop || '',
          mobile: banner?.translations['pt-BR']?.images?.mobile || ''
        }
      },
      'es-ES': {
        title: banner?.translations['es-ES']?.title || '',
        date: banner?.translations['es-ES']?.date || '',
        description: banner?.translations['es-ES']?.description || '',
        textButton: banner?.translations['es-ES']?.textButton || '',
        actionButton: banner?.translations['es-ES']?.actionButton || '',
        images: {
          desktop: banner?.translations['es-ES']?.images?.desktop || '',
          mobile: banner?.translations['es-ES']?.images?.mobile || ''
        }
      }
    }
  });
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Cria o FormData com o formato exato esperado pela API
    const submitData = new FormData();
    
    // Adiciona a posição
    submitData.append('position', formData.position);
    
    // Prepara os dados de tradução no formato esperado
    const translationsData = [
      {
        language: 'pt-BR',
        title: formData.translations['pt-BR'].title,
        date: formData.translations['pt-BR'].date,
        description: formData.translations['pt-BR'].description,
        textButton: formData.translations['pt-BR'].textButton,
        actionButton: formData.translations['pt-BR'].actionButton
      },
      {
        language: 'es-ES',
        title: formData.translations['es-ES'].title,
        date: formData.translations['es-ES'].date,
        description: formData.translations['es-ES'].description,
        textButton: formData.translations['es-ES'].textButton,
        actionButton: formData.translations['es-ES'].actionButton
      }
    ];
    
    // Adiciona as traduções como string JSON
    submitData.append('translationsData', JSON.stringify(translationsData));
    
    // Adiciona as imagens se existirem
    if (desktopImage) {
      submitData.append('desktopImage0', desktopImage);
    }
    if (mobileImage) {
      submitData.append('mobileImage0', mobileImage);
    }

    onSubmit(submitData);
  };

  const handleImageUpload = async (file: File, type: 'desktop' | 'mobile') => {
    if (type === 'desktop') {
      setDesktopImage(file);
    } else {
      setMobileImage(file);
    }
    
    // Preview da imagem
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        translations: {
          'pt-BR': {
            ...prev.translations['pt-BR'],
            images: {
              ...prev.translations['pt-BR'].images,
              [type]: reader.result as string
            }
          },
          'es-ES': {
            ...prev.translations['es-ES'],
            images: {
              ...prev.translations['es-ES'].images,
              [type]: reader.result as string
            }
          }
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="p-4 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-4">
          {/* Position and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Posição
              </label>
              <select
                value={formData.position}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  position: e.target.value as 'header' | 'middle'
                }))}
                className="mt-1 block w-full"
              >
                <option value="header">Header</option>
                <option value="middle">Middle</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.isActive.toString()}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  isActive: e.target.value === 'true'
                }))}
                className="mt-1 block w-full"
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>
              </select>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-4">Imagens</h4>
            <div className="grid grid-cols-2 gap-4">
              <ImageUpload
                type="desktop"
                currentImage={formData.translations['pt-BR'].images.desktop}
                onUpload={(file) => handleImageUpload(file, 'desktop')}
                uploading={uploading}
              />
              <ImageUpload
                type="mobile"
                currentImage={formData.translations['pt-BR'].images.mobile}
                onUpload={(file) => handleImageUpload(file, 'mobile')}
                uploading={uploading}
              />
            </div>
          </div>

          {/* Translation Fields */}
          <TranslationFields
            language="pt-BR"
            title="Português"
            data={formData.translations['pt-BR']}
            onChange={(data) => setFormData(prev => ({
              ...prev,
              translations: {
                ...prev.translations,
                'pt-BR': {
                  ...data,
                  images: prev.translations['pt-BR'].images
                }
              }
            }))}
          />

          <TranslationFields
            language="es-ES"
            title="Español"
            data={formData.translations['es-ES']}
            onChange={(data) => setFormData(prev => ({
              ...prev,
              translations: {
                ...prev.translations,
                'es-ES': {
                  ...data,
                  images: prev.translations['es-ES'].images
                }
              }
            }))}
          />
        </div>
      </div>

      <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
        <button
          type="submit"
          disabled={saving}
          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Salvando...' : 'Salvar'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export default BannerForm;