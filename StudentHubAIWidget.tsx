import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  RefreshCw, 
  Copy, 
  Check, 
  Maximize2, 
  Minimize2, 
  Trash2, 
  Volume2, 
  HelpCircle,
  BookOpen,
  Languages,
  Clock,
  Layers,
  ChevronDown
} from 'lucide-react';
import { api } from '../../lib/api.js';
import { AIChatMessage } from '../../types/index.js';
import { AI_QUICK_STUDY_PROMPTS } from '../../data/sriLankaData.js';
import { useLanguage } from '../../context/LanguageContext.js';
import { useToast } from '../common/Toast.js';

interface StudentHubAIWidgetProps {
  onNavigateToFullAI?: () => void;
}

export const StudentHubAIWidget: React.FC<StudentHubAIWidgetProps> = ({ onNavigateToFullAI }) => {
  const { language } = useLanguage();
  const { success, error: toastError } = useToast();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [messages, setMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('studenthub_ai_widget_chats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-1',
        role: 'model',
        content: `👋 **Ayubowan & Welcome to StudentHub AI!** 🇱🇰🎓\n\nI am your personalized Sri Lankan academic tutor and study companion. I can help you with:\n\n* **G.C.E. O/L & A/L** concepts (Combined Maths, Physics, Chemistry, Biology, Commerce, Arts, Tech)\n* **Step-by-step problem solving & derivations**\n* **Practice quiz questions & past paper tips**\n* **Sinhala (සිංහල), Tamil (தமிழ்) and English translations**\n* **ICT, programming & revision timetables**\n\nHow can I help your studies today?`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [selectedStream, setSelectedStream] = useState<string>('General / G.C.E. A/L');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_ai_widget_chats', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send conversation to server-side Gemini API
      const res = await api.aiChat({
        messages: newHistory.map(m => ({ role: m.role, content: m.content })),
        gradeLevel: selectedStream,
        targetLanguage: language === 'si' ? 'Sinhala' : language === 'ta' ? 'Tamil' : 'English'
      });

      const modelMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.content || 'I could not process that request. Please try again.',
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      toastError(err.message || 'Failed to connect to StudentHub AI');
      const errorMsg: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Study Assistant Notice:**\n${err.message || 'Could not retrieve response.'}\n\n*Please ensure your question is clear or check your network connection.*`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeak = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      toastError('Text-to-speech is not supported in this browser');
      return;
    }

    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown characters for TTS
    const plainText = text.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1.0;
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearHistory = () => {
    const defaultWelcome: AIChatMessage = {
      id: `welcome-${Date.now()}`,
      role: 'model',
      content: `👋 **Ayubowan! Chat history cleared.**\n\nAsk me any question in Sinhala (සිංහල), Tamil (தமிழ்), or English!`,
      timestamp: new Date().toISOString()
    };
    setMessages([defaultWelcome]);
    success('Chat history cleared');
  };

  const handleRegenerate = async () => {
    if (messages.length < 2 || isLoading) return;
    // Find last user message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    if (lastUserIdx === -1) return;
    const actualIdx = messages.length - 1 - lastUserIdx;
    const lastUserMsg = messages[actualIdx];

    // Truncate up to last user message
    const truncated = messages.slice(0, actualIdx + 1);
    setMessages(truncated);
    setIsLoading(true);

    try {
      const res = await api.aiChat({
        messages: truncated.map(m => ({ role: m.role, content: m.content })),
        gradeLevel: selectedStream,
        targetLanguage: language === 'si' ? 'Sinhala' : language === 'ta' ? 'Tamil' : 'English'
      });

      const modelMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      toastError(err.message || 'Failed to regenerate response');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold shadow-lg backdrop-blur-md border border-slate-700/50 animate-bounce">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Ask StudentHub AI 🇱🇰</span>
          </div>

          <button
            id="studenthub-ai-floating-trigger"
            onClick={() => setIsOpen(true)}
            className="group relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-amber-500 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-indigo-500/30"
            aria-label="Open StudentHub AI Tutor"
          >
            <Bot className="w-7 h-7 transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse" />
          </button>
        </div>
      )}

      {/* Floating Chat Modal Panel */}
      {isOpen && (
        <div
          id="studenthub-ai-floating-panel"
          className={`fixed z-50 transition-all duration-200 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-2xl'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[95vw] sm:w-[420px] md:w-[460px] h-[600px] max-h-[85vh] rounded-2xl'
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-900 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center border border-white/20">
                <Bot className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm leading-tight text-white flex items-center gap-1">
                    StudentHub AI
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                      Gemini 3.7
                    </span>
                  </h3>
                </div>
                <p className="text-[11px] text-indigo-200">
                  Sri Lankan Academic Companion 🇱🇰
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              {onNavigateToFullAI && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onNavigateToFullAI();
                  }}
                  title="Open Full Workspace"
                  className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Layers className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                title={isExpanded ? 'Minimize Window' : 'Expand Window'}
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close Window"
                className="p-1.5 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Academic Stream & Language Bar */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <select
                value={selectedStream}
                onChange={e => setSelectedStream(e.target.value)}
                className="bg-transparent font-medium text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="General / G.C.E. A/L">G.C.E. A/L (All Streams)</option>
                <option value="G.C.E. A/L Physical Science">A/L Physical Science (Maths)</option>
                <option value="G.C.E. A/L Biological Science">A/L Bio Science</option>
                <option value="G.C.E. A/L Commerce">A/L Commerce</option>
                <option value="G.C.E. A/L Technology">A/L Technology</option>
                <option value="G.C.E. A/L Arts">A/L Arts</option>
                <option value="G.C.E. O/L (Grade 10-11)">G.C.E. O/L (Grades 10-11)</option>
                <option value="University / Undergraduate">University Level</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
              <Languages className="w-3.5 h-3.5 text-indigo-500" />
              <span>{language === 'si' ? 'සිංහල' : language === 'ta' ? 'தமிழ்' : 'English'}</span>
            </div>
          </div>

          {/* Chat Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
            {messages.map((msg) => {
              const isAi = msg.role === 'model';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                >
                  {isAi && (
                    <div className="w-7 h-7 rounded-lg bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                      isAi
                        ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60'
                        : 'bg-indigo-600 text-white font-medium'
                    }`}
                  >
                    {/* Message content with simplified markdown linebreaks & bolding */}
                    <div className="space-y-1.5 whitespace-pre-wrap">
                      {msg.content}
                    </div>

                    {/* AI Message Action Toolbar */}
                    {isAi && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(msg.id, msg.content)}
                            title="Copy Answer"
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleSpeak(msg.id, msg.content)}
                            title={speakingId === msg.id ? 'Stop Reading' : 'Listen to Explanation'}
                            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                              speakingId === msg.id ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <span className="text-[10px]">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-bounce" />
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 shadow-xs">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                    <span>StudentHub AI is analyzing study concepts...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Sri Lankan Prompt Chips */}
          <div className="px-3 py-2 bg-slate-100/80 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 overflow-x-auto flex gap-1.5 scrollbar-none">
            {AI_QUICK_STUDY_PROMPTS.slice(0, 4).map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(language === 'si' ? p.sinhala : language === 'ta' ? p.tamil : p.prompt)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-[11px] text-slate-700 dark:text-slate-300 font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {p.category}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-end gap-2"
            >
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  rows={2}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    language === 'si'
                      ? 'අධ්‍යාපනික ගැටළුවක් අසන්න (සිංහල/English)...'
                      : language === 'ta'
                      ? 'கல்வி கேள்விகளைக் கேளுங்கள்...'
                      : 'Ask a study question in English, Sinhala, or Tamil...'
                  }
                  className="w-full p-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1">
                {messages.length > 2 && (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isLoading}
                    title="Regenerate Last Answer"
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isLoading}
                  className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold shadow-xs disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>

            <p className="mt-1 text-[10px] text-center text-slate-400 dark:text-slate-400">
              StudentHub AI provides educational tutoring powered by Google Gemini. Always verify with official syllabi.
            </p>
          </div>
        </div>
      )}
    </>
  );
};
