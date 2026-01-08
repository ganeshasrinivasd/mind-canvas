// store/mapStore.ts

import { create } from 'zustand';
import type { MindMapDocument } from '@/types/mindmap';

interface DocumentMetadata {
  id: string;
  title: string;
  source_type: string;
  style_preset: string;
  created_at: string;
  updated_at: string;
  char_count: number | null;
  page_count: number | null;
}

interface MapState {
  // State
  document: MindMapDocument | null;
  selectedNodeId: string | null;
  isDirty: boolean;
  isGenerating: boolean;
  isSaving: boolean;
  isLoading: boolean;
  savedDocuments: DocumentMetadata[];

  // Actions
  setDocument: (document: MindMapDocument | null) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  toggleCollapsed: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  markDirty: () => void;
  markClean: () => void;

  // Persistence actions
  saveDocument: () => Promise<void>;
  loadDocument: (id: string) => Promise<void>;
  fetchDocuments: () => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  document: null,
  selectedNodeId: null,
  isDirty: false,
  isGenerating: false,
  isSaving: false,
  isLoading: false,
  savedDocuments: [],

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

  // Persistence actions
  saveDocument: async () => {
    const state = get();
    if (!state.document) {
      throw new Error('No document to save');
    }

    set({ isSaving: true });

    try {
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          document: state.document,
          viewState: state.document.view,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save document');
      }

      set({ isDirty: false, isSaving: false });
      console.log('✅ Document saved successfully');

      // Refresh document list
      await get().fetchDocuments();
    } catch (error) {
      set({ isSaving: false });
      console.error('Error saving document:', error);
      throw error;
    }
  },

  loadDocument: async (id: string) => {
    set({ isLoading: true });

    try {
      const response = await fetch(`/api/documents/load/${id}`);

      if (!response.ok) {
        throw new Error('Failed to load document');
      }

      const { document } = await response.json();

      set({
        document,
        isDirty: false,
        isLoading: false,
        selectedNodeId: null,
      });

      console.log('✅ Document loaded successfully');
    } catch (error) {
      set({ isLoading: false });
      console.error('Error loading document:', error);
      throw error;
    }
  },

  fetchDocuments: async () => {
    try {
      const response = await fetch('/api/documents/list');

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const { documents } = await response.json();

      set({ savedDocuments: documents });
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  deleteDocument: async (id: string) => {
    try {
      const response = await fetch(`/api/documents/delete/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete document');
      }

      console.log('✅ Document deleted successfully');

      // Refresh document list
      await get().fetchDocuments();
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
}));
