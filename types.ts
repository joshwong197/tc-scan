export enum UserRole {
  SIGNING_PARTY = 'Signing Party',
  ISSUING_PARTY = 'Issuing Party',
  GUARANTOR = 'Guarantor',
  OBSERVER = 'Observer'
}

export type Language = 'English' | 'Chinese' | 'Hindi';

export type TabId = 'summary' | 'deep-dive' | 'ask';

export interface ContractAnalysis {
  riskScore: 'Low' | 'Medium' | 'High';
  gist: string;
  coreTerms: {
    term: string;
    value: string;
  }[];
  redFlags: string[];
}

export interface DeepDiveAnalysis {
  originalText: string;
  translation: string;
  impact: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
}