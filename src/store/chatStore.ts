import { create } from 'zustand';
import { UIMessage } from 'ai';

interface ChatStore {
  savedMessages: UIMessage[];
  setSavedMessages: (messages: UIMessage[]) => void;
  shouldClear: boolean;
  triggerClear: () => void;
  ackClear: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  savedMessages: [],
  setSavedMessages: (messages) => set({ savedMessages: messages }),
  shouldClear: false,
  triggerClear: () => set({ shouldClear: true }),
  ackClear: () => set({ shouldClear: false })
}));
