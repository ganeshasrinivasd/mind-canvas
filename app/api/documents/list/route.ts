// app/api/documents/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/db/supabase/client';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // TODO: Filter by user_id when auth is implemented
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error listing documents:', error);
      return NextResponse.json(
        { error: 'Failed to list documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents: documents || [] });
  } catch (error) {
    console.error('Error listing documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to list documents' },
      { status: 500 }
    );
  }
}
