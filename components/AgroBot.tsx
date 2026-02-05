import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';
import { ChatMessage } from '../types';

type Emotion = 'NEUTRAL' | 'HAPPY' | 'THINKING' | 'LOVE' | 'SURPRISED';

// Custom Avatar Component: "Célestin"
const CelestinAvatar: React.FC<{ size?: number, emotion?: Emotion }> = ({ size = 40, emotion = 'NEUTRAL' }) => {
  
  // Dynamic Eye Logic
  const renderEyes = () => {
    switch (emotion) {
      case 'HAPPY':
        // Squinting happy eyes ^ ^
        return (
          <>
             <path d="M35 52 Q40 48 45 52" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round"/>
             <path d="M55 52 Q60 48 65 52" stroke="#374151" strokeWidth="3" fill="none" strokeLinecap="round"/>
          </>
        );
      case 'LOVE':
        // Heart eyes
        return (
          <>
            <path d="M35 52 l2 2 l2 -2 a2.5 2.5 0 0 0 -4 0" fill="#ec4899" />
            <path d="M61 52 l2 2 l2 -2 a2.5 2.5 0 0 0 -4 0" fill="#ec4899" />
          </>
        );
      case 'SURPRISED':
        // Wide eyes
        return (
          <>
             <circle cx="40" cy="50" r="5" fill="#374151" />
             <circle cx="60" cy="50" r="5" fill="#374151" />
             <circle cx="42" cy="48" r="1.5" fill="white" />
             <circle cx="62" cy="48" r="1.5" fill="white" />
          </>
        );
      case 'THINKING':
        // One eye looking up/sideways
        return (
          <>
             <circle cx="40" cy="48" r="3" fill="#374151" />
             <circle cx="60" cy="50" r="3" fill="#374151" />
          </>
        );
      default: // NEUTRAL
        return (
          <>
            <circle cx="40" cy="50" r="3" fill="#374151">
                <animate attributeName="ry" values="3;0.5;3" dur="4s" repeatCount="indefinite" begin="1s"/>
            </circle>
            <circle cx="60" cy="50" r="3" fill="#374151">
                <animate attributeName="ry" values="3;0.5;3" dur="4s" repeatCount="indefinite" begin="1s"/>
            </circle>
          </>
        );
    }
  };

  // Dynamic Mouth Logic
  const renderMouth = () => {
    switch (emotion) {
      case 'HAPPY':
      case 'LOVE':
        return <path d="M35 62 Q50 75 65 62" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />;
      case 'SURPRISED':
        return <ellipse cx="50" cy="65" rx="5" ry="6" fill="#92400e" />;
      case 'THINKING':
        return <path d="M42 65 Q50 65 58 65" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />;
      default: // NEUTRAL
        return <path d="M40 65 Q50 68 60 65" stroke="#92400e" strokeWidth="2" fill="none" strokeLinecap="round" />;
    }
  };

  // Dynamic Animation Class
  const getAnimationClass = () => {
      if (emotion === 'HAPPY' || emotion === 'LOVE') return 'animate-bounce-slight';
      if (emotion === 'THINKING') return 'animate-pulse-slow';
      if (emotion === 'SURPRISED') return 'animate-wiggle';
      return '';
  };

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={`drop-shadow-md overflow-visible ${getAnimationClass()}`}>
      <style>
        {`
          @keyframes wiggle { 0%, 100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }
          @keyframes bounce-slight { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-2px); } }
          .animate-wiggle { animation: wiggle 0.5s ease-in-out infinite; }
          .animate-bounce-slight { animation: bounce-slight 2s ease-in-out infinite; }
        `}
      </style>
      <defs>
        <linearGradient id="hatGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fcd34d" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="skinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fde68a" />
          <stop offset="100%" stopColor="#fcd34d" />
        </linearGradient>
      </defs>
      
      {/* Body/Shirt */}
      <path d="M20 90 Q50 100 80 90 L80 100 L20 100 Z" fill="#059669" />
      
      {/* Head */}
      <circle cx="50" cy="55" r="30" fill="url(#skinGradient)" />
      
      {/* Expressions */}
      {renderEyes()}
      {/* Cheeks (Always visible but subtler) */}
      <circle cx="35" cy="58" r="4" fill="#f87171" opacity="0.4" />
      <circle cx="65" cy="58" r="4" fill="#f87171" opacity="0.4" />
      {renderMouth()}

      {/* Straw Hat */}
      <ellipse cx="50" cy="35" rx="45" ry="12" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
      <path d="M25 35 Q50 10 75 35" fill="url(#hatGradient)" stroke="#d97706" strokeWidth="2" />
      
      {/* The Sprout on the hat */}
      <g transform="translate(65, 15) rotate(10)">
         <path d="M0 0 Q5 -10 10 -5 Q5 0 0 0" fill="#22c55e" stroke="#15803d" strokeWidth="1" />
         <path d="M0 0 Q-5 -8 -10 -3 Q-5 0 0 0" fill="#4ade80" stroke="#15803d" strokeWidth="1" />
         <animateTransform attributeName="transform" type="rotate" values="10 0 0; 20 0 0; 10 0 0" dur="3s" repeatCount="indefinite" />
      </g>
    </svg>
  );
};

