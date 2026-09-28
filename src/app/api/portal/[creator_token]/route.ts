import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';
import { Post } from '@/types/post';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ creator_token: string }> }
) {
  try {
    const { creator_token } = await params;

    let posts: Post[] = [];

    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        posts = data;
      }
    }

    if (posts.length === 0) {
      posts = await persistentStore.getAll();
    }

    // Performance Summary
    let latestSummary = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = await supabase
        .from('performance_summaries')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(1)
        .single();
      if (data) latestSummary = data;
    }

    if (!latestSummary) {
      latestSummary = await persistentStore.getLatestSummary('The Finance Woman');
    }

    return NextResponse.json({
      creator: {
        name: 'The Finance Woman',
        handle: 'thefinancewoman',
        token: creator_token,
      },
      posts,
      summary: latestSummary,
    });
  } catch (err: unknown) {
    console.error('Portal API error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
