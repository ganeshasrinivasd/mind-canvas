# MindCanvas

**Transform complex documents into interactive mind maps that you can actually navigate.**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://mindcanvas.vercel.app)
[![Version](https://img.shields.io/badge/version-1.3.0-blue)](https://github.com/ganeshasrinivasd/mind-canvas)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## The Idea

Information is messy. PDFs, research papers, long articles — they're all linear text, but your brain doesn't think linearly. It thinks in networks, connections, hierarchies.

MindCanvas takes that wall of text and turns it into a **visual graph you can explore**. Not a summary. Not bullet points. A proper semantic network where you can see how ideas connect, collapse what you don't need, and zoom into what matters.

---

## Features

### Core Experience
- **AI-Powered Generation**: Claude Sonnet 4.5 extracts concepts and creates hierarchical structures
- **Multiple Input Types**: Topics, plain text, or PDF documents (up to 10MB)
- **4 Visual Styles**: Study, Executive, Legal, Technical presets
- **Interactive Canvas**: Pan, zoom, collapse nodes, and explore your ideas with React Flow
- **Inspector Panel**: Detailed view of any concept with bullets and metadata

### Authentication & Security (v3)
- **User Accounts**: Sign up/sign in with email and password via Supabase Auth
- **Protected Documents**: Your mind maps are private and linked to your account
- **Session Management**: Secure JWT-based authentication with httpOnly cookies
- **User Isolation**: Row-level security ensures you only see your own documents

### Rate Limiting (v3)
- **Tiered Limits**:
  - **Guest users**: 3 mind maps per hour (IP-based)
  - **Authenticated users**: 20 mind maps per hour (user-based)
- **Fair Usage**: Sliding window algorithm prevents abuse
- **Transparent**: Rate limit headers show remaining quota
- **User-Friendly**: Clear error messages with time-to-reset

### Input Validation (v3)
- **File Size Limits**: 10MB max for PDFs, 500k chars for text
- **Request Validation**: Zod schemas validate all API inputs
- **Type Safety**: Title length, depth, and node count constraints
- **Timeout Protection**: 120-second max for generation requests

### Persistence
- **Save & Load**: Persistent storage with Supabase PostgreSQL
- **Document Library**: Manage multiple mind maps per user
- **View State**: Restore exact canvas state (zoom, positions, collapsed nodes)
- **Soft Delete**: Archive documents instead of permanent deletion

---

## How It Works

### The Generation Process

1. **Text Extraction** - Pulls text from your source (topic, text, or PDF)
2. **Semantic Parsing** - AI analyzes content to identify:
   - Main concepts and their relationships
   - Node types (topics, details, risks, actions, definitions, examples)
   - Hierarchical structure (parent-child dependencies)
   - Source evidence (which text supports each node)
3. **Graph Construction** - Builds a semantic graph with explicit relationships
4. **Tree Layout Algorithm** - Positions nodes using modified Reingold-Tilford:
   - Calculates optimal spacing to prevent overlaps
   - Creates clear visual hierarchy from root to leaves
   - Places nodes at appropriate depths based on relationships
5. **Interactive Rendering** - Displays on an infinite canvas where you can pan, zoom, and collapse branches

### Why It's Reliable

**Evidence Linking** - Every node tracks which part of the source text it came from. Not hallucinated. Direct quotes with page numbers (for PDFs).

**Typed Relationships** - Connections aren't random. Each node has a semantic type, and relationships follow the actual structure of the content.

**Deterministic Layout** - The tree algorithm positions nodes mathematically. Same content = same structure every time.

**Source Preservation** - The original text is never lost. Click any node to see the exact evidence that supports it.

---

## Why Not Just Use ChatGPT?

Oh, you mean paste your 50-page research paper into ChatGPT and ask it to "summarize this"? Sure, that works if you enjoy:

- Linear bullet points that lose all context
- No idea which part of the document a claim came from
- Hallucinated connections between unrelated concepts
- Hitting token limits halfway through
- Re-asking "wait, how does X relate to Y again?" seventeen times

MindCanvas gives you **structure**, not a summary. You see the whole network at once. You navigate it like a map. You verify every claim against the source. It's not a chatbot. It's a thinking tool.

---

## Version History

### **v3.0 - Production Ready** (Current - January 2026)
**Authentication, Rate Limiting & Security**

**Major Changes:**
- Added Supabase Auth for user accounts (email/password)
- Implemented tiered rate limiting (3/hour guests, 20/hour authenticated)
- Added input validation with Zod schemas
- Protected all document routes with authentication
- Added user-specific data isolation with RLS-ready architecture
- Increased Claude token limit to 8192 (prevent JSON truncation)
- Fixed document loading with position field migration
- Added bronze color palette throughout UI
- Improved intro animation (shows once per session)

**Security Improvements:**
- 10MB PDF file size limit
- 500k character text limit
- Request timeout protection (120s)
- Rate limit headers in all responses
- Structured error codes and messages

**Dependencies Added:**
- `@supabase/ssr` - Server-side auth
- `@upstash/redis` - Distributed rate limiting
- `@upstash/ratelimit` - Rate limiting logic
- `zod` - Runtime validation

---

### **v2.0 - Simplified Architecture** (December 2025)
**Removed Complexity, Enhanced Core**

**Major Changes:**
- Removed Neo4j graph database (too complex for MVP)
- Removed Query/Insights/GraphRAG features
- Focused on core mind mapping experience
- Reduced dependencies from 30+ to 10
- Removed ~2500 lines of unnecessary code
- Improved performance with simpler architecture

**What Stayed:**
- Semantic map generation with Claude
- Interactive canvas with React Flow
- Save/load functionality with Supabase
- Tree layout algorithm
- Document library

---

### **v1.0 - Initial Release** (November 2025)
**Neural Intelligence Platform**

**Core Features:**
- AI-powered semantic extraction (Claude Sonnet 4.5)
- PDF, text, and topic input support
- Interactive mind map canvas (React Flow)
- Modified Reingold-Tilford tree layout
- Save/load documents (Supabase)
- Document library
- Inspector panel for node details
- 5 visual style presets

**Experimental Features:**
- Neo4j graph database integration
- Cross-document intelligence
- Query system for knowledge graphs
- GraphRAG implementation
- Proactive insights engine

---

## Tech Stack

### **Frontend**
- **Next.js 16** - React framework with Turbopack
- **TypeScript** - Type-safe development
- **React Flow** - Interactive canvas visualization
- **Zustand** - Lightweight state management
- **Tailwind CSS** - Utility-first styling

### **Backend**
- **Next.js API Routes** - Serverless API endpoints
- **Supabase** - PostgreSQL database with Auth
- **Upstash Redis** - Distributed rate limiting
- **Claude Sonnet 4.5** - Semantic analysis (Anthropic API)

### **Infrastructure**
- **Vercel** - Deployment and hosting
- **pdf-parse** - PDF text extraction
- **Zod** - Runtime validation

---

## Running Locally

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier)
- Upstash Redis account (free tier)
- Anthropic API key

### Installation

```bash
# Clone the repository
git clone https://github.com/ganeshasrinivasd/mind-canvas.git
cd mind-canvas

# Install dependencies
npm install

# Set up environment variables
# Create .env.local with your API keys for:
# - Anthropic (Claude API)
# - Supabase (Database & Auth)
# - Upstash Redis (Rate Limiting)

# Run the database migration in Supabase SQL Editor
# See supabase_schema.sql for the schema

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Deployment

### Vercel (Recommended)

1. **Connect GitHub Repository** to Vercel
2. **Set Environment Variables** in Vercel dashboard (Anthropic API key, Supabase credentials, Upstash Redis credentials)
3. **Deploy** - Automatic deployment on push to `main`

### Build Command
```bash
npm run build
```

### Production URL
The app is live at: [https://mindcanvas.vercel.app](https://mindcanvas.vercel.app)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   USER REQUEST                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│             RATE LIMITING (Upstash)                 │
│  ├─ Guest: 3/hour (IP-based)                        │
│  └─ Auth: 20/hour (User ID-based)                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│          AUTHENTICATION (Supabase Auth)             │
│  ├─ Optional: /api/maps/generate                    │
│  └─ Required: /api/documents/*                      │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│            INPUT VALIDATION (Zod)                   │
│  ├─ File size limits                                │
│  ├─ Content validation                              │
│  └─ Type safety                                     │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│              BUSINESS LOGIC                         │
│  ├─ PDF extraction (pdf-parse)                      │
│  ├─ Claude AI generation                            │
│  ├─ Tree layout algorithm                           │
│  └─ Document persistence                            │
└──────────────────┬──────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│         RESPONSE (with headers)                     │
│  ├─ X-RateLimit-Limit                               │
│  ├─ X-RateLimit-Remaining                           │
│  └─ X-RateLimit-Reset                               │
└─────────────────────────────────────────────────────┘
```

---

## API Routes

### Generation
- `POST /api/maps/generate` - Generate mind map from input (auth optional)
  - Rate limited: 3/hour guests, 20/hour authenticated
  - Validates: file size, text length, parameters
  - Returns: MindMapDocument with semantic graph

### Documents (Auth Required)
- `POST /api/documents/save` - Save document to database
- `GET /api/documents/load/[id]` - Load document by ID
- `GET /api/documents/list` - List user's documents
- `DELETE /api/documents/delete/[id]` - Archive document (soft delete)

---

## Project Structure

```
mindcanvas/
├── app/
│   ├── api/
│   │   ├── documents/       # Document CRUD endpoints
│   │   └── maps/           # Generation endpoint
│   ├── editor/             # Mind map editor page
│   ├── documents/          # Document library page
│   └── layout.tsx          # Root layout with providers
├── components/
│   ├── AuthModal.tsx       # Sign in/up modal
│   ├── MindMapCanvas.tsx   # Interactive canvas
│   ├── MindNode.tsx        # Node component
│   ├── LandingPage.tsx     # Home page
│   └── LandingHero.tsx     # Intro animation
├── lib/
│   ├── ai/                 # Claude integration
│   ├── auth/               # Authentication helpers
│   ├── layout/             # Tree layout algorithm
│   ├── pdf/                # PDF extraction
│   ├── ratelimit/          # Rate limiting config
│   └── validation/         # Zod schemas
├── store/
│   └── mapStore.ts         # Zustand state
├── types/
│   └── mindmap.ts          # TypeScript types
└── supabase_schema.sql     # Database schema
```

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Roadmap

### Future Enhancements
- [ ] Guest mode with localStorage (7-day expiry)
- [ ] Browser fingerprinting for advanced abuse prevention
- [ ] CAPTCHA integration (progressive friction)
- [ ] Export to PNG/PDF/Markdown
- [ ] Real-time collaboration
- [ ] Mobile app (React Native)
- [ ] Chrome extension for instant page mapping
- [ ] Obsidian/Notion integrations

---

## Built By

**[Ganesha Damaraju](https://gdamaraju.com)**
- Portfolio: [gdamaraju.com](https://gdamaraju.com)
- GitHub: [@ganeshasrinivasd](https://github.com/ganeshasrinivasd)
- LinkedIn: [ganesha2906](https://www.linkedin.com/in/ganesha2906/)

Co-developed with **Claude Sonnet 4.5** (Anthropic)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- **Anthropic** - For Claude Sonnet 4.5 API
- **Supabase** - For database and authentication infrastructure
- **Upstash** - For distributed rate limiting
- **React Flow** - For the interactive canvas library
- **Vercel** - For seamless deployment

---

**Made by [Ganesha Damaraju](https://gdamaraju.com)**
