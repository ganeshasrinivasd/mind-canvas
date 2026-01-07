// lib/layout/initializeViewState.ts

import type { SemanticMap, ViewState, NodeViewState } from '@/types/mindmap';
import { computeLayout, DEFAULT_LAYOUT_CONFIG, LayoutConfig } from './treeLayout';

/**
 * Initializes view state for a semantic map with auto-computed positions.
 * All nodes start unlocked and expanded.
 */
export function initializeViewState(
  semantic: SemanticMap,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): ViewState {
  // Compute initial layout positions
  const { positions } = computeLayout(semantic, config);

  // Create node view state for each node
  const nodeState: Record<string, NodeViewState> = {};

  for (const nodeId in semantic.nodes) {
    nodeState[nodeId] = {
      pos: positions[nodeId] || { x: 0, y: 0 },
      collapsed: false,
      locked: false,
    };
  }

  return {
    viewport: {
      x: 0,
      y: 0,
      zoom: 1,
    },
    nodeState,
  };
}
