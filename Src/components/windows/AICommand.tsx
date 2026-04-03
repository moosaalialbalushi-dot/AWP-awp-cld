import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Plus, Send, Loader2, X, Trash2, Paperclip, Mic, MicOff,
} from 'lucide-react';
import type { ChatSession, ChatMessage } from '@/types';
import { callAIProxy, extractText } from '@/services/aiProxy';

const PROVIDERS = ['Gemini', 'Claude', 'OpenRouter'] as const;
type Provider = typeof PROVIDERS[number];

const PROVIDER_MODELS: Record<Provider, { id: string; label: string }[]> = {
  Gemini: [
    { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  ],
  Claude: [
    { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku' },
    { id: 'claude-sonnet-4-6', label: 'Claude Sonnet' },
    { id: 'claude-opus-4-6', label: 'Claude Opus' },
  ],
  OpenRouter: [
    { id: 'meta-llama/llama-3.3-70b-instruct', label: 'Llama 3.3 70B' },
    { id: 'mistralai/mistral-7b-instruct:free', label: 'Mistral 7B (Free)' },
    { id: 'google/gemini-2.0-flash-exp:free', label: 'Gemini Flash (Free)' },
    { id: 'deepseek/deepseek-chat', label: 'DeepSeek Chat' },
    { id: 'openai/gpt-4o-mini', label: 'GPT-4o Mini' },
    { id: 'anthropic/claude-3.5-haiku', label: 'Claude 3.5 Haiku' },
  ],
};

const PROVIDER_COLORS: Record<Provider, string> = {
  Gemini: 'text-blue-400',
  Claude: 'text-orange-400',
  OpenRouter: 'text-emerald-400',
};

interface Props {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeProvider: Provider;
  onSetSessions: (fn: (prev: ChatSession[]) => ChatSession[]) => void;
  onSetActiveChat: (id: string | null) => void;
  onSetProvider: (p: Provider) => void;
}

export const AICommand: React.FC<Props> = ({
  chatSessions, activeChatId, activeProvider,
  onSetSessions, onSetActiveChat, onSetProvider,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Record<Provider, string>>({
    Gemini: 'gemini-2.0-flash', Claude: 'claude-sonnet-4-6', OpenRouter: 'meta-llama/llama-3.3-70b-instruct',
  });
  const [isListening, setIsListening] = useState(false);
  const msgEndRef = useRef<HTMLDivElement>(null);

  const activeSession = chatSessions.find(s => s.id === activeChatId && !s.archived);

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.messages]);

  const createNewChat = () => {
    const id = `chat-${Date.now()}`;
    const session: ChatSession = {
      id, title: 'New Chat', provider: activeProvider, messages: [], archived: false, createdAt: Date.now(),
    };
    onSetSessions(prev => [...prev, session]);
    onSetActiveChat(id);
  };

  const archiveChat = (id: string) => {
    onSetSessions(prev => prev.map(s => s.id === id ? { ...s, archived: true } : s));
    if (activeChatId === id) onSetActiveChat(null);
  };

  const deleteChat = (id: string) => {
    onSetSessions(prev => prev.filter(s => s.id !== id));
    if (activeChatId === id) onSetActiveChat(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    if (!activeChatId) { createNewChat(); return; }

    const userMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'user', text: input.trim(), timestamp: Date.now() };
    const userInput = input.trim();
    setInput('');

    onSetSessions(prev => prev.map(s => {
      if (s.id !== activeChatId) return s;
      return {
        ...s,
        provider: activeProvider,
        title: s.messages.length === 0 ? userInput.slice(0, 40) : s.title,
        messages: [...s.messages, userMsg],
      };
    }));

    setIsLoading(true);
    try {
      const history = activeSession?.messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      })) ?? [];

      const res = await callAIProxy({
        provider: activeProvider.toLowerCase() as 'gemini' | 'claude' | 'openrouter',
        model: selectedModel[activeProvider],
        system: 'You are an expert Al Wajer Pharmaceutical ERP assistant. Help with formulations, business strategy, regulatory, and operations.',
        messages: [...history, { role: 'user', content: userInput }],
      });

      const text = extractText(res, activeProvider.toLowerCase()) || 'No response.';
      const modelMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'model', text, timestamp: Date.now() };

      onSetSessions(prev => prev.map(s => s.id === activeChatId ? { ...s, messages: [...s.messages, modelMsg] } : s));
    } catch (e) {
      const errMsg: ChatMessage = { id: `m-${Date.now()}`, role: 'model', text: `Error: ${String(e)}`, timestamp: Date.now() };
      onSetSessions(prev => prev.map(s => s.id === activeChatId ? { ...s, messages: [...s.messages, errMsg] } : s));
    } finally {
      setIsLoading(false);
    }
  };

  const activeSessions = chatSessions.filter(s => !s.archived);
  const archivedSessions = chatSessions.filter(s => s.archived && s.messages.length > 0);

  return (
    <div className="flex gap-3 animate-fadeIn" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
      {/* Sidebar */}
      <div className="w-44 shrink-0 flex flex-col gap-2">
        <button onClick={createNewChat} className="w-full py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all">
          <Plus size={12}/> New Chat
        </button>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {activeSessions.map(s => (
            <div key={s.id} onClick={() => { onSetActiveChat(s.id); onSetProvider(s.provider as Provider); }}
              className={`group relative p-2.5 rounded-lg border cursor-pointer transition-all ${activeChatId === s.id ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}>
              <p className="text-xs font-bold text-white truncate pr-4">{s.title || 'New Chat'}</p>
              <p className={`text-[10px] font-bold ${PROVIDER_COLORS[s.provider as Provider] || 'text-slate-500'}`}>{s.provider}</p>
              <p className="text-[9px] text-slate-600">{s.messages.length} msg</p>
              <button onClick={e => { e.stopPropagation(); archiveChat(s.id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"><X size={10}/></button>
            </div>
          ))}
          {archivedSessions.length > 0 && (
            <>
              <p className="text-[9px] text-slate-600 uppercase font-bold px-1 pt-2">History</p>
              {archivedSessions.map(s => (
                <div key={s.id} onClick={() => { onSetSessions(prev => prev.map(x => x.id === s.id ? { ...x, archived: false } : x)); onSetActiveChat(s.id); }}
                  className="group relative p-2 rounded-lg border border-white/5 bg-slate-900/20 cursor-pointer hover:border-white/10 transition-all">
                  <p className="text-[10px] text-slate-500 truncate pr-4">{s.title}</p>
                  <button onClick={e => { e.stopPropagation(); deleteChat(s.id); }}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 text-slate-700 hover:text-red-400"><Trash2 size={9}/></button>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Provider bar */}
        <div className="flex flex-wrap gap-1.5 items-center bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 shrink-0">
          {PROVIDERS.map(p => (
            <button key={p} onClick={() => onSetProvider(p)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${activeProvider === p ? `bg-${p === 'Gemini' ? 'blue' : p === 'Claude' ? 'orange' : 'emerald'}-500/10 border-${p === 'Gemini' ? 'blue' : p === 'Claude' ? 'orange' : 'emerald'}-500/30 ${PROVIDER_COLORS[p]}` : 'border-transparent text-slate-500 hover:text-white'}`}>
              {p === 'Claude' ? '🤖 Claude' : p === 'Gemini' ? '✨ Gemini' : '🔀 OpenRouter'}
            </button>
          ))}
          <div className="w-px h-4 bg-white/10 mx-1"/>
          <select
            value={selectedModel[activeProvider]}
            onChange={e => setSelectedModel(prev => ({ ...prev, [activeProvider]: e.target.value }))}
            className="bg-transparent text-slate-400 text-[11px] border border-white/10 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#D4AF37]/40"
          >
            {PROVIDER_MODELS[activeProvider].map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30 border border-white/5 rounded-xl p-4 space-y-3">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BrainCircuit className="text-slate-700 mb-3" size={40}/>
              <p className="text-slate-500 text-sm">Select a chat or create a new one to start.</p>
            </div>
          ) : activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BrainCircuit className="text-[#D4AF37]/40 mb-3" size={36}/>
              <p className="text-slate-500 text-sm">Ask anything about formulations, business, or operations.</p>
            </div>
          ) : (
            activeSession.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#D4AF37] text-slate-950 font-medium rounded-br-sm'
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800/80 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-[#D4AF37]"/>
                <span className="text-slate-400 text-sm">Thinking…</span>
              </div>
            </div>
          )}
          <div ref={msgEndRef}/>
        </div>

        {/* Input */}
        <div className="flex gap-2 shrink-0">
          <button title="Attach file" className="p-2.5 text-slate-500 hover:text-white bg-slate-800 rounded-xl border border-white/10 transition-all">
            <Paperclip size={15}/>
          </button>
          <button
            onClick={() => setIsListening(l => !l)}
            className={`p-2.5 rounded-xl border transition-all ${isListening ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-slate-800 border-white/10 text-slate-500 hover:text-white'}`}
            title="Voice input"
          >
            {isListening ? <MicOff size={15}/> : <Mic size={15}/>}
          </button>
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything… (Shift+Enter for newline)"
              rows={1}
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none resize-none custom-scrollbar"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 rounded-xl transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
          </button>
        </div>
      </div>
    </div>
  );
};
