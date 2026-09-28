import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = (body.password || '').toString().trim();
    const settings = await persistentStore.getSettings();
    const correctPassword = settings.portal_passcode || (process.env.INFLUENCER_PORTAL_PASSWORD || 'FINANCE2026').trim();

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Incorrect passcode. Access denied.' }, { status: 401 });
    }

    // Return creator data
    let posts = [];
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

    const summary = await persistentStore.getLatestSummary('The Finance Woman');
    const ideas = await persistentStore.getAllIdeas();

    return NextResponse.json({
      authenticated: true,
      posts,
      summary,
      ideas,
    });
  } catch (err: unknown) {
    console.error('Error authenticating portal:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}