import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Save, Sparkles, Image as ImageIcon, Copy, Trash, RefreshCw, Upload, Clock, Maximize2, X, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Customer, Platform, AiTextModel, AiImageModel, Copywriting, ImageAsset, User as UserType } from '../types';
import { db } from '../services/db';
import { generateCopywriting, generateImage } from '../services/geminiService';

interface CustomerDetailProps {
  customerId: string | 'new';
  platform: Platform;
  currentUser: UserType;
  onBack: () => void;
}

const CustomerDetail: React.FC<CustomerDetailProps> = ({ customerId, platform, currentUser, onBack }) => {
  const [customer, setCustomer] = useState<Customer>({
    id: Date.now().toString(),
    creatorId: currentUser.id,
    name: '',
    contactInfo: '',
    platform: platform,
    lastTrackedDate: Date.now(),
    images: [],
    copywritings: [],
    notes: ''
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [selectedTextModel, setSelectedTextModel] = useState<AiTextModel>(AiTextModel.DEEPSEEK);
  const [selectedImageModel, setSelectedImageModel] = useState<AiImageModel>(AiImageModel.DOUBAO);
  const [prompt, setPrompt] = useState('');
  const [imagePrompt, setImagePrompt] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllCopy, setShowAllCopy] = useState(false);
  const [expandedCopyIds, setExpandedCopyIds] = useState<Set<string>>(new Set());
  const [manualCopyContent, setManualCopyContent] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      if (customerId !== 'new') {
        const allAccessible = await db.getCustomers(currentUser);
        const found = allAccessible.find(c => c.id === customerId);
        if (found) setCustomer(found);
      }
      setIsLoading(false);
    };
    loadData();
  }, [customerId, currentUser]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async () => {
    const updatedCustomer = { ...customer, lastTrackedDate: Date.now() };
    setCustomer(updatedCustomer);
    await db.saveCustomer(updatedCustomer, currentUser);
    showToast('✅ 保存成功');
    if (customerId === 'new') setTimeout(onBack, 1000);
  };

  const handleAiText = async () => {
    if (!prompt) return showToast("⚠️ 请输入需求");
    setIsGeneratingText(true);
    try {
      const text = await generateCopywriting(prompt, selectedTextModel, platform);
      const newCopy: Copywriting = { id: Date.now().toString(), content: text, createdAt: Date.now(), isAiGenerated: true, modelUsed: selectedTextModel };
      setCustomer(prev => ({ ...prev, copywritings: [newCopy, ...prev.copywritings] }));
      setPrompt('');
      showToast('✨ 文案生成完毕');
    } catch (e) { showToast("❌ 生成失败"); } finally { setIsGeneratingText(false); }
  };

  const handleManualAddCopy = () => {
    if (!manualCopyContent.trim()) return showToast("⚠️ 内容不能为空");
    const newCopy: Copywriting = { id: Date.now().toString(), content: manualCopyContent, createdAt: Date.now(), isAiGenerated: false };
    setCustomer(prev => ({ ...prev, copywritings: [newCopy, ...prev.copywritings] }));
    setManualCopyContent('');
    showToast('📝 记录成功');
  };

  const handleAiImage = async () => {
    if (!imagePrompt) return showToast("⚠️ 请输入图片描述");
    setIsGeneratingImage(true);
    try {
      const base64Url = await generateImage(imagePrompt, selectedImageModel);
      const newImg: ImageAsset = { id: Date.now().toString(), url: base64Url, createdAt: Date.now(), isAiGenerated: true };
      setCustomer(prev => ({ ...prev, images: [newImg, ...prev.images] }));
      setImagePrompt('');
      showToast('🎨 图片生成完毕');
    } catch (e) { showToast("❌ 生成失败"); } finally { setIsGeneratingImage(false); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: ImageAsset = { id: Date.now().toString(), url: reader.result as string, createdAt: Date.now(), isAiGenerated: false };
        setCustomer(prev => ({ ...prev, images: [newImg, ...prev.images] }));
        showToast('📤 上传成功');
      };
      reader.readAsDataURL(file);
    }
  };

  const displayedImages = showAllImages ? customer.images : customer.images.slice(0, 4);
  const displayedCopywritings = showAllCopy ? customer.copywritings : customer.copywritings.slice(0, 5);
  const isXHS = platform === Platform.XIAOHONGSHU;
  const brandColor = isXHS ? 'text-red-500' : 'text-yellow-600';
  const brandBg = isXHS ? 'bg-red-500' : 'bg-yellow-500';
  
  // Dynamic gradient for buttons
  const actionGradient = isXHS 
    ? 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-red-500/30' 
    : 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 shadow-yellow-500/30';

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 relative pb-24">
      
      {/* Toast */}
      <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300 ${toastMessage ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}>
        <div className="bg-black/80 backdrop-blur text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 font-bold text-sm">
          {toastMessage}
        </div>
      </div>

      {/* Fullscreen Image */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200" onClick={() => setFullscreenImage(null)}>
           <button onClick={() => setFullscreenImage(null)} className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"><X size={24} /></button>
           <img src={fullscreenImage} alt="Full" className="max-w-[95vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-gray-100 transition-colors border border-gray-200">
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <div>
               <h1 className="text-lg md:text-xl font-bold text-gray-800 leading-none">{customer.name || '新客户'}</h1>
            </div>
          </div>
          <button 
            onClick={handleSave}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 text-white ${actionGradient}`}
          >
            <Save size={16} /> 保存
          </button>
        </div>
      </div>

      {/* Main Content: Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* Right Column (Basic Info & Lifecycle) - Info comes FIRST on mobile (order-1) */}
          <div className="lg:col-span-4 lg:col-start-9 order-1 lg:order-2 space-y-6">
             {/* Info Card */}
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center text-center">
                    <div className={`w-24 h-24 rounded-3xl ${brandBg} flex items-center justify-center text-white text-3xl font-bold shadow-xl mb-6 transform rotate-3`}>
                      {customer.name ? customer.name.charAt(0) : <User size={32}/>}
                    </div>
                    
                    <input 
                      value={customer.name}
                      onChange={e => setCustomer({...customer, name: e.target.value})}
                      className="text-2xl font-bold text-center bg-transparent border-b-2 border-transparent focus:border-gray-200 outline-none w-full pb-2 placeholder-gray-300 transition-all text-gray-800"
                      placeholder="输入客户姓名"
                    />
                    
                    <input 
                      value={customer.contactInfo}
                      onChange={e => setCustomer({...customer, contactInfo: e.target.value})}
                      className="text-sm font-medium text-gray-500 text-center bg-gray-50 rounded-xl px-4 py-2 mt-4 w-full outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 transition-all"
                      placeholder="输入联系方式 (微信/闲鱼号)"
                    />
                </div>
             </div>

             {/* Lifecycle Card */}
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-sm font-bold text-gray-400 mb-6 uppercase tracking-wider flex items-center gap-2">
                   <Clock size={16} /> 服务周期
                </h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-2xl p-4">
                     <label className="text-xs font-bold text-gray-400 ml-1 block mb-1">成单日期</label>
                     <input 
                       type="date"
                       value={customer.dealDate ? new Date(customer.dealDate).toISOString().split('T')[0] : ''}
                       onChange={e => setCustomer({...customer, dealDate: new Date(e.target.value).getTime()})}
                       className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none"
                     />
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                     <label className="text-xs font-bold text-gray-400 ml-1 block mb-1">服务到期</label>
                     <input 
                       type="date"
                       value={customer.expiryDate ? new Date(customer.expiryDate).toISOString().split('T')[0] : ''}
                       onChange={e => setCustomer({...customer, expiryDate: new Date(e.target.value).getTime()})}
                       className="w-full bg-transparent text-sm font-bold text-gray-700 outline-none"
                     />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400 ml-1 block mb-2 uppercase">备注</label>
                    <textarea 
                      value={customer.notes}
                      onChange={e => setCustomer({...customer, notes: e.target.value})}
                      className="w-full bg-gray-50 rounded-2xl p-4 text-sm text-gray-600 outline-none focus:bg-white focus:ring-2 focus:ring-gray-100 transition-colors resize-none h-32"
                      placeholder="记录特殊需求..."
                    />
                  </div>
                </div>
             </div>
          </div>

          {/* Left Column (Assets: Images & Copywriting) - Assets come SECOND on mobile (order-2) */}
          <div className="lg:col-span-8 lg:col-start-1 order-2 lg:order-1 space-y-8">
             
             {/* 1. Image Assets (Now on TOP) */}
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${brandBg}`}></div>
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <ImageIcon className={brandColor} size={24}/> 图片资产库
                     <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{customer.images.length}</span>
                   </h2>
                   <div className="flex gap-3 self-end md:self-auto">
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                      <button onClick={() => fileInputRef.current?.click()} className={`text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg ${actionGradient}`}>
                         <Upload size={14}/> 本地上传
                      </button>
                   </div>
                </div>

                {/* AI Image Generation */}
                <div className="bg-gray-50 rounded-2xl p-2 flex flex-col md:flex-row items-stretch md:items-center gap-3 pr-2 mb-8 border border-gray-200">
                   <div className="px-3 py-2 md:py-0 border-b md:border-b-0 md:border-r border-gray-200 flex items-center justify-between md:block">
                     <span className="md:hidden text-xs font-bold text-gray-400">模型:</span>
                     <select 
                        value={selectedImageModel}
                        onChange={(e) => setSelectedImageModel(e.target.value as AiImageModel)}
                        className="bg-transparent text-xs font-bold text-gray-600 outline-none cursor-pointer text-right md:text-left"
                     >
                       <option value={AiImageModel.DOUBAO}>豆包绘画</option>
                       <option value={AiImageModel.JIMENG}>即梦 AI</option>
                     </select>
                   </div>
                   <input 
                     value={imagePrompt}
                     onChange={(e) => setImagePrompt(e.target.value)}
                     placeholder="描述画面..." 
                     className="flex-1 bg-transparent py-2 px-2 outline-none text-sm text-gray-800 placeholder-gray-400"
                   />
                   <button 
                     onClick={handleAiImage}
                     disabled={isGeneratingImage}
                     className={`text-white p-2.5 rounded-xl transition-all shadow-md ${actionGradient} w-full md:w-auto flex justify-center`}
                   >
                     {isGeneratingImage ? <RefreshCw className="animate-spin" size={18} /> : <Sparkles size={18} />}
                   </button>
                </div>

                {/* Image Grid */}
                {customer.images.length === 0 ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <ImageIcon className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-gray-400 text-sm font-medium">暂无图片，请上传或生成</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {displayedImages.map((img) => (
                          <div key={img.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm hover:shadow-md transition-all">
                            <img src={img.url} alt="Asset" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-3 backdrop-blur-sm">
                                <button onClick={() => setFullscreenImage(img.url)} className="p-2 bg-white/20 hover:bg-white rounded-full text-white hover:text-black transition-all"><Maximize2 size={16}/></button>
                                <button onClick={() => {if(confirm('删除图片？')) setCustomer(prev => ({...prev, images: prev.images.filter(i => i.id !== img.id)}))}} className="p-2 bg-white/20 hover:bg-red-500 rounded-full text-white transition-all"><Trash size={16}/></button>
                            </div>
                          </div>
                      ))}
                    </div>
                    {customer.images.length > 4 && (
                      <button onClick={() => setShowAllImages(!showAllImages)} className="w-full mt-6 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 flex justify-center items-center gap-1">
                        {showAllImages ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {showAllImages ? '收起' : '查看更多图片'}
                      </button>
                    )}
                  </>
                )}
             </div>

             {/* 2. Copywriting (Now Below Images) */}
             <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-2 h-full ${brandBg}`}></div>
                <div className="flex items-center justify-between mb-8">
                   <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                     <Copy className={brandColor} size={24}/> 营销文案库
                     <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{customer.copywritings.length}</span>
                   </h2>
                </div>

                {/* AI Text Generator */}
                <div className="mb-8">
                   <div className="bg-gray-50 rounded-3xl p-4 border border-gray-200 focus-within:ring-2 focus-within:ring-gray-100 transition-all">
                      <div className="flex justify-between items-center mb-3 px-1">
                         <div className="text-xs font-bold text-gray-500 flex items-center gap-2">
                           <Sparkles size={12} className={brandColor}/> AI 智能创作
                         </div>
                         <select 
                            value={selectedTextModel}
                            onChange={(e) => setSelectedTextModel(e.target.value as AiTextModel)}
                            className="bg-white border border-gray-200 text-xs font-bold text-gray-600 rounded-lg px-2 py-1 outline-none"
                         >
                            {Object.values(AiTextModel).map(m => <option key={m} value={m}>{m}</option>)}
                         </select>
                      </div>
                      <textarea 
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="w-full bg-transparent rounded-xl outline-none text-sm resize-none h-24 text-gray-800 placeholder-gray-400"
                        placeholder="输入营销诉求，例如：写一篇小红书笔记..."
                      />
                      <div className="flex justify-end mt-2">
                        <button 
                          onClick={handleAiText}
                          disabled={isGeneratingText}
                          className={`text-white px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2 ${actionGradient}`}
                        >
                           {isGeneratingText ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                           {isGeneratingText ? '正在思考...' : '立即生成'}
                        </button>
                      </div>
                   </div>
                </div>
                
                {/* Manual Add Input (Always Visible) */}
                <div className="mb-6 relative">
                   <input 
                      value={manualCopyContent}
                      onChange={e => setManualCopyContent(e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 pr-20 text-sm outline-none focus:border-gray-400 shadow-sm"
                      placeholder="💡 有灵感？直接在此输入手动记录..."
                   />
                   <button 
                      onClick={handleManualAddCopy}
                      className="absolute right-3 top-2.5 bg-gray-100 text-gray-600 px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
                   >
                      添加
                   </button>
                </div>

                {/* List */}
                <div className="space-y-4">
                  {displayedCopywritings.map((copy, index) => (
                    <div key={copy.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-gray-300 hover:shadow-sm hover:bg-white transition-all group">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                             <span className="text-sm font-black text-gray-300 font-mono">#{String(index + 1).padStart(2, '0')}</span>
                             <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${copy.isAiGenerated ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                {copy.isAiGenerated ? 'AI' : '手动'}
                             </span>
                             <span className="text-[10px] text-gray-400 font-medium">
                               {new Date(copy.createdAt).toLocaleDateString()}
                             </span>
                          </div>
                          
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => {navigator.clipboard.writeText(copy.content); showToast('✅ 已复制')}} className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500"><Copy size={14}/></button>
                             <button onClick={() => setCustomer(prev => ({...prev, copywritings: prev.copywritings.filter(c => c.id !== copy.id)}))} className="p-1.5 bg-white border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-500 text-gray-400"><Trash size={14}/></button>
                          </div>
                       </div>
                       
                       <div 
                         className={`text-sm text-gray-700 leading-relaxed cursor-pointer whitespace-pre-wrap ${expandedCopyIds.has(copy.id) ? '' : 'line-clamp-2'}`}
                         onClick={() => {
                            const newSet = new Set(expandedCopyIds);
                            if(newSet.has(copy.id)) newSet.delete(copy.id); else newSet.add(copy.id);
                            setExpandedCopyIds(newSet);
                         }}
                       >
                          {copy.content}
                       </div>
                    </div>
                  ))}

                  {customer.copywritings.length > 5 && (
                    <button onClick={() => setShowAllCopy(!showAllCopy)} className="w-full py-3 text-xs font-bold text-gray-400 hover:text-gray-600 flex justify-center items-center gap-1 border-t border-gray-100 mt-4">
                       {showAllCopy ? <ChevronUp size={14}/> : <ChevronDown size={14}/>} {showAllCopy ? '收起列表' : `查看全部 (${customer.copywritings.length})`}
                    </button>
                  )}
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CustomerDetail;