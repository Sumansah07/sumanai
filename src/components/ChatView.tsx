'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useChat } from '@/context/ChatContext';
import { Message } from './Message';
import { ChatInput } from './ChatInput';
import { generateId, parseSSEMessage } from '@/lib/utils';
import { Message as MessageType } from '@/types/chat';
import { AlertCircle, Loader2 } from 'lucide-react';

export function ChatView() {
  const { state, dispatch } = useChat();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [state.currentConversation?.messages, scrollToBottom]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || state.isStreaming) return;

    setError(null);

    // Add user message
    const userMessage: MessageType = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
      model: state.selectedModel,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });

    // Prepare messages for API including system prompt
    const messages = [
      {
        role: 'system' as const,
        content: state.systemPrompt,
      },
      ...(state.currentConversation?.messages || []).map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user' as const,
        content,
      },
    ];

    console.log('Sending system prompt:', state.systemPrompt);

    // Create assistant message placeholder
    const assistantMessageId = generateId();
    const assistantMessage: MessageType = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: state.selectedModel,
    };

    dispatch({ type: 'ADD_MESSAGE', payload: assistantMessage });
    setStreamingMessageId(assistantMessageId);
    dispatch({ type: 'SET_STREAMING', payload: true });

    try {
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: state.selectedModel,
          messages,
          temperature: state.temperature,
          stream: true,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      if (!response.body) {
        throw new Error('Response body is missing');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.trim()) {
            const parsed = parseSSEMessage(line);

            if (parsed && parsed.done) {
              break;
            }

            if (parsed && parsed.choices && parsed.choices[0]?.delta?.content) {
              const deltaContent = parsed.choices[0].delta.content;
              accumulatedContent += deltaContent;

              dispatch({
                type: 'UPDATE_MESSAGE',
                payload: {
                  messageId: assistantMessageId,
                  content: accumulatedContent,
                },
              });
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);

      if (error.name !== 'AbortError') {
        setError(error.message || 'Failed to get response from AI');

        // Remove the empty assistant message if streaming failed
        if (assistantMessage.content === '') {
          dispatch({ type: 'DELETE_MESSAGE', payload: assistantMessageId });
        }
      }
    } finally {
      dispatch({ type: 'SET_STREAMING', payload: false });
      setStreamingMessageId(null);
      abortControllerRef.current = null;
    }
  };

  const handleStopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      dispatch({ type: 'SET_STREAMING', payload: false });
      setStreamingMessageId(null);
    }
  };

  const handleEditMessage = (messageId: string, newContent: string) => {
    dispatch({
      type: 'UPDATE_MESSAGE',
      payload: {
        messageId,
        content: newContent,
      },
    });
    
    // Trigger new AI response after editing user message
    const editedMessage = currentMessages.find(msg => msg.id === messageId);
    if (editedMessage && editedMessage.role === 'user') {
      handleSendMessage(newContent);
    }
  };

  const currentMessages = state.currentConversation?.messages || [];

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {currentMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4 sm:p-8">
            <div className="text-center max-w-md w-full">
              <div className="mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 sm:w-10 sm:h-10 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Talk to Suman AI
              </h2>
              <p className="text-zinc-400 mb-4 sm:mb-6 text-sm sm:text-base">
                Ask me anything! I can help with coding, writing, learning, problem-solving, and more.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                <button
                  onClick={() => handleSendMessage("Help me write a Python function to sort a list")}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-center"
                >
                  💻 Code example
                </button>
                <button
                  onClick={() => handleSendMessage("Explain quantum computing in simple terms")}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-center"
                >
                  🎓 Learn something
                </button>
                <button
                  onClick={() => handleSendMessage("Help me write a professional email")}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-center"
                >
                  ✍️ Writing help
                </button>
                <button
                  onClick={() => handleSendMessage("Give me creative ideas for a weekend project")}
                  className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-center"
                >
                  💡 Brainstorm
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            {currentMessages.map((message) => (
              <Message
                key={message.id}
                message={message}
                isStreaming={state.isStreaming && message.id === streamingMessageId}
                onEditMessage={handleEditMessage}
              />
            ))}
            {state.isStreaming && streamingMessageId && (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>AI is thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-4xl mx-auto px-4 mb-4">
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-red-400 font-medium">Error</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSendMessage={handleSendMessage}
        onStopStreaming={handleStopStreaming}
        isStreaming={state.isStreaming}
        disabled={isLoading}
        placeholder={
          state.currentConversation
            ? "Continue the conversation..."
            : "Start a new conversation..."
        }
      />
    </div>
  );
}
