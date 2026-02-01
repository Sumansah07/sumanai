"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from "react";
import {
  ChatState,
  ChatAction,
  Conversation,
  Message,
  Model,
} from "@/types/chat";
import { StorageManager } from "@/lib/storage";
import {
  generateId,
  generateConversationTitle,
  DEFAULT_SYSTEM_PROMPT,
} from "@/lib/utils";

const initialState: ChatState = {
  conversations: [],
  currentConversation: null,
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  selectedModel: "llama-3.3-70b-versatile",
  temperature: 0.7,
  isStreaming: false,
  availableModels: [],
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case "LOAD_CONVERSATIONS": {
      const conversations = action.payload.conversations || [];
      const currentId = action.payload.currentId;
      const current = currentId
        ? conversations.find((c: Conversation) => c.id === currentId)
        : null;

      return {
        ...state,
        conversations,
        currentConversation:
          current || (conversations.length > 0 ? conversations[0] : null),
      };
    }

    case "NEW_CONVERSATION": {
      const newConversation: Conversation = {
        id: generateId(),
        title: "New Conversation",
        messages: [],
        systemPrompt: state.systemPrompt,
        model: state.selectedModel,
        temperature: state.temperature,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedConversations = [newConversation, ...state.conversations];
      StorageManager.saveConversation(newConversation);
      StorageManager.saveCurrentConversationId(newConversation.id);

      return {
        ...state,
        conversations: updatedConversations,
        currentConversation: newConversation,
      };
    }

    case "SET_CONVERSATION": {
      const conversation = state.conversations.find(
        (c) => c.id === action.payload,
      );
      if (conversation) {
        StorageManager.saveCurrentConversationId(conversation.id);
        return {
          ...state,
          currentConversation: conversation,
          systemPrompt: conversation.systemPrompt,
          selectedModel: conversation.model,
          temperature: conversation.temperature,
        };
      }
      return state;
    }

    case "ADD_MESSAGE": {
      const message: Message = action.payload;

      if (!state.currentConversation) {
        // Create new conversation if none exists
        const newConversation: Conversation = {
          id: generateId(),
          title:
            message.role === "user"
              ? generateConversationTitle(message.content)
              : "New Conversation",
          messages: [message],
          systemPrompt: state.systemPrompt,
          model: state.selectedModel,
          temperature: state.temperature,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const updatedConversations = [newConversation, ...state.conversations];
        StorageManager.saveConversation(newConversation);
        StorageManager.saveCurrentConversationId(newConversation.id);

        return {
          ...state,
          conversations: updatedConversations,
          currentConversation: newConversation,
        };
      }

      const updatedConversation = {
        ...state.currentConversation,
        messages: [...state.currentConversation.messages, message],
        updatedAt: new Date(),
        title:
          state.currentConversation.messages.length === 0 &&
          message.role === "user"
            ? generateConversationTitle(message.content)
            : state.currentConversation.title,
      };

      const updatedConversations = state.conversations.map((c) =>
        c.id === updatedConversation.id ? updatedConversation : c,
      );

      StorageManager.saveConversation(updatedConversation);

      return {
        ...state,
        conversations: updatedConversations,
        currentConversation: updatedConversation,
      };
    }

    case "UPDATE_MESSAGE": {
      const { messageId, content } = action.payload;

      if (!state.currentConversation) return state;

      const updatedMessages = state.currentConversation.messages.map((msg) =>
        msg.id === messageId ? { ...msg, content } : msg,
      );

      const updatedConversation = {
        ...state.currentConversation,
        messages: updatedMessages,
        updatedAt: new Date(),
      };

      const updatedConversations = state.conversations.map((c) =>
        c.id === updatedConversation.id ? updatedConversation : c,
      );

      StorageManager.saveConversation(updatedConversation);

      return {
        ...state,
        conversations: updatedConversations,
        currentConversation: updatedConversation,
      };
    }

    case "DELETE_CONVERSATION": {
      const conversationId = action.payload;
      const updatedConversations = state.conversations.filter(
        (c) => c.id !== conversationId,
      );

      StorageManager.deleteConversation(conversationId);

      const newCurrent =
        state.currentConversation?.id === conversationId
          ? updatedConversations[0] || null
          : state.currentConversation;

      if (newCurrent) {
        StorageManager.saveCurrentConversationId(newCurrent.id);
      } else {
        StorageManager.saveCurrentConversationId(null);
      }

      return {
        ...state,
        conversations: updatedConversations,
        currentConversation: newCurrent,
      };
    }

    case "CLEAR_HISTORY": {
      StorageManager.clearAllConversations();
      return {
        ...state,
        conversations: [],
        currentConversation: null,
      };
    }

    case "SET_SYSTEM_PROMPT": {
      const newPrompt = action.payload;
      StorageManager.saveSettings({
        temperature: state.temperature,
        systemPrompt: newPrompt,
        selectedModel: state.selectedModel,
        maxStoredConversations: 50,
      });

      if (state.currentConversation) {
        const updatedConversation = {
          ...state.currentConversation,
          systemPrompt: newPrompt,
        };

        const updatedConversations = state.conversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c,
        );

        StorageManager.saveConversation(updatedConversation);

        return {
          ...state,
          systemPrompt: newPrompt,
          conversations: updatedConversations,
          currentConversation: updatedConversation,
        };
      }

      return {
        ...state,
        systemPrompt: newPrompt,
      };
    }

    case "SET_MODEL": {
      const newModel = action.payload;
      StorageManager.saveSettings({
        temperature: state.temperature,
        systemPrompt: state.systemPrompt,
        selectedModel: newModel,
        maxStoredConversations: 50,
      });

      if (state.currentConversation) {
        const updatedConversation = {
          ...state.currentConversation,
          model: newModel,
        };

        const updatedConversations = state.conversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c,
        );

        StorageManager.saveConversation(updatedConversation);

        return {
          ...state,
          selectedModel: newModel,
          conversations: updatedConversations,
          currentConversation: updatedConversation,
        };
      }

      return {
        ...state,
        selectedModel: newModel,
      };
    }

    case "SET_TEMPERATURE": {
      const newTemp = action.payload;
      StorageManager.saveSettings({
        temperature: newTemp,
        systemPrompt: state.systemPrompt,
        selectedModel: state.selectedModel,
        maxStoredConversations: 50,
      });

      if (state.currentConversation) {
        const updatedConversation = {
          ...state.currentConversation,
          temperature: newTemp,
        };

        const updatedConversations = state.conversations.map((c) =>
          c.id === updatedConversation.id ? updatedConversation : c,
        );

        StorageManager.saveConversation(updatedConversation);

        return {
          ...state,
          temperature: newTemp,
          conversations: updatedConversations,
          currentConversation: updatedConversation,
        };
      }

      return {
        ...state,
        temperature: newTemp,
      };
    }

    case "SET_STREAMING": {
      return {
        ...state,
        isStreaming: action.payload,
      };
    }

    case "DELETE_MESSAGE": {
      const messageId = action.payload;
      if (!state.currentConversation) return state;

      const updatedMessages = state.currentConversation.messages.filter(
        (msg) => msg.id !== messageId,
      );

      const updatedConversation = {
        ...state.currentConversation,
        messages: updatedMessages,
        updatedAt: new Date(),
      };

      const updatedConversations = state.conversations.map((c) =>
        c.id === updatedConversation.id ? updatedConversation : c,
      );

      StorageManager.saveConversation(updatedConversation);

      return {
        ...state,
        conversations: updatedConversations,
        currentConversation: updatedConversation,
      };
    }

    default:
      return state;
  }
}

interface ChatContextValue {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  setAvailableModels: (models: Model[]) => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const [availableModels, setAvailableModels] = React.useState<Model[]>([]);

  // Load saved data on mount
  useEffect(() => {
    // Only run on client side after hydration
    if (typeof window === 'undefined') return;
    
    const loadData = () => {
      try {
        const conversations = StorageManager.loadConversations();
        const currentId = StorageManager.loadCurrentConversationId();
        const settings = StorageManager.loadSettings();

        dispatch({
          type: "LOAD_CONVERSATIONS",
          payload: { conversations, currentId },
        });

        // Force update system prompt to latest version
        dispatch({ type: "SET_SYSTEM_PROMPT", payload: DEFAULT_SYSTEM_PROMPT });
        dispatch({ type: "SET_MODEL", payload: settings.selectedModel });
        dispatch({ type: "SET_TEMPERATURE", payload: settings.temperature });
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const contextValue: ChatContextValue = {
    state: { ...state, availableModels },
    dispatch,
    setAvailableModels,
  };

  return (
    <ChatContext.Provider value={contextValue}>{children}</ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
