import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Banner, BannerFormData } from '../../types/banner';
import BannerForm from './BannerForm';

interface BannerModalProps {
  banner?: Banner;
  onClose: () => void;
  onSave: (data: BannerFormData) => Promise<void>;
}

function BannerModal({ banner, onClose, onSave }: BannerModalProps) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (formData: BannerFormData) => {
    setSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {banner ? 'Editar Banner' : 'Novo Banner'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <BannerForm
            banner={banner}
            onSubmit={handleSubmit}
            saving={saving}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}

export default BannerModal;