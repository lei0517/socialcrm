import React, { useState } from 'react';
import { User } from '../types';
import { db } from '../services/db';
import { ChevronRight, ShieldCheck } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const user = await db.login(username, password);
      if (user) {
        onLogin(user);
      } else {
        setError('用户名或密码错误');
      }
    } catch (err) {
      setError('登录请求失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-gray-50">
      {/* Colorful Blobs Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>

      {/* Glass Card */}
      <div className="relative w-full max-w-md p-8 mx-4 glass-panel rounded-3xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
           <div className="w-16 h-16 bg-gradient-to-tr from-red-500 to-orange-400 text-white rounded-2xl flex items-center justify-center mb-4 shadow-lg transform rotate-3">
             <div className="text-3xl font-black">R</div>
           </div>
           <h1 className="text-2xl font-bold text-gray-800 tracking-tight">欢迎回来</h1>
           <p className="text-gray-500 text-sm mt-1">红鱼管家 · 智能CRM系统</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-4">
             <input 
               type="text"
               value={username}
               onChange={(e) => setUsername(e.target.value)}
               className="w-full px-5 py-3 rounded-xl bg-white/50 border border-white/60 focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none transition-all placeholder-gray-400 text-gray-700"
               placeholder="账号"
             />
             <input 
               type="password"
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               className="w-full px-5 py-3 rounded-xl bg-white/50 border border-white/60 focus:bg-white focus:ring-2 focus:ring-red-200 focus:border-red-300 outline-none transition-all placeholder-gray-400 text-gray-700"
               placeholder="密码"
             />
          </div>

          {error && (
            <div className="text-red-500 text-xs text-center font-medium bg-red-50 py-2 rounded-lg flex items-center justify-center gap-1">
              <ShieldCheck size={14} />
              {error}
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-gray-900 to-gray-800 hover:from-black hover:to-gray-900 text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 mt-2"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
                <>
                  <span>立即登录</span>
                  <ChevronRight size={18} />
                </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;