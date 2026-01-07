# MindCanvas — Complete Product Specification

**Interactive AI Mind Map Generator**
*Version 1.0 | January 2026*

---

## Executive Summary

MindCanvas transforms unstructured information (topics, text, PDFs, research papers, contracts) into interactive, editable mind maps. Unlike linear AI summaries, MindCanvas gives users navigable structure with evidence trails they can rearrange without losing the AI's work.

**Core Innovation:** Separation of semantic meaning (AI-generated) from visual layout (user-controlled), enabling true editing without regeneration.

---

## 1. Problem Statement

### Current Solutions Fail Because:

| Tool Type | Problem |
|-----------|---------|
| ChatGPT/Claude summaries | Linear output, hard to navigate, no structure |
| Traditional mind maps (XMind, Miro) | Manual creation required, time-consuming |
| PDF summarizers | Lose document structure, no evidence trails |
| AI mind map tools | Regenerating destroys user edits |

### MindCanvas Solves:

- "I need to understand this 50-page document in 10 minutes"
- "I need a visual map for studying or presenting"
- "I need to find key risks/clauses in this contract"
- "I want to edit the AI's output without starting over"

---

## 2. Target Users (v1)

| Persona | Use Case | Key Need |
|---------|----------|----------|
| **Students** | Study 40-page textbook chapters | Quick comprehension, exam prep |
| **Analysts** | Extract risks from 80-page contracts | Evidence trails, clause identification |
| **Researchers** | Map argument structure of papers | Hierarchical relationships |
| **Consultants** | Present report findings visually | Fast, professional output |
| **Product Managers** | Understand competitor docs/specs | Strategic overview |

---

## 3. Core Architecture

### The Two-Layer Model (Critical Design Decision)

```
┌─────────────────────────────────────────────────────────────┐
│                    MindMapDocument                          │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   SEMANTIC MAP      │    │        VIEW STATE           │ │
│  │   (AI-owned)        │    │        (UI-owned)           │ │
│  ├─────────────────────┤    ├─────────────────────────────┤ │
│  │ • Tree hierarchy    │    │ • Node positions (x, y)     │ │
│  │ • Stable node IDs   │    │ • Collapsed state           │ │
│  │ • Labels & bullets  │    │ • Viewport (pan, zoom)      │ │
│  │ • Node kinds        │    │ • Locked nodes              │ │
│  │ • Evidence pointers │    │ • Custom colors/icons       │ │
│  │ • NO positions      │    │ • NO semantic content       │ │
│  └─────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Why this matters:** Regenerating the semantic map never destroys the user's manual arrangement. Users can drag nodes freely, and the positions persist independently.

---

## 4. Data Models

### 4.1 Complete Document Schema

```typescript
// types/mindmap.ts

type MindMapDocument = {
  id: string;
  version: "1.0";
  meta: DocumentMeta;
  semantic: SemanticMap;
  view: ViewState;
  sources: Source[];
};

type DocumentMeta = {
  title: string;
  stylePreset: StylePreset;
  createdAt: string;        // ISO 8601
  updatedAt: string;
  sourceType: "topic" | "text" | "pdf";
  maxDepth: number;
  maxNodes: number;
};

type StylePreset = "study" | "executive" | "legal" | "technical";
```

### 4.2 Semantic Map (Claude Output)

```typescript
type SemanticMap = {
  rootId: string;
  nodes: Record<string, SemanticNode>;
};

type SemanticNode = {
  id: string;                    // Stable UUID
  label: string;                 // 2-6 words
  kind: NodeKind;
  bullets?: string[];            // 2-5 key points
  children?: string[];           // Child node IDs
  evidence?: EvidenceRef[];      // Source references
};

type NodeKind = 
  | "topic"       // Main branches
  | "detail"      // Supporting information
  | "risk"        // Warnings, concerns
  | "action"      // To-dos, recommendations
  | "definition"  // Key terms
  | "example";    // Illustrations

