import React, { useState } from 'react';
import { X, Key, ShieldCheck, ExternalLink, AlertCircle } from 'lucide-react';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    apiKey: string;
    onSave: (key: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
    const [tempKey, setTempKey] = useState(apiKey);
    const [showKey, setShowKey] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div
                className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative p-8">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                            <Key size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 leading-none mb-1">AI Settings</h2>
                            <p className="text-sm text-slate-500 font-medium">Configure your Gemini API access</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">
                                Gemini API Key
                            </label>
                            <div className="relative">
                                <input
                                    type={showKey ? "text" : "password"}
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    placeholder="Enter your API key..."
                                    className="w-full pl-4 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-sm"
                                />
                                <button
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors text-xs font-bold uppercase tracking-wider"
                                >
                                    {showKey ? "Hide" : "Show"}
                                </button>
                            </div>
                            <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1.5 ml-1">
                                <AlertCircle size={12} />
                                Your key is stored locally in your browser.
                            </p>
                        </div>

                        <div className="bg-indigo-50/50 rounded-2xl p-5 border border-indigo-100">
                            <h3 className="text-xs font-bold text-indigo-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <ShieldCheck size={14} />
                                Enterprise Privacy
                            </h3>
                            <p className="text-xs text-indigo-800/80 leading-relaxed font-medium">
                                Using your own API key ensures your data remains private. Google does not use data from API calls to train their models.
                            </p>
                            <a
                                href="https://aistudio.google.com/app/apikey"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors group"
                            >
                                Get a free API key
                                <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </a>
                        </div>

                        <button
                            onClick={() => {
                                onSave(tempKey);
                                onClose();
                            }}
                            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-black hover:shadow-xl transition-all"
                        >
                            Save Configuration
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
