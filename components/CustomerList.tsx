import React, { useState, useEffect, useMemo } from 'react';
import { Search, UserPlus, Image as ImageIcon, MessageSquare, ChevronRight, ChevronLeft, Clock, AlertCircle, CheckCircle2, LayoutGrid, Users, Zap, Trash2, Edit } from 'lucide-react';
import { Customer, Platform, User } from '../types';
import { db } from '../services/db';

interface CustomerListProps {
  platform: Platform; 
  currentUser: User;
  onNavigateHome: () => void;
  onSelectCustomer: (id: string) => void;
  onCreateCustomer: () => void;
}

type TabType = 'all' | Platform;

const CustomerList: React.FC<CustomerListProps> = ({ platform: initialPlatform, currentUser, onNavigateHome, onSelectCustomer, onCreateCustomer }) => {
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>(initialPlatform);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await db.getCustomers(currentUser);
        setAllCustomers(data);
      } catch (error) {
        console.error("Failed to load customers", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentUser]);

  useEffect(() => {
    setActiveTab(initialPlatform);
  }, [initialPlatform]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm('确定要删除这位客户吗？删除后无法恢复。')) {
      await db.deleteCustomer(id);
      setAllCustomers(prev => prev.filter(c => c.id !== id));
    }
  };

  const filteredCustomers = useMemo(() => {
    let result = allCustomers;
    if (activeTab !== 'all') {
      result = result.filter(c => c.platform === activeTab);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.contactInfo.toLowerCase().includes(q) ||
        c.notes.includes(q)
      );
    }
    return result.sort((a, b) => (a.lastTrackedDate || 0) - (b.lastTrackedDate || 0));
  }, [allCustomers, activeTab, searchQuery]);

  const getLifecycleBadge = (dealDate?: number) => {
    if (!dealDate) return <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded">潜在客户</span>;
    const diffWeeks = Math.ceil((Date.now() - dealDate) / (1000 * 60 * 60 * 24 * 7));
    if (diffWeeks <= 2) return <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded">🚀 磨合期 | 第{diffWeeks}周</span>;
    if (diffWeeks <= 8) return <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-1 rounded">🤝 稳定期 | 第{diffWeeks}周</span>;
    if (diffWeeks <= 12) return <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded">⚠️ 续费期 | 第{diffWeeks}周</span>;
    return <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-1 rounded">🏁 已到期</span>;
  };

  const getTrackingBadge = (daysUntracked: number) => {
    if (daysUntracked <= 0) {
      return (
        <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700 w-fit font-medium">
          <CheckCircle2 size={10} /> 今日已跟进
        </div>
      );
    }
    if (daysUntracked > 14) {
      return (
        <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-red-600 to-red-500 text-white w-fit font-bold shadow-md shadow-red-500/30 animate-pulse">
          <AlertCircle size={10} /> ⚠️ {daysUntracked}天未跟进 (紧急)
        </div>
      );
    }
    if (daysUntracked > 3) {
      return (
        <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white w-fit font-bold shadow-sm shadow-orange-500/20">
          <Clock size={10} /> ⏳ {daysUntracked}天未跟进
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-full border border-green-300 bg-green-50/30 text-gray-500 w-fit font-medium">
        <Clock size={10} /> {daysUntracked}天未跟进
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col text-gray-800">
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
             <button onClick={onNavigateHome} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
               <ChevronLeft size={20} />
             </button>
             <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center text-white font-bold text-sm">R</div>
                <span className="text-base font-bold text-gray-800 tracking-tight">红鱼管家</span>
             </div>
          </div>
          
          {/* Enhanced Platform Switching Tabs */}
          <div className="flex items-center gap-1.5 md:gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm overflow-x-auto no-scrollbar">
             <button
                onClick={() => setActiveTab('all')}
                className={`relative px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-1 md:gap-2 outline-none whitespace-nowrap ${
                   activeTab === 'all' 
                   ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 scale-105 ring-1 ring-gray-900/50' 
                   : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
             >
                <LayoutGrid size={14} />
                <span>全部</span>
             </button>
             
             <div className="w-px h-4 bg-gray-200"></div>
             
             <button
                onClick={() => setActiveTab(Platform.XIAOHONGSHU)}
                className={`relative px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-1 md:gap-2 outline-none whitespace-nowrap ${
                   activeTab === Platform.XIAOHONGSHU 
                   ? 'bg-gradient-to-r from-[#ff2442] to-[#ff5c6b] text-white shadow-lg shadow-red-200 scale-105 ring-1 ring-red-200' 
                   : 'text-gray-500 hover:bg-red-50 hover:text-[#ff2442]'
                }`}
             >
                <Users size={14} />
                <span>小红书</span>
             </button>

             <button
                onClick={() => setActiveTab(Platform.XIANYU)}
                className={`relative px-3 py-1.5 rounded-lg text-xs md:text-sm font-bold transition-all duration-300 flex items-center gap-1 md:gap-2 outline-none whitespace-nowrap ${
                   activeTab === Platform.XIANYU 
                   ? 'bg-gradient-to-r from-[#ffda44] to-[#ffc107] text-gray-900 shadow-lg shadow-yellow-200 scale-105 ring-1 ring-yellow-200' 
                   : 'text-gray-500 hover:bg-yellow-50 hover:text-yellow-600'
                }`}
             >
                <Zap size={14} />
                <span>闲鱼</span>
             </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 py-6 md:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full md:w-[400px]">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="搜索客户、联系方式、备注..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:border-red-300 outline-none text-sm transition-all"
            />
          </div>
          <button onClick={onCreateCustomer} className="w-full md:w-auto bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm font-bold transition-transform hover:scale-105 active:scale-95">
            <UserPlus size={18} /> <span>添加客户</span>
          </button>
        </div>

        {isLoading ? (
           <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin"></div></div>
        ) : (
          <div className="space-y-3">
             {/* Desktop Headers */}
             <div className="hidden md:grid grid-cols-12 gap-6 px-6 py-2 text-xs font-bold text-gray-400">
                <div className="col-span-4">客户信息</div>
                <div className="col-span-3">联系方式</div>
                <div className="col-span-2">状态 / 跟进</div>
                <div className="col-span-2">资源数量</div>
                <div className="col-span-1 text-right">操作</div>
             </div>

             {filteredCustomers.length === 0 ? (
               <div className="text-center py-20 text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
                 <p>暂无客户数据，点击右上角添加</p>
               </div>
             ) : (
               filteredCustomers.map((customer) => {
                  const daysUntracked = Math.floor((Date.now() - (customer.lastTrackedDate || 0)) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={customer.id} onClick={() => onSelectCustomer(customer.id)} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-red-100 hover:shadow-md transition-all cursor-pointer group relative">
                      
                      {/* Mobile Layout (Card) */}
                      <div className="md:hidden flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                           <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md ${customer.platform === Platform.XIAOHONGSHU ? 'bg-[#ff2442]' : 'bg-[#ffda44]'}`}>
                                  {customer.name.charAt(0)}
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-800 text-base">{customer.name}</h3>
                                  <div className="flex gap-2 mt-1">
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded border ${customer.platform === Platform.XIAOHONGSHU ? 'bg-red-50 text-red-500 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                      {customer.platform === Platform.XIAOHONGSHU ? '小红书' : '闲鱼'}
                                    </span>
                                  </div>
                              </div>
                           </div>
                           <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onSelectCustomer(customer.id); }}
                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={18}/>
                              </button>
                              <button 
                                onClick={(e) => handleDelete(e, customer.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={18}/>
                              </button>
                           </div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-50 p-2 rounded-lg">
                           <MessageSquare size={14} className="text-gray-400"/> {customer.contactInfo || '暂无联系方式'}
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {getLifecycleBadge(customer.dealDate)}
                            {getTrackingBadge(daysUntracked)}
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1"><ImageIcon size={14}/><span className="text-xs font-bold text-gray-600">{customer.images.length} 图片</span></div>
                            <div className="flex items-center gap-1"><MessageSquare size={14}/><span className="text-xs font-bold text-gray-600">{customer.copywritings.length} 文案</span></div>
                        </div>
                      </div>

                      {/* Desktop Layout (Grid) */}
                      <div className="hidden md:grid grid-cols-12 gap-6 items-center">
                        <div className="col-span-4 flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold shadow-md transform transition-transform group-hover:scale-110 ${customer.platform === Platform.XIAOHONGSHU ? 'bg-[#ff2442]' : 'bg-[#ffda44]'}`}>
                              {customer.name.charAt(0)}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800 text-base">{customer.name}</h3>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border mt-1 inline-block ${customer.platform === Platform.XIAOHONGSHU ? 'bg-red-50 text-red-500 border-red-100' : 'bg-yellow-50 text-yellow-600 border-yellow-100'}`}>
                                 {customer.platform === Platform.XIAOHONGSHU ? '小红书' : '闲鱼'}
                              </span>
                           </div>
                        </div>
                        <div className="col-span-3 flex items-center gap-2 text-gray-600 text-sm"><MessageSquare size={16} className="text-gray-300"/> {customer.contactInfo}</div>
                        <div className="col-span-2 space-y-2">
                           {getLifecycleBadge(customer.dealDate)}
                           {getTrackingBadge(daysUntracked)}
                        </div>
                        <div className="col-span-2 flex items-center gap-4 text-gray-400">
                           <div className="flex items-center gap-1"><ImageIcon size={16}/><span className="text-sm font-bold text-gray-600">{customer.images.length}</span></div>
                           <div className="flex items-center gap-1"><MessageSquare size={16}/><span className="text-sm font-bold text-gray-600">{customer.copywritings.length}</span></div>
                        </div>
                        <div className="col-span-1 flex justify-end gap-1">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSelectCustomer(customer.id); }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="编辑"
                          >
                            <Edit size={16}/>
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, customer.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="删除"
                          >
                            <Trash2 size={16}/>
                          </button>
                        </div>
                      </div>

                    </div>
                  );
               })
             )}
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerList;