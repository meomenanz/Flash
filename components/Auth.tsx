
import React, { useState } from 'react';
import { AuthMode } from '../types';

interface AuthProps {
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onLogin: (u: string, p: string) => void;
  onRegister: (u: string, p: string) => void;
}

const Auth: React.FC<AuthProps> = ({ mode, setMode, onLogin, onRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    if (mode === 'login') onLogin(username, password);
    else onRegister(username, password);
  };

  if (mode === 'welcome') {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="z-10 text-center animate-in fade-in zoom-in duration-700">
          <h1 className="text-8xl font-black tracking-tighter mb-4 flash-gradient text-transparent bg-clip-text italic">
            FLASH
          </h1>
          <p className="text-slate-400 text-lg mb-8 tracking-widest font-light uppercase">Молниеносный мессенджер</p>
          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => setMode('register')}
              className="px-8 py-3 rounded-full flash-gradient font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-purple-500/20"
            >
              Начать работу
            </button>
            <button 
              onClick={() => setMode('login')}
              className="px-8 py-3 rounded-full border border-slate-700 bg-slate-900/50 hover:bg-slate-800 transition-colors font-bold"
            >
              Войти
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 p-6">
      <div className="w-full max-w-md bg-slate-900/50 border border-slate-800 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
        <h2 className="text-3xl font-bold mb-2 flash-gradient text-transparent bg-clip-text">
          {mode === 'login' ? 'С возвращением' : 'Создать аккаунт'}
        </h2>
        <p className="text-slate-400 mb-8">
          {mode === 'login' ? 'Войдите, чтобы продолжить общение.' : 'Присоединяйтесь к Flash для мгновенной связи.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Никнейм</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              placeholder="Придумайте имя"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Пароль</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all text-white"
              placeholder="Минимум 6 символов"
            />
          </div>
          <button 
            type="submit"
            className="w-full py-4 rounded-xl flash-gradient font-bold shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
          >
            {mode === 'login' ? 'Войти' : 'Зарегистрироваться'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500">
          {mode === 'login' ? (
            <p>Нет аккаунта? <button onClick={() => setMode('register')} className="text-purple-400 hover:underline">Регистрация</button></p>
          ) : (
            <p>Уже есть аккаунт? <button onClick={() => setMode('login')} className="text-purple-400 hover:underline">Вход</button></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
