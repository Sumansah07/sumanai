'use client';

import React, { useState, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import { User, Bot, Copy, Check } from 'lucide-react';
import { Message as MessageType } from '@/types/chat';
import { cn, formatTime, copyToClipboard } from '@/lib/utils';
import 'highlight.js/styles/github-dark.css';

interface MessageProps {
  message: MessageType;
  isStreaming?: boolean;
}

interface CodeBlockProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function CodeBlock({ inline, className, children, ...props }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    await copyToClipboard(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && language) {
    return (
      <div className="relative group my-4">
        <div className="absolute top-0 left-0 px-2 py-1 text-xs text-zinc-400 bg-zinc-900 rounded-tl-lg">
          {language}
        </div>
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-zinc-400" />
          )}
        </button>
        <pre className="!bg-zinc-950 border border-zinc-800 rounded-lg overflow-x-auto">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
      </div>
    );
  }

  if (!inline) {
    return (
      <div className="relative group my-4">
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors opacity-0 group-hover:opacity-100 z-10"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-zinc-400" />
          )}
        </button>
        <pre className="!bg-zinc-950 border border-zinc-800 rounded-lg overflow-x-auto p-4">
          <code {...props}>{children}</code>
        </pre>
      </div>
    );
  }

  return (
    <code className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-sm" {...props}>
      {children}
    </code>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-3 py-2">
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
      <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
    </div>
  );
}

export const Message = memo(function Message({ message, isStreaming = false }: MessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return null; // Don't render system messages in the UI
  }

  return (
    <div
      className={cn(
        "flex gap-4 py-6 px-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          isUser ? "bg-blue-600" : "bg-zinc-700"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-lg px-4 py-3 max-w-4xl",
            isUser
              ? "bg-blue-600/10 border border-blue-600/20"
              : "bg-zinc-800/50 border border-zinc-800"
          )}
        >
          {message.content.length === 0 && isStreaming ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-invert max-w-none prose-sm">
              <ReactMarkdown
                rehypePlugins={[[rehypeHighlight, { detect: true }]]}
                components={{
                  code: CodeBlock as any,
                  pre: ({ children }) => (
                    <div className="not-prose">{children}</div>
                  ),
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mt-6 mb-4 text-zinc-100">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mt-5 mb-3 text-zinc-100">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-4 mb-2 text-zinc-100">{children}</h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-base font-semibold mt-3 mb-2 text-zinc-200">{children}</h4>
                  ),
                  p: ({ children, node }) => {
                    // Check if this paragraph contains code blocks
                    const hasCodeBlock = node?.children?.some(
                      (child: any) => child.tagName === 'pre' || child.tagName === 'code'
                    );
                    
                    if (hasCodeBlock) {
                      return <div className="my-2 leading-relaxed text-zinc-300">{children}</div>;
                    }
                    
                    return <p className="my-2 leading-relaxed text-zinc-300">{children}</p>;
                  },
                  ul: ({ children }) => (
                    <ul className="my-2 ml-4 list-disc list-outside space-y-1 text-zinc-300">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="my-2 ml-4 list-decimal list-outside space-y-1 text-zinc-300">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="ml-2 text-zinc-300">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-zinc-600 pl-4 my-4 text-zinc-400 italic">
                      {children}
                    </blockquote>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 underline-offset-2 transition-colors"
                    >
                      {children}
                    </a>
                  ),
                  strong: ({ children }) => (
                    <strong className="font-semibold text-zinc-100">{children}</strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-zinc-300">{children}</em>
                  ),
                  hr: () => <hr className="my-4 border-zinc-700" />,
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-4">
                      <table className="min-w-full border border-zinc-700 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-zinc-800">{children}</thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-zinc-700">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-zinc-800/50 transition-colors">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 text-sm text-zinc-300">{children}</td>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="mt-1 px-2 text-xs text-zinc-500">
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  );
});
