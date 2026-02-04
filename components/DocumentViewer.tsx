
import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud, FileText, Search, ShieldCheck } from 'lucide-react';
import { processFile, ProcessedFile } from '../services/fileService';

interface DocumentViewerProps {
  content: string | null;
  contentType: 'text' | 'html';
  onUpload: (data: ProcessedFile) => void;
  onTextSelected: (text: string) => void;
  isProcessing: boolean;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  content, 
  contentType,
  onUpload, 
  onTextSelected,
  isProcessing 
}) => {
  const [selectionRect, setSelectionRect] = useState<DOMRect | null>(null);
  const [tempSelection, setTempSelection] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);
  const selectionRangeRef = useRef<Range | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      try {
        const data = await processFile(file);
        onUpload(data);
        // Clear any previous highlights on new file
        setSelectionRect(null);
        selectionRangeRef.current = null;
      } catch (error) {
        console.error("File extraction failed", error);
        alert("Could not read file. Please try a valid PDF or DOCX file.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
      // Don't clear rect immediately if we are clicking the button
      return;
    }

    const range = selection.getRangeAt(0);
    
    // Ensure selection is inside our text viewer
    if (textRef.current && textRef.current.contains(range.commonAncestorContainer)) {
      const rect = range.getBoundingClientRect();
      setSelectionRect(rect);
      setTempSelection(selection.toString());
      selectionRangeRef.current = range.cloneRange(); // Clone to persist across renders
    } else {
      setSelectionRect(null);
      selectionRangeRef.current = null;
    }
  };

  const handleDocumentClick = (e: MouseEvent) => {
    // If clicking outside the text area and not on the tooltip, clear selection UI
    // Note: This logic is handled partially by the blur event of the window, but 
    // for React we just ensure explicit clears if needed.
    const target = e.target as HTMLElement;
    if (!target.closest('.tc-explain-tooltip') && !target.closest('.prose')) {
       setSelectionRect(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, []);

  const clearHighlights = () => {
    if (textRef.current) {
        const highlights = textRef.current.querySelectorAll('.tc-highlight');
        highlights.forEach(span => {
            const parent = span.parentNode;
            if (parent) {
                parent.replaceChild(document.createTextNode(span.textContent || ''), span);
                parent.normalize();
            }
        });
    }
  };

  const applyHighlightAndExplain = () => {
    if (!selectionRangeRef.current) return;

    // 1. Clear previous highlights
    clearHighlights();

    // 2. Apply new highlight
    try {
        const span = document.createElement('span');
        span.className = 'tc-highlight bg-indigo-200 border-b-2 border-indigo-500 text-indigo-900 rounded-sm';
        selectionRangeRef.current.surroundContents(span);
        
        // Clear native browser selection to show our custom highlight clearly
        window.getSelection()?.removeAllRanges();
    } catch (e) {
        console.warn("Complex selection (likely across paragraphs), skipping visual highlight", e);
        // Fallback: If we can't wrap it (e.g. cross-block selection), we just leave the native selection
    }

    // 3. Trigger analysis
    onTextSelected(tempSelection);
    setSelectionRect(null);
  };

  const handleScroll = () => {
    if (selectionRect) {
      setSelectionRect(null);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-slate-200 shadow-sm relative z-0">
      {/* Header */}
      <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
        <div className="flex items-center gap-2 text-indigo-700 font-bold text-lg">
          <ShieldCheck size={24} />
          <span>TC Scan</span>
        </div>
        {content && (
          <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded flex items-center gap-1">
            <ShieldCheck size={12} />
            Ephemeral Mode: Local only
          </span>
        )}
      </div>

      {/* Content Area */}
      <div 
        className="flex-1 overflow-y-auto relative bg-slate-50/50"
        onScroll={handleScroll}
      >
        {!content ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-500">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-6">
              <UploadCloud size={40} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">Upload your Contract</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Drag and drop a PDF or DOCX file here.
              <br/><span className="text-xs text-slate-400 mt-2 block"> (Privacy: Files are processed locally)</span>
            </p>
            
            <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-colors flex items-center gap-2 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
                  <span>Extracting text...</span>
                </>
              ) : (
                <>
                  <FileText size={18} />
                  <span>Select Document</span>
                </>
              )}
              <input type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.docx,.txt" />
            </label>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto min-h-full bg-white shadow-sm p-12 my-8 border border-slate-100 rounded-sm">
            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-slate-500 animate-pulse">Scanning clauses and identifying risks...</p>
              </div>
            ) : (
              <div 
                ref={textRef}
                onMouseUp={handleSelection}
                className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-serif"
              >
                {contentType === 'html' ? (
                  // Safe here because content comes from local file processing
                  <div 
                    dangerouslySetInnerHTML={{ __html: content }} 
                    className="[&_p]:mb-4 [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:p-2 [&_th]:border [&_th]:p-2 [&_th]:bg-slate-50"
                  />
                ) : (
                  <div className="whitespace-pre-wrap">
                    {content}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selection Tooltip */}
      {selectionRect && !isProcessing && (
        <div 
          className="tc-explain-tooltip fixed z-50 animate-in fade-in zoom-in duration-150"
          style={{
            top: `${selectionRect.top - 50}px`,
            left: `${selectionRect.left + (selectionRect.width / 2) - 50}px`,
          }}
        >
          <button
            onClick={applyHighlightAndExplain}
            className="bg-indigo-900 text-white text-sm font-medium py-2 px-4 rounded-full shadow-lg flex items-center gap-2 hover:bg-indigo-800 transition-colors after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-8 after:border-transparent after:border-t-indigo-900"
          >
            <Search size={14} />
            Explain
          </button>
        </div>
      )}
    </div>
  );
};
