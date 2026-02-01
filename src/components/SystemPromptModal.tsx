'use client';

import React, { useState, useEffect } from 'react';
import { X, RotateCcw, Save } from 'lucide-react';
import { useChat } from '@/context/ChatContext';
import { cn, DEFAULT_SYSTEM_PROMPT } from '@/lib/utils';

interface SystemPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SystemPromptModal({ isOpen, onClose }: SystemPromptModalProps) {
  const { state, dispatch } = useChat();
  const [prompt, setPrompt] = useState(state.systemPrompt);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPrompt(state.systemPrompt);
    setHasChanges(false);
  }, [state.systemPrompt, isOpen]);

  useEffect(() => {
    setHasChanges(prompt !== state.systemPrompt);
  }, [prompt, state.systemPrompt]);

  const handleSave = () => {
    dispatch({ type: 'SET_SYSTEM_PROMPT', payload: prompt });
    onClose();
  };

  const handleReset = () => {
    setPrompt(DEFAULT_SYSTEM_PROMPT);
  };

  const handleCancel = () => {
    setPrompt(state.systemPrompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleCancel}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4 z-50 pointer-events-none">
        <div
          className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-semibold text-white">System Prompt</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Define how the AI assistant should behave and respond
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden p-6">
            <div className="h-full flex flex-col gap-4">
              {/* Info */}
              <div className="bg-blue-600/10 border border-blue-600/20 rounded-lg p-3">
                <p className="text-sm text-blue-400">
                  The system prompt sets the behavior and personality of the AI assistant.
                  It's sent with every message to maintain consistent responses.
                </p>
              </div>

              {/* Textarea */}
              <div className="flex-1 flex flex-col">
                <label htmlFor="system-prompt" className="text-sm font-medium text-zinc-300 mb-2">
                  Prompt Content
                </label>
                <textarea
                  id="system-prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter your system prompt here..."
                  className={cn(
                    "flex-1 w-full resize-none rounded-lg bg-zinc-800 border border-zinc-700",
                    "px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-500",
                    "focus:outline-none focus:border-zinc-600 transition-colors",
                    "scrollbar-thin scrollbar-thumb-zinc-600 scrollbar-track-transparent"
                  )}
                />

                {/* Character count */}
                <div className="mt-2 text-xs text-zinc-500 text-right">
                  {prompt.length} characters
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Quick Templates
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setPrompt("You are a helpful coding assistant. Provide clear, well-commented code examples and explain technical concepts in simple terms.")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Coding Assistant
                  </button>
                  <button
                    onClick={() => setPrompt("You are a creative writing assistant. Help with storytelling, character development, and provide engaging narrative suggestions.")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Creative Writer
                  </button>
                  <button
                    onClick={() => setPrompt("You are a study tutor. Break down complex topics, provide clear explanations, and create helpful study materials.")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Study Tutor
                  </button>
                  <button
                    onClick={() => setPrompt("You are a professional business consultant. Provide strategic advice, analyze problems, and suggest actionable solutions.")}
                    className="px-3 py-1.5 text-xs rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    Business Consultant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors text-zinc-400"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg text-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors",
                  hasChanges
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                )}
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
