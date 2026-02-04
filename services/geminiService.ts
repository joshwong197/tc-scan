import { ContractAnalysis, DeepDiveAnalysis, UserRole, ChatMessage, Language } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

const getRoleContext = (role: UserRole) => {
  switch (role) {
    case UserRole.SIGNING_PARTY: return "The user is the signing party (Client/Customer). Focus on obligations, payment terms, and termination rights.";
    case UserRole.ISSUING_PARTY: return "The user is the issuing party (Provider/Vendor). Focus on liability caps, IP protection, and payment enforcement.";
    case UserRole.GUARANTOR: return "The user is a guarantor. Focus strictly on personal liability, indemnity, and default conditions.";
    case UserRole.OBSERVER: return "The user is an observer. Provide a neutral, balanced summary.";
    default: return "";
  }
};

/**
 * Analyzes the full document using Gemini 2.5 Flash.
 */
export const analyzeContract = async (
  text: string,
  role: UserRole,
  language: Language,
  apiKey: string,
  additionalContext?: string
): Promise<ContractAnalysis> => {
  const ai = new GoogleGenAI({ apiKey });
  const roleContext = getRoleContext(role);
  const specificConcerns = additionalContext ? `USER SPECIFIC CONCERNS: "${additionalContext}". Pay special attention to these areas in the Red Flags.` : "";

  const prompt = `You are an expert senior legal counsel. Analyze the following contract text. 
  
  Context:
  ${roleContext}
  ${specificConcerns}
  
  IMPORTANT: Output the content of the JSON fields in ${language} language.

  Output the analysis in JSON format with the following structure:
  1. riskScore: 'Low', 'Medium', or 'High' based on the risk to the ${role}.
  2. gist: A 3-sentence summary of what this contract actually achieves (in ${language}).
  3. coreTerms: An array of objects with 'term' (Name of term in ${language}) and 'value' (The specific detail/number/date in ${language}). Extract Money, Dates, Deliverables, and Jurisdiction.
  4. redFlags: A list of specific warnings or risky clauses for the ${role} (in ${language}).

  Contract Text:
  ${text.substring(0, 100000)} ... (truncated if too long)`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          riskScore: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
          gist: { type: Type.STRING },
          coreTerms: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                term: { type: Type.STRING },
                value: { type: Type.STRING },
              }
            }
          },
          redFlags: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }
    }
  });

  if (response.text) {
    const parsed = JSON.parse(response.text);
    return {
      riskScore: parsed.riskScore || 'Low',
      gist: parsed.gist || 'Analysis incomplete.',
      coreTerms: Array.isArray(parsed.coreTerms) ? parsed.coreTerms : [],
      redFlags: Array.isArray(parsed.redFlags) ? parsed.redFlags : []
    } as ContractAnalysis;
  }
  throw new Error("Failed to analyze contract");
};

/**
 * Explains a specific clause using Gemini 2.5 Flash.
 */
export const explainClause = async (
  clauseText: string,
  fullContext: string,
  language: Language,
  apiKey: string
): Promise<DeepDiveAnalysis> => {
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `You are a legal translator for non-lawyers.
  
  Context from document:
  ... ${fullContext.substring(0, 2000)} ...

  Analyze this specific clause:
  "${clauseText}"

  Return JSON with:
  - translation: Rewrite this in plain ${language} that a 15-year-old would understand.
  - impact: What happens if this is breached or enforced? What is the practical consequence? (Answer in ${language}).
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3.0-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          translation: { type: Type.STRING },
          impact: { type: Type.STRING },
        }
      }
    }
  });

  if (response.text) {
    const data = JSON.parse(response.text);
    return {
      originalText: clauseText,
      translation: data.translation || "Could not translate.",
      impact: data.impact || "Could not determine impact."
    };
  }
  throw new Error("Failed to explain clause");
};

/**
 * Chat with the contract context.
 */
export const sendChatMessage = async (
  contractText: string,
  history: ChatMessage[],
  newMessage: string,
  language: Language,
  apiKey: string
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are a helpful legal assistant named 'TC Counselor'. 
  You are answering questions about a specific contract provided below.
  Keep answers professional, concise, and helpful. 
  Do not provide binding legal advice, but explain the text clearly.
  Answer specifically in the ${language} language.
  
  Contract Text:
  ${contractText.substring(0, 50000)}`;

  const chat = ai.chats.create({
    model: 'gemini-3.0-flash',
    config: {
      systemInstruction: systemInstruction,
    },
    history: history.map(h => ({
      role: h.role === 'user' ? 'user' : 'model',
      parts: [{ text: h.text }]
    }))
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text || "I couldn't generate a response.";
};