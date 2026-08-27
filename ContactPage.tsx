import React, { useState } from 'react';
import {
  Phone,
  Mail,
  ExternalLink,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Building2,
  GraduationCap,
  ArrowRight
} from 'lucide-react';
import { FOUNDER_DATA } from '../data/founderData.js';
import { FounderCard } from '../components/common/FounderCard.js';
import { useToast } from '../components/common/Toast.js';

interface ContactPageProps {
  onNavigate: (tab: string, param?: string) => void;
}

export const ContactPage: React.FC<ContactPageProps> = ({ onNavigate }) => {
  const { success } = useToast();

  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      success('Thank you! Your message has been prepared.');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      
      {/* Top Breadcrumb */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              onClick={() => onNavigate('landing')}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
            >
              Home
            </button>
            <span>/</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">Contact</span>
          </div>

          <button
            onClick={() => onNavigate('about')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
          >
            <span>About StudentHub.lk</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Header */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-indigo-50/60 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
              <Phone className="w-3.5 h-3.5" />
              <span>Direct Founder Communication</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
              Get in Touch with StudentHub.lk
            </h1>
            
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              Reach out directly to Founder & Creator <strong>G. Yuwan Senithu Hansana</strong> for feedback, partnerships, student inquiries, or technical suggestions.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        
        {/* Main 2-column Layout */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Official Contact Card & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Official Founder Contact Card
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verified public contact information for StudentHub.lk leadership.
              </p>
            </div>

            <FounderCard variant="full" showBio={true} showTechInterests={true} />

            {/* Quick Summary Cards */}
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Direct Phone</div>
                <div className="text-[11px] text-slate-500">{FOUNDER_DATA.phone}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Official Email</div>
                <div className="text-[11px] text-slate-500 truncate">{FOUNDER_DATA.email}</div>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">Location</div>
                <div className="text-[11px] text-slate-500">Sri Lanka 🇱🇰</div>
              </div>
            </div>
          </div>

          {/* Right Column: Send a Message Form */}
          <div className="lg:col-span-5">
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Send a Direct Message</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white">
                  Write to the Founder
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Fill out the form below to initiate an email to {FOUNDER_DATA.name}.
                </p>
              </div>

              {submitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-center space-y-3 animate-in fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                    Message Ready!
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Click the button below to send your prepared email directly to <strong>{FOUNDER_DATA.email}</strong>.
                  </p>
                  <a
                    href={`mailto:${FOUNDER_DATA.email}?subject=${encodeURIComponent(`[StudentHub.lk ${subject}] From ${senderName || 'Student'}`)}&body=${encodeURIComponent(message)}`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open Email Client</span>
                  </a>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setMessage('');
                      }}
                      className="text-[11px] font-bold text-slate-500 hover:underline"
                    >
                      Write another message
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Dilshan Perera"
                      value={senderName}
                      onChange={e => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Your Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="your.name@gmail.com"
                      value={senderEmail}
                      onChange={e => setSenderEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Inquiry Category
                    </label>
                    <select
                      value={subject}
                      onChange={e => setSubject(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                    >
                      <option value="General Inquiry">General StudentHub.lk Inquiry</option>
                      <option value="School / Tuition Collaboration">School or Tuition Class Collaboration</option>
                      <option value="Feature Suggestion">Feature Suggestion or AI Tool Request</option>
                      <option value="Technical Issue">Report a Bug / Technical Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      placeholder="Type your message, question, or proposal..."
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !message.trim()}
                    className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSubmitting ? 'Preparing...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>

        {/* Contact CTA Section */}
        <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-center space-y-6 border border-slate-800">
          <div className="max-w-2xl mx-auto space-y-3">
            <span className="text-amber-400 text-xs font-bold uppercase tracking-wider">
              Quick Contact Actions
            </span>
            <h3 className="text-2xl sm:text-3xl font-black">
              Connect Instantly with G. Yuwan Senithu Hansana
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200">
              {FOUNDER_DATA.role}
            </p>
            
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <a
                href={FOUNDER_DATA.phoneTel}
                className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>[ Call Me ] : {FOUNDER_DATA.phone}</span>
              </a>

              <a
                href={FOUNDER_DATA.emailMailto}
                className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Mail className="w-4 h-4" />
                <span>[ Email Me ] : {FOUNDER_DATA.email}</span>
              </a>

              <a
                href={FOUNDER_DATA.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
              >
                <span>[ About Me / Portfolio ]</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
              </a>
            </div>
          </div>
        </section>

      </div>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <span className="font-bold text-white text-sm">StudentHub.lk</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-slate-300">StudentHub.lk — Built for Sri Lankan Students.</span>
            </div>
            <div className="text-amber-400 font-medium">
              Founded by G. Yuwan Senithu Hansana
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-4">
              <button onClick={() => onNavigate('landing')} className="hover:text-white transition-colors">Home</button>
              <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors">About</button>
              <button onClick={() => onNavigate('contact')} className="hover:text-white text-white font-bold transition-colors">Contact</button>
              <a href={FOUNDER_DATA.portfolioUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Founder Portfolio ↗</a>
            </div>
            <div>
              © {new Date().getFullYear()} StudentHub.lk. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
