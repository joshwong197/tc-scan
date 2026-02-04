import React, { useState } from 'react';
import { UserRole } from '../types';
import { User, Shield, PenTool, Eye, ChevronDown, ChevronRight, Play } from 'lucide-react';

interface OnboardingModalProps {
  onStart: (role: UserRole, additionalContext: string) => void;
}

export const Onboarding: React.FC<OnboardingModalProps> = ({ onStart }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [additionalContext, setAdditionalContext] = useState('');

  const roles = [
    { id: UserRole.SIGNING_PARTY, icon: PenTool, desc: "I am signing this contract." },
    { id: UserRole.ISSUING_PARTY, icon: User, desc: "I created this contract." },
    { id: UserRole.GUARANTOR, icon: Shield, desc: "I am guaranteeing performance." },
    { id: UserRole.OBSERVER, icon: Eye, desc: "I am just reviewing." },
  ];

  const handleStart = () => {
    if (selectedRole) {
      onStart(selectedRole, additionalContext);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-slate-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8 animate-in fade-in zoom-in duration-500 flex flex-col border border-slate-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 mb-6 shadow-sm">
            <Shield size={32} />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Who are you in this transaction?</h2>
          <p className="text-slate-500 mt-3 text-lg">Select your role to tailor the risk analysis for your specific needs.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex items-start gap-4 p-5 rounded-xl border-2 transition-all text-left group relative ${selectedRole === role.id
                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                }`}
            >
              <div className={`p-2.5 rounded-lg transition-colors ${selectedRole === role.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                }`}>
                <role.icon size={22} />
              </div>
              <div className="flex-1">
                <span className={`block font-bold text-base mb-0.5 ${selectedRole === role.id ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {role.id}
                </span>
                <span className="text-sm text-slate-500 leading-relaxed">{role.desc}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Context Toggle */}
        <div className="mb-10">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors mb-3 group"
          >
            <div className={`p-1 rounded-md transition-colors ${showDetails ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 group-hover:bg-indigo-50'}`}>
              {showDetails ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </div>
            Tell me more (Optional)
          </button>

          {showDetails && (
            <div className="animate-in slide-in-from-top-4 duration-300">
              <textarea
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                placeholder="E.g., I'm specifically concerned about the liability cap and data privacy clauses..."
                className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none shadow-sm"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={!selectedRole}
          className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:translate-y-[-1px] active:translate-y-[0px] disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none transition-all flex items-center justify-center gap-3"
        >
          <span>Start Review</span>
          <Play size={20} fill="currentColor" />
        </button>
      </div>
    </div>
  );
};