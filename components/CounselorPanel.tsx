
import React, { useRef, useEffect } from 'react';
import { TabId, ContractAnalysis, DeepDiveAnalysis, ChatMessage, Language } from '../types';
import { RiskBadge } from './RiskBadge';
import { BookOpen, Search, MessageSquare, ArrowRight, AlertTriangle, Scale, Send, Globe } from 'lucide-react';

interface CounselorPanelProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  analysis: ContractAnalysis | null;
  deepDiveData: DeepDiveAnalysis | null;
  isAnalyzing: boolean;
  isExplaining: boolean;
  
  // Chat props
  chatHistory: ChatMessage[];
  isChatLoading: boolean;
  onSendMessage: (msg: string) => void;
  
  // Language props
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CounselorPanel: React.FC<CounselorPanelProps> = ({
  activeTab,
  onTabChange,
  analysis,
  deepDiveData,
  isAnalyzing,
  isExplaining,
  chatHistory,
  isChatLoading,
  onSendMessage,
  language,
  onLanguageChange
}) => {
  const tabs = [
    { id: 'summary' as TabId, label: 'Summary', icon: BookOpen },
    { id: 'deep-dive' as TabId, label: 'Deep Dive', icon: Search },
    { id: 'ask' as TabId, label: 'Ask', icon: MessageSquare },
  ];

  const chatInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, activeTab]);

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInputRef.current?.value) {
      onSendMessage(chatInputRef.current.value);
      chatInputRef.current.value = '';
    }
  };

  const renderContent = () => {
    if (isAnalyzing) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
          <div className="w-16 h-1 bg-slate-200 rounded-full overflow-hidden mb-4">
            <div className="h-full bg-indigo-500 animate-[loading_1s_ease-in-out_infinite]"></div>
          </div>
          <p>Analyzing document context...</p>
        </div>
      );
    }

    if (!analysis) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
          <BookOpen size={48} className="mb-4 text-slate-200" />
          <p>Upload a document to receive legal counsel.</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'summary':
        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-in slide-in-from-right-4 duration-300">
            {/* Header Score */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Risk Assessment</h3>
              <RiskBadge level={analysis.riskScore} />
            </div>

            {/* Gist */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                <Scale size={18} className="text-indigo-600" />
                The Gist
              </h4>
              <p className="text-slate-700 leading-relaxed text-sm">
                {analysis.gist}
              </p>
            </div>

            {/* Core Terms */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-3 text-sm uppercase tracking-wide">Core Terms</h4>
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-slate-100">
                    {analysis.coreTerms?.map((item, idx) => (
                      <tr key={idx} className="group hover:bg-slate-50">
                        <td className="px-4 py-3 text-slate-500 font-medium w-1/3">{item.term}</td>
                        <td className="px-4 py-3 text-slate-800">{item.value}</td>
                      </tr>
                    ))}
                    {(!analysis.coreTerms || analysis.coreTerms.length === 0) && (
                      <tr>
                        <td colSpan={2} className="px-4 py-3 text-slate-400 italic">No specific core terms identified.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Red Flags */}
            <div>
              <h4 className="font-semibold text-red-700 mb-3 text-sm uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle size={16} />
                Critical Red Flags
              </h4>
              <ul className="space-y-3">
                {analysis.redFlags?.map((flag, idx) => (
                  <li key={idx} className="flex gap-3 text-sm text-slate-700 bg-red-50/50 p-3 rounded-lg border border-red-100">
                    <span className="text-red-500 font-bold mt-0.5">•</span>
                    {flag}
                  </li>
                ))}
                {(!analysis.redFlags || analysis.redFlags.length === 0) && (
                   <li className="text-sm text-slate-400 italic">No major red flags detected.</li>
                )}
              </ul>
            </div>
          </div>
        );

      case 'deep-dive':
        if (!deepDiveData && !isExplaining) {
          return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center animate-in fade-in">
              <Search size={48} className="mb-4 text-slate-200" />
              <p className="max-w-xs">Highlight any text in the document on the left and click <strong>"Explain"</strong> to see a deep dive.</p>
            </div>
          );
        }

        if (isExplaining) {
           return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4"></div>
              <p>Translating legalese...</p>
            </div>
          );
        }

        return (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-in slide-in-from-right-4 duration-300">
            {/* Original */}
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <h5 className="text-xs font-bold text-slate-500 uppercase mb-2">Original Text</h5>
              <p className="font-serif italic text-slate-600 text-sm border-l-2 border-slate-300 pl-3">
                "{deepDiveData?.originalText}"
              </p>
            </div>

            {/* Translation */}
            <div>
              <h4 className="text-lg font-bold text-indigo-900 mb-2 flex items-center gap-2">
                <MessageSquare size={20} className="text-indigo-500" />
                Plain English Translation
              </h4>
              <p className="text-slate-800 leading-relaxed bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                {deepDiveData?.translation}
              </p>
            </div>

            {/* Impact */}
            <div>
              <h4 className="text-sm font-bold text-slate-900 mb-2 uppercase tracking-wide">
                Why this matters (Impact)
              </h4>
              <div className="flex gap-3">
                <div className="shrink-0 mt-1">
                   <ArrowRight size={18} className="text-amber-500" />
                </div>
                <p className="text-slate-700 text-sm leading-relaxed">
                  {deepDiveData?.impact}
                </p>
              </div>
            </div>
          </div>
        );

      case 'ask':
        return (
          <div className="flex-1 flex flex-col h-full animate-in slide-in-from-right-4 duration-300">
            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatHistory.length === 0 && (
                 <div className="mt-8">
                   <p className="text-slate-400 text-sm text-center mb-4">Suggested Questions:</p>
                   <div className="flex flex-wrap gap-2 justify-center">
                     {["Can I terminate early?", "Are there hidden fees?", "Is the indemnity standard?"].map(q => (
                       <button 
                        key={q} 
                        onClick={() => onSendMessage(q)}
                        className="text-xs bg-white border border-slate-200 text-indigo-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 transition-colors"
                       >
                         {q}
                       </button>
                     ))}
                   </div>
                 </div>
               )}
               {chatHistory.map((msg) => (
                 <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                     msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                   }`}>
                     {msg.text}
                   </div>
                 </div>
               ))}
               {isChatLoading && (
                 <div className="flex justify-start">
                   <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 border border-slate-200">
                     <div className="flex gap-1">
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                       <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                     </div>
                   </div>
                 </div>
               )}
               <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-slate-200 bg-white">
              <form onSubmit={handleChatSubmit} className="relative">
                <input
                  ref={chatInputRef}
                  type="text"
                  placeholder="Ask about this contract..."
                  className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all text-sm"
                />
                <button 
                  type="submit"
                  disabled={isChatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50/50">
      {/* Header: Tabs + Language */}
      <div className="h-20 flex items-center justify-between px-3 border-b border-slate-200 bg-white shrink-0 sticky top-0 z-20">
        <div className="flex flex-1 items-center gap-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <tab.icon size={18} />
                <span className="leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 ml-2">
           <div className="relative group">
              <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors">
                <Globe size={14} />
                {language}
              </button>
              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden hidden group-hover:block z-50">
                 {(['English', 'Chinese', 'Hindi'] as Language[]).map(lang => (
                   <button
                    key={lang}
                    onClick={() => onLanguageChange(lang)}
                    className={`w-full text-left px-4 py-2 text-xs hover:bg-slate-50 ${language === lang ? 'text-indigo-600 font-bold bg-indigo-50' : 'text-slate-700'}`}
                   >
                     {lang}
                   </button>
                 ))}
              </div>
           </div>
        </div>
      </div>

      {/* Pane Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};
