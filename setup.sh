#!/bin/bash

# MindCanvas Quick Start Script
# Run this after creating your project directory

set -e

echo "🗺️  MindCanvas Quick Start"
echo "=========================="
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js 18+ required. You have $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Check if we're in an empty directory
if [ "$(ls -A .)" ]; then
    echo "⚠️  Directory is not empty. Continue? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 1
    fi
fi

# Initialize Next.js
echo ""
echo "📦 Creating Next.js project..."
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install @xyflow/react zustand @anthropic-ai/sdk html-to-image uuid @supabase/supabase-js pdf-parse
npm install -D @types/uuid

# Create directory structure
echo ""
echo "📁 Creating directory structure..."
mkdir -p components/ui
mkdir -p lib/layout
mkdir -p lib/ai
mkdir -p lib/pdf
mkdir -p lib/db
mkdir -p lib/export
mkdir -p store
mkdir -p types
mkdir -p public/icons

# Create .env.local template
echo ""
echo "🔐 Creating .env.local template..."
cat > .env.local << 'EOF'
# Anthropic API Key (required)
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Supabase (required for save/load)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Create types file
echo ""
echo "📝 Creating type definitions..."
cat > types/mindmap.ts << 'EOF'
// MindCanvas Type Definitions
// See MINDCANVAS_SPEC.md Section 4 for full documentation

export type MindMapDocument = {
  id: string;
  version: "1.0";
  meta: DocumentMeta;
  semantic: SemanticMap;
  view: ViewState;
  sources: Source[];
};

export type DocumentMeta = {
  title: string;
  stylePreset: StylePreset;
  createdAt: string;
  updatedAt: string;
  sourceType: "topic" | "text" | "pdf";
  maxDepth: number;
  maxNodes: number;
};

export type StylePreset = "study" | "executive" | "legal" | "technical";

export type SemanticMap = {
  rootId: string;
  nodes: Record<string, SemanticNode>;
};

export type SemanticNode = {
  id: string;
  label: string;
  kind: NodeKind;
  bullets?: string[];
  children?: string[];
  evidence?: EvidenceRef[];
};

export type NodeKind = 
  | "topic"
  | "detail"
  | "risk"
  | "action"
  | "definition"
  | "example";

export type EvidenceRef = {
  sourceId: string;
  page?: number;
  quote: string;
  locator?: string;
};

export type ViewState = {
  viewport: {
    x: number;
    y: number;
    zoom: number;
  };
  nodeState: Record<string, NodeViewState>;
};

export type NodeViewState = {
  pos: { x: number; y: number };
  collapsed: boolean;
  locked: boolean;
  color?: string;
  icon?: string;
};

export type Source =
  | { sourceId: string; type: "pdf"; fileName: string; storageUrl: string; pageCount: number }
  | { sourceId: string; type: "text"; name: string; charCount: number }
  | { sourceId: string; type: "topic"; query: string };

// Node kind visual config
export const NODE_KIND_CONFIG: Record<NodeKind, { icon: string; color: string; borderStyle: string }> = {
  topic: { icon: "📌", color: "#64748b", borderStyle: "solid" },
  detail: { icon: "📝", color: "#3b82f6", borderStyle: "solid" },
  risk: { icon: "⚠️", color: "#f59e0b", borderStyle: "dashed" },
  action: { icon: "✅", color: "#22c55e", borderStyle: "solid" },
  definition: { icon: "📖", color: "#8b5cf6", borderStyle: "dotted" },
  example: { icon: "💡", color: "#06b6d4", borderStyle: "solid" },
};

// Style preset config
export const STYLE_PRESET_CONFIG: Record<StylePreset, { maxDepth: number; maxNodes: number; description: string }> = {
  study: { maxDepth: 4, maxNodes: 80, description: "Comprehensive, explanatory" },
  executive: { maxDepth: 2, maxNodes: 30, description: "Decision-focused, concise" },
  legal: { maxDepth: 3, maxNodes: 60, description: "Precise, evidence-heavy" },
  technical: { maxDepth: 4, maxNodes: 100, description: "Detailed, systematic" },
};
EOF

# Create Zustand store scaffold
cat > store/mapStore.ts << 'EOF'
import { create } from 'zustand';
import type { MindMapDocument, SemanticNode } from '@/types/mindmap';

interface MapState {
  // State
  document: MindMapDocument | null;
  selectedNodeId: string | null;
  isDirty: boolean;
  isGenerating: boolean;
  error: string | null;

  // Actions
  setDocument: (doc: MindMapDocument) => void;
  updateNodePosition: (nodeId: string, x: number, y: number) => void;
  toggleCollapsed: (nodeId: string) => void;
  selectNode: (nodeId: string | null) => void;
  setGenerating: (generating: boolean) => void;
  setError: (error: string | null) => void;
  markDirty: () => void;
  markClean: () => void;
  reset: () => void;
}

export const useMapStore = create<MapState>((set, get) => ({
  // Initial state
  document: null,
  selectedNodeId: null,
  isDirty: false,
  isGenerating: false,
  error: null,

  // Actions
  setDocument: (doc) => set({ document: doc, isDirty: false, error: null }),
  
  updateNodePosition: (nodeId, x, y) => {
    const { document } = get();
    if (!document) return;
    
    set({
      document: {
        ...document,
        view: {
          ...document.view,
          nodeState: {
            ...document.view.nodeState,
            [nodeId]: {
              ...document.view.nodeState[nodeId],
              pos: { x, y },
              locked: true, // Mark as locked when manually positioned
            },
          },
        },
      },
      isDirty: true,
    });
  },
  
  toggleCollapsed: (nodeId) => {
    const { document } = get();
    if (!document) return;
    
    const currentState = document.view.nodeState[nodeId];
    set({
      document: {
        ...document,
        view: {
          ...document.view,
          nodeState: {
            ...document.view.nodeState,
            [nodeId]: {
              ...currentState,
              collapsed: !currentState?.collapsed,
            },
          },
        },
      },
      isDirty: true,
    });
  },
  
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  setGenerating: (generating) => set({ isGenerating: generating }),
  setError: (error) => set({ error }),
  markDirty: () => set({ isDirty: true }),
  markClean: () => set({ isDirty: false }),
  reset: () => set({ document: null, selectedNodeId: null, isDirty: false, isGenerating: false, error: null }),
}));

// Selectors
export const useSelectedNode = (): SemanticNode | null => {
  const document = useMapStore((state) => state.document);
  const selectedNodeId = useMapStore((state) => state.selectedNodeId);
  
  if (!document || !selectedNodeId) return null;
  return document.semantic.nodes[selectedNodeId] || null;
};
EOF

# Update .gitignore
echo ""
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Environment
.env.local
.env.*.local

# Uploads
uploads/

# IDE
.idea/
*.swp
*.swo
EOF

echo ""
echo "✅ MindCanvas project initialized!"
echo ""
echo "Next steps:"
echo "1. Copy your API keys to .env.local"
echo "2. Run 'npm run dev' to start the dev server"
echo "3. Start building with Claude Code: 'claude'"
echo ""
echo "Refer to CLAUDE_CODE_GUIDE.md for the full build walkthrough."
EOF
