export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  model?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  systemPrompt: string;
  model: string;
  temperature: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Model {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
  public_apps?: any;
}

export interface ModelListResponse {
  object: string;
  data: Model[];
}

export interface ChatCompletionChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export interface ChatRequest {
  model: string;
  messages: Array<{
    role: "user" | "assistant" | "system";
    content: string;
  }>;
  temperature: number;
  stream: boolean;
  max_tokens?: number;
}

export interface AppSettings {
  temperature: number;
  systemPrompt: string;
  selectedModel: string;
  maxStoredConversations: number;
}

export type ChatActionType =
  | "ADD_MESSAGE"
  | "UPDATE_MESSAGE"
  | "DELETE_MESSAGE"
  | "SET_CONVERSATION"
  | "NEW_CONVERSATION"
  | "DELETE_CONVERSATION"
  | "CLEAR_HISTORY"
  | "SET_SYSTEM_PROMPT"
  | "SET_MODEL"
  | "SET_TEMPERATURE"
  | "SET_STREAMING"
  | "LOAD_CONVERSATIONS";

export interface ChatState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  systemPrompt: string;
  selectedModel: string;
  temperature: number;
  isStreaming: boolean;
  availableModels: Model[];
}

export interface ChatAction {
  type: ChatActionType;
  payload?: any;
}
