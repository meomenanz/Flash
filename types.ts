
export interface User {
  id: string;
  username: string;
  password?: string;
  avatar: string;
  status: 'online' | 'offline';
  isBot?: boolean;
  isOfficial?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  isSupportRequest?: boolean;
  fromName?: string;
}

export interface ChatSession {
  id: string;
  participantId: string;
  lastMessage?: string;
  lastTimestamp?: number;
  isSupport?: boolean;
}

export type AuthMode = 'login' | 'register' | 'welcome';
