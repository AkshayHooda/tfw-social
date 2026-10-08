import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { persistentStore } from '@/lib/persistent-store';
import { sendNotificationEmail } from '@/lib/email/notifier';
import { CreatePostInput } from '@/types/post';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        return NextResponse.json({ posts: data, source: 'supabase' }, {
          headers: { 'Cache-Control': 'no-store, max-age=0' },
        });
      }
    }

    const posts = await persistentStore.getAll();
    return NextResponse.json({ posts, source: 'blob_store' }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  } catch (err: unknown) {
    console.error('Error fetching posts:', err);
    const posts = await persistentStore.getAll();
    return NextResponse.json({ posts, source: 'fallback' }, {
      headers: { 'Cache-Control': 'no-store, max-age=0' },
    });
  }
}

export async function POST(request: Request) {
  try {
    const body: CreatePostInput = await request.json();

    if (!body.creator_name || !body.platform || !body.media_url || !body.media_type) {
      return NextResponse.json(
        { error: 'creator_name, platform, media_url, and media_type are required' },
        { status: 400 }
      );
    }

    let createdPost = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .insert([
          {
            token: (await import('crypto')).randomUUID(),
            creator_name: body.creator_name,
            creator_handle: body.creator_handle || null,
            platform: body.platform,
            media_url: body.media_url,
            media_type: body.media_type,
            caption: body.caption || null,
            editor_notes: body.editor_notes || null,
            media_urls: body.media_urls && body.media_urls.length > 0 ? body.media_urls : null,
            scheduled_at: body.scheduled_at || null,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (!error && data) {
        createdPost = data;
      }
    }

    if (!createdPost) {
      createdPost = await persistentStore.create(body);
    }

    // Immediately trigger notification email to needingadvice01@gmail.com
    try {
      await sendNotificationEmail({
        postId: createdPost.id,
        creatorName: createdPost.creator_name,
        platform: createdPost.platform,
        action: 'pending_review',
        caption: createdPost.caption,
        token: createdPost.token,
      });
    } catch (notifyErr) {
      console.error('[POST /api/posts] Could not trigger notification:', notifyErr);
    }

    return NextResponse.json({ post: createdPost, source: 'persistent_store' }, { status: 201 });
  } catch (err: unknown) {
    console.error('Error creating post:', err);
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
      return NextResponse.json({ error: 'Post id is required' }, { status: 400 });
    }

    let success = false;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', id);
      if (!error) success = true;
    }

    const blobDeleted = await persistentStore.deleteById(id);
    if (blobDeleted) success = true;

    if (!success) {
      return NextResponse.json({ error: 'Post not found or could not be deleted' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Post deleted successfully' });
  } catch (err: unknown) {
    console.error('Error deleting post:', err);
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
      const updated = await persistentStore.setAll(body);
      return NextResponse.json({ success: true, count: updated.length });
    }

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'Post id is required' }, { status: 400 });
    }

    let updated = null;

    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        updated = data;
      }
    }

    if (!updated) {
      updated = await persistentStore.updateById(id, updates);
    }

    if (!updated) {
      return NextResponse.json({ error: 'Post not found or could not be updated' }, { status: 404 });
    }

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    console.error('Error updating post:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
