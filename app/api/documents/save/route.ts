// app/api/documents/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabase/client';
import type { MindMapDocument, ViewState } from '@/types/mindmap';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { document, viewState } = await request.json() as {
      document: MindMapDocument;
      viewState: ViewState;
    };

    if (!document || !document.id) {
      return NextResponse.json(
        { error: 'Invalid document data' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // For now, we'll work without authentication
    // TODO: Get user from session when auth is implemented
    const userId = null;

    // Check if document already exists
    const { data: existingDoc } = await supabase
      .from('documents')
      .select('id')
      .eq('id', document.id)
      .single();

    if (existingDoc) {
      // Update existing document
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          title: document.meta.title,
          source_type: document.meta.sourceType,
          style_preset: document.meta.stylePreset,
          updated_at: new Date().toISOString(),
          char_count: document.sources.find((s) => s.type === 'text')?.charCount || null,
          page_count: document.sources.find((s) => s.type === 'pdf')?.pageCount || null,
          document_data: {
            semantic: document.semantic,
            sources: document.sources,
            meta: document.meta,
          },
        })
        .eq('id', document.id);

      if (updateError) {
        console.error('Error updating document:', updateError);
        return NextResponse.json(
          { error: 'Failed to update document' },
          { status: 500 }
        );
      }
    } else {
      // Insert new document
      const { error: insertError } = await supabase
        .from('documents')
        .insert({
          id: document.id,
          user_id: userId,
          title: document.meta.title,
          source_type: document.meta.sourceType,
          style_preset: document.meta.stylePreset,
          created_at: document.meta.createdAt,
          updated_at: document.meta.updatedAt,
          char_count: document.sources.find((s) => s.type === 'text')?.charCount || null,
          page_count: document.sources.find((s) => s.type === 'pdf')?.pageCount || null,
          is_archived: false,
          document_data: {
            semantic: document.semantic,
            sources: document.sources,
            meta: document.meta,
          },
        });

      if (insertError) {
        console.error('Error inserting document:', insertError);
        return NextResponse.json(
          { error: 'Failed to save document' },
          { status: 500 }
        );
      }
    }

    // Save view snapshot
    const { error: snapshotError } = await supabase
      .from('view_snapshots')
      .insert({
        document_id: document.id,
        viewport: viewState.viewport,
        node_state: viewState.nodeState,
        is_current: true,
      });

    if (snapshotError) {
      console.error('Error saving view snapshot:', snapshotError);
      return NextResponse.json(
        { error: 'Failed to save view state' },
        { status: 500 }
      );
    }

    console.log(`✅ Document "${document.meta.title}" saved to Supabase`);

    return NextResponse.json({
      success: true,
      documentId: document.id,
      message: 'Document saved successfully',
    });
  } catch (error) {
    console.error('Error saving document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save document' },
      { status: 500 }
    );
  }
}