type EvidenceRef = {
  sourceId: string;
  page?: number;
  quote: string;                 // ≤200 chars
  locator?: string;              // "Section 2.1", "Paragraph 3"
};
```

### 4.3 View State (UI-Owned)

```typescript
type ViewState = {
  viewport: {
    x: number;
    y: number;
    zoom: number;                // 0.1 to 2.0
  };
  nodeState: Record<string, NodeViewState>;
};

type NodeViewState = {
  pos: { x: number; y: number };
  collapsed: boolean;
  locked: boolean;               // Prevents auto-layout
  color?: string;                // Hex color override
  icon?: string;                 // Custom icon
};
```

### 4.4 Sources

```typescript
type Source =
  | { sourceId: string; type: "pdf"; fileName: string; storageUrl: string; pageCount: number }
  | { sourceId: string; type: "text"; name: string; charCount: number }
  | { sourceId: string; type: "topic"; query: string };
```

---

## 5. Style Presets

| Preset | Max Depth | Max Nodes | Emphasized Kinds | Tone |
|--------|-----------|-----------|------------------|------|
| **Study** | 4 | 80 | definition, example, detail | Explanatory, comprehensive |
| **Executive** | 2 | 30 | action, risk, topic | Decision-focused, concise |
| **Legal** | 3 | 60 | risk, definition, action | Precise, cautious, evidence-heavy |
| **Technical** | 4 | 100 | detail, definition, example | Detailed, systematic |

---

## 6. Visual Language

### Node Rendering by Kind

| Kind | Icon | Default Color | Border Style |
|------|------|---------------|--------------|
| topic | 📌 | `#64748b` (slate) | 2px solid |
| detail | 📝 | `#3b82f6` (blue) | 1px solid |
| risk | ⚠️ | `#f59e0b` (amber) | 2px dashed |
| action | ✅ | `#22c55e` (green) | 2px solid |
| definition | 📖 | `#8b5cf6` (purple) | 1px dotted |
| example | 💡 | `#06b6d4` (cyan) | 1px solid |

### Node Component Structure

```
┌─────────────────────────────────────┐
│ [icon] Label Text Here        [▼]  │  ← Collapse toggle
├─────────────────────────────────────┤
│ • First bullet point               │  ← Only visible when expanded
│ • Second bullet point              │
└─────────────────────────────────────┘
     │
     ├── Child Node 1
     └── Child Node 2
```

---

## 7. User Experience Flows

### Flow 1: Topic/Text → Mind Map

```
┌──────────────────────────────────────────────────────────────┐
│  MindCanvas                                          [Export]│
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  Enter a topic or paste text...                        │ │
│  │                                                         │ │
│  │  ________________________________________________      │ │
│  │                                                         │ │
│  │  Style: [Study ▼]  Depth: [3 ▼]  [Generate Map]        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User enters topic (e.g., "Machine Learning Fundamentals") or pastes text
2. Selects style preset and depth
3. Clicks "Generate Map"
4. Skeleton nodes appear progressively (streaming)
5. Full map renders with auto-layout
6. User drags nodes, collapses branches, edits labels
7. Exports PNG/JSON or saves

### Flow 2: PDF → Mind Map with Evidence

```
┌──────────────────────────────────────────────────────────────┐
│  MindCanvas                                          [Export]│
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐  ┌───────────────────────────────┐ │
│  │                      │  │ ┌─────────────────────────┐   │ │
│  │  [Upload PDF]        │  │ │ Main Topic              │   │ │
│  │                      │  │ └──────────┬──────────────┘   │ │
│  │  contract.pdf        │  │      ┌─────┴─────┐            │ │
│  │  ████████████ 100%   │  │   ┌──┴──┐     ┌──┴──┐         │ │
│  │                      │  │   │Node │     │Node │         │ │
│  │  [Generate Map]      │  │   └─────┘     └─────┘         │ │
│  └──────────────────────┘  └───────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Inspector: "Termination Clause"                         ││
│  │ Kind: risk                                              ││
│  │ • Either party may terminate with 30 days notice        ││
│  │ • Early termination incurs 15% penalty                  ││
│  │                                                         ││
│  │ Evidence:                                               ││
│  │ ┌─────────────────────────────────────────────────────┐ ││
│  │ │ "...shall provide written notice no less than      │ ││
│  │ │ thirty (30) days prior..."  — Page 12, Section 8.1 │ ││
│  │ └─────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

