import { NextResponse } from 'next/server';
import { persistentStore } from '@/lib/persistent-store';
import { sendIdeaNotificationEmail } from '@/lib/email/notifier';
import { CreateIdeaInput } from '@/types/post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const ideas = await persistentStore.getAllIdeas();
    return NextResponse.json({ ideas }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
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

    const createdIdea = await persistentStore.createIdea({
      creator_name: body.creator_name || 'The Finance Woman',
      title: body.title || 'Untitled Concept',
      notes: body.notes || '',
      links: body.links || [],
      images: body.images || [],
      raw_video_url: body.raw_video_url || null,
      raw_video_name: body.raw_video_name || null,
      category: body.category || 'reel',
      priority: body.priority || 'normal',
      stage: body.stage || (body.raw_video_url ? 'filmed' : 'idea'),
    });

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