export const AgroBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: 'Bonjour ! Je m\'appelle Célestin. 🌾\nJe suis l\'apprenti jardinier de la maison. Une question sur vos plantes ou nos horaires ?',
      timestamp: new Date()
    }
  ]);
  const [currentEmotion, setCurrentEmotion] = useState<Emotion>('HAPPY');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  // Hide tooltip after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setCurrentEmotion('THINKING'); // Avatar thinks while waiting

    // Prepare history for API (strip emotions from history if we stored them raw, 
    // but we store clean text so it's fine)
    const history = messages.map(m => ({ role: m.role, text: m.text }));
    
    const rawResponse = await sendMessageToGemini(history, userMsg.text);

    // Parse Emotion Tag e.g. [HAPPY]
    let emotion: Emotion = 'NEUTRAL';
    let cleanText = rawResponse;

    const emotionMatch = rawResponse.match(/^\[(HAPPY|THINKING|LOVE|SURPRISED|NEUTRAL)\]\s*/);
    
    if (emotionMatch) {
        emotion = emotionMatch[1] as Emotion;
        cleanText = rawResponse.replace(/^\[(HAPPY|THINKING|LOVE|SURPRISED|NEUTRAL)\]\s*/, '');
    }

    setCurrentEmotion(emotion);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: cleanText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      {/* Floating Tooltip Bubble */}
      {!isOpen && showTooltip && (
        <div className="bg-white px-4 py-2 rounded-xl rounded-tr-none shadow-lg border border-emerald-100 mb-2 animate-fade-in origin-bottom-right">
            <p className="text-sm font-medium text-slate-700 flex items-center gap-2">
                👋 Besoin d'un conseil vert ?
            </p>
        </div>
      )}

      {!isOpen && (
        <button
          onClick={() => { setIsOpen(true); setShowTooltip(false); }}
          className="group relative bg-white hover:bg-emerald-50 text-slate-800 rounded-full p-2 pr-6 shadow-xl border-2 border-emerald-500 transition-all hover:scale-105 flex items-center gap-3"
        >
          <div className="bg-emerald-100 rounded-full p-1">
             {/* Show Happy face on the button by default */}
             <CelestinAvatar size={48} emotion="HAPPY" />
          </div>
          <div className="text-left">
             <span className="block font-bold text-emerald-800 text-sm">Célestin</span>
             <span className="block text-[10px] text-emerald-600 font-medium uppercase tracking-wide">Jardinier Virtuel</span>
          </div>
          
          {/* Status Dot */}
          <span className="absolute top-2 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full">
             <span className="absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 animate-ping"></span>
          </span>
        </button>
      )}

      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-[350px] sm:w-[400px] h-[550px] flex flex-col border-2 border-emerald-500 overflow-hidden animate-fade-in origin-bottom-right">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 flex justify-between items-center text-white relative overflow-hidden transition-colors duration-500">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                 <svg width="100%" height="100%">
                     <pattern id="leaf-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                         <path d="M10 0 Q15 5 20 0 L10 10 Z" fill="white"/>
                     </pattern>
                     <rect width="100%" height="100%" fill="url(#leaf-pattern)" />
                 </svg>
            </div>

            <div className="flex items-center gap-3 relative z-10">
              <div className="bg-white/20 backdrop-blur-sm p-1.5 rounded-full border border-white/30 shadow-inner transition-transform duration-300 transform hover:scale-110">
                {/* THE LIVE AVATAR */}
                <CelestinAvatar size={42} emotion={currentEmotion} />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Célestin</h3>
                <p className="text-xs text-emerald-100 font-medium flex items-center gap-1">
                   <Sparkles size={10} className="text-yellow-300"/> 
                   {isTyping ? 'Réfléchit...' : 'Apprenti Jardinier'}
                </p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-2 rounded-full transition relative z-10">
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4 scroll-smooth">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start items-end gap-2'}`}
              >
                {msg.role === 'model' && (
                    <div className="mb-2 shrink-0 opacity-70 scale-75 origin-bottom-left">
                         {/* Small static avatar for message history */}
                         <CelestinAvatar size={24} emotion="NEUTRAL" />
                    </div>
                )}
                
                <div
                  className={`max-w-[80%] rounded-2xl p-3 text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <span className={`text-[10px] mt-1 block opacity-70 ${msg.role === 'user' ? 'text-emerald-100 text-right' : 'text-slate-400'}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start items-end gap-2">
                 <div className="mb-2 shrink-0">
                    {/* Typing state avatar */}
                    <CelestinAvatar size={28} emotion="THINKING" />
                 </div>
                 <div className="bg-white border border-slate-200 rounded-2xl p-3 rounded-bl-none flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-slate-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez votre question..."
                className="flex-1 bg-slate-50 text-slate-900 border border-slate-200 rounded-full px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition-all placeholder:text-slate-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 disabled:opacity-50 transition shadow-md hover:shadow-lg transform active:scale-95"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-[10px] text-center text-slate-400 mt-2 flex justify-center items-center gap-1">
               <span>Powered by Gemini</span> • <span>Célestin apprend encore</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};