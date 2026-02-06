
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";
import Gun from 'gun';

// --- Инициализация Gun.js и Глобальных переменных ---
if (typeof window !== 'undefined') {
  (window as any).global = window;
  (window as any).process = { 
    env: { NODE_ENV: 'development', API_KEY: (window as any).process?.env?.API_KEY || '' },
    nextTick: (cb: any) => setTimeout(cb, 0),
    browser: true
  };
}

const gun = Gun(['https://gun-manhattan.herokuapp.com/gun', 'https://peer.wall.org/gun']);
const FLASH_SYSTEM_ID = 'sys-flash-id';
const EMOJIS = ['⚡', '🔥', '🚀', '❤️', '😂', '👍', '👋', '💀', '🤡', '✅'];

// --- AI Сервис ---
const ai = new GoogleGenAI({ apiKey: (window as any).process?.env?.API_KEY });

async function getAiResponse(contactName: string, chatHistory: any[]) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: chatHistory.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
      config: {
        systemInstruction: `You are ${contactName}, a user of Flash Messenger. Be natural, brief, use emojis. Keep it under 2 sentences.`,
        temperature: 0.8,
      },
    });
    return response.text || "Flash speed! ⚡";
  } catch (e) {
    return "Flash is busy right now! ⚡";
  }
}

// --- Компоненты ---

const Auth = ({ mode, setMode, onLogin, onRegister }: any) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (mode === 'login') onLogin(username, password);
    else onRegister(username, password);
  };

  if (mode === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-center p-6">
        <h1 className="text-7xl font-black italic flash-gradient text-transparent bg-clip-text mb-4">FLASH</h1>
        <p className="text-slate-400 tracking-widest uppercase mb-8">Настоящий мессенджер</p>
        <div className="flex gap-4">
          <button onClick={() => setMode('register')} className="px-8 py-3 rounded-full flash-gradient font-bold shadow-lg shadow-purple-500/20">Начать</button>
          <button onClick={() => setMode('login')} className="px-8 py-3 rounded-full border border-slate-700 bg-slate-900/50">Войти</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-slate-950 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <h2 className="text-3xl font-bold mb-6 flash-gradient text-transparent bg-clip-text">
          {mode === 'login' ? 'Вход' : 'Регистрация'}
        </h2>
        <input type="text" placeholder="Никнейм" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-4 text-white outline-none focus:ring-2 focus:ring-purple-500" />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 mb-6 text-white outline-none focus:ring-2 focus:ring-purple-500" />
        <button type="submit" className="w-full py-4 rounded-xl flash-gradient font-bold">Подтвердить</button>
        <p className="mt-6 text-center text-slate-500">
          {mode === 'login' ? 'Нет аккаунта?' : 'Есть аккаунт?'} 
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="ml-2 text-purple-400">Сменить</button>
        </p>
      </form>
    </div>
  );
};

