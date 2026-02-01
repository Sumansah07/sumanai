"use client";

import React, { useState, useEffect } from "react";
import { X, Thermometer, Info, Save } from "lucide-react";
import { useChat } from "@/context/ChatContext";
import { cn } from "@/lib/utils";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { state, dispatch } = useChat();
  const [temperature, setTemperature] = useState(state.temperature);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setTemperature(state.temperature);
    setHasChanges(false);
  }, [state.temperature, isOpen]);

  useEffect(() => {
    setHasChanges(temperature !== state.temperature);
  }, [temperature, state.temperature]);

  const handleSave = () => {
    dispatch({ type: "SET_TEMPERATURE", payload: temperature });
    onClose();
  };

  const handleCancel = () => {
    setTemperature(state.temperature);
    onClose();
  };

  const getTemperatureDescription = (temp: number): string => {
    if (temp <= 0.2)
      return "Very Conservative - Highly focused and deterministic";
    if (temp <= 0.4) return "Conservative - More predictable responses";
    if (temp <= 0.6) return "Balanced - Good mix of consistency and creativity";
    if (temp <= 0.8) return "Creative - More varied and imaginative responses";
    return "Very Creative - Highly varied and unpredictable";
  };

  const getTemperatureColor = (temp: number): string => {
    if (temp <= 0.2) return "text-blue-400";
    if (temp <= 0.4) return "text-cyan-400";
    if (temp <= 0.6) return "text-green-400";
    if (temp <= 0.8) return "text-orange-400";
    return "text-red-400";
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
          className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl w-full max-w-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
            <div>
              <h2 className="text-xl font-semibold text-white">Settings</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Configure model behavior and preferences
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
          <div className="p-6 space-y-6">
            {/* Temperature Setting */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Thermometer className="w-5 h-5 text-zinc-400" />
                <label
                  htmlFor="temperature"
                  className="text-sm font-medium text-zinc-300"
                >
                  Temperature
                </label>
                <div className="group relative">
                  <Info className="w-4 h-4 text-zinc-500 cursor-help" />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 p-2 bg-zinc-800 rounded-lg text-xs text-zinc-300 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity">
                    Temperature controls the randomness of the AI's responses.
                    Lower values make the output more focused and deterministic,
                    while higher values make it more creative and varied.
                  </div>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    id="temperature"
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="absolute -bottom-6 left-0 text-xs text-zinc-500">
                    0.0
                  </div>
                  <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-zinc-500">
                    0.5
                  </div>
                  <div className="absolute -bottom-6 right-0 text-xs text-zinc-500">
                    1.0
                  </div>
                </div>

                {/* Current Value Display */}
                <div className="flex items-center justify-between mt-8">
                  <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-zinc-800 rounded-lg">
                      <span
                        className={cn(
                          "text-lg font-mono",
                          getTemperatureColor(temperature),
                        )}
                      >
                        {temperature.toFixed(1)}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-400">
                      {getTemperatureDescription(temperature)}
                    </p>
                  </div>
                </div>

                {/* Preset Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setTemperature(0.0)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg transition-colors",
                      temperature === 0.0
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
                    )}
                  >
                    Deterministic (0.0)
                  </button>
                  <button
                    onClick={() => setTemperature(0.3)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg transition-colors",
                      temperature === 0.3
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
                    )}
                  >
                    Focused (0.3)
                  </button>
                  <button
                    onClick={() => setTemperature(0.7)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg transition-colors",
                      temperature === 0.7
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
                    )}
                  >
                    Balanced (0.7)
                  </button>
                  <button
                    onClick={() => setTemperature(1.0)}
                    className={cn(
                      "px-3 py-1.5 text-xs rounded-lg transition-colors",
                      temperature === 1.0
                        ? "bg-blue-600 text-white"
                        : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400",
                    )}
                  >
                    Creative (1.0)
                  </button>
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-300 mb-3">
                Current Model
              </h3>
              <div className="bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-mono text-zinc-100">
                      {state.selectedModel}
                    </p>
                    {state.currentConversation && (
                      <p className="text-xs text-zinc-500 mt-1">
                        Active in current conversation
                      </p>
                    )}
                  </div>
                  {state.availableModels.find(
                    (m) => m.id === state.selectedModel,
                  ) && (
                    <div className="text-right">
                      <p className="text-xs text-zinc-400">Context Window</p>
                      <p className="text-sm font-mono text-zinc-300">
                        {state.availableModels
                          .find((m) => m.id === state.selectedModel)
                          ?.context_window.toLocaleString()}{" "}
                        tokens
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Additional Settings Info */}
            <div className="bg-amber-600/10 border border-amber-600/20 rounded-lg p-3">
              <p className="text-sm text-amber-400">
                <strong>Note:</strong> Temperature changes will only apply to
                new messages. Existing conversations maintain their original
                settings.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-800">
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
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed",
              )}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
