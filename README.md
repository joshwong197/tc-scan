# TC SCAN: Intelligent Contract Analysis

TC SCAN is a premium, localized AI tool designed to demystify complex legal documents. By leveraging Google's **Gemini 3.0 Flash** model, the application provides role-specific risk assessments, plain-language translations, and an interactive counselor for any contract.

![TC SCAN Preview](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🚀 Key Functionalities

### 1. **Who Are You? (Role-Based Tailoring)**
The app doesn't just read the contract; it reads it *for you*. Before analysis begins, you select your role:
*   **Signing Party**: Focuses on obligations, hidden costs, and termination traps.
*   **Issuing Party**: Focuses on IP protection, liability caps, and payment enforcement.
*   **Guarantor**: Highlights personal liability and default triggers.
*   **Observer**: Provides a balanced, neutral overview.

### 2. **Summary (The Executive View)**
**The AI Logic:** 
When a document is uploaded, TC SCAN sends the extracted text to Gemini with a specialized "Senior Legal Counsel" system prompt.
*   **Risk Score**: A calibrated 'Low', 'Medium', or 'High' indicator relative to your selected role.
*   **The Gist**: A concise, 3-sentence summary of the contract's primary purpose.
*   **Core Terms**: Automatic extraction of "The Essentials"—Money, Dates, Deliverables, and Jurisdiction.
*   **Red Flags**: A tailored list of warnings highlighting clauses that could be detrimental to your specific interests.

### 3. **Deep Dive (Legalese Translator)**
**The AI Logic:** 
Highlight any confusing paragraph in the document viewer to trigger a Deep Dive.
*   **Plain English Translation**: Rewrites the clause at a 15-year-old's reading level, stripping away jargon like "indemnification" or "force majeure" for absolute clarity.
*   **Practical Impact**: Explains the "So what?"—detailing what actually happens if the clause is enforced or breached.

### 4. **Ask (The AI Counselor)**
**The AI Logic:** 
A full-context interactive chat interface that maintains the contract's context in memory.
*   **Semantic Search**: Ask questions like "Is there a cooling-off period?" or "Can I cancel if they are late?".
*   **Reasoning**: The AI cross-references different sections of the contract to provide cohesive answers about how various clauses interact.

---

## 🔒 Privacy & Security (BYOK)

TC SCAN follows a **Bring Your Own Key (BYOK)** model to ensure maximum privacy and cost-efficiency:
1.  **Local Storage**: Your Gemini API key is stored 100% locally in your browser's `localStorage`. It is never sent to any server other than Google's API.
2.  **Enterprise Privacy**: By using your own API key, you benefit from Google's enterprise-grade privacy. Google does not use data submitted via API calls to train its foundation models.
3.  **No Data Retention**: The document text is processed in-memory and is not saved to any database.

---

## 🛠️ Getting Started

1.  **Clone the Repository**
2.  **Install Dependencies**: `npm install`
3.  **Run Locally**: `npm run dev`
4.  **Configure API Key**: Click the **Settings (⚙️)** icon in the header and paste your Gemini API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
