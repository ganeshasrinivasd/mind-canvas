// app/api/documents/delete/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: documentId } = await params;

    // Require authentication to delete documents
    const { user, supabase } = await getSession();

    // Archive in Supabase (soft delete) - only user's own documents
    const { error: supabaseError } = await supabase
      .from('documents')
      .update({ is_archived: true })
      .eq('id', documentId)
      .eq('user_id', user.id);

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

    // Handle authentication errors
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        {
          error: {
            code: 'AUTHENTICATION_REQUIRED',
            message: 'Sign in to delete documents'
          }
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
