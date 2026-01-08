// app/api/documents/load/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabase/client';
import { initializeViewState } from '@/lib/layout/initializeViewState';
import type { MindMapDocument } from '@/types/mindmap';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    const supabase = createServerSupabaseClient();

    // Get document with data from Supabase
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (docError || !docData) {
      console.error('Error loading document:', docError);
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    // Extract document data from JSONB column
    const documentData = docData.document_data as {
      semantic: MindMapDocument['semantic'];
      sources: MindMapDocument['sources'];
      meta: MindMapDocument['meta'];
    };

    if (!documentData || !documentData.semantic) {
      return NextResponse.json(
        { error: 'Document data is corrupted or missing' },
        { status: 500 }
      );
    }

    // Get current view snapshot from Supabase
    const { data: viewSnap, error: viewError } = await supabase
      .from('view_snapshots')
      .select('*')
      .eq('document_id', documentId)
      .eq('is_current', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Construct the full document
    const document: MindMapDocument = {
      id: documentId,
      version: '1.0',
      meta: documentData.meta,
      semantic: documentData.semantic,
      sources: documentData.sources,
      view: viewSnap && !viewError
        ? {
            viewport: viewSnap.viewport,
            nodeState: viewSnap.node_state,
          }
        : initializeViewState(documentData.semantic),
    };

    console.log(`✅ Document "${document.meta.title}" loaded from Supabase`);

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error loading document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load document' },
      { status: 500 }
    );
  }
}
