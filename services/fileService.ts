import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Configure the worker. 
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

export interface ProcessedFile {
  rawText: string;      // Pure text for AI analysis
  displayContent: string; // Formatted text/HTML for display
  type: 'text' | 'html';
}

export const processFile = async (file: File): Promise<ProcessedFile> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();

  if (fileType === 'application/pdf') {
    return await extractPdfText(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
    fileName.endsWith('.docx')
  ) {
    return await extractDocx(file);
  } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await readTextFile(file);
    return { rawText: text, displayContent: text, type: 'text' };
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
  }
};

const readTextFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });
};

const extractDocx = async (file: File): Promise<ProcessedFile> => {
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract raw text for AI
  const rawResult = await mammoth.extractRawText({ arrayBuffer });
  
  // Extract HTML for Display
  const htmlResult = await mammoth.convertToHtml({ arrayBuffer });

  return {
    rawText: rawResult.value,
    displayContent: htmlResult.value,
    type: 'html'
  };
};

const extractPdfText = async (file: File): Promise<ProcessedFile> => {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;
  
  let fullRawText = '';
  let fullDisplayText = '';
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Sort items by Y position (descending) then X position (ascending)
    // This ensures we read top-to-bottom, left-to-right
    const items = textContent.items.map((item: any) => ({
      str: item.str,
      x: item.transform[4],
      y: item.transform[5],
      hasEOL: item.hasEOL
    }));

    // Simple sorting to handle column/line order roughly
    items.sort((a, b) => {
      if (Math.abs(a.y - b.y) > 5) { // If Y difference is significant
        return b.y - a.y; // Sort Top to Bottom
      }
      return a.x - b.x; // Sort Left to Right
    });

    let lastY = -1;
    let pageText = '';
    
    // Iterate and reconstruct layout with newlines
    for (const item of items) {
      if (lastY !== -1 && Math.abs(item.y - lastY) > 8) {
        // Significant vertical gap -> New line
        // If gap is very large, maybe double newline (paragraph)
        if (Math.abs(item.y - lastY) > 20) {
            pageText += '\n\n';
        } else {
            pageText += '\n';
        }
      } else if (lastY !== -1) {
        // Same line, add space if needed
        if (!pageText.endsWith(' ') && !item.str.startsWith(' ')) {
             pageText += ' ';
        }
      }
      
      pageText += item.str;
      lastY = item.y;
    }

    fullRawText += pageText + '\n\n';
    fullDisplayText += pageText + '\n\n' + '--- Page ' + i + ' ---\n\n';
  }
  
  return {
    rawText: fullRawText,
    displayContent: fullDisplayText,
    type: 'text'
  };
};