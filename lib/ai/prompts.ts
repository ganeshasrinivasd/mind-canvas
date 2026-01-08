// lib/ai/prompts.ts

import type { StylePreset } from '@/types/mindmap';

export function buildSemanticMapPrompt(params: {
  title: string;
  content: string;
  stylePreset: StylePreset;
  maxDepth: number;
  maxNodes: number;
}): string {
  const { title, content, stylePreset, maxDepth, maxNodes } = params;

  const styleGuidance = getStyleGuidance(stylePreset);

  return `You are a mind map extraction engine. You analyze content and produce hierarchical mind maps as JSON.

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no preamble.
2. Every node needs a unique ID (use format: "node_1", "node_2", etc.)
3. Labels must be 2-6 words (short, scannable)
4. Bullets should be 1-2 sentences each (2-5 bullets per node)
5. Respect maxDepth=${maxDepth} and maxNodes=${maxNodes} constraints exactly
6. Use appropriate node kinds: topic, detail, risk, action, definition, example

STYLE GUIDANCE FOR "${stylePreset}":
${styleGuidance}

Create a hierarchical mind map for the following:

Title: ${title}

Content:
${content}

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
    },
    "node_2": {
      "id": "node_2",
      "label": "Another Label",
      "kind": "detail",
      "bullets": ["Supporting info"],
      "children": []
    }
  }
}

IMPORTANT:
- The root node label should be a concise version of the title (2-6 words)
- Create a balanced tree structure
- Make sure all referenced children exist in nodes
- Use varied node kinds appropriately
- Keep labels concise and scannable
- Make bullets informative but brief

Return ONLY the JSON, nothing else.`;
}

function getStyleGuidance(stylePreset: StylePreset): string {
  switch (stylePreset) {
    case 'study':
      return `- Focus on comprehensive understanding and learning
- Emphasize definitions, examples, and core concepts
- Use "definition" and "example" node kinds liberally
- Provide explanatory bullets that teach
- Max depth: 4 levels, Max nodes: 80
- Tone: Educational and thorough`;

    case 'executive':
      return `- Focus on actionable insights and decisions
- Emphasize actions, risks, and key takeaways
- Use "action" and "risk" node kinds prominently
- Keep bullets decision-focused and concise
- Max depth: 2-3 levels, Max nodes: 30
- Tone: Strategic and high-level`;

    case 'legal':
      return `- Focus on precision and evidence
- Emphasize risks, definitions, and key provisions
- Use "risk" and "definition" node kinds frequently
- Provide precise, careful language in bullets
- Max depth: 3 levels, Max nodes: 60
- Tone: Precise and cautious`;

    case 'technical':
      return `- Focus on detailed technical information
- Emphasize details, definitions, and specifications
- Use "detail" and "definition" node kinds extensively
- Provide systematic, comprehensive bullets
- Max depth: 4 levels, Max nodes: 100
- Tone: Technical and systematic`;

    default:
      return '';
  }
}

// Enhanced version with metacognitive prompting and evidence extraction
export function buildSemanticMapPromptV2(params: {
  title: string;
  content: string;
  stylePreset: StylePreset;
  maxDepth: number;
  maxNodes: number;
}): string {
  const { title, content, stylePreset, maxDepth, maxNodes } = params;

  const styleGuidance = getStyleGuidance(stylePreset);

  return `You are a knowledge graph extraction engine with metacognitive reasoning capabilities.

METACOGNITIVE REFLECTION (think before extracting):
Before extracting, reflect on these questions:
1. What is the primary purpose of this document? (educational, strategic, legal, technical, analytical)
2. What are the 3-5 main themes or topics?
3. What types of relationships exist between concepts? (hierarchical, causal, definitional, contradictory)
4. What evidence is strongest and most relevant?
5. What is the appropriate granularity for this content?

EXTRACTION RULES:
1. Output ONLY valid JSON. No markdown, no explanations, no preamble.
2. Use stable node IDs with UUID format: "node_<uuid>" (e.g., "node_a1b2c3")
3. Labels must be 2-6 words (short, scannable, precise)
4. Bullets should be 1-2 sentences each (2-5 bullets per node)
5. Evidence: ALWAYS include character offsets (charStart, charEnd) from source text
6. Respect maxDepth=${maxDepth} and maxNodes=${maxNodes} constraints exactly
7. Use appropriate node kinds: topic, detail, risk, action, definition, example

STYLE GUIDANCE FOR "${stylePreset}":
${styleGuidance}

EVIDENCE LINKING:
For each bullet point, extract the supporting quote from the source text and provide:
- quote: The exact text (max 200 chars)
- charStart: Character position where quote begins in source
- charEnd: Character position where quote ends in source
- locator: Optional section/paragraph reference (e.g., "Introduction, para 2")

Create a hierarchical mind map for the following:

Title: ${title}

Content:
${content}

Return this exact JSON structure:
{
  "rootId": "node_a1b2c3",
  "nodes": {
    "node_a1b2c3": {
      "id": "node_a1b2c3",
      "label": "Concise Root Label",
      "kind": "topic",
      "bullets": ["Evidence-based key point from source"],
      "children": ["node_x4y5z6"],
      "evidence": [{
        "quote": "Exact text extracted from content",
        "charStart": 1234,
        "charEnd": 1456,
        "locator": "Section 1"
      }]
    },
    "node_x4y5z6": {
      "id": "node_x4y5z6",
      "label": "Sub-concept Label",
      "kind": "detail",
      "bullets": ["Supporting detail with evidence"],
      "children": [],
      "evidence": [{
        "quote": "Another quote from source",
        "charStart": 2000,
        "charEnd": 2150,
        "locator": "Section 2"
      }]
    }
  }
}

CRITICAL REQUIREMENTS:
- The root node label should be a concise version of the title (2-6 words)
- Create a balanced tree structure with appropriate depth
- All referenced children MUST exist in nodes object
- Every bullet point MUST have corresponding evidence with accurate character offsets
- Use varied node kinds appropriately based on semantic role
- Evidence quotes should be verbatim from the source content
- Character offsets must be accurate for precise highlighting

Return ONLY the JSON, nothing else.`;
}

export function buildRepairPrompt(invalidJson: string, errorMessage: string): string {
  return `You are a JSON repair utility. Fix the invalid JSON and return ONLY the corrected JSON.

The following JSON is invalid:
${invalidJson}

Error: ${errorMessage}

Fix the JSON ensuring:
1. Valid JSON syntax
2. All referenced children exist in nodes
3. rootId exists in nodes
4. No circular references
5. All required fields present (id, label, kind)

Return ONLY the corrected JSON.`;
}
