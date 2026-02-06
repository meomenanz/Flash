
import React, { useState } from 'react';
import { User, ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  users: User[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onAddContact: (username: string) => void;
  currentUser: User;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  sessions, 
  users, 
  activeSessionId, 
  onSelectSession, 
  onAddContact,
  currentUser,
  onLogout
}) => {
  const [search, setSearch] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newContactName, setNewContactName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContactName.trim()) {
      onAddContact(newContactName.trim());
      setNewContactName('');
      setIsAdding(false);
    }
  };

  const filteredSessions = sessions.map(session => {
    const user = users.find(u => u.id === session.participantId);
    return { ...session, user };
  }).filter(s => s.user?.username.toLowerCase().includes(search.toLowerCase()));

  const isFlash = currentUser.id === 'sys-flash-id';

  return (
    <div className="w-80 border-r border-slate-800 bg-slate-900/30 flex flex-col h-full overflow-hidden">
      {/* Профиль */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={currentUser.avatar} alt="Profile" className="w-10 h-10 rounded-full border-2 border-purple-500 p-0.5" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-950"></div>
          </div>
          <div className="overflow-hidden">
            <h3 className="font-bold text-sm truncate flex items-center gap-1">
              {currentUser.username}
              {currentUser.isOfficial && <i className="fa-solid fa-circle-check text-[10px] text-blue-400"></i>}
            </h3>
            <p className="text-[10px] text-purple-400 uppercase tracking-widest font-bold">В сети</p>
          </div>
        </div>
        <button onClick={onLogout} className="p-2 hover:bg-red-500/20 hover:text-red-400 rounded-full text-slate-500 transition-all">
          <i className="fa-solid fa-power-off text-xs"></i>
        </button>
      </div>

      {/* Поиск и Добавление */}
      <div className="p-4 space-y-3">
        {!isAdding ? (
          <div className="flex gap-2">
            <div className="relative flex-1">
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs"></i>
              <input 
                type="text" 
                placeholder="Поиск..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-800/40 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
            <button onClick={() => setIsAdding(true)} className="p-2 bg-purple-600 hover:bg-purple-500 rounded-xl text-white shadow-lg shadow-purple-500/20 transition-all">
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
        ) : (
          <form onSubmit={handleAddSubmit} className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
            <input 
              autoFocus
              type="text" 
              placeholder="Никнейм..."
              value={newContactName}
              onChange={(e) => setNewContactName(e.target.value)}
              className="flex-1 bg-slate-800 border border-purple-500/50 rounded-xl px-3 py-2 text-sm focus:outline-none"
            />
            <button type="submit" className="p-2 bg-green-600 hover:bg-green-500 rounded-xl text-white"><i className="fa-solid fa-check"></i></button>
            <button type="button" onClick={() => setIsAdding(false)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400"><i className="fa-solid fa-xmark"></i></button>
          </form>
        )}
      </div>

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between items-center">
          <span>{isFlash ? 'Входящие запросы' : 'Ваши диалоги'}</span>
        </div>
        {filteredSessions.map(session => {
          const isSupportSession = session.participantId === 'sys-flash-id' && !isFlash;
          const displayName = isSupportSession ? 'Поддержка ⚡' : session.user?.username;
          
          return (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full flex items-center gap-3 p-4 transition-all hover:bg-slate-800/40 relative group ${activeSessionId === session.id ? 'bg-slate-800/80' : ''}`}
            >
              {activeSessionId === session.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 flash-gradient shadow-[2px_0_10px_rgba(168,85,247,0.5)]"></div>
              )}
              <div className="relative flex-shrink-0">
                <img src={isSupportSession ? 'https://api.dicebear.com/7.x/bottts/svg?seed=Support' : session.user?.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-slate-800 bg-slate-800" />
                {session.user?.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900"></div>}
              </div>
              <div className="flex-1 text-left overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className={`font-bold text-sm truncate flex items-center gap-1 ${isSupportSession ? 'text-purple-400' : 'text-slate-200'}`}>
                    {displayName}
                    {session.user?.isOfficial && <i className="fa-solid fa-circle-check text-[10px] text-blue-400"></i>}
                  </span>
                  {session.lastTimestamp && <span className="text-[10px] text-slate-500">{new Date(session.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
                </div>
                <p className="text-xs truncate mt-0.5 text-slate-500">
                  {session.lastMessage || (isSupportSession ? 'Нужна помощь? Напишите!' : 'Начните чат...')}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
