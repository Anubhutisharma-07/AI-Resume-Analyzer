import React, { useState } from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (newValue: string) => void;
  maxCharacters?: number;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value = '',
  onChange,
  maxCharacters = 2000,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    // Enforce the strict backend character ceiling boundary right at the input loop
    if (text.length <= maxCharacters) {
      onChange(text);
    }
  };

  const characterCount = value.length;
  const isNearLimit = characterCount >= maxCharacters * 0.9;
  const isAtLimit = characterCount === maxCharacters;

  return (
    <div 
      className={`w-full max-w-2xl rounded-xl border p-4 bg-white shadow-sm transition-all duration-200 ${
        isFocused 
          ? 'border-blue-500 ring-1 ring-blue-500/30' 
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Label and New Redesigned Icon Section */}
      <div className="mb-2.5 flex items-center gap-2 text-slate-700">
        <span className="text-base text-slate-500 flex items-center justify-center">
          {/* New visual anchor icon element from the recent redesign */}
          📄
        </span>
        <label htmlFor="jobDescription" className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Target Job Description
        </label>
      </div>

      {/* Input Text Area Wrapper */}
      <div className="relative">
        <textarea
          id="jobDescription"
          rows={6}
          value={value}
          onChange={handleTextChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Redesigned Placeholder: Paste or type the core engineering skills, requirements, or complete job description profile here to begin analysis..."
          className="w-full resize-none bg-transparent py-1 text-sm text-slate-800 placeholder-slate-400 focus:outline-none leading-relaxed min-h-[120px]"
        />
      </div>

      {/* Bottom Status Bar holding the validated Character Counter */}
      <div className="mt-2 flex items-center justify-between border-t border-slate-50 pt-2">
        <p className="text-[11px] text-slate-400 italic">
          ATS analytical engine parses keywords automatically below.
        </p>

        {/* Live Character Limit Counter Utility Element */}
        <div 
          className={`text-xs font-mono font-bold px-2 py-0.5 rounded transition-colors duration-150 ${
            isAtLimit 
              ? 'bg-rose-50 text-rose-600' 
              : isNearLimit 
                ? 'bg-amber-50 text-amber-600' 
                : 'text-slate-400'
          }`}
          aria-label={`Character count: ${characterCount} out of ${maxCharacters}`}
        >
          {characterCount}/{maxCharacters}
        </div>
      </div>
    </div>
  );
};
