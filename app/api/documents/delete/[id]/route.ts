// app/api/documents/delete/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabase/client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    const supabase = createServerSupabaseClient();

    // Archive in Supabase (soft delete)
    const { error: supabaseError } = await supabase
      .from('documents')
      .update({ is_archived: true })
      .eq('id', documentId);

    if (supabaseError) {
      console.error('Error archiving document in Supabase:', supabaseError);
      return NextResponse.json(
        { error: 'Failed to archive document' },
        { status: 500 }
      );
    }

    console.log(`✅ Document ${documentId} archived`);

    return NextResponse.json({
      success: true,
      message: 'Document archived successfully',
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
