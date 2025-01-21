export interface BannerTranslation {
  title: string;
  date: string;
  description: string;
  textButton: string;
  actionButton: string;
  images: {
    desktop: string;
    mobile: string;
  };
}

export interface Banner {
  id: number;
  position: 'header' | 'middle';
  isActive: boolean;
  translations: {
    'pt-BR': BannerTranslation;
    'es-ES': BannerTranslation;
  };
  eventId: number;
  createdBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BannerFormData {
  position: 'header' | 'middle';
  isActive: boolean;
  translations: {
    'pt-BR': BannerTranslation;
    'es-ES': BannerTranslation;
  };
}