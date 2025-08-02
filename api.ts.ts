import { apiRequest } from "./queryClient";

export interface User {
  id: string;
  username: string;
  email: string;
  credits: number;
}

export interface GenerateRequest {
  prompt: string;
  style: string;
  refinement?: string;
  dimension: "1:1" | "4:5" | "9:11" | "16:9";
  userId: string;
  styleId?: string;
  applyMyStyle?: boolean;
}

export interface GenerateResponse {
  images: string[];
  historyId: string;
  creditsRemaining: number;
}

export const api = {
  // Authentication
  register: async (userData: { username: string; email: string; password: string }): Promise<{ user: User }> => {
    const res = await apiRequest("POST", "/api/auth/register", userData);
    return res.json();
  },

  login: async (credentials: { email?: string; username?: string }): Promise<{ user: User }> => {
    const res = await apiRequest("POST", "/api/auth/login", credentials);
    return res.json();
  },

  // Users
  getUser: async (id: string): Promise<{ user: User }> => {
    const res = await apiRequest("GET", `/api/users/${id}`);
    return res.json();
  },

  updateCredits: async (userId: string, credits: number): Promise<{ success: boolean }> => {
    const res = await apiRequest("PATCH", `/api/users/${userId}/credits`, { credits });
    return res.json();
  },

  // Image Generation
  generateImages: async (data: GenerateRequest): Promise<GenerateResponse> => {
    const res = await apiRequest("POST", "/api/generate", data);
    return res.json();
  },

  // Styles
  getStyles: async (userId: string) => {
    const res = await apiRequest("GET", `/api/styles/${userId}`);
    return res.json();
  },

  createStyle: async (styleData: any) => {
    const res = await apiRequest("POST", "/api/styles", styleData);
    return res.json();
  },

  deleteStyle: async (styleId: string) => {
    const res = await apiRequest("DELETE", `/api/styles/${styleId}`);
    return res.json();
  },

  // History
  getHistory: async (userId: string, limit?: number) => {
    const url = limit ? `/api/history/${userId}?limit=${limit}` : `/api/history/${userId}`;
    const res = await apiRequest("GET", url);
    return res.json();
  },

  getHistoryItem: async (id: string) => {
    const res = await apiRequest("GET", `/api/history/item/${id}`);
    return res.json();
  },

  // References
  getReferences: async (userId: string) => {
    const res = await apiRequest("GET", `/api/references/${userId}`);
    return res.json();
  },

  createReference: async (referenceData: any) => {
    const res = await apiRequest("POST", "/api/references", referenceData);
    return res.json();
  },
};