**Steps:**
1. User uploads PDF (≤50 pages for free tier)
2. System extracts text by page
3. Progress indicator shows extraction status
4. Claude generates semantic map with evidence pointers
5. Map renders with nodes color-coded by kind
6. Click any node → Inspector shows bullets + evidence quotes with page numbers
7. User can jump to source page from evidence

---

## 8. Interactions & Keyboard Shortcuts

### Mouse/Touch Interactions

| Action | Mouse | Trackpad | Touch |
|--------|-------|----------|-------|
| Select node | Click | Click | Tap |
| Drag node | Click + drag | Click + drag | Long press + drag |
| Pan canvas | Space + drag | Two-finger drag | Two-finger drag |
| Zoom | Scroll wheel | Pinch | Pinch |
| Collapse/expand | Click toggle | Click toggle | Tap toggle |
| Open inspector | Double-click | Double-click | Double-tap |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save map |
| `Cmd/Ctrl + E` | Export PNG |
| `Cmd/Ctrl + Shift + E` | Export JSON |
| `Cmd/Ctrl + K` | Search/jump to node |
| `Cmd/Ctrl + Z` | Undo |
| `Cmd/Ctrl + Shift + Z` | Redo |
| `Space` (hold) | Pan mode |
| `Escape` | Deselect / Close inspector |
| `Delete/Backspace` | Delete selected node |
| `Tab` | Collapse/expand selected |
| `Arrow keys` | Navigate between nodes |

---

## 9. Tech Stack

### Frontend
- **Framework:** Next.js 14+ (App Router, TypeScript)
- **Canvas:** React Flow v11+ (nodes, edges, interactions)
- **State:** Zustand (lightweight, React-friendly)
- **Styling:** Tailwind CSS
- **Export:** html-to-image (PNG), native JSON
- **Animations:** Framer Motion (optional, for polish)

### Backend
- **API:** Next.js API Routes (serverless)
- **Database:** Supabase (PostgreSQL)
- **Storage:** Supabase Storage (PDFs)
- **Auth:** Supabase Auth (optional for MVP)

### AI Layer
- **LLM:** Claude (claude-sonnet-4-20250514)
- **Orchestration:** LangGraph (TypeScript)
- **PDF Extraction:** pdf-parse or pdf.js

### Infrastructure
- **Hosting:** Vercel (free tier)
- **Database:** Supabase (free tier: 500MB)
- **CDN:** Vercel Edge

---

## 10. AI Pipeline (LangGraph)

### Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        LangGraph Pipeline                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐       │
│  │ INGEST  │───▶│  CHUNK  │───▶│ OUTLINE │───▶│VALIDATE │       │
│  │         │    │ SELECT  │    │ BUILDER │    │ REPAIR  │       │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘       │
│       │              │              │              │             │
│       ▼              ▼              ▼              ▼             │
│  topic/text     top chunks      SemanticMap    valid JSON       │
│  or PDF pages   with pages      (draft)        (cleaned)        │
│                                                                  │
│                                      │                           │
│                                      ▼                           │
│                              ┌─────────────┐                     │
│                              │  EVIDENCE   │                     │
│                              │   MAPPER    │                     │
│                              └─────────────┘                     │
│                                      │                           │
│                                      ▼                           │
│                              ┌─────────────┐                     │
│                              │  FINALIZE   │──▶ SemanticMap      │
│                              └─────────────┘                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Node Details

#### 1. Ingest
- **Topic/Text:** Pass through directly
- **PDF:** Extract pages → `{pageNumber: number, text: string}[]`

#### 2. Chunk & Select (PDF only)
- Segment by sections (headers, page breaks)
- Select top-k representative chunks per section
- Output: `contextBundle` with page references
- Token budget: ~6,000 tokens max

#### 3. Outline Builder (Claude)
- Generate SemanticMap as strict JSON
- Enforce: maxDepth, maxNodes, label length (2-6 words)
- Include node kinds and bullets

#### 4. Validator/Repair
- Parse JSON, check for errors
- If invalid: Claude repair prompt (max 2 retries)
- Trim duplicates at same level
- Verify tree integrity (all children exist, no cycles)

