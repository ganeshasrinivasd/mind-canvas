# Building MindCanvas with Claude Code

This guide walks you through using Claude Code to build the MindCanvas project from the specification.

---

## What is Claude Code?

Claude Code is Anthropic's command-line tool for agentic coding. It lets you delegate coding tasks to Claude directly from your terminal. Claude Code can:

- Read and understand your entire codebase
- Create, edit, and delete files
- Run terminal commands
- Execute multi-step coding tasks autonomously
- Search the web for documentation

---

## Step 1: Install Claude Code

### Prerequisites
- Node.js 18+ installed
- An Anthropic API key (or use the built-in authentication)

### Installation

```bash
# Install globally via npm
npm install -g @anthropic-ai/claude-code

# Or use npx (no installation needed)
npx @anthropic-ai/claude-code
```

### Authentication

```bash
# Option 1: Set API key as environment variable
export ANTHROPIC_API_KEY=sk-ant-your-key-here

# Option 2: Login interactively (recommended)
claude login
```

---

## Step 2: Initialize Your Project

```bash
# Create project directory
mkdir mindcanvas
cd mindcanvas

# Initialize git (Claude Code works best with git)
git init

# Create the spec file (copy from MINDCANVAS_SPEC.md)
# Or download it directly
```

---

## Step 3: Start Claude Code

```bash
# Start Claude Code in your project directory
claude

# Or with a specific model
claude --model claude-sonnet-4-20250514
```

You'll see an interactive prompt where you can give Claude instructions.

---

## Step 4: Building MindCanvas (Conversation Flow)

Here's exactly how to prompt Claude Code to build MindCanvas step by step:

### Session 1: Project Setup

```
You: Read the MINDCANVAS_SPEC.md file in this directory. This is the complete 
specification for a mind map generator called MindCanvas. 

First, initialize a Next.js 14 project with TypeScript, Tailwind CSS, and the 
App Router. Install these dependencies:
- react-flow-renderer (or @xyflow/react)
- zustand
- @anthropic-ai/sdk
- html-to-image
- uuid

Set up the basic folder structure as defined in section 22 of the spec.
```

Claude Code will:
1. Read the spec file
2. Run `npx create-next-app@latest` with the right options
3. Install dependencies
4. Create the folder structure

### Session 2: Types and Data Models

```
You: Now create the TypeScript types from section 4 of the spec. Create:
- types/mindmap.ts with all the type definitions
- A validation function in lib/ai/validateSemantic.ts that checks if a 
  SemanticMap is valid (no cycles, all children exist, rootId exists)
```

### Session 3: Layout Algorithm

```
You: Implement the tree layout algorithm from section 12 in lib/layout/treeLayout.ts.
Follow the Reingold-Tilford approach described in the spec. Include:
- computeLayout function
- computeSubtreeWidths helper
- assignPositions helper
- The LayoutConfig interface

Write unit tests for the layout function.
```

### Session 4: React Flow Canvas

```
You: Create the main canvas component using React Flow (or @xyflow/react):

1. components/MindMapCanvas.tsx - the main canvas wrapper
2. components/MindNode.tsx - custom node component with:
   - Icon based on node kind
   - Color coding per the spec (section 6)
   - Collapse/expand toggle
   - Hover state

Use the Zustand store for state management. The store should track:
- The current MindMapDocument
- Selected node ID
- Dirty state (unsaved changes)

Wire up the layout algorithm to position nodes initially.
```

### Session 5: Zustand Store

```
You: Create the Zustand store in store/mapStore.ts with:

State:
- document: MindMapDocument | null
- selectedNodeId: string | null
- isDirty: boolean
- isGenerating: boolean

Actions:
- setDocument
- updateNodePosition (marks node as locked)
- toggleCollapsed
- selectNode
- setGenerating
- markClean/markDirty
```

### Session 6: Inspector Panel

```
You: Create components/InspectorPanel.tsx that shows when a node is selected:

- Node label (editable later)
- Node kind with icon
- Bullets as a list
- Evidence section (if present) with quotes and page numbers
- "Low confidence" badge if evidence is empty

Style it according to the spec's visual language.
```

### Session 7: Input Form

```
You: Create components/InputForm.tsx for the main input interface:

- Text area for topic or pasted content
- Style preset dropdown (study, executive, legal, technical)
- Depth slider (2-5)
- Max nodes slider (20-100)
- "Generate Map" button
- PDF upload zone (drag & drop or click)

Use proper form validation. Show character count for text input.
```

### Session 8: Claude Integration

```
You: Create the AI pipeline:

1. lib/ai/prompts.ts - the three prompts from section 11
2. lib/ai/pipeline.ts - the generation pipeline that:
   - Takes input (topic/text/pdf content)
   - Calls Claude with the semantic map prompt
   - Validates the response
   - Retries with repair prompt if invalid (max 2 times)
   - Returns SemanticMap

3. app/api/maps/generate/route.ts - the API endpoint that:
   - Accepts POST with the input
   - Runs the pipeline
   - Returns the generated document with auto-layout applied
```

