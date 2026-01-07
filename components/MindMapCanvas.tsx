// components/MindMapCanvas.tsx

'use client';

import React, { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  NodeChange,
  Connection,
  addEdge,
  ReactFlowProvider,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useMapStore } from '@/store/mapStore';
import { MindNode, MindNodeData } from './MindNode';
import type { SemanticNode } from '@/types/mindmap';

// Custom node types
const nodeTypes: any = {
  mindNode: MindNode,
};

export function MindMapCanvas() {
  const {
    document,
    selectedNodeId,
    selectNode,
    updateNodePosition,
    toggleCollapsed,
  } = useMapStore();

  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<any>([]);

  // Convert document to React Flow nodes and edges
  const { flowNodes, flowEdges } = useMemo(() => {
    if (!document) {
      return { flowNodes: [], flowEdges: [] };
    }

    const { semantic, view } = document;
    const flowNodes: Node<any>[] = [];
    const flowEdges: Edge[] = [];

    // Create nodes
    Object.values(semantic.nodes).forEach((semanticNode: SemanticNode) => {
      const nodeView = view.nodeState[semanticNode.id];

      if (!nodeView) return;

      const nodeData: MindNodeData = {
        ...semanticNode,
        collapsed: nodeView.collapsed,
        isSelected: selectedNodeId === semanticNode.id,
        onToggleCollapse: toggleCollapsed,
      };

      flowNodes.push({
        id: semanticNode.id,
        type: 'mindNode',
        position: nodeView.pos,
        data: nodeData,
        draggable: true,
      });

      // Create edges to children (only if not collapsed)
      if (semanticNode.children && !nodeView.collapsed) {
        semanticNode.children.forEach((childId) => {
          flowEdges.push({
            id: `${semanticNode.id}-${childId}`,
            source: semanticNode.id,
            target: childId,
            type: 'smoothstep',
            style: {
              stroke: 'rgba(196, 167, 125, 0.4)',
              strokeWidth: 2,
            },
            animated: false,
          });
        });
      }
    });

    return { flowNodes, flowEdges };
  }, [document, selectedNodeId, toggleCollapsed]);

  // Update React Flow nodes when document changes
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);

  // Handle node drag end - update position in store
  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          // Node drag ended - update position in store
          updateNodePosition(change.id, change.position.x, change.position.y);
        }
      });
    },
    [onNodesChange, updateNodePosition]
  );

  // Handle node click - select node
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      selectNode(node.id);
    },
    [selectNode]
  );

  // Handle pane click - deselect
  const handlePaneClick = useCallback(() => {
    selectNode(null);
  }, [selectNode]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - deselect
      if (e.key === 'Escape') {
        selectNode(null);
      }

      // Tab - toggle collapse for selected node
      if (e.key === 'Tab' && selectedNodeId) {
        e.preventDefault();
        toggleCollapsed(selectedNodeId);
      }

      // Delete/Backspace - delete selected node (future feature)
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId) {
        // TODO: Implement node deletion
        console.log('Delete node:', selectedNodeId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectNode, toggleCollapsed]);

  if (!document) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '16px',
        }}
      >
        No mind map loaded. Generate or load a map to get started.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{
          padding: 0.5,
          includeHiddenNodes: false,
          minZoom: 0.3,
          maxZoom: 1.5,
        }}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} color="rgba(196, 167, 125, 0.15)" />
        <Controls
          showInteractive={false}
          style={{
            button: {
              backgroundColor: 'rgba(15, 23, 42, 0.9)',
              borderColor: 'rgba(196, 167, 125, 0.3)',
              color: 'rgba(255, 255, 255, 0.7)',
            },
          }}
        />

        {/* Info panel */}
        <Panel position="top-left" style={{ margin: 10 }}>
          <div
            className="backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8))',
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid rgba(196, 167, 125, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
              color: '#ffffff',
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>
              {document.meta.title}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
              {Object.keys(document.semantic.nodes).length} nodes •{' '}
              {document.meta.stylePreset} style
            </div>
          </div>
        </Panel>

        {/* Keyboard shortcuts hint */}
        <Panel position="bottom-left" style={{ margin: 10 }}>
          <div
            className="backdrop-blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(15, 23, 42, 0.8))',
              padding: '10px 14px',
              borderRadius: '10px',
              border: '1px solid rgba(196, 167, 125, 0.3)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            <div>
              <kbd style={kbdStyle}>Space + Drag</kbd> Pan •{' '}
              <kbd style={kbdStyle}>Scroll</kbd> Zoom
            </div>
            <div style={{ marginTop: '4px' }}>
              <kbd style={kbdStyle}>Tab</kbd> Collapse •{' '}
              <kbd style={kbdStyle}>Esc</kbd> Deselect
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function MindMapCanvasWrapper() {
  return (
    <ReactFlowProvider>
      <MindMapCanvas />
    </ReactFlowProvider>
  );
}

const kbdStyle: React.CSSProperties = {
  backgroundColor: 'rgba(196, 167, 125, 0.15)',
  padding: '3px 7px',
  borderRadius: '5px',
  fontSize: '10px',
  fontFamily: 'monospace',
  border: '1px solid rgba(196, 167, 125, 0.3)',
  color: '#ffffff',
  fontWeight: 600,
};
