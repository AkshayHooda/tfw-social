import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';
import { sendIdeaNotificationEmail } from '@/lib/email/notifier';
import { CreateIdeaInput } from '@/types/post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return NextResponse.json({ ideas: data, source: 'supabase' }, {
          headers: { 'Cache-Control': 'no-store, no-cache, max-age=0' },
        });
      }
    }

    const ideas = await persistentStore.getAllIdeas();
    return NextResponse.json({ ideas, source: 'blob_store' }, {
      headers: { 'Cache-Control': 'no-store, no-cache, max-age=0' },
    });
  } catch (err: unknown) {
    console.error('[GET /api/ideas] Error:', err);
    return NextResponse.json({ ideas: [] }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreateIdeaInput = await request.json();

    if (!body.title && !body.notes) {
      return NextResponse.json(
        { error: 'Please provide either a title or concept notes for your idea.' },
        { status: 400 }
      );
    }

    // Format submission attribution
    let finalNotes = body.notes ? body.notes.trim() : '';
    if (!finalNotes.includes('Submitted by')) {
      const sourceTag = 'Submitted by Romany (via Client Portal)';
      finalNotes = finalNotes ? `${sourceTag}\n\n${finalNotes}` : sourceTag;
    }

    const createdIdea = await persistentStore.createIdea({
      creator_name: body.creator_name || 'The Finance Woman',
      title: body.title || 'Untitled Concept',
      notes: finalNotes,
      links: body.links || [],
      images: body.images || [],
      raw_video_url: body.raw_video_url || null,
      raw_video_name: body.raw_video_name || null,
      category: body.category || 'reel',
      priority: body.priority || 'normal',
      stage: body.stage || (body.raw_video_url ? 'filmed' : 'idea'),
    });

    // Also sync to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('ideas').insert([
          {
            id: createdIdea.id,
            title: createdIdea.title,
            category: createdIdea.category,
            priority: createdIdea.priority,
            status: createdIdea.status,
            notes: createdIdea.notes,
            creator_name: createdIdea.creator_name,
            format: createdIdea.category === 'carousel' ? 'Carousel' : 'Reel',
            hook: createdIdea.notes ? createdIdea.notes.split('\n')[0] : null,
            created_at: createdIdea.created_at,
            updated_at: createdIdea.updated_at,
          }
        ]);
      } catch (sbErr) {
        console.warn('[POST /api/ideas] Supabase insert warning:', sbErr);
      }
    }

    // Send immediate email notification to editor
    try {
      await sendIdeaNotificationEmail({
        ideaId: createdIdea.id,
        creatorName: createdIdea.creator_name,
        title: createdIdea.title,
        notes: createdIdea.notes,
        links: createdIdea.links,
        images: createdIdea.images,
        raw_video_url: createdIdea.raw_video_url,
        category: createdIdea.category,
        priority: createdIdea.priority,
        stage: createdIdea.stage,
      });
    } catch (emailErr) {
      console.warn('[POST /api/ideas] Notification email error:', emailErr);
    }

    return NextResponse.json({ success: true, idea: createdIdea }, { status: 201 });
  } catch (err: unknown) {
    console.error('[POST /api/ideas] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();

    if (Array.isArray(body)) {
      const updated = await persistentStore.setAllIdeas(body);
      return NextResponse.json({ success: true, count: updated.length });
    }

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Idea id is required' }, { status: 400 });
    }

    // Also sync updates to Supabase if configured
    if (isSupabaseConfigured && supabase) {
      try {
        const sbUpdates: Record<string, unknown> = {
          updated_at: new Date().toISOString(),
        };
        if (updates.title !== undefined) sbUpdates.title = updates.title;
        if (updates.notes !== undefined) sbUpdates.notes = updates.notes;
        if (updates.priority !== undefined) sbUpdates.priority = updates.priority;
        if (updates.status !== undefined) sbUpdates.status = updates.status;
        if (updates.category !== undefined) sbUpdates.category = updates.category;
        if (updates.stage !== undefined) {
          if (updates.stage === 'editing') sbUpdates.status = 'in_production';
          else if (updates.stage === 'approved') sbUpdates.status = 'approved';
          else if (updates.stage === 'scheduled') sbUpdates.status = 'scheduled';
          else if (updates.stage === 'posted') sbUpdates.status = 'published';
          else if (updates.stage === 'review') sbUpdates.status = 'review';
        }

        await supabase.from('ideas').update(sbUpdates).eq('id', id);
      } catch (sbErr) {
        console.warn('[PUT /api/ideas] Supabase update warning:', sbErr);
      }
    }

    const updated = await persistentStore.updateIdea(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Idea not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, idea: updated });
  } catch (err: unknown) {
    console.error('[PUT /api/ideas] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Idea id is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('ideas').delete().eq('id', id);
      } catch (sbErr) {
        console.warn('[DELETE /api/ideas] Supabase delete warning:', sbErr);
      }
    }

    const success = await persistentStore.deleteIdea(id);
    if (!success) {
      return NextResponse.json({ error: 'Idea not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('[DELETE /api/ideas] Error:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
