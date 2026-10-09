import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
    
    let ideas = [];
    if (isSupabaseConfigured && supabase) {
      const { data: supabaseIdeas } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });
      if (supabaseIdeas && supabaseIdeas.length > 0) {
        ideas = supabaseIdeas;
      }
    }
    if (ideas.length === 0) {
      ideas = await persistentStore.getAllIdeas();
    }

    return NextResponse.json(
      {
        authenticated: true,
        posts,
        summary,
        ideas,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error authenticating portal:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}