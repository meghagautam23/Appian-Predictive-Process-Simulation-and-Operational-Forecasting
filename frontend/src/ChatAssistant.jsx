import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Sparkles } from 'lucide-react';

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I am Honey AI. How can I help you optimize your workflow today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // 1. Add User Message
    const userMsg = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      // 2. Call Backend API
      const response = await fetch("http://127.0.0.1:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg.text }),
      });

      const data = await response.json();

      // 3. Add AI Message
      const aiMsg = { id: Date.now() + 1, text: data.reply, sender: 'ai' };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg = { id: Date.now() + 1, text: "Connection Error. Is the backend running?", sender: 'ai' };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* CHAT WINDOW */}
      {isOpen && (
        <div className="mb-4 w-[350px] h-[500px] bg-dashboard-800 border border-dashboard-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          
          {/* Header */}
          <div className="p-4 bg-dashboard-900 border-b border-dashboard-700 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-blue to-purple-500 flex items-center justify-center shadow-lg">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Honey AI Assistant</h3>
                <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-400">Online</span>
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-dashboard-800/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user' 
                    ? 'bg-brand-blue text-white rounded-tr-none' 
                    : 'bg-dashboard-700 text-slate-200 rounded-tl-none border border-dashboard-600'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                 <div className="bg-dashboard-700 px-4 py-3 rounded-2xl rounded-tl-none border border-dashboard-600 flex gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 bg-dashboard-900 border-t border-dashboard-700">
            <div className="flex items-center gap-2 bg-dashboard-800 rounded-full px-4 py-2 border border-dashboard-700 focus-within:border-brand-blue transition-colors">
              <input 
                type="text" 
                placeholder="Ask about SLAs, staff..." 
                className="flex-1 bg-transparent text-sm text-white focus:outline-none"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2 bg-brand-blue rounded-full text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (FAB) */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-gradient-to-r from-brand-blue to-purple-600 rounded-full shadow-lg hover:shadow-brand-blue/50 hover:scale-105 active:scale-95 transition-all flex items-center justify-center border border-white/20 group"
      >
        {isOpen ? <X size={28} className="text-white" /> : <Sparkles size={28} className="text-white animate-pulse" />}
        
        {/* Tooltip */}
        {!isOpen && (
            <span className="absolute right-16 bg-white text-dashboard-900 text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                Ask AI Assistant
            </span>
        )}
      </button>
    </div>
  );
};

export default ChatAssistant;