// lib/types/chat.ts

export interface ChatSession {
  id: string;
  user_id: string;
  messages: ChatMessage[];
  trip_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}