#### 5. Evidence Mapper (PDF only)
- Attach 1-3 evidence quotes per non-leaf node
- Keep quotes ≤200 characters
- Include page numbers and locators

#### 6. Finalize
- Return complete SemanticMap
- Frontend generates ViewState with auto-layout

### Error Handling & Resilience

| Failure | Detection | Recovery |
|---------|-----------|----------|
| Invalid JSON | Parse error | Retry with repair prompt (max 2x) |
| Too many nodes | Count > maxNodes | Ask Claude to consolidate |
| Missing root | Validation | Inject synthetic root |
| Timeout (>30s) | Timer | Return partial map + "Continue" button |
| PDF extraction fail | Exception | Show error, suggest text-based PDF |
| Rate limit | 429 response | Queue with exponential backoff |

### Cost Controls

- Cache semantic maps by content hash (SHA-256)
- Limit PDF to first 50 pages (warn user)
- Token budget: ~8k input, ~4k output per generation
- Rate limit: 10 generations per hour (free tier)

---

## 11. Claude Prompts

### Prompt A: Semantic Map Generator

```
<system>
You are a mind-map extraction engine. You analyze content and produce hierarchical mind maps as JSON.

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no preamble.
2. Every node needs a unique ID (use format: "node_1", "node_2", etc.)
3. Labels must be 2-6 words (short, scannable)
4. Bullets should be 1-2 sentences each
5. Respect maxDepth and maxNodes constraints exactly
6. Use appropriate node kinds: topic, detail, risk, action, definition, example
</system>

<user>
Create a hierarchical mind map for the following:

**Title:** {{title}}
**Style:** {{stylePreset}}
**Constraints:** maxDepth={{maxDepth}}, maxNodes={{maxNodes}}

**Content:**
{{content}}

Return this exact JSON structure:
{
  "rootId": "node_1",
  "nodes": {
    "node_1": {
      "id": "node_1",
      "label": "Short Label",
      "kind": "topic",
      "bullets": ["Key point 1", "Key point 2"],
      "children": ["node_2", "node_3"]
    }
  }
}
</user>
```

### Prompt B: JSON Repair

```
<system>
You are a JSON repair utility. Fix the invalid JSON and return ONLY the corrected JSON.
</system>

<user>
The following JSON is invalid:
{{invalidJson}}

Error: {{errorMessage}}

Fix the JSON ensuring:
1. Valid JSON syntax
2. All referenced children exist in nodes
3. rootId exists in nodes
4. No circular references
5. All required fields present (id, label, kind)

Return ONLY the corrected JSON.
</user>
```

### Prompt C: Evidence Mapper

```
<system>
You are an evidence mapping utility. You attach source quotes to mind map nodes.
</system>

<user>
Given this semantic map:
{{semanticMapJson}}

And these source excerpts with page numbers:
{{pageExcerpts}}

For each non-leaf node, find 1-2 supporting quotes from the source.
Keep quotes under 200 characters.
Include page numbers.

Return the updated semantic map with evidence arrays populated:
{
  "nodes": {
    "node_1": {
      ...existingFields,
      "evidence": [
        {
          "sourceId": "{{sourceId}}",
          "page": 5,
          "quote": "Short relevant quote...",
          "locator": "Section 2.1"
        }
      ]
    }
  }
}

If no relevant evidence exists for a node, set evidence to empty array [].
Return ONLY the JSON.
</user>
```

---

## 12. Layout Algorithm

### Tree Layout Specification

```typescript
// lib/layout/treeLayout.ts

interface LayoutConfig {
  nodeWidth: 200,
  nodeHeight: 60,
  horizontalGap: 80,      // Between siblings
  verticalGap: 100,       // Between levels
  direction: 'TB' | 'LR', // Top-bottom or Left-right
}

interface LayoutResult {
  positions: Record<string, { x: number; y: number }>;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
}
```

### Algorithm: Modified Reingold-Tilford

