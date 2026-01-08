// app/api/documents/save/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { SaveDocumentSchema, validateRequest } from '@/lib/validation/schemas';
import type { MindMapDocument, ViewState } from '@/types/mindmap';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Require authentication for save functionality
    const { user, supabase } = await getSession();

    const body = await request.json();

    // Validate request body
    const validation = validateRequest(SaveDocumentSchema, body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { document, viewState } = validation.data;

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
          user_id: user.id,
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

    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Sign in to save your work'
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save document' },
      { status: 500 }
    );
  }
}
