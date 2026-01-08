// lib/demo/generateMockMap.ts

import { randomUUID } from 'crypto';
import type { MindMapDocument, SemanticMap, StylePreset } from '@/types/mindmap';
import { initializeViewState } from '@/lib/layout/initializeViewState';

/**
 * Generates a mock mind map for demo purposes
 * TODO: Replace with actual Claude API integration
 */
export function generateMockMap(params: {
  title: string;
  stylePreset: StylePreset;
  maxDepth: number;
  maxNodes: number;
}): MindMapDocument {
  const { title, stylePreset, maxDepth, maxNodes } = params;

  // Create a simple semantic map based on the title
  const semantic: SemanticMap = createMockSemanticMap(title, stylePreset, maxDepth, maxNodes);

  // Generate view state with layout
  const view = initializeViewState(semantic);

  const document: MindMapDocument = {
    id: randomUUID(),
    version: '1.0',
    meta: {
      title,
      stylePreset,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceType: 'topic',
      maxDepth,
      maxNodes,
    },
    semantic,
    view,
    sources: [
      {
        sourceId: 'demo_1',
        type: 'topic',
        query: title,
      },
    ],
  };

  return document;
}

function createMockSemanticMap(
  title: string,
  stylePreset: StylePreset,
  maxDepth: number,
  maxNodes: number
): SemanticMap {
  const rootId = 'node_1';

  // Create a simple tree structure based on the style preset
  const nodes: SemanticMap['nodes'] = {};

  // Root node
  nodes[rootId] = {
    id: rootId,
    label: title.slice(0, 50),
    kind: 'topic',
    bullets: [
      `Overview of ${title}`,
      `Key aspects and important considerations`,
      'This is a demo - real AI generation coming soon',
    ],
    children: ['node_2', 'node_3', 'node_4'],
  };

  // Level 1 - Main branches
  if (stylePreset === 'study') {
    nodes['node_2'] = {
      id: 'node_2',
      label: `Core Concepts in ${title}`,
      kind: 'topic',
      bullets: [
        'Fundamental principles and foundational ideas',
        'Essential building blocks for understanding',
      ],
      children: maxDepth >= 3 ? ['node_5', 'node_6'] : undefined,
    };
    nodes['node_3'] = {
      id: 'node_3',
      label: 'Practical Examples',
      kind: 'example',
      bullets: [
        `Real-world applications of ${title}`,
        'Case studies and implementation scenarios',
      ],
      children: maxDepth >= 3 ? ['node_7'] : undefined,
    };
    nodes['node_4'] = {
      id: 'node_4',
      label: 'Key Terminology',
      kind: 'definition',
      bullets: [
        `Important terms related to ${title}`,
        'Definitions and vocabulary',
      ],
    };
  } else if (stylePreset === 'executive') {
    nodes['node_2'] = {
      id: 'node_2',
      label: 'Strategic Actions',
      kind: 'action',
      bullets: [
        `Priority initiatives for ${title}`,
        'Next steps and implementation plan',
      ],
    };
    nodes['node_3'] = {
      id: 'node_3',
      label: 'Risk Assessment',
      kind: 'risk',
      bullets: [
        'Potential challenges and obstacles',
        'Mitigation strategies and contingencies',
      ],
    };
    nodes['node_4'] = {
      id: 'node_4',
      label: 'Executive Summary',
      kind: 'topic',
      bullets: [
        `High-level overview of ${title}`,
        'Key takeaways and decision points',
      ],
    };
  } else if (stylePreset === 'legal') {
    nodes['node_2'] = {
      id: 'node_2',
      label: 'Key Provisions',
      kind: 'topic',
      bullets: [
        `Important clauses in ${title}`,
        'Legal terms and conditions',
      ],
      children: maxDepth >= 3 ? ['node_5'] : undefined,
    };
    nodes['node_3'] = {
      id: 'node_3',
      label: 'Risk Factors',
      kind: 'risk',
      bullets: [
        'Liability concerns and legal exposure',
        'Compliance requirements and obligations',
      ],
    };
    nodes['node_4'] = {
      id: 'node_4',
      label: 'Required Actions',
      kind: 'action',
      bullets: [
        'Review and approval needed',
        'Execution and signature requirements',
      ],
    };
  } else {
    // technical
    nodes['node_2'] = {
      id: 'node_2',
      label: `${title} Architecture`,
      kind: 'topic',
      bullets: [
        'System design and technical approach',
        'Architectural patterns and structure',
      ],
      children: maxDepth >= 3 ? ['node_5', 'node_6'] : undefined,
    };
    nodes['node_3'] = {
      id: 'node_3',
      label: 'Implementation Details',
      kind: 'detail',
      bullets: [
        `Technical implementation of ${title}`,
        'Code structure and components',
      ],
      children: maxDepth >= 3 ? ['node_7'] : undefined,
    };
    nodes['node_4'] = {
      id: 'node_4',
      label: 'Technical Specifications',
      kind: 'definition',
      bullets: [
        'Requirements and constraints',
        'Performance metrics and standards',
      ],
    };
  }

  // Level 2 - Details (only if maxDepth >= 3)
  if (maxDepth >= 3) {
    nodes['node_5'] = {
      id: 'node_5',
      label: 'Supporting Information',
      kind: 'detail',
      bullets: [
        `Additional context for ${title}`,
        'Background and historical perspective',
      ],
      children: maxDepth >= 4 ? ['node_8'] : undefined,
    };
    nodes['node_6'] = {
      id: 'node_6',
      label: 'Related Topics',
      kind: 'detail',
      bullets: [
        'Connected concepts and ideas',
        'Cross-references and dependencies',
      ],
    };
    nodes['node_7'] = {
      id: 'node_7',
      label: 'Deep Dive',
      kind: 'detail',
      bullets: [
        'Detailed examination and analysis',
        'Comprehensive exploration',
      ],
    };
  }

  // Level 3 - Deep details (only if maxDepth >= 4)
  if (maxDepth >= 4) {
    nodes['node_8'] = {
      id: 'node_8',
      label: 'Advanced Topics',
      kind: 'detail',
      bullets: [
        'Complex considerations and nuances',
        'Expert-level insights',
      ],
      children: maxDepth >= 5 ? ['node_9'] : undefined,
    };
  }

  // Level 4 - Very deep (only if maxDepth >= 5)
  if (maxDepth >= 5) {
    nodes['node_9'] = {
      id: 'node_9',
      label: 'Granular Details',
      kind: 'detail',
      bullets: [
        'Highly specific information',
        'Fine-grained analysis and breakdown',
      ],
    };
  }

  return {
    rootId,
    nodes,
  };
}