```typescript
function computeLayout(
  semantic: SemanticMap,
  config: LayoutConfig
): LayoutResult {
  const positions: Record<string, { x: number; y: number }> = {};
  
  // Phase 1: Compute subtree widths (post-order traversal)
  const subtreeWidths = computeSubtreeWidths(semantic, config);
  
  // Phase 2: Assign positions (pre-order traversal)
  assignPositions(semantic.rootId, 0, 0, semantic, subtreeWidths, positions, config);
  
  // Phase 3: Center the tree
  const bounds = computeBounds(positions);
  centerTree(positions, bounds);
  
  return { positions, bounds };
}

function computeSubtreeWidths(
  semantic: SemanticMap,
  config: LayoutConfig
): Record<string, number> {
  const widths: Record<string, number> = {};
  
  function traverse(nodeId: string): number {
    const node = semantic.nodes[nodeId];
    if (!node.children || node.children.length === 0) {
      widths[nodeId] = config.nodeWidth;
      return config.nodeWidth;
    }
    
    const childWidths = node.children.map(traverse);
    const totalChildWidth = childWidths.reduce((a, b) => a + b, 0) 
      + (node.children.length - 1) * config.horizontalGap;
    
    widths[nodeId] = Math.max(config.nodeWidth, totalChildWidth);
    return widths[nodeId];
  }
  
  traverse(semantic.rootId);
  return widths;
}

function assignPositions(
  nodeId: string,
  x: number,
  y: number,
  semantic: SemanticMap,
  widths: Record<string, number>,
  positions: Record<string, { x: number; y: number }>,
  config: LayoutConfig
): void {
  positions[nodeId] = { x, y };
  
  const node = semantic.nodes[nodeId];
  if (!node.children || node.children.length === 0) return;
  
  const totalWidth = widths[nodeId];
  let currentX = x - totalWidth / 2;
  
  for (const childId of node.children) {
    const childWidth = widths[childId];
    const childX = currentX + childWidth / 2;
    const childY = y + config.nodeHeight + config.verticalGap;
    
    assignPositions(childId, childX, childY, semantic, widths, positions, config);
    currentX += childWidth + config.horizontalGap;
  }
}
```

### Auto-Layout Rules

1. **Initial generation:** All nodes get computed positions
2. **User drags node:** Mark node as `locked: true`
3. **Re-layout action:** Only reposition `locked: false` nodes
4. **Add child manually:** Parent stays locked, new child gets computed position

---

## 13. API Specification

### POST /api/maps/generate

Generate a new mind map from content.

**Request:**
```json
{
  "sourceType": "topic" | "text" | "pdf",
  "title": "string",
  "stylePreset": "study" | "executive" | "legal" | "technical",
  "maxDepth": 2-5,
  "maxNodes": 20-100,
  "text": "string (optional, for topic/text)",
  "pdfFileId": "string (optional, for pdf)"
}
```

**Response (streaming):**
```json
{
  "status": "generating" | "complete" | "error",
  "document": MindMapDocument,
  "progress": {
    "stage": "extracting" | "outlining" | "validating" | "mapping",
    "percent": 0-100
  }
}
```

### POST /api/maps/:id/save

Save view state changes.

**Request:**
```json
{
  "view": ViewState
}
```

**Response:**
```json
{
  "success": true,
  "updatedAt": "ISO 8601"
}
```

### GET /api/maps/:id

Load a saved mind map.

**Response:**
```json
{
  "document": MindMapDocument
}
```

### POST /api/upload/pdf

Upload a PDF for processing.

**Request:** `multipart/form-data` with `file` field

**Response:**
```json
{
  "pdfFileId": "uuid",
  "storageUrl": "string",
  "pageCount": number,
  "sizeBytes": number
}
```

**Limits:**
- Max file size: 10MB
- Max pages: 50 (free tier)
- Allowed types: `application/pdf`

---

## 14. Database Schema (Supabase)

