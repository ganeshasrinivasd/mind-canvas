# MindCanvas

Transform complex documents into interactive mind maps that you can actually navigate.

## The Idea

Information is messy. PDFs, research papers, long articles — they're all linear text, but your brain doesn't think linearly. It thinks in networks, connections, hierarchies.

MindCanvas takes that wall of text and turns it into a visual graph you can explore. Not a summary. Not bullet points. A proper semantic network where you can see how ideas connect, collapse what you don't need, and zoom into what matters.

## How It Works

### The Generation Process

When you feed MindCanvas content (a topic, text, or PDF), here's what happens:

1. **Text Extraction** - Pulls text from your source
2. **Semantic Parsing** - AI analyzes the content to identify:
   - Main concepts and their relationships
   - Node types (topics, details, risks, actions, definitions, examples)
   - Hierarchical structure (what depends on what)
   - Source evidence (which part of the text supports each node)
3. **Graph Construction** - Builds a semantic graph with explicit parent-child relationships
4. **Tree Layout Algorithm** - Positions nodes using a hierarchical tree layout:
   - Calculates optimal spacing between nodes
   - Prevents overlaps
   - Creates clear visual hierarchy from root to leaves
   - Places nodes at appropriate depths based on relationships
5. **Interactive Rendering** - Displays on an infinite canvas where you can pan, zoom, and collapse branches

### Why It's Reliable

**Evidence Linking** - Every node tracks which part of the source text it came from. Not hallucinated. Not paraphrased into nonsense. Direct quotes with page numbers (for PDFs).

**Typed Relationships** - Connections aren't random. Each node has a semantic type, and relationships follow the actual structure of the content.

**Deterministic Layout** - The tree algorithm positions nodes mathematically. Same content = same structure every time.

**Source Preservation** - The original text is never lost. Click any node to see the exact evidence that supports it.

## Why Not Just Use ChatGPT?

Oh, you mean paste your 50-page research paper into ChatGPT and ask it to "summarize this"? Sure, that works if you enjoy:

- Linear bullet points that lose all context
- No idea which part of the document a claim came from
- Hallucinated connections between unrelated concepts
- Hitting token limits halfway through
- Re-asking "wait, how does X relate to Y again?" seventeen times

MindCanvas gives you **structure**, not a summary. You see the whole network at once. You navigate it like a map. You verify every claim against the source. It's not a chatbot. It's a thinking tool.

## Features

- **AI-Powered Generation**: Claude Sonnet 4.5 extracts concepts and creates hierarchical structures
- **Multiple Input Types**: Topics, plain text, or PDF documents
- **5 Visual Styles**: Professional, Creative, Technical, Educational, Minimalist
- **Interactive Canvas**: Pan, zoom, collapse nodes, and explore your ideas
- **Save & Load**: Persistent storage with Supabase - your mind maps don't disappear
- **Document Library**: Manage multiple mind maps, restore exact view state (zoom, positions)
- **Inspector Panel**: Detailed view of any concept with bullets and metadata

## Tech Stack

- Next.js 16
- TypeScript
- React Flow (interactive canvas)
- Claude Sonnet 4.5 (semantic analysis)
- Supabase (PostgreSQL storage)
- Zustand (state management)
- pdf-parse (PDF text extraction)

## Running Locally

```bash
npm install

# Create .env.local with:
# ANTHROPIC_API_KEY=sk-ant-...
# NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

npm run dev
```

See `supabase_schema.sql` for database setup.

## Deployment

Works on Vercel out of the box. Set environment variables in Vercel dashboard.

## Built By

[Ganesha Damaraju](https://gdamaraju.com)

## License

MIT
