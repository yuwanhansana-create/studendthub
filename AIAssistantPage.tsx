import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  BookOpen,
  HelpCircle,
  CheckCircle2,
  FileText,
  Send,
  Copy,
  Check,
  RotateCcw,
  Volume2,
  Calendar,
  Languages,
  MessageSquare,
  Wand2,
  GraduationCap,
  ChevronRight,
  Lightbulb,
  Award,
  Layers,
  Trash2
} from 'lucide-react';
import { api } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../components/common/Toast.js';
import { useLanguage } from '../context/LanguageContext.js';
import { QuizData, AIChatMessage } from '../types/index.js';
import { 
  SRI_LANKA_GRADE_LEVELS, 
  SRI_LANKA_SUBJECTS_LIST, 
  AI_QUICK_STUDY_PROMPTS, 
  OFFICIAL_EDUCATION_RESOURCES 
} from '../data/sriLankaData.js';

interface AIAssistantPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

type MainTab = 'chat' | 'tools';
type ToolMode = 'explain' | 'questions' | 'quiz' | 'summarize' | 'plan' | 'translate';

export const AIAssistantPage: React.FC<AIAssistantPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { language, t } = useLanguage();

  const [activeMainTab, setActiveMainTab] = useState<MainTab>('chat');

  // --- Interactive Chat State ---
  const [chatMessages, setChatMessages] = useState<AIChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('studenthub_ai_page_chats');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome-chat',
        role: 'model',
        content: `👋 **Ayubowan! Welcome to StudentHub AI.** 🇱🇰🎓\n\nI am your dedicated academic assistant for Sri Lankan studies. You can ask me questions in **English, Sinhala (සිංහල)**, or **Tamil (தமிழ்)** about:\n\n* **G.C.E. A/L & O/L** syllabi, theories, and difficult exam questions\n* **Step-by-step problem solving & formula derivations**\n* **ICT, programming & digital technology**\n* **Revision planning, time management & past paper insights**\n\nSelect a preset prompt below or type your study question to begin!`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [selectedStream, setSelectedStream] = useState<string>(user?.grade || SRI_LANKA_GRADE_LEVELS[3]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const chatInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem('studenthub_ai_page_chats', JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    if (activeMainTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeMainTab]);

  // --- Study Tools State ---
  const [toolMode, setToolMode] = useState<ToolMode>('explain');
  const [topic, setTopic] = useState('');
  const [textToSummarize, setTextToSummarize] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SRI_LANKA_SUBJECTS_LIST[0]);
  const [isToolLoading, setIsToolLoading] = useState(false);
  const [toolResultText, setToolResultText] = useState('');
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isToolCopied, setIsToolCopied] = useState(false);

  // Chat Actions
  const handleSendChatMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isChatLoading) return;

    const userMsg: AIChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updated = [...chatMessages, userMsg];
    setChatMessages(updated);
    setChatInput('');
    setIsChatLoading(true);

    try {
      const res = await api.aiChat({
        messages: updated.map(m => ({ role: m.role, content: m.content })),
        gradeLevel: selectedStream,
        targetLanguage: language === 'si' ? 'Sinhala' : language === 'ta' ? 'Tamil' : 'English'
      });

      const modelMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: res.content || 'I could not generate a response.',
        timestamp: new Date().toISOString()
      };

      setChatMessages(prev => [...prev, modelMsg]);
    } catch (err: any) {
      toastError(err.message || 'Failed to communicate with StudentHub AI');
      const errReply: AIChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: `⚠️ **Study Assistant Notice:**\n${err.message || 'Could not connect to AI service.'}`,
        timestamp: new Date().toISOString()
      };
      setChatMessages(prev => [...prev, errReply]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleCopyChat = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    success('Copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakChat = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      toastError('Text-to-speech not supported in your browser');
      return;
    }
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  const handleClearChatHistory = () => {
    setChatMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `👋 **Ayubowan! Chat history reset.**\n\nAsk me any study question or select a topic below!`,
        timestamp: new Date().toISOString()
      }
    ]);
    success('Chat history cleared');
  };

  // Tool Engine Actions
  const handleRunTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((toolMode === 'summarize' || toolMode === 'translate') && textToSummarize.trim().length < 5) {
      toastError('Please enter text for this tool');
      return;
    }
    if (toolMode !== 'summarize' && toolMode !== 'translate' && toolMode !== 'plan' && !topic.trim()) {
      toastError('Please enter a topic to study');
      return;
    }

    setIsToolLoading(true);
    setToolResultText('');
    setQuizData(null);
    setSelectedAnswers({});
    setShowQuizResults(false);

    try {
      const data = await api.askAssistant({
        mode: toolMode,
        topic: topic.trim(),
        text: textToSummarize.trim(),
        subject: selectedSubject,
        gradeLevel: selectedStream,
        targetLanguage: language === 'si' ? 'Sinhala' : language === 'ta' ? 'Tamil' : 'English'
      });

      if (toolMode === 'quiz' && data.data) {
        setQuizData(data.data);
      } else {
        setToolResultText(data.result || '');
      }
      success('AI Study Guidance generated!');
    } catch (err: any) {
      toastError(err.message || 'Failed to process AI study request');
    } finally {
      setIsToolLoading(false);
    }
  };

  const handleSelectQuizAnswer = (qId: number, optionIdx: number) => {
    if (showQuizResults) return;
    setSelectedAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    if (!quizData) return { correct: 0, total: 0, percentage: 0 };
    let correct = 0;
    quizData.questions.forEach(q => {
      if (selectedAnswers[q.id] === q.correctIndex) correct++;
    });
    return {
      correct,
      total: quizData.questions.length,
      percentage: Math.round((correct / quizData.questions.length) * 100)
    };
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Google Gemini 3.7 Flash Engine</span>
            <span className="text-white/40">•</span>
            <span>StudentHub.lk 🇱🇰</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            StudentHub AI Tutor & Study Center
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 leading-relaxed">
            Your personalized Sri Lankan academic tutor. Understand tough O/L and A/L concepts, generate practice quizzes, summarize lecture notes, and get explanations in Sinhala, Tamil, or English.
          </p>

          {/* Main Mode Switcher */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveMainTab('chat')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeMainTab === 'chat'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Interactive Chatbot</span>
            </button>

            <button
              onClick={() => setActiveMainTab('tools')}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all ${
                activeMainTab === 'tools'
                  ? 'bg-amber-400 text-slate-950 shadow-lg scale-102'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <Wand2 className="w-4 h-4" />
              <span>Specialized Study Tools</span>
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: INTERACTIVE CHATBOT */}
      {activeMainTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Chat Conversation (3 Cols) */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[700px] overflow-hidden">
            {/* Chat Top Bar */}
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    StudentHub AI Conversation
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                    <span>Active • Sri Lankan Academic Assistant</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleClearChatHistory}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40 dark:bg-slate-950/30">
              {chatMessages.map(msg => {
                const isAi = msg.role === 'model';
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${isAi ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAi && (
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-5 h-5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isAi
                          ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60'
                          : 'bg-indigo-600 text-white font-medium'
                      }`}
                    >
                      <div className="whitespace-pre-wrap space-y-2">
                        {msg.content}
                      </div>

                      {isAi && (
                        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-400">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleCopyChat(msg.id, msg.content)}
                              className="px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center gap-1 transition-colors"
                            >
                              {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>Copy</span>
                            </button>

                            <button
                              onClick={() => handleSpeakChat(msg.id, msg.content)}
                              className={`px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors ${
                                speakingId === msg.id ? 'text-indigo-600 dark:text-indigo-400 font-bold' : 'text-slate-600 dark:text-slate-300'
                              }`}
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                              <span>{speakingId === msg.id ? 'Stop' : 'Listen'}</span>
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

              {isChatLoading && (
                <div className="flex gap-3 justify-start items-center">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center shrink-0">
                    <Bot className="w-5 h-5 animate-bounce" />
                  </div>
                  <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-5 py-3 shadow-xs">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <div className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />
                      <span>StudentHub AI is analyzing Sri Lankan curriculum...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Presets */}
            <div className="px-4 py-2 bg-slate-100/90 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
              {AI_QUICK_STUDY_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChatMessage(language === 'si' ? p.sinhala : language === 'ta' ? p.tamil : p.prompt)}
                  className="shrink-0 px-3 py-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-xs text-slate-700 dark:text-slate-300 font-medium hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-2xs"
                >
                  {p.category}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendChatMessage();
                }}
                className="flex items-end gap-3"
              >
                <textarea
                  ref={chatInputRef}
                  rows={2}
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendChatMessage();
                    }
                  }}
                  placeholder={
                    language === 'si'
                      ? 'අධ්‍යාපනික ගැටළුවක් අසන්න (සිංහල, English, දෙමළ)...'
                      : language === 'ta'
                      ? 'கல்வி கேள்விகளைக் கேளுங்கள்...'
                      : 'Ask any study question in English, Sinhala, or Tamil...'
                  }
                  className="flex-1 p-3 text-xs sm:text-sm bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-2xl border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                />

                <button
                  type="submit"
                  disabled={!chatInput.trim() || isChatLoading}
                  className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold shadow-md disabled:opacity-50 transition-all flex items-center gap-2 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Sidebar: Academic Settings & Sri Lanka Exam Resources */}
          <div className="space-y-6">
            {/* Stream Selector Card */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>Academic Stream Context</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Target Exam / Stream
                </label>
                <select
                  value={selectedStream}
                  onChange={(e) => setSelectedStream(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 font-medium"
                >
                  {SRI_LANKA_GRADE_LEVELS.map(g => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300">
                <p className="font-semibold flex items-center gap-1.5 mb-1">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Trilingual Learning
                </p>
                StudentHub AI supports natural Sinhala (සිංහල) and Tamil (தமிழ்) question prompting and translations.
              </div>
            </div>

            {/* Official Education Resources */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>Sri Lanka Education Links</span>
              </h3>

              <div className="space-y-2 text-xs">
                {OFFICIAL_EDUCATION_RESOURCES.slice(0, 4).map((r, i) => (
                  <a
                    key={i}
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all group"
                  >
                    <div className="font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600">
                      {r.name}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {r.description}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: SPECIALIZED STUDY TOOLS */}
      {activeMainTab === 'tools' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form: Tool Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Select Study Tool
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'explain', label: 'Concept Explainer', icon: BookOpen },
                  { id: 'quiz', label: 'Practice Quiz', icon: Award },
                  { id: 'questions', label: 'Past Paper Questions', icon: HelpCircle },
                  { id: 'summarize', label: 'Note Summarizer', icon: FileText },
                  { id: 'plan', label: '30-Day Timetable', icon: Calendar },
                  { id: 'translate', label: 'Trilingual Glossary', icon: Languages }
                ].map(tItem => {
                  const Icon = tItem.icon;
                  const isSelected = toolMode === tItem.id;
                  return (
                    <button
                      key={tItem.id}
                      type="button"
                      onClick={() => setToolMode(tItem.id as ToolMode)}
                      className={`p-3 rounded-2xl border text-left flex flex-col gap-1.5 transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-xs">{tItem.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleRunTool} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Category
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs font-medium"
                >
                  {SRI_LANKA_SUBJECTS_LIST.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {toolMode !== 'summarize' && toolMode !== 'translate' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {toolMode === 'plan' ? 'Exam & Goal Focus' : 'Study Topic / Theory / Formula'}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={
                      toolMode === 'plan'
                        ? 'e.g. 2026 G.C.E. A/L Combined Maths & Physics Revision'
                        : 'e.g. Kirchhoff\'s Laws, Bernoulli\'s Principle, DNA Replication'
                    }
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {(toolMode === 'summarize' || toolMode === 'translate') && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                    {toolMode === 'translate' ? 'Academic Terms or Paragraph to Translate' : 'Paste Lesson Notes / Textbook Passage'}
                  </label>
                  <textarea
                    rows={6}
                    required
                    placeholder="Paste lesson text here..."
                    value={textToSummarize}
                    onChange={(e) => setTextToSummarize(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isToolLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isToolLoading ? 'Generating Guidance...' : 'Generate with StudentHub AI'}</span>
              </button>
            </form>
          </div>

          {/* Right Display: Tool Output */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[500px]">
            {isToolLoading && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 animate-pulse flex items-center justify-center text-white">
                  <Bot className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    Processing Study Materials...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    StudentHub AI is aligning your prompt with the Sri Lankan curriculum.
                  </p>
                </div>
              </div>
            )}

            {!isToolLoading && quizData && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">
                      {quizData.title}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Answer all 5 questions and click Submit to check your score.
                    </p>
                  </div>

                  {showQuizResults && (
                    <div className="px-4 py-2 rounded-2xl bg-indigo-50 dark:bg-indigo-950 border border-indigo-200 text-indigo-600 font-extrabold text-sm">
                      Score: {calculateScore().correct} / {calculateScore().total} ({calculateScore().percentage}%)
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  {quizData.questions.map((q, qIndex) => {
                    const isSelected = selectedAnswers[q.id] !== undefined;
                    return (
                      <div key={q.id} className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
                        <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex gap-2">
                          <span className="text-indigo-600">Q{qIndex + 1}.</span>
                          <span>{q.question}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const isChosen = selectedAnswers[q.id] === optIdx;
                            const isCorrect = q.correctIndex === optIdx;
                            let btnStyle = 'border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200';

                            if (showQuizResults) {
                              if (isCorrect) {
                                btnStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold';
                              } else if (isChosen && !isCorrect) {
                                btnStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300';
                              }
                            } else if (isChosen) {
                              btnStyle = 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 font-bold';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectQuizAnswer(q.id, optIdx)}
                                className={`p-3 rounded-xl border text-left text-xs transition-all ${btnStyle}`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        {showQuizResults && (
                          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl text-xs text-slate-700 dark:text-slate-300 border border-indigo-100 dark:border-indigo-900/30">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {!showQuizResults ? (
                  <button
                    onClick={() => setShowQuizResults(true)}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
                  >
                    Submit Quiz & Calculate Score
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedAnswers({});
                      setShowQuizResults(false);
                    }}
                    className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-all"
                  >
                    Retry Quiz
                  </button>
                )}
              </div>
            )}

            {!isToolLoading && !quizData && toolResultText && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                    Generated Study Guide
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(toolResultText);
                      setIsToolCopied(true);
                      success('Copied to clipboard');
                      setTimeout(() => setIsToolCopied(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    {isToolCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Copy Content</span>
                  </button>
                </div>

                <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {toolResultText}
                </div>
              </div>
            )}

            {!isToolLoading && !quizData && !toolResultText && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
                    Ready to Study
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Choose a tool on the left and input your subject topic to generate custom Sri Lankan study materials.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