const Sidebar = ({ sessions, users, activeSessionId, onSelectSession, onAddContact, currentUser, onLogout }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col h-full">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={currentUser.avatar} className="w-10 h-10 rounded-full border-2 border-purple-500 p-0.5" />
          <span className="font-bold text-sm truncate">{currentUser.username}</span>
        </div>
        <button onClick={onLogout} className="text-slate-500 hover:text-red-400"><i className="fa-solid fa-power-off"></i></button>
      </div>
      <div className="p-4">
        {!isAdding ? (
          <button onClick={() => setIsAdding(true)} className="w-full py-2 bg-purple-600 rounded-xl font-bold text-sm"><i className="fa-solid fa-plus mr-2"></i> Добавить друга</button>
        ) : (
          <form onSubmit={e => { e.preventDefault(); onAddContact(newContactName); setIsAdding(false); setNewContactName(''); }} className="flex gap-2">
            <input autoFocus value={newContactName} onChange={e => setNewContactName(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1 text-sm outline-none" placeholder="Ник..." />
            <button type="submit" className="text-green-500"><i className="fa-solid fa-check"></i></button>
            <button type="button" onClick={() => setIsAdding(false)} className="text-slate-500"><i className="fa-solid fa-xmark"></i></button>
          </form>
        )}
      </div>
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session: any) => {
          const user = users.find((u: any) => u.id === session.participantId);
          return (
            <button key={session.id} onClick={() => onSelectSession(session.id)} className={`w-full p-4 flex items-center gap-3 hover:bg-slate-800/40 ${activeSessionId === session.id ? 'bg-slate-800/80' : ''}`}>
              <img src={user?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Unknown'} className="w-12 h-12 rounded-full bg-slate-800" />
              <div className="text-left overflow-hidden">
                <p className="font-bold text-sm truncate">{user?.username || 'Загрузка...'}</p>
                <p className="text-xs text-slate-500 truncate">{session.lastMessage || 'Начните чат'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const ChatArea = ({ recipient, messages, onSendMessage, currentUserId }: any) => {
  const [text, setText] = useState('');
  const scrollRef = useRef<any>(null);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950">
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/50">
        <img src={recipient.avatar} className="w-10 h-10 rounded-full mr-3" />
        <span className="font-bold">{recipient.username}</span>
      </div>
      <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((m: any) => (
          <div key={m.id} className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm ${m.senderId === currentUserId ? 'bg-purple-600' : 'bg-slate-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={e => { e.preventDefault(); if (text.trim()) { onSendMessage(text); setText(''); } }} className="p-4 border-t border-slate-800 flex gap-3">
        <input value={text} onChange={e => setText(e.target.value)} className="flex-1 bg-slate-800 rounded-full px-5 py-3 outline-none focus:ring-2 focus:ring-purple-500" placeholder="Сообщение..." />
        <button type="submit" className="w-12 h-12 rounded-full flash-gradient flex items-center justify-center"><i className="fa-solid fa-paper-plane"></i></button>
      </form>
    </div>
  );
};

// --- Основное приложение ---

const App = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<any>('welcome');
  const [sessions, setSessions] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);

  useEffect(() => {
    gun.get('flash_v1_users').map().on((u: any, id: string) => {
      if (u) setAllUsers(prev => prev.find(x => x.id === id) ? prev : [...prev, { ...u, id }]);
    });
    gun.get('flash_v1_messages').map().on((m: any, id: string) => {
      if (m) setMessages(prev => prev.find(x => x.id === id) ? prev : [...prev, { ...m, id }]);
    });
  }, []);

  const handleRegister = (u: string, p: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const user = { id, username: u, password: p, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u}`, status: 'online' };
    gun.get('flash_v1_users').get(id).put(user);
    setCurrentUser(user);
  };

  const handleLogin = (u: string, p: string) => {
    const user = allUsers.find(x => x.username === u && x.password === p);
    if (user) setCurrentUser(user);
    else alert("Ошибка входа!");
  };

  const addContact = (u: string) => {
    let target = allUsers.find(x => x.username.toLowerCase() === u.toLowerCase());
    if (!target) {
      if (confirm("Создать бота?")) {
        const id = 'bot-' + Math.random().toString(36).substr(2, 5);
        target = { id, username: u, avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${u}`, isBot: true };
        gun.get('flash_v1_users').get(id).put(target);
      } else return;
    }
    const sess = { id: 'sess-' + Math.random().toString(36).substr(2, 5), participantId: target.id };
    setSessions(prev => [sess, ...prev]);
    setActiveSessionId(sess.id);
  };

  const sendMessage = async (txt: string) => {
    const session = sessions.find(s => s.id === activeSessionId);
    const id = 'msg-' + Math.random().toString(36).substr(2, 9);
    const msg = { id, senderId: currentUser.id, receiverId: session.participantId, text: txt, timestamp: Date.now() };
    gun.get('flash_v1_messages').get(id).put(msg);

    const recipient = allUsers.find(u => u.id === session.participantId);
    if (recipient?.isBot) {
      const history = messages.filter(m => (m.senderId === currentUser.id && m.receiverId === recipient.id) || (m.senderId === recipient.id && m.receiverId === currentUser.id)).map(m => ({ role: m.senderId === currentUser.id ? 'user' : 'model', text: m.text }));
      const aiTxt = await getAiResponse(recipient.username, [...history, { role: 'user', text: txt }]);
      const bid = 'bot-msg-' + Math.random().toString(36).substr(2, 9);
      gun.get('flash_v1_messages').get(bid).put({ id: bid, senderId: recipient.id, receiverId: currentUser.id, text: aiTxt, timestamp: Date.now() });
    }
  };

  if (!currentUser) return <Auth mode={authMode} setMode={setAuthMode} onLogin={handleLogin} onRegister={handleRegister} />;

  const activeSess = sessions.find(s => s.id === activeSessionId);
  const activeRecipient = activeSess ? allUsers.find(u => u.id === activeSess.participantId) : null;

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar sessions={sessions} users={allUsers} activeSessionId={activeSessionId} onSelectSession={setActiveSessionId} onAddContact={addContact} currentUser={currentUser} onLogout={() => setCurrentUser(null)} />
      {activeRecipient ? (
        <ChatArea recipient={activeRecipient} messages={messages.filter(m => (m.senderId === currentUser.id && m.receiverId === activeRecipient.id) || (m.senderId === activeRecipient.id && m.receiverId === currentUser.id)).sort((a,b) => a.timestamp - b.timestamp)} onSendMessage={sendMessage} currentUserId={currentUser.id} />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-600">
          <div className="w-20 h-20 rounded-3xl flash-gradient flex items-center justify-center mb-6 animate-glow">
            <i className="fa-solid fa-bolt text-4xl text-white"></i>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">FLASH MESSENGER</h2>
          <p>Выберите чат или добавьте друга</p>
        </div>
      )}
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
