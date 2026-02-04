import React, { useState, useCallback, useEffect } from 'react';
import { Onboarding } from './components/OnboardingModal';
import { DocumentViewer } from './components/DocumentViewer';
import { CounselorPanel } from './components/CounselorPanel';
import { SettingsModal } from './components/SettingsModal';
import { UserRole, TabId, ContractAnalysis, DeepDiveAnalysis, ChatMessage, Language } from './types';
import { analyzeContract, explainClause, sendChatMessage } from './services/geminiService';
import { ProcessedFile } from './services/fileService';
import { Settings, Shield, Lock } from 'lucide-react';

const App: React.FC = () => {
  // --- STATE ---
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userContext, setUserContext] = useState<string>(''); // Additional user text
  const [language, setLanguage] = useState<Language>('English');

  // File State
  const [fileData, setFileData] = useState<ProcessedFile | null>(null);

  // Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ContractAnalysis | null>(null);

  // Right Pane State
  const [activeTab, setActiveTab] = useState<TabId>('summary');

  // Deep Dive State
  const [isExplaining, setIsExplaining] = useState(false);
  const [deepDiveData, setDeepDiveData] = useState<DeepDiveAnalysis | null>(null);

  // Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // --- PERSISTENCE ---
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // --- LOGIC ---

  const runAnalysis = async (text: string, role: UserRole, lang: Language, context: string) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      const result = await analyzeContract(text, role, lang, apiKey, context);
      setAnalysis(result);
    } catch (error: any) {
      console.error("Analysis failed", error);
      alert(error?.message || "Analysis failed. Ensure API Key is valid.");
      if (error?.message?.includes('API_KEY_INVALID') || error?.message?.includes('403')) {
        setIsSettingsOpen(true);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  // --- HANDLERS ---

  const handleStartReview = (role: UserRole, context: string) => {
    setUserRole(role);
    setUserContext(context);
    if (fileData) {
      runAnalysis(fileData.rawText, role, language, context);
    }
  };

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    if (fileData && userRole) {
      setDeepDiveData(null);
      runAnalysis(fileData.rawText, userRole, newLang, userContext);
    }
  };

  const handleFileUpload = async (data: ProcessedFile) => {
    setFileData(data);
    setActiveTab('summary');
    setChatHistory([]);
    setDeepDiveData(null);

    if (userRole) {
      runAnalysis(data.rawText, userRole, language, userContext);
    }
  };

  const handleTextSelected = useCallback(async (selectedText: string) => {
    if (!apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setActiveTab('deep-dive');
    setIsExplaining(true);
    setDeepDiveData(null);

    if (!fileData?.rawText) return;

    try {
      const result = await explainClause(selectedText, fileData.rawText, language, apiKey);
      setDeepDiveData(result);
    } catch (error) {
      console.error("Explanation failed", error);
    } finally {
      setIsExplaining(false);
    }
  }, [fileData, language, apiKey]);

  const handleSendMessage = async (text: string) => {
    if (!fileData?.rawText || !apiKey) return;

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: text,
      timestamp: Date.now()
    };

    setChatHistory(prev => [...prev, newUserMsg]);
    setIsChatLoading(true);

    try {
      const responseText = await sendChatMessage(fileData.rawText, chatHistory, text, language, apiKey);
      const newAiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        text: responseText,
        timestamp: Date.now()
      };
      setChatHistory(prev => [...prev, newAiMsg]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* HEADER */}
      <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-none">TC<span className="text-indigo-600">SCAN</span></h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Contract Intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {!apiKey && (
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">
              <Lock size={14} />
              API KEY REQUIRED
            </div>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className={`p-2.5 rounded-xl transition-all ${!apiKey
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-black'
                : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
              }`}
          >
            <Settings size={20} />
          </button>
        </div>
      </header>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSave={handleSaveApiKey}
      />

      <div className="flex-1 flex overflow-hidden">
        {!userRole ? (
          <Onboarding onStart={handleStartReview} />
        ) : (
          <main className="flex-1 flex overflow-hidden animate-in fade-in duration-700">
            {/* LEFT PANE: Document Viewer (60%) */}
            <div className="w-[60%] h-full">
              <DocumentViewer
                content={fileData?.displayContent || null}
                contentType={fileData?.type || 'text'}
                onUpload={handleFileUpload}
                onTextSelected={handleTextSelected}
                isProcessing={isAnalyzing}
              />
            </div>

            {/* RIGHT PANE: Counselor (40%) */}
            <div className="w-[40%] h-full border-l border-slate-200 shadow-2xl bg-white relative z-10">
              <CounselorPanel
                activeTab={activeTab}
                onTabChange={setActiveTab}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                deepDiveData={deepDiveData}
                isExplaining={isExplaining}
                chatHistory={chatHistory}
                isChatLoading={isChatLoading}
                onSendMessage={handleSendMessage}
                language={language}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </main>
        )}
      </div>
    </div>
  );
};

export default App;