```sql
-- Mind maps table
CREATE TABLE mindmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  style_preset TEXT NOT NULL CHECK (style_preset IN ('study', 'executive', 'legal', 'technical')),
  source_type TEXT NOT NULL CHECK (source_type IN ('topic', 'text', 'pdf')),
  semantic_json JSONB NOT NULL,
  max_depth INTEGER NOT NULL DEFAULT 3,
  max_nodes INTEGER NOT NULL DEFAULT 60,
  content_hash TEXT, -- For caching
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- View state (separate for frequent updates)
CREATE TABLE mindmap_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  view_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(mindmap_id)
);

-- Sources metadata
CREATE TABLE mindmap_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mindmap_id UUID REFERENCES mindmaps(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  file_name TEXT,
  storage_url TEXT,
  page_count INTEGER,
  char_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_mindmaps_content_hash ON mindmaps(content_hash);
CREATE INDEX idx_mindmap_views_mindmap_id ON mindmap_views(mindmap_id);
CREATE INDEX idx_mindmap_sources_mindmap_id ON mindmap_sources(mindmap_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER mindmaps_updated_at
  BEFORE UPDATE ON mindmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER mindmap_views_updated_at
  BEFORE UPDATE ON mindmap_views
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

---

## 15. UI States

### Empty State
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                         🗺️                                   │
│                                                              │
│              Transform any content into a                    │
│              visual, interactive mind map                    │
│                                                              │
│    ┌─────────────────────────────────────────────────────┐   │
│    │  Enter a topic, paste text, or upload a PDF...     │   │
│    └─────────────────────────────────────────────────────┘   │
│                                                              │
│              [Generate Map]                                  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Loading State (Streaming)
```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│         ┌─────────────────────┐                              │
│         │ ████████░░ 80%      │  Outlining structure...      │
│         └─────────────────────┘                              │
│                                                              │
│              ┌──────────────┐                                │
│              │  Main Topic  │  ← Skeleton appears            │
│              └──────┬───────┘                                │
│              ┌──────┴──────┐                                 │
│         ┌────┴────┐  ┌─────┴────┐                            │
│         │ ░░░░░░░ │  │ ░░░░░░░░ │ ← Nodes filling in         │
│         └─────────┘  └──────────┘                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Error States

| Error | Message | Actions |
|-------|---------|---------|
| PDF too large | "This PDF has {n} pages. Free tier supports up to 50." | [Upgrade] [Use first 50 pages] |
| Generation failed | "Couldn't generate map. The content may be too complex." | [Try again] [Simplify input] |
| Invalid PDF | "Couldn't read this PDF. Please use a text-based PDF (not scanned images)." | [Upload different file] |
| Network error | "Connection lost. Your changes are saved locally." | [Retry] |
| Rate limited | "You've reached the limit of 10 maps per hour." | [Upgrade] [Wait {time}] |

---

## 16. Export Formats

### PNG Export
- Capture entire canvas (including off-screen nodes)
- Resolution: 2x for retina
- Background: white
- Include title watermark (optional)

### JSON Export
- Complete `MindMapDocument`
- Can be re-imported
- Human-readable (pretty-printed)

### Future: SVG, Markdown, PDF

---

## 17. Success Metrics

| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| Generation success rate | >95% | Valid JSON returned / attempts |
| Time to first node | <3s | Streaming first node visible |
| Full generation time | <15s | Complete map rendered |
| User edits map | >40% | Sessions with drag/collapse |
| Export rate | >20% | PNG or JSON downloaded |
| Return usage | >30% | Users who save and reopen |
| Error rate | <5% | Failed generations / total |

---

## 18. Constraints & Guardrails

### Structural Constraints
- Max depth: 5 levels
- Max nodes: 100 (free tier: 60)
- Label length: 2-50 characters
- No duplicate labels at same level (merge similar)
- All children must exist in nodes object

### Evidence Constraints
- Quotes ≤ 200 characters
- Evidence required for PDF mode top-level nodes
- Page numbers must be valid (within document range)

### Hallucination Mitigation
- If no evidence found, set `evidence: []` and show "Low confidence" badge
- Never fabricate page numbers
- Validate quotes exist in source text (fuzzy match)

---

## 19. Security Considerations

### Input Validation
- Sanitize all user input (XSS prevention)
- Validate PDF MIME type server-side
- Limit file sizes (10MB max)
- Rate limit API endpoints

### Data Storage
- PDFs stored in private Supabase bucket
- No PII in semantic maps
- Auto-delete unused PDFs after 7 days

