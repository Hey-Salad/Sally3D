'use client';

import { useRef, useState, KeyboardEvent } from 'react';
import { 
  Plus, 
  Paperclip, 
  Globe, 
  ArrowUp, 
  Loader2,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function ChatInput({ 
  onSend, 
  isLoading = false,
  placeholder = 'Ask HeySalad anything...'
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [researchActive, setResearchActive] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    const ta = e.target;
    ta.style.height = 'auto';
    ta.style.height = `${Math.min(ta.scrollHeight, 200)}px`;
  };

  return (
    <div className="rounded-3xl bg-card border border-border focus-within:border-border/80 transition-colors">
      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        disabled={isLoading}
        className="w-full resize-none bg-transparent px-5 pt-4 pb-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none text-base"
      />

      {/* Action bar */}
      <div className="flex items-center justify-between px-3 pb-3 pt-1">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Add"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
            aria-label="Attach file"
          >
            <Paperclip className="w-[18px] h-[18px]" />
          </button>
          <button
            type="button"
            onClick={() => setResearchActive(!researchActive)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors',
              researchActive
                ? 'bg-coral-glow text-coral border border-coral/30'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60 border border-transparent'
            )}
          >
            <Globe className="w-4 h-4" />
            <span>Research</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-coral" />
            <span>GPT-4o</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !value.trim()}
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center transition-all',
              value.trim() && !isLoading
                ? 'bg-coral hover:bg-coral/90 text-white shadow-lg shadow-coral/20'
                : 'bg-secondary text-muted-foreground cursor-not-allowed'
            )}
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
