
import React, { useState, useEffect } from 'react';
import { User, Message, ChatSession, AuthMode } from './types.ts';
import Auth from './components/Auth.tsx';
import Sidebar from './components/Sidebar.tsx';
import ChatArea from './components/ChatArea.tsx';
import { getAiResponse } from './services/chatService.ts';
import Gun from 'gun';

// Публичные реле-серверы для Gun.js
const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://peer.wall.org/gun']);

const FLASH_SYSTEM_ID = 'sys-flash-id';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('welcome');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const savedCurrentUser = localStorage.getItem('flash_current_user');
    if (savedCurrentUser) setCurrentUser(JSON.parse(savedCurrentUser));

    gun.get('flash_v1_users').map().on((userData: any, id: string) => {
      if (userData) {
        setAllUsers(prev => {
          const exists = prev.find(u => u.id === id);
          if (exists) return prev;
          return [...prev, { ...userData, id }];
        });
      }
    });

    gun.get('flash_v1_messages').map().on((msgData: any, id: string) => {
      if (msgData) {
        setMessages(prev => {
          if (prev.find(m => m.id === id)) return prev;
          return [...prev, { ...msgData, id }];
        });
      }
    });

    gun.get('flash_v1_users').get(FLASH_SYSTEM_ID).put({
      username: 'Flash',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Flash&backgroundColor=b6e3f4',
      status: 'online',
      isOfficial: true
    });
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.username.toLowerCase() !== 'flash') {
      const supportSession: ChatSession = {
        id: 'session-support-' + currentUser.id,
        participantId: FLASH_SYSTEM_ID,
        isSupport: true
      };
      setSessions(prev => prev.find(s => s.participantId === FLASH_SYSTEM_ID) ? prev : [supportSession, ...prev]);
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id === FLASH_SYSTEM_ID) {
      const usersWhoMessagedFlash = new Set(
        messages
          .filter(m => m.receiverId === FLASH_SYSTEM_ID)
          .map(m => m.senderId)
      );
      
      usersWhoMessagedFlash.forEach(userId => {
        setSessions(prev => {
          if (prev.find(s => s.participantId === userId)) return prev;
          return [{ id: 'sess-' + userId, participantId: userId }, ...prev];
        });
      });
    }
  }, [messages, currentUser]);

  const handleRegister = (username: string, pass: string) => {
    const lowerName = username.toLowerCase();
    if (lowerName === 'flash') return alert("Ник 'Flash' зарезервирован!");
    const exists = allUsers.find(u => u.username.toLowerCase() === lowerName);
    if (exists) return alert("Этот никнейм уже занят!");

    const userId = Math.random().toString(36).substr(2, 9);
    const newUser: User = {
      id: userId,
      username,
      password: pass,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      status: 'online'
    };
    gun.get('flash_v1_users').get(userId).put(newUser);
    setCurrentUser(newUser);
  };

  const handleLogin = (username: string, pass: string) => {
    const user = allUsers.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === pass);
    if (user) setCurrentUser(user);
    else alert("Пользователь не найден или пароль неверен.");
  };

  const addContact = (username: string) => {
    if (!currentUser) return;
    const cleanName = username.trim();
    if (!cleanName || cleanName.toLowerCase() === currentUser.username.toLowerCase()) return;

    let targetUser = allUsers.find(u => u.username.toLowerCase() === cleanName.toLowerCase());
    if (!targetUser) {
      if (confirm(`Пользователь "${cleanName}" не найден. Создать AI-бота?`)) {
        const botId = 'bot-' + Math.random().toString(36).substr(2, 5);
        targetUser = { id: botId, username: cleanName, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanName}`, status: 'online', isBot: true };
        gun.get('flash_v1_users').get(botId).put(targetUser);
      } else return;
    }

    if (targetUser) {
      const existingSession = sessions.find(s => s.participantId === targetUser!.id);
      if (existingSession) setActiveSessionId(existingSession.id);
      else {
        const newSession: ChatSession = { id: Math.random().toString(36).substr(2, 9), participantId: targetUser!.id };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
      }
    }
  };

  const sendMessage = async (text: string) => {
    if (!currentUser || !activeSessionId) return;
    const session = sessions.find(s => s.id === activeSessionId);
    if (!session) return;
    const isWritingToSupport = session.participantId === FLASH_SYSTEM_ID && currentUser.id !== FLASH_SYSTEM_ID;
    const msgId = Math.random().toString(36).substr(2, 12);
    const newMessage: Message = { id: msgId, senderId: currentUser.id, receiverId: session.participantId, text: isWritingToSupport ? `${currentUser.username}: ${text}` : text, timestamp: Date.now(), isSupportRequest: isWritingToSupport, fromName: currentUser.username };
    gun.get('flash_v1_messages').get(msgId).put(newMessage);

    const recipient = allUsers.find(u => u.id === session.participantId);
    if (recipient?.isBot) {
      const history = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === recipient.id) || (m.senderId === recipient.id && m.receiverId === currentUser.id)).map(m => ({ role: m.senderId === currentUser.id ? 'user' as const : 'model' as const, text: m.text }));
      const aiText = await getAiResponse(recipient.username, [...history, { role: 'user', text }]);
      const botMsgId = 'bot-msg-' + Math.random().toString(36).substr(2, 9);
      gun.get('flash_v1_messages').get(botMsgId).put({ id: botMsgId, senderId: recipient.id, receiverId: currentUser.id, text: aiText, timestamp: Date.now() });
    }
  };

  if (!currentUser) return <Auth mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />;
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const activeRecipient = activeSession ? allUsers.find(u => u.id === activeSession.participantId) : null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      <Sidebar sessions={sessions} users={allUsers} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onAddContact={addContact} currentUser={currentUser} onLogout={() => { setCurrentUser(null); localStorage.removeItem('flash_current_user'); }} />
      <div className="flex-1 flex flex-col min-w-0">
        {activeSessionId && activeRecipient ? (
          <ChatArea recipient={activeRecipient} messages={messages.filter(m => (m.senderId === currentUser.id && m.receiverId === activeRecipient.id) || (m.senderId === activeRecipient.id && m.receiverId === currentUser.id)).sort((a, b) => a.timestamp - b.timestamp)} onSendMessage={sendMessage} currentUserId={currentUser.id} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 p-10 text-center relative">
            <div className="w-20 h-20 rounded-3xl flash-gradient flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/20 animate-glow">
              <i className="fa-solid fa-bolt text-4xl text-white"></i>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 italic tracking-tighter">FLASH MESSENGER</h2>
            <p className="max-w-xs text-sm">Выберите чат или добавьте друга по нику.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
