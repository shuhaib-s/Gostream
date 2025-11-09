import axios from 'axios';
import { API_BASE_URL, API_ENDPOINTS, COOKIE_NAMES } from './constants';
import { getCookie } from './utils/cookies';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Enable sending cookies with requests
});

// Add auth token to requests from cookies
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = getCookie(COOKIE_NAMES.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface Project {
  id: string;
  name: string;
  streamKey: string;
  userId: string;
  createdAt: string;
  streams?: Stream[];
  destinations?: Destination[];
}

export interface Stream {
  id: string;
  projectId: string;
  status: string;
  startedAt: string;
  endedAt?: string;
}

export interface Destination {
  id: string;
  projectId: string;
  platform: string;
  name: string;
  rtmpUrl: string;
  streamKey: string;
  enabled: boolean;
  createdAt: string;
}

export const auth = {
  signup: async (email: string, password: string, name: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH_SIGNUP, { email, password, name });
    return response.data;
  },
  login: async (email: string, password: string) => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGIN, { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post(API_ENDPOINTS.AUTH_LOGOUT);
    return response.data;
  },
  me: async () => {
    const response = await api.get(API_ENDPOINTS.AUTH_ME);
    return response.data;
  },
};

export const projects = {
  list: async (): Promise<Project[]> => {
    const response = await api.get(API_ENDPOINTS.PROJECTS);
    return response.data;
  },
  get: async (id: string): Promise<Project> => {
    const response = await api.get(API_ENDPOINTS.PROJECT_DETAIL(id));
    return response.data;
  },
  create: async (name: string): Promise<Project> => {
    const response = await api.post(API_ENDPOINTS.PROJECTS, { name });
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.PROJECT_DELETE(id));
    return response.data;
  },
};

export const destinations = {
  create: async (
    projectId: string,
    data: {
      platform: string;
      name: string;
      rtmpUrl: string;
      streamKey: string;
    }
  ): Promise<Destination> => {
    const response = await api.post(API_ENDPOINTS.DESTINATIONS_CREATE(projectId), data);
    return response.data;
  },
  update: async (
    id: string,
    data: Partial<{
      platform: string;
      name: string;
      rtmpUrl: string;
      streamKey: string;
      enabled: boolean;
    }>
  ): Promise<Destination> => {
    const response = await api.put(API_ENDPOINTS.DESTINATIONS_UPDATE(id), data);
    return response.data;
  },
  delete: async (id: string) => {
    const response = await api.delete(API_ENDPOINTS.DESTINATIONS_DELETE(id));
    return response.data;
  },
};

export default api;


