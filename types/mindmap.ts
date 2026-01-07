// types/mindmap.ts

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
  createdAt: string;        // ISO 8601
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
  id: string;                    // Stable UUID
  label: string;                 // 2-6 words
  kind: NodeKind;
  bullets?: string[];            // 2-5 key points
  children?: string[];           // Child node IDs
  evidence?: EvidenceRef[];      // Source references
};

export type NodeKind =
  | "topic"       // Main branches
  | "detail"      // Supporting information
  | "risk"        // Warnings, concerns
  | "action"      // To-dos, recommendations
  | "definition"  // Key terms
  | "example";    // Illustrations

export type EvidenceRef = {
  sourceId: string;
  page?: number;
  quote: string;                 // ≤200 chars
  locator?: string;              // "Section 2.1", "Paragraph 3"
};

export type ViewState = {
  viewport: {
    x: number;
    y: number;
    zoom: number;                // 0.1 to 2.0
  };
  nodeState: Record<string, NodeViewState>;
};

export type NodeViewState = {
  pos: { x: number; y: number };
  collapsed: boolean;
  locked: boolean;               // Prevents auto-layout
  color?: string;                // Hex color override
  icon?: string;                 // Custom icon
};

export type Source =
  | { sourceId: string; type: "pdf"; fileName: string; storageUrl: string; pageCount: number }
  | { sourceId: string; type: "text"; name: string; charCount: number }
  | { sourceId: string; type: "topic"; query: string };
