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
      const maxHeight = 200; // Max height in pixels
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
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
        textareaRef.current.style.height = 'auto';
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
        <div className="relative flex items-end gap-2 sm:gap-3">
          {/* Textarea Container */}
          <div className="flex-1 relative">
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
                "w-full resize-none rounded-lg bg-zinc-800 border border-zinc-700 px-3 sm:px-4 py-2 sm:py-3 text-sm",
                "placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600",
                "transition-colors scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent",
                "min-h-[44px] sm:min-h-[52px] max-h-[200px]",
                (disabled || isStreaming) && "opacity-50 cursor-not-allowed"
              )}
              rows={1}
            />

            {/* Character count (optional, shown when message is long) */}
            {message.length > 500 && (
              <div className="absolute bottom-2 right-2 text-xs text-zinc-500">
                {message.length} / 4000
              </div>
            )}
          </div>

          {/* Send/Stop Button */}
          {isStreaming ? (
            <button
              onClick={handleStop}
              className="p-2 sm:p-3 rounded-lg bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center shrink-0"
              title="Stop generation"
            >
              <Square className="w-4 h-4 text-white fill-current" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!message.trim() || disabled}
              className={cn(
                "p-2 sm:p-3 rounded-lg transition-colors flex items-center justify-center shrink-0",
                message.trim() && !disabled
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-zinc-800 cursor-not-allowed",
                !message.trim() && "opacity-50"
              )}
              title="Send message (Enter)"
            >
              {disabled ? (
                <Loader2 className="w-4 h-4 text-zinc-400 animate-spin" />
              ) : (
                <Send className="w-4 h-4 text-white" />
              )}
            </button>
          )}
        </div>

        {/* Helper text */}
        <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
          <span className="hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Enter</kbd> to send,{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">Shift + Enter</kbd> for new line
          </span>
          <span className="sm:hidden text-xs">
            <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-400">Enter</kbd> to send
          </span>
          {isStreaming && (
            <span className="flex items-center gap-1.5">
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
