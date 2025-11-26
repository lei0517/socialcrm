import React, { useState } from 'react';
import { ChevronLeft, Edit2, BookOpen, Plus, Trash2, Copy, X } from 'lucide-react';
import { Platform, ManualSection } from '../types';
import { db } from '../services/db';

interface ManualViewProps {
  platform: Platform;
  onBack: () => void;
}

const ManualView: React.FC<ManualViewProps> = ({ platform, onBack }) => {
  const [manuals, setManuals] = useState<ManualSection[]>(db.getManuals(platform));
  const [viewingManual, setViewingManual] = useState<ManualSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<'tip' | 'guide'>('guide');

  const handleSave = () => {
    if (!editTitle.trim() || !editContent.trim()) return alert('内容不能为空');
    const newManual: ManualSection = { id: editingId || Date.now().toString(), title: editTitle, content: editContent, type: editType };
    
    if (editingId) {
      setManuals(prev => prev.map(m => m.id === editingId ? newManual : m));
    } else {
      setManuals(prev => [newManual, ...prev]);
    }
    setIsEditing(false);
  };

  const isXHS = platform === Platform.XIAOHONGSHU;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative text-gray-800">
       
       {viewingManual && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setViewingManual(null)}>
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden" onClick={e => e.stopPropagation()}>
               <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
                   <h2 className="font-bold text-gray-800 text-lg line-clamp-1 mr-4">{viewingManual.title}</h2>
                   <button onClick={() => setViewingManual(null)} className="p-2 hover:bg-gray-200 rounded-full"><X size={20} /></button>
               </div>
               <div className="p-8 overflow-y-auto custom-scrollbar">
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap">{viewingManual.content}</div>
               </div>
               <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                   <button onClick={() => { navigator.clipboard.writeText(viewingManual.content); alert('已复制'); }} className="bg-black text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 flex items-center gap-2"><Copy size={16}/> 复制内容</button>
               </div>
            </div>
         </div>
       )}

       {isEditing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">
               <h3 className="text-xl font-bold mb-6 text-gray-900">{editingId ? '编辑文档' : '新增文档'}</h3>
               <div className="space-y-4">
                  <input className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black transition-colors font-bold" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="标题" />
                  <select className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={editType} onChange={e => setEditType(e.target.value as any)}>
                    <option value="guide">📘 运营技巧</option>
                    <option value="tip">💡 避坑指南</option>
                  </select>
                  <textarea className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-black h-40 resize-none" value={editContent} onChange={e => setEditContent(e.target.value)} placeholder="正文内容..." />
                  <div className="flex justify-end gap-3 pt-4">
                    <button onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-500 hover:bg-gray-100 rounded-xl font-bold">取消</button>
                    <button onClick={handleSave} className="px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 font-bold">保存</button>
                  </div>
               </div>
            </div>
         </div>
       )}

       <header className={`backdrop-blur-md border-b sticky top-0 z-20 ${isXHS ? 'bg-red-50/80 border-red-100' : 'bg-yellow-50/80 border-yellow-100'}`}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={onBack} className="p-2 hover:bg-white/50 rounded-full transition-colors"><ChevronLeft size={24} /></button>
             <h1 className="text-lg font-bold text-gray-900">{isXHS ? '小红书运营知识库' : '闲鱼运营知识库'}</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-gray-900">文档列表</h2>
             <button onClick={() => {setIsEditing(true); setEditingId(null); setEditTitle(''); setEditContent('');}} className="bg-black text-white px-5 py-3 rounded-xl flex items-center gap-2 shadow-lg font-bold"><Plus size={18} /> 新建</button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {manuals.map((section) => (
               <div key={section.id} onClick={() => setViewingManual(section)} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden">
                  <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br rounded-bl-full opacity-20 ${section.type === 'tip' ? 'from-orange-400 to-red-400' : 'from-blue-400 to-purple-400'}`}></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-wide ${section.type === 'tip' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>{section.type === 'tip' ? '避坑' : '技巧'}</span>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={(e) => {e.stopPropagation(); setIsEditing(true); setEditingId(section.id); setEditTitle(section.title); setEditContent(section.content);}} className="p-1.5 bg-gray-100 rounded-lg hover:bg-black hover:text-white transition-colors"><Edit2 size={14}/></button>
                         <button onClick={(e) => {e.stopPropagation(); if(confirm('删除？')) setManuals(prev => prev.filter(m => m.id !== section.id));}} className="p-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={14}/></button>
                      </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">{section.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-3 mb-4 leading-relaxed">{section.content}</p>
                  <div className="pt-4 border-t border-gray-50 flex items-center gap-2 text-xs text-gray-400 font-bold group-hover:text-black transition-colors"><BookOpen size={14}/> 点击阅读全文</div>
               </div>
             ))}
           </div>
      </main>
    </div>
  );
};

export default ManualView;