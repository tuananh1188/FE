import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, ShoppingCart, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { chatApi, type ChatHistoryEntry } from '../../api/chat.api';

export const ChatWidget = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{role: 'user' | 'model', text: string, products?: any[]}[]>([
        { role: 'model', text: 'Xin chào! Mình là trợ lý ảo của SPCK-X41. Mình có thể giúp gì cho bạn hôm nay?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        
        const newMessages = [...messages, { role: 'user' as const, text: userMessage }];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Convert to history format expected by Gemini API
            const history: ChatHistoryEntry[] = messages.slice(1).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }));

            const res = await chatApi.sendMessage(userMessage, history);
            if (res.data.success) {
                setMessages([...newMessages, { 
                    role: 'model', 
                    text: res.data.text,
                    products: res.data.products
                }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages([...newMessages, { role: 'model', text: 'Xin lỗi, hệ thống chat đang gặp sự cố. Vui lòng thử lại sau!' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden transition-all duration-300" style={{ height: '500px', maxHeight: '80vh' }}>
                    {/* Header */}
                    <div className="bg-[#FF6B00] text-white p-4 flex justify-between items-center shadow-md z-10 relative">
                        <div className="flex items-center gap-2">
                            <Bot size={24} />
                            <div>
                                <h3 className="font-bold text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>Trợ lý SPCK-X41</h3>
                                <p className="text-xs text-orange-100 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                    Luôn trực tuyến
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`flex-shrink-0 size-8 rounded-full flex items-center justify-center shadow-sm ${msg.role === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-[#FFF0E6] text-[#FF6B00]'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'}`}>
                                        {msg.text}
                                    </div>
                                </div>
                                
                                {msg.role === 'model' && msg.products && msg.products.length > 0 && (
                                    <div className="w-full pl-10 pr-2 overflow-x-auto no-scrollbar py-2">
                                        <div className="flex gap-3 min-w-max pb-1">
                                            {msg.products.map((product) => (
                                                <div 
                                                    key={product._id}
                                                    onClick={() => navigate(`/product/${product.slug || product._id}`)}
                                                    className="w-40 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-all flex flex-col group"
                                                >
                                                    <div className="relative aspect-square overflow-hidden bg-gray-50">
                                                        <img 
                                                            src={product.images?.[0] || '/products/electronics.png'} 
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                        {product.discount > 0 && (
                                                            <div className="absolute top-1 left-1 bg-red-500 text-white text-[9px] font-bold px-1 rounded">
                                                                -{product.discount}%
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 flex-1 flex flex-col justify-between">
                                                        <h4 className="text-[11px] font-semibold text-gray-800 line-clamp-2 leading-tight min-h-[2.4em]">
                                                            {product.name}
                                                        </h4>
                                                        <div className="mt-1">
                                                            <div className="flex flex-col">
                                                                <span className="text-[12px] font-bold text-[#FF6B00]">
                                                                    {(product.price * 25400).toLocaleString('vi-VN')}đ
                                                                </span>
                                                                {product.discount > 0 && (
                                                                    <span className="text-[9px] text-gray-400 line-through">
                                                                        {(product.originalPrice * 25400).toLocaleString('vi-VN')}đ
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button className="w-full mt-1.5 py-1 bg-[#FFF0E6] text-[#FF6B00] rounded-lg text-[9px] font-bold flex items-center justify-center gap-1 hover:bg-[#FF6B00] hover:text-white transition-colors">
                                                                <ShoppingCart size={10} />
                                                                Mua ngay
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2 max-w-[85%] mr-auto">
                                <div className="flex-shrink-0 size-8 rounded-full bg-[#FFF0E6] text-[#FF6B00] flex items-center justify-center shadow-sm">
                                    <Bot size={16} />
                                </div>
                                <div className="p-4 rounded-2xl bg-white text-gray-800 rounded-tl-none shadow-sm flex gap-1 items-center">
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                    <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-3 bg-white border-t border-gray-100">
                        <form onSubmit={handleSend} className="flex items-center gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00] rounded-full px-4 py-2 text-sm outline-none transition-all"
                                disabled={isLoading}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className={`p-2.5 rounded-full flex items-center justify-center shadow-sm transition-all ${!input.trim() || isLoading ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-[#FF6B00] text-white hover:bg-[#E65A00] cursor-pointer'}`}
                            >
                                <Send size={18} className={input.trim() && !isLoading ? "ml-0.5" : ""} />
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-[#FF6B00] hover:bg-[#E65A00] text-white rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30 transition-transform hover:scale-105 cursor-pointer z-50 relative"
            >
                {isOpen ? <X size={24} /> : <MessageCircle size={28} />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                    </span>
                )}
            </button>
        </div>
    );
};