### API Security
- CORS restricted to app domain
- API routes require valid session (future)
- Claude API key server-side only

---

## 20. Responsive Design

| Screen | Canvas | Inspector | Interactions |
|--------|--------|-----------|--------------|
| Desktop (>1024px) | Full + sidebar | Right panel (320px) | Drag, hover, right-click |
| Tablet (768-1024px) | Full screen | Bottom sheet | Tap to select, pinch zoom |
| Mobile (<768px) | View mode only | Full overlay | Tap to inspect, no drag |

**MVP:** Desktop and tablet. Mobile = read-only view mode.

---

## 21. Roadmap

### v1.0 (MVP) — 2 weeks
- [x] Topic/text generation
- [x] PDF generation with evidence
- [x] Drag/drop canvas (React Flow)
- [x] Collapse/expand branches
- [x] Inspector panel
- [x] Save/load (Supabase)
- [x] Export PNG + JSON

### v1.5 — 2 weeks
- [ ] Search/jump to node (Cmd+K)
- [ ] Edit labels inline
- [ ] Add child node manually
- [ ] Auto-layout unlocked nodes
- [ ] Undo/redo
- [ ] Evidence highlighting in source viewer

### v2.0 — 4 weeks
- [ ] Concept map mode (non-tree relations)
- [ ] User authentication
- [ ] Collaborative editing (real-time)
- [ ] MCP connectors (Google Drive, Notion)
- [ ] Multiple documents → unified map
- [ ] Compare maps (study vs executive)

### v3.0 — Future
- [ ] AI chat with map context
- [ ] Auto-update when source changes
- [ ] Custom node types
- [ ] Presentation mode
- [ ] Mobile app

---

## 22. Project Structure

```
mindcanvas/
├── app/
│   ├── page.tsx                    # Landing/input page
│   ├── editor/
│   │   └── [id]/
│   │       └── page.tsx            # Main editor view
│   ├── api/
│   │   ├── maps/
│   │   │   ├── generate/
│   │   │   │   └── route.ts        # POST: Generate map
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET: Load map
│   │   │       └── save/
│   │   │           └── route.ts    # POST: Save view state
│   │   └── upload/
│   │       └── pdf/
│   │           └── route.ts        # POST: Upload PDF
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── MindMapCanvas.tsx           # React Flow wrapper
│   ├── MindNode.tsx                # Custom node component
│   ├── InspectorPanel.tsx          # Right sidebar
│   ├── Toolbar.tsx                 # Top toolbar
│   ├── InputForm.tsx               # Topic/text/PDF input
│   ├── ExportMenu.tsx              # Export dropdown
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── layout/
│   │   └── treeLayout.ts           # Layout algorithm
│   ├── ai/
│   │   ├── prompts.ts              # Claude prompts
│   │   ├── pipeline.ts             # LangGraph pipeline
│   │   └── validateSemantic.ts     # JSON validation
│   ├── pdf/
│   │   └── extract.ts              # PDF text extraction
│   ├── db/
│   │   └── supabase.ts             # Database client
│   └── export/
│       └── png.ts                  # PNG export
├── store/
│   └── mapStore.ts                 # Zustand store
├── types/
│   └── mindmap.ts                  # TypeScript types
├── public/
│   └── icons/                      # Node kind icons
├── .env.local                      # Environment variables
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── README.md
```

---

## 23. Environment Variables

