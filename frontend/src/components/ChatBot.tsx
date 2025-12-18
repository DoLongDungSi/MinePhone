// FILE: MinePhone/frontend/src/components/ChatBot.tsx
import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, ShoppingBag, Zap, Star } from 'lucide-react';
import { api } from '../api';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
}

const ChatBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Chào bạn! Mình là AI của MinePhone. Bạn đang tìm điện thoại tầm giá nào, hay hãng nào?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Gửi context để AI nhớ hội thoại cũ
      const context = messages.slice(-3).map(m => `${m.sender}: ${m.text}`).join('\n');
      const prompt = `Lịch sử chat:\n${context}\nKhách hàng: ${userMsg.text}`;

      const res = await api.post('/ai/chat', { message: prompt });
      const botMsg: Message = { id: Date.now() + 1, text: res.data.reply, sender: 'bot' };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: 'Mạng đang chập chờn, bạn thử lại nhé!', sender: 'bot' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  // --- HÀM XỬ LÝ TEXT: BIẾN **TEXT** THÀNH IN ĐẬM ---
  const formatText = (text: string) => {
    // 1. Tách chuỗi bởi ký tự **
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, index) => {
        // 2. Nếu đoạn text nằm giữa **, bỏ ** và in đậm
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index} className="font-black text-gray-900">{part.slice(2, -2)}</strong>;
        }
        // 3. Text thường
        return part;
    });
  };

  // --- RENDER CONTENT: XỬ LÝ CẢ CARD VÀ TEXT ---
  const renderContent = (text: string) => {
    const lines = text.split('\n'); // Xử lý từng dòng để giữ xuống dòng
    return lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // --- TRƯỜNG HỢP 1: VẼ THẺ SẢN PHẨM (CARD) ---
        if (trimmedLine.startsWith('@@PRODUCT|')) {
            const rawData = trimmedLine.replace(/^@@PRODUCT\|/, '').replace(/@@$/, '');
            const parts = rawData.split('|');

            if (parts.length >= 4) {
                const [id, name, price, image] = parts;
                
                return (
                    <div key={index} className="group relative bg-white rounded-2xl p-3 my-3 shadow-lg border border-gray-100 hover:-translate-y-1 transition-all duration-300 w-full max-w-[220px] ml-0">
                        {/* Nhãn Hot Deal */}
                        <div className="absolute top-0 left-0 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-tl-2xl rounded-br-lg z-10 shadow-md flex items-center gap-1">
                            <Zap size={10} fill="currentColor"/> HOT
                        </div>

                        {/* Vùng Ảnh (Đã fix lỗi bị trắng xoá) */}
                        <div className="w-full h-32 bg-white rounded-xl mb-3 flex items-center justify-center p-2 border border-gray-50 overflow-hidden">
                            <img 
                                src={image} 
                                alt={name} 
                                className="w-full h-full object-contain hover:scale-110 transition-transform duration-500"
                                onError={(e) => {
                                    // Fallback nếu ảnh lỗi thì hiện ảnh mặc định
                                    (e.target as HTMLImageElement).src = 'https://cdn-icons-png.flaticon.com/512/6124/6124998.png';
                                }}
                            />
                        </div>

                        {/* Thông tin */}
                        <div className="space-y-1">
                            <h4 className="font-bold text-gray-800 text-xs leading-snug line-clamp-2 min-h-[32px]" title={name}>
                                {name}
                            </h4>
                            
                            <div className="flex items-center justify-between">
                                <div className="text-blue-600 font-black text-sm">
                                    {price}
                                </div>
                                <div className="flex text-yellow-400 text-[8px]">
                                    {[1,2,3,4,5].map(i => <Star key={i} size={8} fill="currentColor"/>)}
                                </div>
                            </div>
                        </div>
                        
                        {/* Nút Mua */}
                        <button 
                            onClick={() => { navigate(`/product/${id}`); setIsOpen(false); }}
                            className="mt-3 w-full bg-black text-white text-[10px] font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-800 active:scale-95 transition-all shadow-md"
                        >
                            <ShoppingBag size={12}/> XEM NGAY
                        </button>
                    </div>
                );
            }
        }
        
        // --- TRƯỜNG HỢP 2: VẼ TEXT THƯỜNG (CÓ IN ĐẬM) ---
        if (trimmedLine === '') return <div key={index} className="h-2"></div>; // Khoảng trắng giữa các đoạn
        
        return (
            <div key={index} className="whitespace-pre-wrap mb-1 text-sm leading-relaxed text-gray-700">
                {formatText(line)} {/* Gọi hàm xử lý in đậm ở đây */}
            </div>
        );
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-black hover:bg-gray-800 text-white p-4 rounded-full shadow-2xl transition-transform hover:scale-110 flex items-center justify-center relative group"
        >
          <MessageCircle size={28} />
          {/* Chấm đỏ thông báo */}
          <span className="absolute top-0 right-0 flex h-4 w-4 -mt-1 -mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-[#F9FAFB] w-80 sm:w-[380px] h-[600px] max-h-[85vh] rounded-[24px] shadow-2xl flex flex-col border border-white overflow-hidden animate-slide-up ring-1 ring-black/5">
          {/* Header */}
          <div className="bg-white p-4 flex justify-between items-center shadow-sm z-20 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white shadow-lg">
                    <Bot size={20}/>
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Trợ lý MinePhone</h3>
                <p className="text-[10px] text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-full w-fit mt-0.5">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
              <X size={18} className="text-gray-500"/>
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar bg-[#F9FAFB]">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && (
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-black mr-2 mt-auto shrink-0 shadow-sm">
                        <Bot size={16}/>
                    </div>
                )}
                
                <div className={`max-w-[85%] ${
                    msg.sender === 'user' 
                    ? 'bg-black text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm' 
                    : '' // Bot không cần background màu, để text và card tự nhiên
                }`}>
                  {msg.sender === 'bot' ? renderContent(msg.text) : msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex items-center gap-2 text-gray-400 text-xs ml-12 animate-pulse">
                  <Loader2 className="animate-spin" size={12} />
                  <span>Đang nhập...</span>
               </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1.5 border border-transparent focus-within:border-black focus-within:bg-white transition-all shadow-inner">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Nhập tin nhắn..."
                    className="flex-1 bg-transparent px-3 py-2 text-sm outline-none text-gray-900 placeholder:text-gray-400"
                    autoFocus
                />
                <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white hover:scale-105 active:scale-95 transition-all shadow-md disabled:opacity-50 disabled:shadow-none"
                >
                    <Send size={16} />
                </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;