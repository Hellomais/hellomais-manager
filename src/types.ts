export interface Event {
  id: number;
  title: string;
  description: string;
  isActive: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  photo: string | null;
  events: Event[];
}

export interface LoginResponse {
  user: User;
  access_token: string;
}