### Session 9: Save/Load (Supabase)

```
You: Set up Supabase integration:

1. lib/db/supabase.ts - Supabase client setup
2. Create the SQL schema from section 14 (I'll run it manually)
3. app/api/maps/[id]/route.ts - GET to load a map
4. app/api/maps/[id]/save/route.ts - POST to save view state

Implement autosave in the canvas component:
- Debounce 2 seconds after last change
- Only save view state (not semantic)
- Show "Saved" indicator
```

### Session 10: PDF Support

```
You: Add PDF upload and extraction:

1. app/api/upload/pdf/route.ts - handle PDF upload to Supabase Storage
2. lib/pdf/extract.ts - extract text by page using pdf-parse
3. Update the pipeline to:
   - Accept PDF content with page numbers
   - Run the evidence mapper prompt
   - Attach evidence to nodes

Add file size and page count validation (10MB max, 50 pages max).
```

### Session 11: Export

```
You: Implement export functionality:

1. lib/export/png.ts - use html-to-image to capture the canvas
2. components/ExportMenu.tsx - dropdown with:
   - Export as PNG
   - Export as JSON
   - Copy link (future)

Make sure PNG export captures the entire canvas, not just visible area.
```

### Session 12: Polish and Deploy

```
You: Final polish:

1. Add keyboard shortcuts from section 8
2. Add loading states and error handling per section 15
3. Create the landing page (app/page.tsx) with the empty state UI
4. Add responsive breakpoints for tablet
5. Write a README.md with setup instructions

Then help me deploy to Vercel.
```

---

## Useful Claude Code Commands

During your session, you can use these commands:

```bash
# In the Claude Code prompt:

/help          # Show available commands
/clear         # Clear conversation history
/compact       # Summarize conversation to save context
/cost          # Show token usage and cost
/init          # Initialize project settings
/memory        # Show/edit project memory

# File operations
/view <file>   # View a file
/find <text>   # Search for text in files
```

---

## Tips for Effective Claude Code Sessions

### 1. Be Specific About the Spec
Always reference specific sections of the spec:
```
"Implement the layout algorithm from section 12"
"Use the node kinds and colors from section 6"
```

### 2. Build Incrementally
Don't ask Claude to build everything at once. Each session should produce working, testable code.

### 3. Test as You Go
After each component:
```
You: Run the dev server and test that [feature] works. 
If there are errors, fix them.
```

### 4. Use /compact for Long Sessions
When context gets long:
```
/compact
```
This summarizes the conversation so Claude remembers what was built.

### 5. Commit After Each Feature
```
You: This looks good. Commit these changes with message "feat: add inspector panel"
```

### 6. Review Generated Code
Claude Code shows you diffs before applying changes. Review them and ask for modifications if needed.

---

## Environment Setup Checklist

Before starting with Claude Code, make sure you have:

- [ ] Node.js 18+ installed
- [ ] npm or pnpm installed
- [ ] Git installed and configured
- [ ] Anthropic API key (for Claude Code and the app)
- [ ] Supabase account (free tier works)
- [ ] Vercel account (for deployment)
- [ ] Code editor (VS Code recommended)

---

## Estimated Build Time

| Session | Task | Time |
|---------|------|------|
| 1 | Project setup | 15 min |
| 2 | Types & validation | 20 min |
| 3 | Layout algorithm | 30 min |
| 4 | React Flow canvas | 45 min |
| 5 | Zustand store | 15 min |
| 6 | Inspector panel | 30 min |
| 7 | Input form | 30 min |
| 8 | Claude integration | 45 min |
| 9 | Supabase save/load | 30 min |
| 10 | PDF support | 45 min |
| 11 | Export | 20 min |
| 12 | Polish & deploy | 60 min |

**Total: ~6-8 hours** spread across multiple sessions

---

## Troubleshooting

### "Claude Code isn't installed"
```bash
# Try npx instead
npx @anthropic-ai/claude-code
```

### "API key not found"
```bash
# Set it explicitly
export ANTHROPIC_API_KEY=sk-ant-your-key
# Then restart claude
claude
```

### "Out of context"
Use `/compact` to summarize, or start a new session with:
```
You: Continue building MindCanvas. So far we've completed [list features].
Next, let's work on [next feature].
```

### "Generated code has errors"
```
You: Run `npm run dev` and show me any errors. Fix them.
```

### "React Flow not rendering"
Make sure you have the CSS imported:
```
You: Check that react-flow CSS is imported in globals.css or layout.tsx
```

---

## Next Steps After MVP

Once you have the MVP working:

1. **Add authentication** with Supabase Auth
2. **Implement undo/redo** with a history stack in Zustand
3. **Add search** with Cmd+K modal
4. **Enable collaborative editing** with Supabase Realtime
5. **Build mobile view mode** with touch optimizations

---

## Resources

- [Claude Code Documentation](https://docs.anthropic.com/claude-code)
- [React Flow Documentation](https://reactflow.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)

---

*Happy building! 🚀*
