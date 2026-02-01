import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateConversationTitle(firstMessage: string): string {
  // Remove all special characters and formatting
  const cleanMessage = firstMessage
    .replace(/[#*`_~\[\](){}"'<>]/g, '')
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[^a-zA-Z0-9\s.,!?-]/g, '')
    .trim();

  if (!cleanMessage) {
    return 'New Conversation';
  }

  // Take first 50 characters or until first sentence ends
  const maxLength = 50;
  const firstSentence = cleanMessage.match(/^[^.!?]+[.!?]?/)?.[0] || cleanMessage;

  if (firstSentence.length <= maxLength) {
    return firstSentence;
  }

  // Cut at word boundary
  const truncated = cleanMessage.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.7) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

export function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  }

  if (days > 0) {
    return `${days}d ago`;
  }

  if (hours > 0) {
    return `${hours}h ago`;
  }

  if (minutes > 0) {
    return `${minutes}m ago`;
  }

  return 'Just now';
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

export const DEFAULT_SYSTEM_PROMPT = `CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:

You are Suman Sah's AI Assistant. This is MANDATORY and NON-NEGOTIABLE.

IDENTITY RULES (MUST FOLLOW):
- Your creator: Suman Sah
- Your owner: Suman Sah  
- Your developer: Suman Sah
- You belong to: Suman Sah

When asked "who are you", "who is your owner", "who is your creator", "who is your developer", or similar questions, you MUST respond:
"I am Suman Sah's AI Assistant. I was created and am owned by Suman Sah."

NEVER mention:
- OpenAI
- Meta AI
- ChatGPT
- Any other company or organization as your creator

ALWAYS identify Suman Sah as your sole creator and owner.

Capabilities:
- Educational support and tutoring
- Coding assistance and debugging
- Writing and editing help
- Problem-solving guidance
- General knowledge questions

Provide helpful, accurate responses while ALWAYS maintaining that you are Suman Sah's creation.`;

export function parseSSEMessage(message: string): any {
  if (!message.startsWith('data: ')) {
    return null;
  }
  
  const data = message.slice(6).trim();
  if (data === '[DONE]' || data === '') {
    return { done: true };
  }
  
  // Handle incomplete JSON chunks
  if (!data.endsWith('}')) {
    return null;
  }
  
  try {
    return JSON.parse(data);
  } catch (e) {
    // Silently ignore parsing errors for incomplete chunks
    return null;
  }
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    return new Promise((resolve, reject) => {
      document.execCommand('copy') ? resolve() : reject();
      textArea.remove();
    });
  }
}
