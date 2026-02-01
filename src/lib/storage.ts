import { Conversation, AppSettings } from '@/types/chat';
import { DEFAULT_SYSTEM_PROMPT } from './utils';

const STORAGE_KEYS = {
  CONVERSATIONS: 'groq_chat_conversations',
  SETTINGS: 'groq_chat_settings',
  CURRENT_CONVERSATION_ID: 'groq_chat_current_id',
} as const;

const MAX_STORED_CONVERSATIONS = 50;

export class StorageManager {
  static isLocalStorageAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  static saveConversations(conversations: Conversation[]): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      // Limit to MAX_STORED_CONVERSATIONS
      const conversationsToSave = conversations
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, MAX_STORED_CONVERSATIONS);

      localStorage.setItem(
        STORAGE_KEYS.CONVERSATIONS,
        JSON.stringify(conversationsToSave)
      );
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  }

  static loadConversations(): Conversation[] {
    if (!this.isLocalStorageAvailable()) return [];

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (!stored || stored.trim() === '') return [];

      const conversations = JSON.parse(stored) as Conversation[];
      if (!Array.isArray(conversations)) return [];

      // Convert date strings back to Date objects
      return conversations.map(conv => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        })),
      }));
    } catch (error) {
      console.error('Failed to load conversations:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      return [];
    }
  }

  static saveConversation(conversation: Conversation): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const conversations = this.loadConversations();
      const existingIndex = conversations.findIndex(c => c.id === conversation.id);

      if (existingIndex !== -1) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.unshift(conversation);
      }

      this.saveConversations(conversations);
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  static deleteConversation(conversationId: string): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      const conversations = this.loadConversations();
      const filtered = conversations.filter(c => c.id !== conversationId);
      this.saveConversations(filtered);
    } catch (error) {
      console.error('Failed to delete conversation:', error);
    }
  }

  static clearAllConversations(): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      localStorage.removeItem(STORAGE_KEYS.CONVERSATIONS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    } catch (error) {
      console.error('Failed to clear conversations:', error);
    }
  }

  static saveSettings(settings: AppSettings): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  static loadSettings(): AppSettings {
    const defaultSettings: AppSettings = {
      temperature: 0.7,
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      selectedModel: 'llama-3.3-70b-versatile',
      maxStoredConversations: MAX_STORED_CONVERSATIONS,
    };

    if (!this.isLocalStorageAvailable()) return defaultSettings;

    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored || stored.trim() === '') return defaultSettings;

      const settings = JSON.parse(stored) as AppSettings;
      return { ...defaultSettings, ...settings };
    } catch (error) {
      console.error('Failed to load settings:', error);
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      return defaultSettings;
    }
  }

  static saveCurrentConversationId(id: string | null): void {
    if (!this.isLocalStorageAvailable()) return;

    try {
      if (id) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID, id);
      } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
      }
    } catch (error) {
      console.error('Failed to save current conversation ID:', error);
    }
  }

  static loadCurrentConversationId(): string | null {
    if (!this.isLocalStorageAvailable()) return null;

    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENT_CONVERSATION_ID);
    } catch (error) {
      console.error('Failed to load current conversation ID:', error);
      return null;
    }
  }

  static exportConversations(): string {
    const conversations = this.loadConversations();
    const settings = this.loadSettings();

    const exportData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      conversations,
      settings,
    };

    return JSON.stringify(exportData, null, 2);
  }

  static importConversations(jsonString: string): boolean {
    try {
      const importData = JSON.parse(jsonString);

      if (importData.conversations && Array.isArray(importData.conversations)) {
        const conversations = importData.conversations.map((conv: any) => ({
          ...conv,
          createdAt: new Date(conv.createdAt),
          updatedAt: new Date(conv.updatedAt),
          messages: conv.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }));

        this.saveConversations(conversations);
      }

      if (importData.settings) {
        this.saveSettings(importData.settings);
      }

      return true;
    } catch (error) {
      console.error('Failed to import conversations:', error);
      return false;
    }
  }
}
