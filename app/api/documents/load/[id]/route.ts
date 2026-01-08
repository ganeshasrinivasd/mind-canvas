// app/api/documents/load/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { initializeViewState } from '@/lib/layout/initializeViewState';
import type { MindMapDocument } from '@/types/mindmap';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Require authentication to load documents
    const { user, supabase } = await getSession();

    // Get document with data from Supabase (only user's own documents)
    const { data: docData, error: docError } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
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

    // Handle legacy data format (position → pos migration)
    let nodeState = viewSnap?.node_state;
    if (nodeState) {
      // Debug: Log raw data structure
      const firstNodeId = Object.keys(nodeState)[0];
      if (firstNodeId) {
        console.log(`Debug - Raw node_state before migration:`, JSON.stringify(nodeState[firstNodeId]));
      }

      nodeState = Object.fromEntries(
        Object.entries(nodeState).map(([nodeId, state]: [string, any]) => {
          // Convert old 'position' field to 'pos'
          if (state.position && !state.pos) {
            const { position, ...rest } = state;
            console.log(`Migrating node ${nodeId}: position →`, position);
            return [nodeId, { ...rest, pos: position }];
          }
          // Ensure pos exists even if both are missing (shouldn't happen, but defensive)
          if (!state.pos && !state.position) {
            console.warn(`Node ${nodeId} missing both pos and position, using default`);
            return [nodeId, { ...state, pos: { x: 0, y: 0 } }];
          }
          return [nodeId, state];
        })
      );
    }

    // Construct the full document
    const document: MindMapDocument = {
      id: documentId,
      version: '1.0',
      meta: documentData.meta,
      semantic: documentData.semantic,
      sources: documentData.sources,
      view: viewSnap && !viewError && nodeState
        ? {
            viewport: viewSnap.viewport,
            nodeState,
          }
        : initializeViewState(documentData.semantic),
    };

    console.log(`✅ Document "${document.meta.title}" loaded from Supabase`);

    // Debug: Log first node's state to verify migration
    const firstNodeId = Object.keys(document.view.nodeState)[0];
    if (firstNodeId) {
      console.log(`Debug - First node state:`, JSON.stringify(document.view.nodeState[firstNodeId]));
    }

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error loading document:', error);

    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Sign in to load your documents'
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to load document' },
      { status: 500 }
    );
  }
}
