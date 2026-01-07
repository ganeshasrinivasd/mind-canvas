// store/mapStore.ts

import { create } from 'zustand';
import type { MindMapDocument } from '@/types/mindmap';

interface MapState {
  // State
  document: MindMapDocument | null;
  selectedNodeId: string | null;
  isDirty: boolean;
  isGenerating: boolean;

  // Actions
  setDocument: (document: MindMapDocument | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  toggleCollapsed: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  markDirty: () => void;
  markClean: () => void;
}

export const useMapStore = create<MapState>((set) => ({
  // Initial state
  document: null,
  selectedNodeId: null,
  isDirty: false,
  isGenerating: false,

  // Actions
  setDocument: (document) =>
    set({
      document,
      isDirty: false,
      selectedNodeId: null,
    }),

  updateNodePosition: (nodeId, x, y) =>
    set((state) => {
      if (!state.document) return state;

      const updatedDocument = {
        ...state.document,
        view: {
          ...state.document.view,
          nodeState: {
            ...state.document.view.nodeState,
            [nodeId]: {
              ...state.document.view.nodeState[nodeId],
              pos: { x, y },
              locked: true, // Mark as locked when user manually positions
            },
          },
        },
        meta: {
          ...state.document.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      return {
        document: updatedDocument,
        isDirty: true,
      };
    }),

  toggleCollapsed: (nodeId) =>
    set((state) => {
      if (!state.document) return state;

      const currentState = state.document.view.nodeState[nodeId];
      const updatedDocument = {
        ...state.document,
        view: {
          ...state.document.view,
          nodeState: {
            ...state.document.view.nodeState,
            [nodeId]: {
              ...currentState,
              collapsed: !currentState.collapsed,
            },
          },
        },
        meta: {
          ...state.document.meta,
          updatedAt: new Date().toISOString(),
        },
      };

      return {
        document: updatedDocument,
        isDirty: true,
      };
    }),

  selectNode: (nodeId) =>
    set({
      selectedNodeId: nodeId,
    }),

  setIsGenerating: (isGenerating) =>
    set({
      isGenerating,
    }),

  markDirty: () =>
    set({
      isDirty: true,
    }),

  markClean: () =>
    set({
      isDirty: false,
    }),
}));
