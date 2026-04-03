import React, { useState, useRef, useEffect } from 'react';
import {
  BrainCircuit, Plus, Send, Loader2, X, Trash2, Sparkles, Shuffle,
} from 'lucide-react';
import type { ChatSession, ChatMessage } from '@/types';
import { callAIProxy, extractText } from '@/services/aiProxy';

const PROVIDERS = ['Gemini', 'OpenRouter'] as const;
type Provider = typeof PROVIDERS[number];

const PROVIDER_MODELS: Record<Provider, { id: string; label: string; free?: boolean }[]> = {
  Gemini: [
    { id: 'gemini-2.0-flash',   label: 'Gemini 2.0 Flash',  free: true },
    { id: 'gemini-2.5-pro',     label: 'Gemini 2.5 Pro' },
  ],
  OpenRouter: [
    { id: 'meta-llama/llama-3.3-70b-instruct:free', label: 'Llama 3.3 70B', free: true },
    { id: 'google/gemini-2.0-flash-exp:free',        label: 'Gemini Flash',  free: true },
    { id: 'mistralai/mistral-7b-instruct:free',       label: 'Mistral 7B',   free: true },
    { id: 'deepseek/deepseek-chat-v3-0324:free',      label: 'DeepSeek V3',  free: true },
    { id: 'openai/gpt-4o-mini',                       label: 'GPT-4o Mini' },
    { id: 'anthropic/claude-3.5-haiku',               label: 'Claude Haiku' },
  ],
};

interface Props {
  chatSessions: ChatSession[];
  activeChatId: string | null;
  activeProvider: Provider;
  onSetSessions: (fn: (prev: ChatSession[]) => ChatSession[]) => void;
  onSetActiveChat: (id: string | null) => void;
  onSetProvider: (p: Provider) => void;
}

const SYSTEM = `You are an expert Al Wajer Pharmaceutical ERP assistant.
Help with formulations, business strategy, regulatory compliance, and operations.
Be concise, professional, and pharmaceutical-industry-accurate.`;

export const AICommand: React.FC<Props> = ({
  chatSessions, activeChatId, activeProvider,
  onSetSessions, onSetActiveChat, onSetProvider,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Record<Provider, string>>({
    Gemini: 'gemini-2.0-flash',
    OpenRouter: 'meta-llama/llama-3.3-70b-instruct:free',
  });
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
        title: s.messages.length === 0 ? userInput.slice(0, 45) : s.title,
        messages: [...s.messages, userMsg],
      };
    }));

    setIsLoading(true);
    try {
      const history = activeSession?.messages.map(m => ({
        role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
        content: m.text,
      })) ?? [];

      const provider = activeProvider.toLowerCase() as 'gemini' | 'openrouter';
      const res = await callAIProxy({
        provider,
        model: selectedModel[activeProvider],
        system: SYSTEM,
        messages: [...history, { role: 'user', content: userInput }],
      });

      const text = extractText(res, provider) || 'No response.';
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
      {/* Session list */}
      <div className="w-44 shrink-0 flex flex-col gap-2">
        <button onClick={createNewChat}
          className="w-full py-2 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all">
          <Plus size={12}/> New Chat
        </button>
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
          {activeSessions.map(s => (
            <div key={s.id}
              onClick={() => { onSetActiveChat(s.id); onSetProvider(s.provider as Provider); }}
              className={`group relative p-2.5 rounded-lg border cursor-pointer transition-all ${activeChatId === s.id ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50' : 'bg-slate-900/50 border-white/5 hover:border-white/20'}`}>
              <p className="text-xs font-bold text-white truncate pr-4">{s.title || 'New Chat'}</p>
              <p className={`text-[10px] font-bold ${s.provider === 'Gemini' ? 'text-blue-400' : 'text-emerald-400'}`}>{s.provider}</p>
              <p className="text-[9px] text-slate-600">{s.messages.length} msg</p>
              <button onClick={e => { e.stopPropagation(); archiveChat(s.id); }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"><X size={10}/></button>
            </div>
          ))}
          {archivedSessions.length > 0 && (
            <>
              <p className="text-[9px] text-slate-600 uppercase font-bold px-1 pt-2">History</p>
              {archivedSessions.map(s => (
                <div key={s.id}
                  onClick={() => { onSetSessions(prev => prev.map(x => x.id === s.id ? { ...x, archived: false } : x)); onSetActiveChat(s.id); }}
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
        {/* Provider + model selector */}
        <div className="flex flex-wrap gap-1.5 items-center bg-slate-900/50 border border-white/10 rounded-xl px-3 py-2 shrink-0">
          <button
            onClick={() => onSetProvider('Gemini')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${activeProvider === 'Gemini' ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' : 'border-transparent text-slate-500 hover:text-white'}`}>
            <Sparkles size={11}/> Gemini
          </button>
          <button
            onClick={() => onSetProvider('OpenRouter')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${activeProvider === 'OpenRouter' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'border-transparent text-slate-500 hover:text-white'}`}>
            <Shuffle size={11}/> OpenRouter
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"/>
          <select
            value={selectedModel[activeProvider]}
            onChange={e => setSelectedModel(prev => ({ ...prev, [activeProvider]: e.target.value }))}
            className="bg-transparent text-slate-400 text-[11px] border border-white/10 rounded-lg px-2 py-0.5 focus:outline-none focus:border-[#D4AF37]/40">
            {PROVIDER_MODELS[activeProvider].map(m => (
              <option key={m.id} value={m.id}>
                {m.label}{m.free ? ' ✓ Free' : ''}
              </option>
            ))}
          </select>
          <span className="ml-auto text-[10px] text-slate-600">Auto-fallback enabled</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-900/30 border border-white/5 rounded-xl p-4 space-y-3">
          {!activeSession ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <BrainCircuit className="text-slate-700 mb-3" size={40}/>
              <p className="text-slate-500 text-sm font-medium">Select a chat or create a new one</p>
              <p className="text-slate-600 text-xs mt-1">Gemini 2.0 Flash is active with Llama fallback</p>
            </div>
          ) : activeSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <BrainCircuit className="text-[#D4AF37]/40 mb-2" size={36}/>
              <p className="text-slate-500 text-sm">Ask anything about formulations, business, or operations.</p>
              <div className="flex flex-wrap gap-2 justify-center mt-2">
                {['Analyze batch yield', 'Optimize formulation cost', 'Draft export invoice', 'Market entry strategy'].map(q => (
                  <button key={q} onClick={() => setInput(q)}
                    className="text-[11px] text-slate-500 border border-white/10 hover:border-[#D4AF37]/30 hover:text-white px-2.5 py-1 rounded-lg transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeSession.messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#D4AF37] text-slate-950 font-medium rounded-br-sm'
                    : 'bg-slate-800/80 text-slate-200 border border-white/5 rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap break-words">{msg.text}</p>
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
          <div className="flex-1 relative">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything… (Enter to send, Shift+Enter for newline)"
              rows={1}
              className="w-full bg-slate-800/50 border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm focus:border-[#D4AF37]/50 focus:outline-none resize-none custom-scrollbar"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 bg-[#D4AF37] hover:bg-[#c4a030] text-slate-950 rounded-xl transition-all disabled:opacity-50">
            {isLoading ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
          </button>
        </div>
      </div>
    </div>
  );
};
