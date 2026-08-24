import React, { useState, useEffect } from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (newValue: string) => void;
  maxCharacters?: number;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  maxCharacters = 2000,
}) => {
  // Support check for the Clipboard API layer
  const [isClipboardSupported, setIsClipboardSupported] = useState<boolean>(false);
  const [pasteError, setPasteError] = useState<string | null>(null);

  useEffect(() => {
    // Gracefully detect if the platform supports secure context clipboard reading
    if (typeof window !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.readText === 'function') {
      setIsClipboardSupported(true);
    }
  }, []);

  const handlePasteFromClipboard = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setPasteError(null);

    try {
      // Prompt user for explicit reading permissions 
      const textFromClipboard = await navigator.clipboard.readText();
      
      if (!textFromClipboard) {
        setPasteError('Clipboard is empty.');
        return;
      }

      // Enforce the backend character cap limit
      const currentLength = value.length;
      const spaceRemaining = maxCharacters - currentLength;

      if (spaceRemaining <= 0) {
        setPasteError('Character limit already reached.');
        return;
      }

      // Intercept and slice overflowing data segments
      const safeAppendText = textFromClipboard.slice(0, spaceRemaining);
      const consolidatedValue = value + safeAppendText;

      // Propagate the state change upstream
      onChange(consolidatedValue);

      if (textFromClipboard.length > spaceRemaining) {
        setPasteError(`Pasted text was truncated to fit the ${maxCharacters} character limit.`);
      }
    } catch (err: any) {
      console.warn('[CLIPBOARD_API_DENIED]:', err);
      // Fail safely if security exceptions or blockages occur
      setPasteError('Permission denied or clipboard access blocked.');
    }
  };

  const isClose = value.length >= maxCharacters * 0.9;
  const isOver = value.length > maxCharacters;

  return (
    <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-4 shadow-sm focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
      {/* Label and Toolbar Node */}
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor="jobDescription" className="text-sm font-semibold text-slate-700 flex items-center gap-2">
          <span>💼</span> Target Job Description <span className="text-xs font-normal text-slate-400">(Optional)</span>
        </label>
        
        {/* Quick Paste Context Button */}
        {isClipboardSupported && (
          <button
            type="button"
            onClick={handlePasteFromClipboard}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            title="Paste text instantly from your system clipboard"
          >
            <span>📥</span>
            <span>Paste from Clipboard</span>
          </button>
        )}
      </div>

      {/* Input Core Area */}
      <div className="relative">
        <textarea
          id="jobDescription"
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxCharacters))}
          placeholder="Paste or type the target engineering role details here..."
          className="w-full resize-y bg-transparent py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed border border-slate-100 p-2 rounded-lg"
          style={{ minHeight: '76px' }}
        />
      </div>

      {/* Footer System Status Bar */}
      <div className="mt-3 flex items-center justify-between border-t border-slate-50 pt-2 text-xs">
        <div className="flex items-center gap-3">
          {pasteError ? (
            <span className="font-medium text-amber-600 animate-fadeIn">{pasteError}</span>
          ) : (
            <span className="text-slate-400">Quick-paste saves time formatting text profiles.</span>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-slate-500 hover:text-slate-700 underline focus:outline-none cursor-pointer"
            >
              Clear Draft
            </button>
          )}
        </div>
        
        {/* Live Character Limit Counter (#750 Verification Anchor) */}
        <div className={`font-semibold transition-colors ${isOver ? 'text-rose-600' : isClose ? 'text-amber-600' : 'text-slate-400'}`}>
          {value.length.toLocaleString()}/{maxCharacters.toLocaleString()}
        </div>
      </div>
    </div>
  );
};
