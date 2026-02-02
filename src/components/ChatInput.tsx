'use client';

import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Square, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopStreaming?: () => void;
  isStreaming: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({
  onSendMessage,
  onStopStreaming,
  isStreaming,
  disabled = false,
  placeholder = "Type your message here...",
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const minHeight = window.innerWidth >= 640 ? 48 : 44; // Match CSS heights
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.max(minHeight, Math.min(scrollHeight, maxHeight))}px`;
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    if (message.trim() && !isStreaming && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      // Reset textarea height
      if (textareaRef.current) {
        const minHeight = window.innerWidth >= 640 ? 48 : 44;
        textareaRef.current.style.height = `${minHeight}px`;
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStop = () => {
    if (onStopStreaming) {
      onStopStreaming();
    }
  };

  return (
    <div className="border-t border-zinc-800 bg-zinc-900/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative w-full">
          {/* Textarea Container */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              disabled={disabled || isStreaming}
              placeholder={placeholder}
              className={cn(
                "w-full resize-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 sm:px-4 py-2 sm:py-3 pr-12 sm:pr-14 text-sm",
                "placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600",
                "transition-colors scrollbar-none overflow-hidden",
                "h-[44px] sm:h-[48px] max-h-[200px]",
                (disabled || isStreaming) && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />

            {/* Send/Stop Button - Inside input field */}
            {isStreaming ? (
              <button
                onClick={handleStop}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-md bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center shrink-0 shadow-none focus:shadow-none focus:outline-none active:shadow-none"
                title="Stop generation"
              >
                <Square className="w-3 h-3 sm:w-4 sm:h-4 text-white fill-current" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || disabled}
                className={cn(
                  "absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 transition-colors flex items-center justify-center shrink-0 bg-transparent hover:bg-transparent border-none shadow-none focus:shadow-none focus:outline-none active:shadow-none",
                  !message.trim() && "opacity-50"
                )}
                title="Send message (Enter)"
              >
                {disabled ? (
                  <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-zinc-400 animate-spin" />
                ) : (
                  <Send className={cn(
                    "w-4 h-4 sm:w-5 sm:h-5 transition-colors",
                    message.trim() && !disabled ? "text-blue-500 hover:text-blue-400" : "text-zinc-500"
                  )} />
                )}
              </button>
            )}

            {/* Character count (optional, shown when message is long) */}
            {message.length > 500 && (
              <div className="absolute bottom-2 right-14 text-xs text-zinc-500">
                {message.length} / 4000
              </div>
            )}
          </div>
        </div>

        {/* Helper text */}
        <div className="mt-2 flex items-center justify-center text-xs text-zinc-500">
          <span className="hidden sm:inline text-center">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Enter</kbd> to send,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Shift + Enter</kbd> for new line
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5 absolute right-0">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Generating response...</span>
              <span className="sm:hidden">Generating...</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
