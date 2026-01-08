# MindCanvas

AI-powered semantic graph extraction and visualization for unstructured documents.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://mindcanvas.vercel.app)
[![Version](https://img.shields.io/badge/version-1.3.0-blue)](https://github.com/ganeshasrinivasd/mind-canvas)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## Overview

MindCanvas extracts hierarchical semantic graphs from unstructured text (PDFs, plain text, topics) using Claude Sonnet 4.5, then renders them as interactive mind maps with a modified Reingold-Tilford tree layout algorithm.

**Core Pipeline:**
```
Input (PDF/Text/Topic)
  → Text Extraction
  → LLM-based Semantic Parsing
  → Graph Construction
  → Tree Layout (Modified Reingold-Tilford)
  → Interactive Rendering (React Flow)
```

---

## Architecture

### System Design

**Frontend:**
- Next.js 16 with React Server Components and Turbopack
- React Flow for canvas rendering (DOM-based, not Canvas API)
- Zustand for client-side state (ephemeral session state)
- TypeScript strict mode with custom type definitions

**Backend:**
- Next.js API Routes (serverless functions on Vercel)
- Supabase PostgreSQL for document persistence
- Supabase Auth (JWT with httpOnly cookies via `@supabase/ssr`)
- Upstash Redis for distributed rate limiting (sliding window algorithm)

**AI Pipeline:**
- Model: `claude-sonnet-4-20250514` (latest Sonnet 4.5)
- Max tokens: 8192 (increased from 4096 to prevent JSON truncation)
- Prompt engineering: Structured output with explicit JSON schema
- Temperature: 0 (deterministic generation)
- No streaming (single response with full graph)

**Request Flow:**
```
Client Request
  ↓
Rate Limit Check (Upstash Redis - sliding window)
  ├─ Guest: 3/hour (IP-based with x-forwarded-for)
  └─ Authenticated: 20/hour (user_id-based)
  ↓
Authentication (Supabase Auth - optional for generation, required for CRUD)
  ↓
Input Validation (Zod schemas)
  ├─ PDF: max 10MB, pdf-parse extraction
  ├─ Text: max 500k chars
  └─ Params: depth (1-5), nodes (10-100), style preset
  ↓
Claude API Call
  ├─ Prompt: Structured JSON schema with node types
  ├─ Response: SemanticMap (rootId, nodes dict, relationships)
  └─ Validation: JSON parse + schema validation
  ↓
Tree Layout Algorithm
  ├─ Modified Reingold-Tilford (O(n) time, O(n) space)
  ├─ Calculates (x, y) coordinates for each node
  └─ Prevents overlaps with configurable spacing
  ↓
Response (MindMapDocument with semantic + view state)
```

---

## Technical Implementation

### 1. LLM-based Semantic Extraction

**Prompt Design:**
- System role: Knowledge graph extraction engine
- Output format: Strict JSON schema with typed nodes
- Node types: `topic`, `detail`, `risk`, `action`, `definition`, `example`
- Constraints: Max depth, max nodes, stable IDs (UUIDs)

**Graph Schema:**
```typescript
interface SemanticMap {
  rootId: string;
  nodes: Record<string, SemanticNode>;
}

interface SemanticNode {
  id: string;              // UUID format: "node_xxx"
  label: string;           // 2-6 words, scannable
  kind: NodeType;          // Semantic type
  bullets: string[];       // Evidence-based claims
  children: string[];      // Child node IDs
  evidence?: Evidence[];   // Source text references
}
```

**Prompt Engineering Approach:**
- Explicit JSON schema in prompt (prevents hallucination)
- Few-shot examples for node labeling
- Max depth/node constraints passed as parameters
- Style presets modulate extraction focus (e.g., "Legal" emphasizes risks, "Technical" emphasizes definitions)

**Files:** `lib/ai/prompts.ts`, `lib/ai/generateSemanticMap.ts`

### 2. Tree Layout Algorithm

**Modified Reingold-Tilford Algorithm:**
- Classic algorithm for tidy tree layouts (1981)
- Modifications: Configurable node spacing, depth-based vertical positioning
- Time complexity: O(n) single-pass traversal
- Space complexity: O(n) for coordinate storage

**Algorithm Steps:**
1. **First Pass (Post-order):** Calculate subtree extents and relative positions
2. **Second Pass (Pre-order):** Convert relative positions to absolute (x, y) coordinates
3. **Collision Detection:** Shift subtrees to prevent overlaps
4. **Centering:** Center parent nodes over children

**Coordinate System:**
- X-axis: Horizontal position (sibling separation)
- Y-axis: Depth level (vertical hierarchy)
- Spacing: Configurable per style preset (default: 250px horizontal, 150px vertical)

**Files:** `lib/layout/treeLayout.ts`

### 3. State Management

**Data Model Separation:**
```typescript
interface MindMapDocument {
  id: string;
  version: string;
  meta: DocumentMetadata;      // Title, source type, timestamps
  semantic: SemanticMap;        // Graph structure (nodes, edges)
  sources: SourceMetadata;      // Original content, evidence
  view: ViewState;              // UI state (positions, collapsed, viewport)
}
```

**Storage Strategy:**
- **Ephemeral State (Zustand):** Current document, UI interactions, loading states
- **Persistent State (Supabase):**
  - `documents` table: Metadata + JSONB column for semantic/sources
  - `view_snapshots` table: Viewport + node state (positions, collapsed flags)

**Rationale:** Separation allows independent updates to graph structure (semantic) vs. UI layout (view).

### 4. Rate Limiting

**Implementation:**
- Library: `@upstash/ratelimit` with Redis backend
- Algorithm: Sliding window (accurate, not fixed window)
- Key structure: `ratelimit:guest:{ip}` or `ratelimit:auth:{user_id}`
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

**Trade-offs:**
- Redis latency adds ~20-50ms per request (acceptable for non-real-time)
- Distributed state enables horizontal scaling
- Upstash free tier: 10k commands/day (sufficient for MVP)

**Files:** `lib/ratelimit/config.ts`, `lib/ratelimit/redis.ts`

### 5. Authentication

**Supabase Auth Integration:**
- SSR-compatible with `@supabase/ssr` (cookie-based sessions)
- Server-side: `createServerClient` in API routes
- Client-side: React Context + `createBrowserClient`
- Session validation: JWT verification on every protected endpoint

**Security Model:**
- Auth optional for generation endpoint (guest usage)
- Auth required for document CRUD (ownership enforcement)
- Row-level security (RLS) ready (not yet enabled, manual user_id filtering)

**Files:** `lib/auth/session.ts`, `lib/auth/AuthContext.tsx`

---

## API Design

### `POST /api/maps/generate`

**Input:**
```typescript
{
  sourceType: "topic" | "text" | "pdf";
  content: string;              // Topic/text or base64 PDF
  stylePreset: "study" | "executive" | "legal" | "technical";
  maxDepth: number;             // 1-5
  maxNodes: number;             // 10-100
  title: string;                // Max 200 chars
}
```

**Output:**
```typescript
{
  document: MindMapDocument;    // Full semantic graph + view state
}
```

**Validation:** Zod schemas with custom error messages

### Document CRUD

- `POST /api/documents/save` - Persist document (requires auth)
- `GET /api/documents/load/[id]` - Load by ID (requires auth + ownership)
- `GET /api/documents/list` - List user's documents (requires auth)
- `DELETE /api/documents/delete/[id]` - Soft delete (requires auth)

**Authorization:** All endpoints check `user_id` match with session

---

## Data Models

### Database Schema (Supabase)

```sql
-- Documents with JSONB for flexible schema
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  source_type TEXT NOT NULL,
  style_preset TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  document_data JSONB NOT NULL,  -- {semantic, sources, meta}
  is_archived BOOLEAN DEFAULT FALSE
);

-- View snapshots for canvas state
CREATE TABLE view_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  viewport JSONB NOT NULL,       -- {x, y, zoom}
  node_state JSONB NOT NULL,     -- {nodeId: {pos, collapsed}}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_current BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_documents_user_id ON documents(user_id);
CREATE INDEX idx_view_snapshots_current ON view_snapshots(document_id, is_current);
```

### TypeScript Types

**Core Types:** `types/mindmap.ts`

```typescript
type NodeType = "topic" | "detail" | "risk" | "action" | "definition" | "example";
type StylePreset = "study" | "executive" | "legal" | "technical";

interface NodeState {
  collapsed: boolean;
  pos: { x: number; y: number };
  locked?: boolean;
}

interface ViewState {
  viewport: { x: number; y: number; zoom: number };
  nodeState: Record<string, NodeState>;
}
```

---

## Tech Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| **Frontend** | Next.js 16 + React 19 | Server Components, optimized builds |
| **State** | Zustand | Lightweight (1.5KB), no boilerplate |
| **Canvas** | React Flow | Declarative node rendering, built-in pan/zoom |
| **Styling** | Tailwind CSS | Utility-first, fast iteration |
| **Backend** | Next.js API Routes | Serverless, co-located with frontend |
| **Database** | Supabase PostgreSQL | JSONB for flexible schema, free tier |
| **Auth** | Supabase Auth | JWT + RLS, SSR-compatible |
| **Rate Limit** | Upstash Redis | Distributed, low latency |
| **LLM** | Claude Sonnet 4.5 | Best-in-class reasoning, JSON mode |
| **Validation** | Zod | Runtime type safety, composable schemas |
| **PDF Parse** | pdf-parse | Pure JS, serverless-compatible |
| **Deployment** | Vercel | Edge network, automatic deployments |

---

## Version History

### v3.0 (January 2026) - Production Hardening
- **Auth:** Supabase email/password with SSR-compatible sessions
- **Rate Limiting:** Tiered limits with Upstash Redis (3/hr guests, 20/hr auth)
- **Validation:** Zod schemas for all inputs (file size, content length, params)
- **Security:** Request timeouts (120s), structured error codes
- **Bug Fixes:** Position field migration (position → pos), hydration errors
- **Performance:** Increased Claude max_tokens to 8192 (prevent truncation)

### v2.0 (December 2025) - Simplification
- **Removed:** Neo4j graph database (700 lines removed)
- **Removed:** GraphRAG, query system, insights engine (1800 lines removed)
- **Focus:** Core mind mapping + persistence
- **Dependencies:** 30+ → 10 packages

### v1.0 (November 2025) - Initial Release
- AI-powered extraction with Claude Sonnet 4.5
- Modified Reingold-Tilford tree layout
- Interactive canvas with React Flow
- Multi-input support (topic, text, PDF)
- Supabase persistence

**v1.0 Experimental Features (removed in v2.0):**
- Neo4j graph database with Cypher queries
- Cross-document entity linking
- GraphRAG with vector search
- Community detection (Leiden algorithm)

---

## Running Locally

### Prerequisites
- Node.js 18+
- Supabase account (database + auth)
- Upstash Redis account (rate limiting)
- Anthropic API key (Claude access)

### Setup

```bash
git clone https://github.com/ganeshasrinivasd/mind-canvas.git
cd mind-canvas
npm install

# Configure environment variables
# .env.local:
# ANTHROPIC_API_KEY=your_key
# NEXT_PUBLIC_SUPABASE_URL=your_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
# SUPABASE_SERVICE_ROLE_KEY=your_key
# UPSTASH_REDIS_REST_URL=your_url
# UPSTASH_REDIS_REST_TOKEN=your_token

# Run database migration (see supabase_schema.sql)
# Execute in Supabase SQL Editor

npm run dev
```

**Production:** Deploy to Vercel with environment variables configured.

---

## Project Structure

```
mindcanvas/
├── app/
│   ├── api/
│   │   ├── maps/generate/route.ts       # LLM generation endpoint
│   │   └── documents/                   # CRUD endpoints
│   ├── editor/page.tsx                  # Canvas page
│   ├── documents/page.tsx               # Library page
│   └── layout.tsx                       # Root with providers
├── lib/
│   ├── ai/
│   │   ├── prompts.ts                   # LLM prompt templates
│   │   └── generateSemanticMap.ts       # Claude API integration
│   ├── layout/
│   │   ├── treeLayout.ts                # Reingold-Tilford algorithm
│   │   └── initializeViewState.ts       # Initial positions
│   ├── auth/
│   │   ├── session.ts                   # Server-side auth helpers
│   │   └── AuthContext.tsx              # Client-side auth state
│   ├── ratelimit/
│   │   ├── config.ts                    # Rate limit configuration
│   │   └── redis.ts                     # Upstash client
│   ├── validation/
│   │   └── schemas.ts                   # Zod validation schemas
│   └── pdf/
│       └── extractText.ts               # PDF text extraction
├── components/
│   ├── MindMapCanvas.tsx                # React Flow wrapper
│   ├── MindNode.tsx                     # Custom node component
│   └── AuthModal.tsx                    # Sign in/up modal
├── store/
│   └── mapStore.ts                      # Zustand state
├── types/
│   └── mindmap.ts                       # TypeScript definitions
└── supabase_schema.sql                  # Database schema
```

---

## Performance Characteristics

| Operation | Latency | Notes |
|-----------|---------|-------|
| PDF extraction | 100-500ms | Linear with page count |
| Claude API call | 5-20s | Depends on input size + max_tokens |
| Tree layout | <100ms | O(n), tested up to 100 nodes |
| Canvas render | <50ms | React Flow DOM-based, 60fps |
| Rate limit check | 20-50ms | Redis roundtrip |
| Document save | 100-200ms | Supabase JSONB insert |
| Document load | 50-100ms | Indexed query + JSONB parse |

**Bottleneck:** Claude API latency (5-20s). Mitigations: loading states, streaming (future).

---

## Known Limitations

1. **No vector search:** Cross-document linking requires manual navigation (removed in v2.0)
2. **No collaborative editing:** Single-user sessions only
3. **Limited PDF support:** Text-based PDFs only (no OCR for scanned documents)
4. **Client-side rendering:** Large graphs (>100 nodes) may impact performance
5. **No undo/redo:** State history not tracked (future enhancement)

---

## License

MIT License - see [LICENSE](LICENSE)

---

## Built By

**[Ganesha Damaraju](https://gdamaraju.com)**

GitHub: [@ganeshasrinivasd](https://github.com/ganeshasrinivasd)

Built with AI assistance for full-stack components outside my core AI/ML expertise.
