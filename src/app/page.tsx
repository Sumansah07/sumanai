"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { TopBar } from "@/components/TopBar";
import { ChatView } from "@/components/ChatView";
import { SystemPromptModal } from "@/components/SystemPromptModal";
import { SettingsModal } from "@/components/SettingsModal";
import { ApiKeyHelper } from "@/components/ApiKeyHelper";
import { ClientOnly } from "@/components/ClientOnly";

export default function HomePage() {
  const [isSystemPromptOpen, setIsSystemPromptOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ClientOnly fallback={
      <div className="flex h-screen bg-zinc-950">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-zinc-400">Loading...</div>
        </div>
      </div>
    }>
      <div className="flex h-screen bg-zinc-950 overflow-hidden">
        {/* API Key Helper (shows only if API key is not configured or invalid) */}
        <ApiKeyHelper />

        {/* Sidebar - always rendered, handles its own mobile visibility */}
        <Sidebar
          onOpenSystemPrompt={() => setIsSystemPromptOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-w-0 w-full">
          {/* Top Bar */}
          <TopBar 
            onOpenSystemPrompt={() => setIsSystemPromptOpen(true)}
            onToggleSidebar={toggleSidebar}
          />

          {/* Chat View */}
          <ChatView />
        </div>

        {/* Modals */}
        <SystemPromptModal
          isOpen={isSystemPromptOpen}
          onClose={() => setIsSystemPromptOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
      </div>
    </ClientOnly>
  );
}
