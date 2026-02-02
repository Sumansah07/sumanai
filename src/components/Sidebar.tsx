"use client";

import React, { useState } from "react";
import {
  Trash2,
  Plus,
  MessageSquare,
  Settings,
  Menu,
  Download,
  Upload,
  ChevronLeft,
} from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn, formatTimestamp } from "@/lib/utils";
import { StorageManager } from "@/lib/storage";

interface SidebarProps {
  onOpenSystemPrompt: () => void;
  onOpenSettings: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ onOpenSystemPrompt, onOpenSettings, isOpen = false, onClose }: SidebarProps) {
  const { state, dispatch } = useChat();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Determine sidebar open state
  const isDesktop = typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches;
  const sidebarOpen = isDesktop ? isOpen : isMobileOpen;

  const closeSidebar = () => {
    if (onClose) {
      onClose();
    } else {
      setIsMobileOpen(false);
    }
  };

  const handleNewConversation = () => {
    dispatch({ type: "NEW_CONVERSATION" });
    closeSidebar();
  };

  const handleSelectConversation = (conversationId: string) => {
    dispatch({ type: "SET_CONVERSATION", payload: conversationId });
    closeSidebar();
  };

  const handleDeleteConversation = (
    e: React.MouseEvent,
    conversationId: string,
  ) => {
    e.stopPropagation();
    dispatch({ type: "DELETE_CONVERSATION", payload: conversationId });
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all conversations? This cannot be undone.",
      )
    ) {
      dispatch({ type: "CLEAR_HISTORY" });
    }
  };

  const handleExport = () => {
    const data = StorageManager.exportConversations();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `groq-chat-export-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const text = await file.text();
        const success = StorageManager.importConversations(text);
        if (success) {
          window.location.reload();
        } else {
          alert(
            "Failed to import conversations. Please check the file format.",
          );
        }
      }
    };
    input.click();
  };

  return (
    <>
      {/* Mobile open button */}
      {!sidebarOpen && (
        <button
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 shadow-lg hover:bg-zinc-800 transition-colors"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-zinc-300" />
        </button>
      )}

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative top-0 left-0 h-full bg-zinc-900 border-r border-zinc-800 transition-all duration-300 z-40 flex flex-col overflow-hidden",
          sidebarOpen ? "w-[280px] sm:w-[320px] md:w-64" : "w-0 md:w-12",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Header */}
        <div className={cn("border-b border-zinc-800", sidebarOpen ? "p-4" : "hidden md:block md:p-2")}>
          <div className="flex items-center justify-between">
            <h1 className={cn(
              "font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent",
              sidebarOpen ? "text-lg" : "hidden md:block md:text-xs md:text-center md:w-full"
            )}>
              {sidebarOpen ? "Suman AI ChatBot" : "S"}
            </h1>
            <button
              onClick={closeSidebar}
              className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content - only show when expanded */}
        {sidebarOpen && (
          <>
            {/* New conversation button */}
            <div className="p-3">
              <button
                onClick={handleNewConversation}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>New Conversation</span>
              </button>
            </div>

            {/* Conversations list */}
            <div className="flex-1 overflow-y-auto px-3">
              {state.conversations.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-xs text-zinc-500">No conversations yet</p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Start a new chat to begin
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {state.conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onMouseEnter={() => setHoveredId(conversation.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      className={cn(
                        "w-full text-left px-3 py-2 rounded-lg transition-all duration-200 group relative cursor-pointer",
                        state.currentConversation?.id === conversation.id
                          ? "bg-zinc-800 text-white"
                          : "hover:bg-zinc-800/50 text-zinc-400 hover:text-white",
                      )}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex items-center gap-2 pr-8">
                        <MessageSquare className="w-4 h-4 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm">{conversation.title}</p>
                          <p className="text-xs text-zinc-500 mt-0.5">
                            {formatTimestamp(conversation.updatedAt)}
                          </p>
                        </div>
                      </div>
                      {(hoveredId === conversation.id ||
                        state.currentConversation?.id === conversation.id) && (
                        <button
                          onClick={(e) =>
                            handleDeleteConversation(e, conversation.id)
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-zinc-700 transition-colors"
                          aria-label="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-3 border-t border-zinc-800 space-y-1">
              <button
                onClick={() => {
                  onOpenSystemPrompt();
                  closeSidebar();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white text-sm"
              >
                <MessageSquare className="w-4 h-4" />
                <span>System Prompt</span>
              </button>

              <button
                onClick={() => {
                  onOpenSettings();
                  closeSidebar();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors text-zinc-400 hover:text-white text-sm"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              {/* Import/Export buttons */}
              <div className="flex gap-1 mt-2">
                <button
                  onClick={handleExport}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs text-zinc-500 hover:text-white"
                  title="Export conversations"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={handleImport}
                  className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors text-xs text-zinc-500 hover:text-white"
                  title="Import conversations"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Import</span>
                </button>
              </div>

              {/* Clear history button */}
              {state.conversations.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  className="w-full flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg hover:bg-red-600/10 transition-colors text-xs text-red-400 hover:text-red-300 mt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}