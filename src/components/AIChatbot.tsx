import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Bot, User } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { GoogleGenAI } from '@google/genai';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your BAZAR DALA AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: `You are a helpful eCommerce assistant for BAZAR DALA. Answer the user's question: ${userMsg}` }] }
        ],
        config: {
          systemInstruction: "You are a friendly, professional assistant for BAZAR DALA, a premium eCommerce store. You help users find products, track orders, and answer general questions about the store. Be concise and helpful."
        }
      });

      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "I'm sorry, I couldn't process that." }]);
    } catch (error) {
      console.error('Chat AI error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white rounded-none shadow-2xl border-2 border-slate-900 w-[350px] md:w-[400px] h-[500px] flex flex-col overflow-hidden mb-6"
          >
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex items-center justify-between border-b-2 border-slate-900">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#9B2B2C] rounded-none border-2 border-white flex items-center justify-center shadow-md">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black uppercase tracking-widest text-[#9B2B2C] italic leading-none mb-2 underline">AI_STATION_77</h3>
                  <p className="text-[10px] font-black opacity-60 uppercase tracking-[0.3em]">SECURE_FEED_ACTIVE</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-white hover:bg-[#9B2B2C] rounded-none border-2 border-transparent hover:border-white transition-all shadow-sm" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-6 bg-[#f8f8f8]" ref={scrollRef}>
              <div className="space-y-6">
                {messages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-none border-2 border-slate-900 flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-[#9B2B2C] text-white' : 'bg-white text-slate-600'}`}>
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      <div className={`p-4 rounded-none text-[12px] font-black uppercase tracking-tight shadow-md border-2 border-slate-900 ${msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="flex gap-4">
                      <div className="w-8 h-8 rounded-none border-2 border-slate-900 bg-white flex items-center justify-center shadow-sm">
                        <Bot className="h-4 w-4 text-slate-600" />
                      </div>
                      <div className="bg-white p-4 rounded-none border-2 border-slate-900 shadow-md">
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse" />
                          <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse [animation-delay:0.2s]" />
                          <div className="w-2 h-2 bg-[#9B2B2C] rounded-none animate-pulse [animation-delay:0.4s]" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-6 border-t-2 border-slate-900 bg-white">
              <div className="relative group">
                <Input
                  placeholder="INPUT_QUERY_HERE..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSend()}
                  className="pr-16 bg-[#f8f8f8] border-2 border-[#777] rounded-none h-14 text-[12px] font-black uppercase tracking-widest focus-visible:ring-0 shadow-inner placeholder:text-slate-400"
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 h-12 w-12 bg-slate-900 hover:bg-[#9B2B2C] rounded-none shadow-md border-2 border-slate-900 active:scale-95 transition-all"
                  onClick={handleSend}
                  disabled={loading}
                >
                  <Send className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        size="lg"
        className="h-16 w-16 rounded-none shadow-xl bg-slate-900 hover:bg-[#9B2B2C] p-0 border-2 border-slate-900 active:scale-95 transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-8 w-8 text-white" /> : <MessageSquare className="h-8 w-8 text-white" />}
      </Button>
    </div>
  );
};
