// lib/ai/generateSemanticMap.ts

import Anthropic from '@anthropic-ai/sdk';
import type { SemanticMap, StylePreset } from '@/types/mindmap';
import { buildSemanticMapPrompt, buildRepairPrompt } from './prompts';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateSemanticMap(params: {
  title: string;
  content: string;
  stylePreset: StylePreset;
  maxDepth: number;
  maxNodes: number;
}): Promise<SemanticMap> {
  const prompt = buildSemanticMapPrompt(params);

  try {
    // Call Claude API
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    // Parse and validate JSON
    const semanticMap = parseAndValidate(responseText);

    return semanticMap;
  } catch (error) {
    console.error('Error generating semantic map:', error);
    throw new Error('Failed to generate mind map. Please try again.');
  }
}

function parseAndValidate(jsonString: string): SemanticMap {
  try {
    // Clean the response - remove any markdown code blocks
    let cleaned = jsonString.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    // Parse JSON
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.rootId) {
      throw new Error('Missing rootId');
    }

    if (!parsed.nodes || typeof parsed.nodes !== 'object') {
      throw new Error('Missing or invalid nodes');
    }

    // Validate root node exists
    if (!parsed.nodes[parsed.rootId]) {
      throw new Error('Root node not found in nodes');
    }

    // Validate all nodes
    for (const [nodeId, node] of Object.entries(parsed.nodes)) {
      const n = node as any;

      if (!n.id || !n.label || !n.kind) {
        throw new Error(`Node ${nodeId} missing required fields`);
      }

      // Validate children exist
      if (n.children) {
        for (const childId of n.children) {
          if (!parsed.nodes[childId]) {
            throw new Error(`Child ${childId} not found in nodes`);
          }
        }
      }
    }

    return parsed as SemanticMap;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid JSON response: ${error.message}`);
    }
    throw error;
  }
}

export async function repairSemanticMap(
  invalidJson: string,
  errorMessage: string
): Promise<SemanticMap> {
  const prompt = buildRepairPrompt(invalidJson, errorMessage);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText = message.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { type: 'text'; text: string }).text)
      .join('');

    return parseAndValidate(responseText);
  } catch (error) {
    console.error('Error repairing semantic map:', error);
    throw new Error('Failed to repair mind map JSON');
  }
}
