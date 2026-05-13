import { http } from './http';

export interface ChatHistoryEntry {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export const chatApi = {
    sendMessage: (message: string, history: ChatHistoryEntry[]) =>
        http.post<{ success: boolean; text: string; products?: any[] }>('/chat', { message, history }),
};
