import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';
import { ReviewActionInput } from '@/types/post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('token', token)
        .single();

      if (!error && data) {
        return NextResponse.json({ post: data });
      }
    }

    const post = await persistentStore.getByToken(token);
    if (!post) {
      return NextResponse.json({ error: 'Post not found or invalid review link' }, { status: 404 });
    }

    return NextResponse.json(
      { post },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        },
      }
    );
  } catch (err: unknown) {
    console.error('Error fetching review post:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const body: ReviewActionInput = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    if (!['approved', 'changes_requested', 'rejected'].includes(body.status)) {
      return NextResponse.json(
        { error: 'Status must be approved, changes_requested, or rejected' },
        { status: 400 }
      );
    }

    // Check if an existing post being approved is a reel with an attached cover image
    // If approved, replace the calendar display thumbnail with the approved cover image and log a note
    let existingPost = null;
    if (isSupabaseConfigured && supabase) {
      const { data: current } = await supabase.from('posts').select('*').eq('token', token).single();
      existingPost = current;
    } else {
      existingPost = await persistentStore.getByToken(token);
    }

    const updatePayload: Record<string, any> = {
      status: body.status,
      feedback: body.feedback || null,
      updated_at: new Date().toISOString(),
    };

    // If approved and post has an attached dedicated cover image in media_urls
    if (body.status === 'approved' && existingPost) {
      const attachedCover = existingPost.media_urls && existingPost.media_urls.length > 1
        ? existingPost.media_urls.find((u: string) => 
            u !== existingPost.media_url && 
            !u.endsWith('.mp4') && 
            !u.endsWith('.mov') && 
            !u.includes('Grid_Mockup') && 
            !u.includes('Feed_Mockup')
          )
        : null;

      if (attachedCover) {
        // Replace current calendar graphic / thumbnail with the approved cover image
        updatePayload.cover_image_url = attachedCover;
        const approvalNote = `[APPROVED COVER]: Cover image "${attachedCover}" approved by Romany on ${new Date().toLocaleDateString('en-GB')}. Set as calendar thumbnail and broadcast cover.`;
        updatePayload.editor_notes = existingPost.editor_notes 
          ? `${existingPost.editor_notes}\n\n${approvalNote}` 
          : approvalNote;
      }
    }

    let targetPost = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .update(updatePayload)
        .eq('token', token)
        .select()
        .single();

      if (!error && data) {
        targetPost = data;
      }
    }

    if (!targetPost) {
      targetPost = await persistentStore.updateByToken(token, updatePayload);
    }

    if (!targetPost) {
      return NextResponse.json({ error: 'Post not found or invalid review link' }, { status: 404 });
    }

    // Trigger email notification
    try {
      const { sendNotificationEmail } = await import('@/lib/email/notifier');
      await sendNotificationEmail({
        postId: targetPost.id,
        creatorName: targetPost.creator_name,
        platform: targetPost.platform,
        action: body.status,
        feedback: body.feedback,
        caption: targetPost.caption,
        token: targetPost.token,
      });
    } catch (notifyErr) {
      console.error('Failed to dispatch notification:', notifyErr);
    }

    return NextResponse.json({ post: targetPost, success: true });
  } catch (err: unknown) {
    console.error('Error updating review post:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}

