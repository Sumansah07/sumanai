"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Sliders, AlertCircle, RefreshCw, Menu } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";
import { Model } from "@/types/chat";

interface TopBarProps {
  onOpenSystemPrompt: () => void;
  onToggleSidebar?: () => void;
}

export function TopBar({ onOpenSystemPrompt, onToggleSidebar }: TopBarProps) {
  const { state, dispatch, setAvailableModels } = useChat();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch available models on component mount
  useEffect(() => {
    if (mounted) {
      fetchModels();
    }
  }, [mounted]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchModels = async () => {
    setIsLoadingModels(true);
    setModelError(null);

    try {
      const response = await fetch("/api/models");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch models");
      }

      const data = await response.json();
      const models = data.data as Model[];

      if (models && models.length > 0) {
        setAvailableModels(models);

        // If current selected model is not in the list, select the first one
        if (!models.find((m) => m.id === state.selectedModel)) {
          dispatch({ type: "SET_MODEL", payload: models[0].id });
        }
      } else {
        throw new Error("No models available");
      }
    } catch (error) {
      console.error("Error fetching models:", error);
      setModelError(
        error instanceof Error ? error.message : "Failed to load models",
      );

      // Set default fallback models if API fails
      const fallbackModels: Model[] = [
        {
          id: "llama-3.3-70b-versatile",
          object: "model",
          created: 1640995200000,
          owned_by: "meta",
          active: true,
          context_window: 32768,
        },
        {
          id: "mixtral-8x7b-32768",
          object: "model",
          created: 1640995200000,
          owned_by: "mistralai",
          active: true,
          context_window: 32768,
        },
        {
          id: "gemma-7b-it",
          object: "model",
          created: 1640995200000,
          owned_by: "google",
          active: true,
          context_window: 8192,
        },
      ];
      setAvailableModels(fallbackModels);
    } finally {
      setIsLoadingModels(false);
    }
  };

  const handleSelectModel = (modelId: string) => {
    dispatch({ type: "SET_MODEL", payload: modelId });
    setIsDropdownOpen(false);
  };

  const formatContextWindow = (contextWindow: number): string => {
    if (contextWindow >= 1000000) {
      return `${(contextWindow / 1000000).toFixed(1)}M`;
    }
    if (contextWindow >= 1000) {
      return `${(contextWindow / 1000).toFixed(0)}K`;
    }
    return contextWindow.toString();
  };

  const selectedModelInfo = state.availableModels.find(
    (m) => m.id === state.selectedModel,
  );

  return (
    <div className="h-12 sm:h-14 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm px-2 sm:px-4 flex items-center justify-between overflow-hidden">
      {/* Mobile hamburger menu and Model Selector */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {/* Mobile hamburger menu */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors shrink-0"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}
        
        {/* Model Selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            ref={buttonRef}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={isLoadingModels}
            className={cn(
              "w-full flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs sm:text-sm",
              "border border-zinc-700 hover:border-zinc-600",
              isLoadingModels && "opacity-50 cursor-not-allowed",
            )}
          >
            {isLoadingModels ? (
              <>
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin shrink-0" />
                <span className="truncate text-xs sm:text-sm">Loading...</span>
              </>
            ) : modelError ? (
              <>
                <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 shrink-0" />
                <span className="text-red-400 truncate text-xs sm:text-sm">Error</span>
              </>
            ) : (
              <>
                <span className="font-medium truncate text-xs sm:text-sm">
                  <span className="inline sm:hidden">
                    {state.selectedModel.split("-").slice(0, 2).join("-")}
                  </span>
                  <span className="hidden sm:inline">
                    {state.selectedModel}
                  </span>
                </span>
                {selectedModelInfo && (
                  <span className="text-xs text-zinc-400 hidden md:inline shrink-0">
                    ({formatContextWindow(selectedModelInfo.context_window)})
                  </span>
                )}
                <ChevronDown
                  className={cn(
                    "w-3 h-3 sm:w-4 sm:h-4 transition-transform shrink-0 ml-auto",
                    isDropdownOpen && "rotate-180",
                  )}
                />
              </>
            )}
          </button>

          {/* Dropdown Portal */}
          {mounted && isDropdownOpen && !isLoadingModels && createPortal(
            <DropdownContent
              buttonRef={buttonRef}
              dropdownRef={dropdownRef}
              modelError={modelError}
              availableModels={state.availableModels}
              selectedModel={state.selectedModel}
              onSelectModel={handleSelectModel}
              onRetry={() => {
                setIsDropdownOpen(false);
                fetchModels();
              }}
              formatContextWindow={formatContextWindow}
            />,
            document.body
          )}
        </div>

        {/* Context window indicator - hidden on small screens */}
        {selectedModelInfo && !modelError && !isLoadingModels && (
          <div className="hidden lg:flex items-center gap-1 text-xs text-zinc-500 shrink-0">
            <span className="hidden xl:inline">Context:</span>
            <span className="text-zinc-400 font-mono">
              {formatContextWindow(selectedModelInfo.context_window)}
            </span>
          </div>
        )}
      </div>

      {/* System Prompt Button */}
      <button
        onClick={onOpenSystemPrompt}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-xs sm:text-sm border border-zinc-700 hover:border-zinc-600 shrink-0 ml-2"
        aria-label="System Prompt Settings"
      >
        <Sliders className="w-3 h-3 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">System</span>
        <span className="sm:hidden">Set</span>
      </button>
    </div>
  );
}

interface DropdownContentProps {
  buttonRef: React.RefObject<HTMLButtonElement | null>;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
  modelError: string | null;
  availableModels: Model[];
  selectedModel: string;
  onSelectModel: (modelId: string) => void;
  onRetry: () => void;
  formatContextWindow: (contextWindow: number) => string;
}

function DropdownContent({
  buttonRef,
  dropdownRef,
  modelError,
  availableModels,
  selectedModel,
  onSelectModel,
  onRetry,
  formatContextWindow,
}: DropdownContentProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: Math.max(rect.width, 320),
      });
    }
  }, [buttonRef]);

  return (
    <div
      ref={dropdownRef}
      className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl overflow-hidden"
      style={{
        top: position.top,
        left: position.left,
        width: position.width,
        zIndex: 9999,
      }}
    >
      <div className="max-h-60 sm:max-h-96 overflow-y-auto">
        {modelError ? (
          <div className="p-4 text-center">
            <p className="text-xs sm:text-sm text-red-400 mb-2">
              {modelError}
            </p>
            <button
              onClick={onRetry}
              className="text-xs text-blue-400 hover:text-blue-300 underline"
            >
              Retry
            </button>
          </div>
        ) : availableModels.length === 0 ? (
          <div className="p-4 text-center text-xs sm:text-sm text-zinc-400">
            No models available
          </div>
        ) : (
          <div className="py-1">
            {availableModels.map((model) => (
              <button
                key={model.id}
                onClick={() => onSelectModel(model.id)}
                className={cn(
                  "w-full text-left px-3 sm:px-4 py-2 sm:py-2.5 hover:bg-zinc-700/50 transition-colors",
                  selectedModel === model.id && "bg-zinc-700",
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium truncate">
                      {model.id}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      <span className="hidden sm:inline">
                        by {model.owned_by} •{" "}
                      </span>
                      {formatContextWindow(model.context_window)} tokens
                    </p>
                  </div>
                  {selectedModel === model.id && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0 ml-2" />
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
