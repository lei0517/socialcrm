import React from 'react';
import { BookOpen, Users, Zap, Star, Tag, Settings, LogOut } from 'lucide-react';
import { Platform, User, UserRole } from '../types';

interface HomeProps {
  currentUser: User;
  onNavigate: (view: string, platform?: Platform) => void;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ currentUser, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative bg-[#f8f9fa] overflow-hidden selection:bg-red-200 font-sans">
      
      {/* Fixed Aurora Background - Prevents mobile scroll issues */}
      <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
         {/* Top Left Red Glow */}
         <div className="absolute -top-[20%] -left-[10%] w-[80vw] h-[80vw] bg-red-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob"></div>
         {/* Bottom Right Yellow Glow */}
         <div className="absolute -bottom-[20%] -right-[10%] w-[80vw] h-[80vw] bg-yellow-100/40 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
         {/* Center White Light */}
         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-white/40 blur-3xl"></div>
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 w-full p-6 flex justify-end items-center z-20">
         <div className="flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-top-4 duration-700 delay-100">
             <div className="flex items-center gap-3 bg-white/60 backdrop-blur-xl px-4 py-2 rounded-full shadow-sm border border-white/50 hover:bg-white transition-colors">
                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-bold">
                   {currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-gray-700 hidden sm:block">{currentUser.username}</span>
             </div>
             
             {currentUser.role === UserRole.SUPER_ADMIN && (
                <button
                   onClick={() => onNavigate('admin')}
                   className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-xl hover:bg-white rounded-full shadow-sm border border-white/50 text-gray-600 transition-all hover:text-blue-600 hover:scale-105 active:scale-95"
                   title="用户管理"
                >
                   <Settings size={20} />
                </button>
             )}
             
             <button
                onClick={onLogout}
                className="w-10 h-10 flex items-center justify-center bg-white/60 backdrop-blur-xl hover:bg-white rounded-full shadow-sm border border-white/50 text-gray-600 hover:text-red-600 transition-all hover:scale-105 active:scale-95"
                title="退出登录"
             >
                <LogOut size={20} />
             </button>
         </div>
      </div>

      {/* Main Content */}
      <div className="w-full max-w-6xl z-10 flex flex-col items-center mt-12 md:mt-0">
        
        {/* Title Section */}
        <header className="mb-10 text-center animate-in zoom-in-95 duration-700 w-full px-4 relative">
          <div className="flex flex-col items-center justify-center">
             <div className="flex items-center justify-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 text-white rounded-2xl flex items-center justify-center font-bold text-2xl shadow-lg shadow-red-500/20 transform -rotate-3">R</div>
             </div>
             <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tighter leading-none mb-3">
               Social<span className="text-[#ff2442]">CRM</span>
             </h1>
             <div className="flex items-center justify-center gap-4 text-gray-400">
                <div className="h-px w-6 bg-gray-300"></div>
                <h2 className="text-lg md:text-xl font-light tracking-[0.3em] text-gray-600">红鱼管家</h2>
                <div className="h-px w-6 bg-gray-300"></div>
             </div>
          </div>
          
          <div className="mt-6 flex justify-center">
             <div className="px-6 py-1.5 bg-white/50 backdrop-blur-md rounded-full border border-white/60 shadow-sm text-sm text-gray-600 font-medium">
               让每一位客户都成为您的 <span className="text-gray-900 font-bold">超级粉丝</span>
             </div>
          </div>
        </header>

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full mb-8 px-4 md:px-0">
          
          {/* Xiaohongshu Card */}
          <button
            onClick={() => onNavigate('list', Platform.XIAOHONGSHU)}
            className="group relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-red-500/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-red-500/30 text-left bg-white outline-none focus:outline-none"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#ff5a6e] to-[#ff2442] opacity-100 transition-transform duration-700 group-hover:scale-105"></div>
            <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                    <Users size={28} className="sm:w-8 sm:h-8" />
                  </div>
              </div>
              
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">小红书客户管理</h2>
                <p className="text-red-50 text-sm sm:text-base font-medium flex flex-wrap items-center gap-2 opacity-90">
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">深度种草</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">笔记管理</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">粉丝互动</span>
                </p>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:opacity-25 transition-all duration-700 ease-out transform group-hover:scale-110 group-hover:rotate-12">
               <Star size={240} className="text-white" fill="currentColor" strokeWidth={0} />
            </div>
          </button>

          {/* Xianyu Card */}
          <button
            onClick={() => onNavigate('list', Platform.XIANYU)}
            className="group relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-yellow-500/10 transition-all duration-500 hover:-translate-y-2 hover:shadow-yellow-500/30 text-left bg-white outline-none focus:outline-none"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-[#ffda44] to-[#ffc107] opacity-100 transition-transform duration-700 group-hover:scale-105"></div>
             <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

            <div className="relative z-10 p-8 sm:p-10 flex flex-col h-full justify-between">
              <div className="flex justify-between items-start">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 shadow-inner">
                    <Tag size={28} className="sm:w-8 sm:h-8" />
                  </div>
              </div>
              
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 tracking-tight">闲鱼客户管理</h2>
                <p className="text-yellow-50 text-sm sm:text-base font-medium flex flex-wrap items-center gap-2 opacity-90">
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">高效流转</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">快速回血</span>
                  <span className="bg-white/10 px-2 py-0.5 rounded-lg backdrop-blur-sm">信用变现</span>
                </p>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:opacity-25 transition-all duration-700 ease-out transform group-hover:scale-110 group-hover:-rotate-12">
               <Zap size={240} className="text-white" fill="currentColor" strokeWidth={0} />
            </div>
          </button>
        </div>

        {/* Manuals Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 md:px-0 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          
          <button
            onClick={() => onNavigate('manual', Platform.XIAOHONGSHU)}
            className="group relative h-36 rounded-[2rem] bg-red-50/60 hover:bg-red-50/80 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all p-6 sm:p-8 flex items-center gap-6 text-left overflow-hidden outline-none focus:outline-none"
          >
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-[#ff2442] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all shadow-md shadow-red-200/50 border border-red-50">
               <BookOpen size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
               <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#ff2442] transition-colors">小红书操作手册</h3>
               <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                  <span className="text-[10px] sm:text-xs font-bold text-red-500 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">运营技巧</span>
                  <span className="text-[10px] sm:text-xs font-bold text-red-500 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">避坑指南</span>
               </div>
            </div>
          </button>

          <button
            onClick={() => onNavigate('manual', Platform.XIANYU)}
            className="group relative h-36 rounded-[2rem] bg-yellow-50/60 hover:bg-yellow-50/80 backdrop-blur-xl border border-white/50 shadow-lg hover:shadow-xl hover:scale-[1.01] transition-all p-6 sm:p-8 flex items-center gap-6 text-left overflow-hidden outline-none focus:outline-none"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-white text-[#d9aa00] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:-rotate-3 transition-all shadow-md shadow-yellow-200/50 border border-yellow-50">
               <Zap size={28} className="sm:w-8 sm:h-8" strokeWidth={2.5} />
            </div>
            <div className="relative z-10">
               <h3 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-[#d9aa00] transition-colors">闲鱼操作手册</h3>
               <div className="flex flex-wrap gap-2 mt-2 sm:mt-3">
                  <span className="text-[10px] sm:text-xs font-bold text-yellow-600 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">话术模版</span>
                  <span className="text-[10px] sm:text-xs font-bold text-yellow-600 bg-white/60 px-2 py-1 rounded-md backdrop-blur-sm">交易流程</span>
               </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;