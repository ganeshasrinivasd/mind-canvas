// lib/layout/treeLayout.ts

import type { SemanticMap } from '@/types/mindmap';

export interface LayoutConfig {
  nodeWidth: number;
  nodeHeight: number;
  horizontalGap: number;      // Between siblings
  verticalGap: number;        // Between levels
  direction: 'TB' | 'LR';     // Top-bottom or Left-right
}

export interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}

export const DEFAULT_LAYOUT_CONFIG: LayoutConfig = {
  nodeWidth: 200,
  nodeHeight: 60,
  horizontalGap: 80,
  verticalGap: 100,
  direction: 'TB',
};

/**
 * Computes layout positions for all nodes in a semantic map using
 * a modified Reingold-Tilford algorithm.
 */
export function computeLayout(
  semantic: SemanticMap,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutResult {
  const positions: Record<string, { x: number; y: number }> = {};

  // Phase 1: Compute subtree widths (post-order traversal)
  const subtreeWidths = computeSubtreeWidths(semantic, config);

  // Phase 2: Assign positions (pre-order traversal)
  assignPositions(
    semantic.rootId,
    0,
    0,
    semantic,
    subtreeWidths,
    positions,
    config
  );

  // Phase 3: Center the tree
  const bounds = computeBounds(positions);
  centerTree(positions, bounds);

  return { positions, bounds };
}

/**
 * Computes the width of each subtree using post-order traversal.
 * A node's subtree width is the sum of its children's widths plus gaps,
 * or just the node width if it's a leaf.
 */
function computeSubtreeWidths(
  semantic: SemanticMap,
  config: LayoutConfig
): Record<string, number> {
  const widths: Record<string, number> = {};

  function traverse(nodeId: string): number {
    const node = semantic.nodes[nodeId];

    // Leaf node - width is just the node width
    if (!node.children || node.children.length === 0) {
      widths[nodeId] = config.nodeWidth;
      return config.nodeWidth;
    }

    // Internal node - width is sum of children widths plus gaps
    const childWidths = node.children.map(traverse);
    const totalChildWidth = childWidths.reduce((a, b) => a + b, 0)
      + (node.children.length - 1) * config.horizontalGap;

    // Subtree width is the larger of node width or total child width
    widths[nodeId] = Math.max(config.nodeWidth, totalChildWidth);
    return widths[nodeId];
  }

  traverse(semantic.rootId);
  return widths;
}

/**
 * Assigns x,y positions to all nodes using pre-order traversal.
 * Children are centered under their parent based on subtree widths.
 */
function assignPositions(
  nodeId: string,
  x: number,
  y: number,
  semantic: SemanticMap,
  widths: Record<string, number>,
  positions: Record<string, { x: number; y: number }>,
  config: LayoutConfig
): void {
  // Position current node
  positions[nodeId] = { x, y };

  const node = semantic.nodes[nodeId];
  if (!node.children || node.children.length === 0) return;

  // Calculate starting position for children
  const totalWidth = widths[nodeId];
  let currentX = x - totalWidth / 2;

  // Position each child
  for (const childId of node.children) {
    const childWidth = widths[childId];
    const childX = currentX + childWidth / 2;
    const childY = y + config.nodeHeight + config.verticalGap;

    assignPositions(childId, childX, childY, semantic, widths, positions, config);
    currentX += childWidth + config.horizontalGap;
  }
}

/**
 * Computes the bounding box of all positioned nodes.
 */
function computeBounds(
  positions: Record<string, { x: number; y: number }>
): { minX: number; maxX: number; minY: number; maxY: number } {
  const coords = Object.values(positions);

  if (coords.length === 0) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  const xs = coords.map(p => p.x);
  const ys = coords.map(p => p.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
  };
}

/**
 * Centers the tree by adjusting all positions so the tree is centered at (0, 0).
 */
function centerTree(
  positions: Record<string, { x: number; y: number }>,
  bounds: { minX: number; maxX: number; minY: number; maxY: number }
): void {
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  // Shift all positions to center the tree
  for (const nodeId in positions) {
    positions[nodeId].x -= centerX;
    positions[nodeId].y -= centerY;
  }
}

/**
 * Recomputes layout for only unlocked nodes, preserving locked node positions.
 * This is used when the user wants to auto-layout after manual edits.
 */
export function recomputeLayoutPreservingLocked(
  semantic: SemanticMap,
  existingPositions: Record<string, { x: number; y: number }>,
  lockedNodes: Set<string>,
  config: LayoutConfig = DEFAULT_LAYOUT_CONFIG
): LayoutResult {
  // For now, we'll use a simple approach: compute full layout then blend
  const fullLayout = computeLayout(semantic, config);

  // Preserve locked node positions
  const blendedPositions: Record<string, { x: number; y: number }> = {};

  for (const nodeId in fullLayout.positions) {
    if (lockedNodes.has(nodeId) && existingPositions[nodeId]) {
      // Keep existing position for locked nodes
      blendedPositions[nodeId] = { ...existingPositions[nodeId] };
    } else {
      // Use computed position for unlocked nodes
      blendedPositions[nodeId] = { ...fullLayout.positions[nodeId] };
    }
  }

  const bounds = computeBounds(blendedPositions);

  return { positions: blendedPositions, bounds };
}
