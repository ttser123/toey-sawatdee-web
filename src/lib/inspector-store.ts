import { create } from 'zustand';

export interface InspectorData {
  fileName: string;
  fullPath: string;
  lines: number[];
  snippets: string[];
}

interface InspectorState {
  selectedNodeData: InspectorData | null;
  setSelectedNode: (data: InspectorData | null) => void;
}

export const useInspectorStore = create<InspectorState>((set) => ({
  selectedNodeData: null,
  setSelectedNode: (data) => set({ selectedNodeData: data }),
}));
