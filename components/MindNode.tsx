// components/MindNode.tsx

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import type { SemanticNode } from '@/types/mindmap';

export interface MindNodeData extends SemanticNode {
  collapsed: boolean;
  isSelected: boolean;
  onToggleCollapse: (nodeId: string) => void;
}

// Visual configuration by node kind
const NODE_STYLES = {
  topic: {
    icon: '📌',
    color: '#C4A77D',
    bgGradient: 'linear-gradient(135deg, rgba(196, 167, 125, 0.25), rgba(160, 139, 111, 0.2))',
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  detail: {
    icon: '📝',
    color: '#A08B6F',
    bgGradient: 'linear-gradient(135deg, rgba(160, 139, 111, 0.25), rgba(139, 115, 85, 0.2))',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  risk: {
    icon: '⚠️',
    color: '#f59e0b',
    bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(217, 119, 6, 0.2))',
    borderStyle: 'dashed',
    borderWidth: '2px',
  },
  action: {
    icon: '✅',
    color: '#8B7355',
    bgGradient: 'linear-gradient(135deg, rgba(139, 115, 85, 0.25), rgba(115, 95, 70, 0.2))',
    borderStyle: 'solid',
    borderWidth: '2px',
  },
  definition: {
    icon: '📖',
    color: '#D4B88D',
    bgGradient: 'linear-gradient(135deg, rgba(212, 184, 141, 0.25), rgba(196, 167, 125, 0.2))',
    borderStyle: 'dotted',
    borderWidth: '1px',
  },
  example: {
    icon: '💡',
    color: '#B09678',
    bgGradient: 'linear-gradient(135deg, rgba(176, 150, 120, 0.25), rgba(160, 139, 111, 0.2))',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
};

export const MindNode = memo(({ data }: NodeProps<any>) => {
  const style = NODE_STYLES[data.kind];
  const hasChildren = data.children && data.children.length > 0;
  const hasBullets = data.bullets && data.bullets.length > 0;
  const showContent = !data.collapsed && hasBullets;

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    data.onToggleCollapse(data.id);
  };

  return (
    <div
      className="mind-node backdrop-blur-md"
      style={{
        minWidth: '220px',
        maxWidth: '320px',
        background: style.bgGradient,
        borderRadius: '12px',
        borderColor: data.isSelected ? style.color : `${style.color}60`,
        borderStyle: style.borderStyle,
        borderWidth: style.borderWidth,
        boxShadow: data.isSelected
          ? `0 8px 32px ${style.color}80, 0 0 0 2px ${style.color}40`
          : `0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)`,
        transition: 'all 0.3s ease',
      }}
    >
      {/* Handle for incoming connections (top) */}
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: style.color,
          width: '10px',
          height: '10px',
          border: '2px solid rgba(15, 23, 42, 0.8)',
          boxShadow: `0 0 8px ${style.color}80`,
        }}
      />

      {/* Node header */}
      <div
        className="node-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
          <span style={{ fontSize: '20px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
            {style.icon}
          </span>
          <span
            style={{
              fontSize: '15px',
              fontWeight: 700,
              color: '#ffffff',
              lineHeight: '1.4',
              textShadow: '0 2px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            {data.label}
          </span>
        </div>

        {/* Collapse toggle - only show if node has children or bullets */}
        {(hasChildren || hasBullets) && (
          <button
            onClick={handleToggleClick}
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: `1px solid ${style.color}40`,
              cursor: 'pointer',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              color: '#ffffff',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              transform: data.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${style.color}30`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            aria-label={data.collapsed ? 'Expand' : 'Collapse'}
          >
            ▼
          </button>
        )}
      </div>

      {/* Bullets - only visible when expanded */}
      {showContent && (
        <div
          className="node-content"
          style={{
            borderTop: `1px solid ${style.color}40`,
            padding: '14px 18px',
            background: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px' }}>
            {data.bullets!.map((bullet, index) => (
              <li
                key={index}
                style={{
                  color: 'rgba(255, 255, 255, 0.9)',
                  lineHeight: '1.7',
                  marginBottom: index < data.bullets!.length - 1 ? '8px' : '0',
                  textShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Handle for outgoing connections (bottom) - only if has children */}
      {hasChildren && (
        <Handle
          type="source"
          position={Position.Bottom}
          style={{
            background: style.color,
            width: '10px',
            height: '10px',
            border: '2px solid rgba(15, 23, 42, 0.8)',
            boxShadow: `0 0 8px ${style.color}80`,
          }}
        />
      )}
    </div>
  );
});

MindNode.displayName = 'MindNode';