```bash
# .env.local

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 24. Build Plan (Step-by-Step)

### Week 1: Core Loop

**Day 1-2: Canvas Foundation**
- Initialize Next.js + TypeScript
- Install React Flow, Zustand, Tailwind
- Create MindMapCanvas with hardcoded JSON
- Implement drag/drop, pan, zoom

**Day 3: AI Integration**
- Set up Anthropic client
- Implement generate API route
- Topic → SemanticMap pipeline (no PDF yet)

**Day 4: Layout + Rendering**
- Implement tree layout algorithm
- Create custom MindNode component
- Wire generated map to canvas

**Day 5: Inspector Panel**
- Build inspector sidebar
- Show bullets and node kind
- Collapse/expand functionality

### Week 2: Polish + Persist

**Day 6-7: Database**
- Set up Supabase project
- Create tables (SQL above)
- Implement save/load API routes
- Add autosave (debounced)

**Day 8-9: PDF Support**
- Upload endpoint with Supabase Storage
- PDF text extraction by page
- Evidence mapping pipeline
- Evidence display in inspector

**Day 10: Export + Deploy**
- PNG export (html-to-image)
- JSON export/import
- Deploy to Vercel
- Final testing

---

## Appendix A: Example MindMapDocument

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "version": "1.0",
  "meta": {
    "title": "Machine Learning Fundamentals",
    "stylePreset": "study",
    "createdAt": "2026-01-06T10:30:00Z",
    "updatedAt": "2026-01-06T10:35:00Z",
    "sourceType": "topic",
    "maxDepth": 3,
    "maxNodes": 60
  },
  "semantic": {
    "rootId": "node_1",
    "nodes": {
      "node_1": {
        "id": "node_1",
        "label": "Machine Learning",
        "kind": "topic",
        "bullets": [
          "Subset of AI that learns from data",
          "Three main paradigms: supervised, unsupervised, reinforcement"
        ],
        "children": ["node_2", "node_3", "node_4"]
      },
      "node_2": {
        "id": "node_2",
        "label": "Supervised Learning",
        "kind": "topic",
        "bullets": [
          "Learns from labeled examples",
          "Predicts outputs for new inputs"
        ],
        "children": ["node_5", "node_6"]
      },
      "node_3": {
        "id": "node_3",
        "label": "Unsupervised Learning",
        "kind": "topic",
        "bullets": [
          "Finds patterns in unlabeled data",
          "Clustering and dimensionality reduction"
        ],
        "children": []
      },
      "node_4": {
        "id": "node_4",
        "label": "Reinforcement Learning",
        "kind": "topic",
        "bullets": [
          "Agent learns through trial and error",
          "Maximizes cumulative reward"
        ],
        "children": []
      },
      "node_5": {
        "id": "node_5",
        "label": "Classification",
        "kind": "detail",
        "bullets": [
          "Predicts discrete categories",
          "Examples: spam detection, image recognition"
        ],
        "children": []
      },
      "node_6": {
        "id": "node_6",
        "label": "Regression",
        "kind": "detail",
        "bullets": [
          "Predicts continuous values",
          "Examples: price prediction, forecasting"
        ],
        "children": []
      }
    }
  },
  "view": {
    "viewport": { "x": 0, "y": 0, "zoom": 1 },
    "nodeState": {
      "node_1": { "pos": { "x": 0, "y": 0 }, "collapsed": false, "locked": false },
      "node_2": { "pos": { "x": -200, "y": 160 }, "collapsed": false, "locked": false },
      "node_3": { "pos": { "x": 0, "y": 160 }, "collapsed": false, "locked": false },
      "node_4": { "pos": { "x": 200, "y": 160 }, "collapsed": false, "locked": false },
      "node_5": { "pos": { "x": -280, "y": 320 }, "collapsed": false, "locked": false },
      "node_6": { "pos": { "x": -120, "y": 320 }, "collapsed": false, "locked": false }
    }
  },
  "sources": [
    { "sourceId": "src_1", "type": "topic", "query": "Machine Learning Fundamentals" }
  ]
}
```

---

## Appendix B: Competitor Analysis

| Tool | Strengths | Weaknesses | MindCanvas Advantage |
|------|-----------|------------|---------------------|
| **Miro AI** | Collaboration, templates | Manual creation, no evidence | Auto-generation, evidence trails |
| **Whimsical AI** | Clean design | Limited AI, no PDF | Full AI pipeline, PDF support |
| **XMind Copilot** | Traditional mind map | Desktop-only, dated UX | Web-based, modern UI |
| **ChatGPT** | Powerful analysis | Linear output, no canvas | Visual, interactive structure |
| **Notion AI** | Integrated workspace | No visual mind maps | Purpose-built visualization |

**MindCanvas differentiator:** Only tool that combines AI generation + evidence trails + editable canvas without destroying user changes on regeneration.

---

*End of Specification*
