// lib/validation/schemas.ts
import { z } from 'zod';

// File size limits
export const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_TEXT_LENGTH = 500_000; // 500k characters

// Generate map request validation
export const GenerateMapSchema = z.object({
  sourceType: z.enum(['topic', 'text', 'pdf']),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less')
    .trim(),
  stylePreset: z.enum(['study', 'executive', 'legal', 'technical']),
  maxDepth: z
    .number()
    .int('Max depth must be an integer')
    .min(1, 'Max depth must be at least 1')
    .max(10, 'Max depth cannot exceed 10'),
  maxNodes: z
    .number()
    .int('Max nodes must be an integer')
    .min(5, 'Max nodes must be at least 5')
    .max(200, 'Max nodes cannot exceed 200'),
  text: z
    .string()
    .max(MAX_TEXT_LENGTH, `Text cannot exceed ${MAX_TEXT_LENGTH.toLocaleString()} characters`)
    .optional(),
});

// Save document request validation
export const SaveDocumentSchema = z.object({
  document: z.object({
    id: z.string().uuid('Invalid document ID format'),
    version: z.string(),
    meta: z.object({
      title: z.string().min(1).max(200),
      sourceType: z.enum(['topic', 'text', 'pdf']),
      stylePreset: z.enum(['study', 'executive', 'legal', 'technical']),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    }),
    semantic: z.object({
      rootId: z.string(),
      nodes: z.record(z.string(), z.any()), // Detailed validation would be complex, trust generation
    }),
    sources: z.array(z.any()),
  }),
  viewState: z.object({
    viewport: z.object({
      x: z.number(),
      y: z.number(),
      zoom: z.number().min(0.1).max(2),
    }),
    nodeState: z.record(
      z.string(),
      z.object({
        collapsed: z.boolean(),
        pos: z.object({
          x: z.number(),
          y: z.number(),
        }),
        locked: z.boolean().optional(),
        color: z.string().optional(),
        icon: z.string().optional(),
      })
    ),
  }),
});

// PDF file validation
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'File must be a PDF' };
  }

  // Check file size
  if (file.size > MAX_PDF_SIZE) {
    return {
      valid: false,
      error: `PDF file size cannot exceed ${MAX_PDF_SIZE / 1024 / 1024}MB`,
    };
  }

  // Check file name
  if (!file.name.endsWith('.pdf')) {
    return { valid: false, error: 'File must have .pdf extension' };
  }

  return { valid: true };
}

// Helper function to safely parse and validate
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; error: string } {
  try {
    const result = schema.safeParse(data);
    if (result.success) {
      return { success: true, data: result.data };
    } else {
      const firstIssue = result.error.issues[0];
      return {
        success: false,
        error: firstIssue.message,
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed',
    };
  }
}
