// components/InspectorPanel.tsx

'use client';

import React from 'react';
import { useMapStore } from '@/store/mapStore';
import type { SemanticNode } from '@/types/mindmap';

// Node kind display names
const NODE_KIND_LABELS: Record<SemanticNode['kind'], string> = {
  topic: 'Topic',
  detail: 'Detail',
  risk: 'Risk',
  action: 'Action',
  definition: 'Definition',
  example: 'Example',
};

// Node kind badge colors
const NODE_KIND_COLORS: Record<SemanticNode['kind'], string> = {
  topic: '#C4A77D',
  detail: '#A08B6F',
  risk: '#f59e0b',
  action: '#8B7355',
  definition: '#D4B88D',
  example: '#B09678',
};

export function InspectorPanel() {
  const { document, selectedNodeId, selectNode } = useMapStore();

  if (!document || !selectedNodeId) {
    return null;
  }

  const selectedNode = document.semantic.nodes[selectedNodeId];

  if (!selectedNode) {
    return null;
  }

  const handleClose = () => {
    selectNode(null);
  };

  const kindColor = NODE_KIND_COLORS[selectedNode.kind];

  return (
    <div className="w-80 h-full backdrop-blur-md border-l flex flex-col overflow-hidden" style={{
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      borderColor: 'rgba(196, 167, 125, 0.3)',
    }}>
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between" style={{
        borderColor: 'rgba(196, 167, 125, 0.3)',
      }}>
        <div className="font-semibold text-sm" style={{ color: '#ffffff' }}>
          Node Inspector
        </div>
        <button
          onClick={handleClose}
          className="bg-transparent border-none cursor-pointer p-1 text-2xl transition-colors"
          style={{ color: 'rgba(255, 255, 255, 0.7)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = '#C4A77D'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)'}
          aria-label="Close inspector"
        >
          ×
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Node label */}
        <div className="mb-5">
          <div className="text-xl font-bold mb-3 leading-snug" style={{ color: '#ffffff' }}>
            {selectedNode.label}
          </div>

          {/* Kind badge */}
          <span
            className="inline-block px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wide"
            style={{
              background: `linear-gradient(135deg, ${kindColor}40, ${kindColor}25)`,
              color: kindColor,
              border: `1px solid ${kindColor}60`,
            }}
          >
            {NODE_KIND_LABELS[selectedNode.kind]}
          </span>
        </div>

        {/* Bullets */}
        {selectedNode.bullets && selectedNode.bullets.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-bold mb-3 uppercase tracking-wide" style={{
              color: '#C4A77D',
              textShadow: '0 0 10px rgba(196, 167, 125, 0.3)',
            }}>
              Key Points
            </div>
            <ul className="m-0 pl-5">
              {selectedNode.bullets.map((bullet, index) => (
                <li key={index} className="text-sm leading-relaxed mb-2.5" style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Evidence */}
        {selectedNode.evidence && selectedNode.evidence.length > 0 && (
          <div className="mb-6">
            <div className="text-xs font-bold mb-3 uppercase tracking-wide" style={{
              color: '#C4A77D',
              textShadow: '0 0 10px rgba(196, 167, 125, 0.3)',
            }}>
              Evidence
            </div>
            <div className="flex flex-col gap-3">
              {selectedNode.evidence.map((evidence, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg backdrop-blur-sm"
                  style={{
                    background: `linear-gradient(135deg, ${kindColor}15, ${kindColor}08)`,
                    borderLeft: `3px solid ${kindColor}`,
                    border: `1px solid ${kindColor}30`,
                  }}
                >
                  <div className="text-sm leading-normal mb-2 italic" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                    "{evidence.quote}"
                  </div>
                  <div className="text-xs flex items-center gap-2" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    {evidence.page && (
                      <span>
                        Page {evidence.page}
                      </span>
                    )}
                    {evidence.locator && (
                      <span>
                        {evidence.page && '•'} {evidence.locator}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Children info */}
        {selectedNode.children && selectedNode.children.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-bold mb-2 uppercase tracking-wide" style={{
              color: '#C4A77D',
              textShadow: '0 0 10px rgba(196, 167, 125, 0.3)',
            }}>
              Children
            </div>
            <div className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              {selectedNode.children.length} child node
              {selectedNode.children.length !== 1 ? 's' : ''}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
