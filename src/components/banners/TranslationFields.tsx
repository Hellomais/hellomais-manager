import React from 'react';
import { BannerTranslation } from '../../types/banner';

interface TranslationFieldsProps {
  language: 'pt-BR' | 'es-ES';
  title: string;
  data: Omit<BannerTranslation, 'images'>;
  onChange: (data: BannerTranslation) => void;
}

function TranslationFields({ language, title, data, onChange }: TranslationFieldsProps) {
  return (
    <div className="border rounded-lg p-4">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'pt-BR' ? 'Título' : 'Título'}
          </label>
          <input
            type="text"
            value={data.title}
            onChange={(e) => onChange({ ...data, title: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'pt-BR' ? 'Data' : 'Fecha'}
          </label>
          <input
            type="text"
            value={data.date}
            onChange={(e) => onChange({ ...data, date: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'pt-BR' ? 'Descrição' : 'Descripción'}
          </label>
          <textarea
            value={data.description}
            onChange={(e) => onChange({ ...data, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'pt-BR' ? 'Texto do Botão' : 'Texto del Botón'}
          </label>
          <input
            type="text"
            value={data.textButton}
            onChange={(e) => onChange({ ...data, textButton: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {language === 'pt-BR' ? 'Link do Botão' : 'Link del Botón'}
          </label>
          <input
            type="text"
            value={data.actionButton}
            onChange={(e) => onChange({ ...data, actionButton: e.target.value })}
            className="mt-1 block w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default TranslationFields;