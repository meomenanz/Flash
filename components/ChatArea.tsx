
import React, { useState, useEffect, useRef } from 'react';
import { User, Message } from '../types';

interface ChatAreaProps {
  recipient: User;
  messages: Message[];
  onSendMessage: (text: string) => void;
  currentUserId: string;
}

const EMOJIS = ['⚡', '🔥', '🚀', '❤️', '😂', '👍', '👋', '💀', '🤡', '✅'];

const ChatArea: React.FC<ChatAreaProps> = ({ recipient, messages, onSendMessage, currentUserId }) => {
  const [inputText, setInputText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
    setShowEmojis(false);
  };

  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const isFlash = currentUserId === 'sys-flash-id';

  return (
    <div className="flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-900/30 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={recipient.avatar} alt="Recipient" className="w-10 h-10 rounded-full border border-slate-700" />
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${recipient.status === 'online' ? 'bg-green-500' : 'bg-slate-500'}`}></div>
          </div>
          <div>
            <h2 className="font-bold text-slate-100 flex items-center gap-1">
              {recipient.username}
              {recipient.isOfficial && <i className="fa-solid fa-circle-check text-sm text-blue-400"></i>}
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              {recipient.isOfficial ? 'Официальный аккаунт' : recipient.status === 'online' ? 'В сети' : 'Не в сети'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-40">
            <i className="fa-solid fa-bolt text-5xl mb-4 text-purple-500"></i>
            <p className="text-sm">История сообщений с {recipient.username}</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            // Подсветка для Flash, что это входящий запрос
            const isSupportInbox = isFlash && !isMe && msg.isSupportRequest;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] group flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  {isSupportInbox && (
                    <span className="text-[10px] text-purple-400 font-bold uppercase mb-1 flex items-center gap-1">
                      <i className="fa-solid fa-headset"></i> Запрос из поддержки
                    </span>
                  )}
                  <div className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm relative ${
                    isMe 
                    ? 'bg-purple-600 text-white rounded-tr-none shadow-purple-500/20' 
                    : isSupportInbox 
                      ? 'bg-slate-800 text-slate-100 rounded-tl-none border-l-4 border-l-purple-500 border border-slate-700'
                      : 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900/20 border-t border-slate-800 relative">
        {showEmojis && (
          <div className="absolute bottom-full left-4 bg-slate-900 border border-slate-800 p-2 rounded-xl flex gap-2 mb-2 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => addEmoji(e)} className="hover:scale-125 transition-transform text-xl p-1">{e}</button>
            ))}
          </div>
        )}
        
        <form onSubmit={handleSend} className="max-w-4xl mx-auto flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => setShowEmojis(!showEmojis)}
            className={`p-2 transition-colors ${showEmojis ? 'text-purple-400' : 'text-slate-500 hover:text-purple-400'}`}
          >
            <i className="fa-solid fa-face-smile"></i>
          </button>
          <input 
            type="text" 
            placeholder={isFlash ? `Ответить пользователю ${recipient.username}...` : "Напишите сообщение..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-800/50 border border-slate-700 rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-slate-100"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all ${
              inputText.trim() ? 'flash-gradient text-white shadow-lg shadow-purple-500/30' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <i className="fa-solid fa-paper-plane text-sm"></i>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatArea;
