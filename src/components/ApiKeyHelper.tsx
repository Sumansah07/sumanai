"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Key,
  Copy,
  RefreshCw,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiStatus {
  configured: boolean;
  valid?: boolean;
  error?: string;
  warning?: string;
  keyPrefix?: string;
  modelsAvailable?: number;
  message?: string;
  help?: string;
}

export function ApiKeyHelper() {
  const [status, setStatus] = useState<ApiStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if user has previously dismissed the helper
    const wasDismissed = localStorage.getItem("groq-api-helper-dismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const checkApiStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch("/api/test");
      const data = await response.json();
      setStatus(data);

      // Auto-show setup if API key is not configured or invalid (unless dismissed)
      if (!data.configured || !data.valid) {
        if (!dismissed) {
          setShowSetup(true);
        }
      } else {
        setShowSetup(false);
        setDismissed(false);
        localStorage.removeItem("groq-api-helper-dismissed");
      }
    } catch (error) {
      setStatus({
        configured: false,
        error: "Failed to check API status",
      });
      if (!dismissed) {
        setShowSetup(true);
      }
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (mounted && !dismissed) {
      checkApiStatus();
    }
  }, [mounted, dismissed]);

  // Add keyboard shortcut to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSetup) {
        handleClose();
      }
    };

    if (showSetup) {
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSetup]);

  const copyExample = async () => {
    const example = "GROQ_API_KEY=gsk_your_actual_api_key_here";
    try {
      await navigator.clipboard.writeText(example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClose = () => {
    setShowSetup(false);
    // If API is not valid, remember that user dismissed the helper
    if (!status?.valid) {
      setDismissed(true);
      localStorage.setItem("groq-api-helper-dismissed", "true");
    }
  };

  const handleReopen = () => {
    setShowSetup(true);
    setDismissed(false);
    localStorage.removeItem("groq-api-helper-dismissed");
  };

  // Don't render until mounted to avoid hydration issues
  if (!mounted || !status) {
    return null;
  }

  // Hide the success indicator completely
  if (status.configured && status.valid && !showSetup) {
    return null;
  }

  // If API is not valid but user dismissed, show a small reopener
  if ((!status.configured || !status.valid) && dismissed && !showSetup) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          onClick={handleReopen}
          className="flex items-center gap-2 px-3 py-2 bg-amber-600/10 border border-amber-600/20 rounded-lg hover:bg-amber-600/20 transition-colors"
        >
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span className="text-sm text-amber-400">API Key Required</span>
        </button>
      </div>
    );
  }

  // Don't show the modal if it's closed
  if (!showSetup) {
    return null;
  }

  // Show setup helper
  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  status.valid ? "bg-green-600/10" : "bg-red-600/10",
                )}
              >
                {status.valid ? (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-400" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold">Groq API Setup</h2>
                <p className="text-sm text-zinc-400 mt-1">
                  {status.configured
                    ? status.valid
                      ? "Your API key is configured and working"
                      : "Your API key needs attention"
                    : "Let's set up your Groq API key"}
                </p>
              </div>
            </div>
            {/* Always show close button */}
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Close"
              title="Close (you can reopen from the bottom right)"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Status Display */}
          <div
            className={cn(
              "p-4 rounded-lg border",
              status.valid
                ? "bg-green-600/10 border-green-600/20"
                : status.configured
                  ? "bg-amber-600/10 border-amber-600/20"
                  : "bg-red-600/10 border-red-600/20",
            )}
          >
            <div className="flex items-start gap-3">
              {status.valid ? (
                <CheckCircle className="w-5 h-5 text-green-400 mt-0.5" />
              ) : status.configured ? (
                <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-400 mt-0.5" />
              )}
              <div className="flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    status.valid
                      ? "text-green-400"
                      : status.configured
                        ? "text-amber-400"
                        : "text-red-400",
                  )}
                >
                  {status.message ||
                    status.error ||
                    status.warning ||
                    "API key not configured"}
                </p>
                {status.help && (
                  <p className="text-xs text-zinc-400 mt-1">{status.help}</p>
                )}
                {status.keyPrefix && (
                  <p className="text-xs text-zinc-500 mt-2">
                    Current key:{" "}
                    <code className="px-1 py-0.5 bg-zinc-800 rounded">
                      {status.keyPrefix}
                    </code>
                  </p>
                )}
                {status.modelsAvailable !== undefined &&
                  status.modelsAvailable > 0 && (
                    <p className="text-xs text-zinc-400 mt-1">
                      {status.modelsAvailable} models available
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Setup Instructions */}
          {(!status.configured || !status.valid) && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-zinc-300">
                Setup Instructions:
              </h3>

              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs">
                    1
                  </span>
                  <div>
                    <p className="text-zinc-300">
                      Get your API key from Groq Console
                    </p>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-1 text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Open Groq Console
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs">
                    2
                  </span>
                  <div>
                    <p className="text-zinc-300">
                      Create a{" "}
                      <code className="px-1 py-0.5 bg-zinc-800 rounded">
                        .env.local
                      </code>{" "}
                      file in your project root
                    </p>
                    <div className="mt-2 p-3 bg-zinc-800 rounded-lg font-mono text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400">
                          GROQ_API_KEY=gsk_your_actual_key_here
                        </span>
                        <button
                          onClick={copyExample}
                          className="p-1 hover:bg-zinc-700 rounded transition-colors"
                          aria-label="Copy to clipboard"
                        >
                          {copied ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-zinc-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 bg-zinc-800 rounded-full flex items-center justify-center text-xs">
                    3
                  </span>
                  <div>
                    <p className="text-zinc-300">
                      Restart your development server
                    </p>
                    <code className="block mt-2 p-2 bg-zinc-800 rounded text-xs text-zinc-400">
                      npm run dev
                    </code>
                  </div>
                </li>
              </ol>

              <div className="p-3 bg-blue-600/10 border border-blue-600/20 rounded-lg">
                <div className="flex gap-2">
                  <Key className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div className="text-xs text-blue-400">
                    <p className="font-medium">Security Note</p>
                    <p className="mt-1">
                      Your API key is kept secure on the server and never
                      exposed to the browser.
                    </p>
                  </div>
                </div>
              </div>

              {/* Note about dismissing */}
              <div className="text-xs text-zinc-500 text-center mt-4 p-3 bg-zinc-800/50 rounded-lg">
                <p>
                  💡 <strong>Tip:</strong> You can close this dialog and
                  continue without an API key, but the chat won't work until
                  configured.
                </p>
                <p className="mt-1">
                  Press{" "}
                  <kbd className="px-1.5 py-0.5 mx-1 text-xs bg-zinc-700 rounded">
                    Esc
                  </kbd>{" "}
                  or click outside to close.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
          <button
            onClick={checkApiStatus}
            disabled={isChecking}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={cn("w-4 h-4", isChecking && "animate-spin")}
            />
            <span className="text-sm">Recheck Status</span>
          </button>

          <div className="flex items-center gap-2">
            {/* Always show close/continue button */}
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-sm"
            >
              {status.valid ? "Close" : "Continue Anyway"}
            </button>

            {!status.valid && (
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-sm"
              >
                Get API Key
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
