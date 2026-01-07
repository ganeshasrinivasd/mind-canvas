// app/api/maps/generate/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateSemanticMap } from '@/lib/ai/generateSemanticMap';
import { initializeViewState } from '@/lib/layout/initializeViewState';
import { extractTextFromPDFBuffer } from '@/lib/pdf/extract';
import type { MindMapDocument, StylePreset } from '@/types/mindmap';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let sourceType: 'topic' | 'text' | 'pdf';
    let title: string;
    let stylePreset: StylePreset;
    let maxDepth: number;
    let maxNodes: number;
    let text: string | undefined;
    let pdfPageCount: number | undefined;

    // Handle FormData (for PDF uploads)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      sourceType = formData.get('sourceType') as 'topic' | 'text' | 'pdf';
      title = formData.get('title') as string;
      stylePreset = formData.get('stylePreset') as StylePreset;
      maxDepth = parseInt(formData.get('maxDepth') as string);
      maxNodes = parseInt(formData.get('maxNodes') as string);

      const pdfFile = formData.get('pdfFile') as File;

      if (pdfFile) {
        // Extract text from PDF
        const arrayBuffer = await pdfFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const extracted = await extractTextFromPDFBuffer(buffer);
        text = extracted.text;
        pdfPageCount = extracted.pageCount;
      }
    } else {
      // Handle JSON (for topic and text)
      const body = await request.json();
      sourceType = body.sourceType;
      title = body.title;
      stylePreset = body.stylePreset;
      maxDepth = body.maxDepth;
      maxNodes = body.maxNodes;
      text = body.text;
    }

    // Validate required fields
    if (!title || !stylePreset || !maxDepth || !maxNodes) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare content for AI generation
    let content: string;

    if (sourceType === 'topic') {
      // For topics, use the title as the content and let Claude expand
      content = `Generate a comprehensive mind map about: ${title}`;
    } else if (sourceType === 'text' && text) {
      // For text, use the provided text
      content = text;
    } else if (sourceType === 'pdf' && text) {
      // For PDF, use the extracted text
      content = text;
    } else {
      return NextResponse.json(
        { error: 'Invalid source type or missing content' },
        { status: 400 }
      );
    }

    // Generate semantic map using Claude AI
    const semantic = await generateSemanticMap({
      title,
      content,
      stylePreset,
      maxDepth,
      maxNodes,
    });

    // Initialize view state with layout
    const view = initializeViewState(semantic);

    // Create the complete document
    const document: MindMapDocument = {
      id: uuidv4(),
      version: '1.0',
      meta: {
        title,
        stylePreset,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        sourceType,
        maxDepth,
        maxNodes,
      },
      semantic,
      view,
      sources: [
        sourceType === 'topic'
          ? {
              sourceId: uuidv4(),
              type: 'topic' as const,
              query: title,
            }
          : sourceType === 'text'
          ? {
              sourceId: uuidv4(),
              type: 'text' as const,
              name: title,
              charCount: text?.length || 0,
            }
          : {
              sourceId: uuidv4(),
              type: 'pdf' as const,
              fileName: title,
              storageUrl: '',
              pageCount: pdfPageCount || 0,
            },
      ],
    };

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error generating mind map:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate mind map' },
      { status: 500 }
    );
  }
}
