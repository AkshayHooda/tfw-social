import { NextResponse } from 'next/server';
import { put, list } from '@vercel/blob';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const COMMENTS_BLOB_PATH = 'data/approval_comments.json';

interface ApprovalComment {
  id: string;
  postNum: number;
  postTitle: string;
  reviewerName: string;
  comment: string;
  actionRequested?: string;
  createdAt: string;
}

async function getStoredComments(): Promise<ApprovalComment[]> {
  try {
    const { blobs } = await list({ prefix: COMMENTS_BLOB_PATH });
    if (!blobs.length) return [];
    const latestBlob = blobs[0];
    const res = await fetch(`${latestBlob.url}?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return [];
    return (await res.json()) as ApprovalComment[];
  } catch (e) {
    console.error('Error fetching stored comments:', e);
    return [];
  }
}

async function saveStoredComments(comments: ApprovalComment[]) {
  await put(COMMENTS_BLOB_PATH, JSON.stringify(comments, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function GET() {
  const comments = await getStoredComments();
  return NextResponse.json({ comments }, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { postNum, postTitle, reviewerName, comment, actionRequested } = body;

    if (!postNum || !comment || !comment.trim()) {
      return NextResponse.json({ error: 'Post number and comment are required' }, { status: 400 });
    }

    const newComment: ApprovalComment = {
      id: (await import('crypto')).randomUUID(),
      postNum: Number(postNum),
      postTitle: postTitle || `Post ${postNum}`,
      reviewerName: (reviewerName && reviewerName.trim()) || 'Reviewer',
      comment: comment.trim(),
      actionRequested: actionRequested || 'changes_requested',
      createdAt: new Date().toISOString(),
    };

    const current = await getStoredComments();
    const updated = [newComment, ...current];
    await saveStoredComments(updated);

    // Also trigger email notification to needingadvice01@gmail.com
    try {
      const { sendNotificationEmail } = await import('@/lib/email/notifier');
      await sendNotificationEmail({
        postId: `approval-post-${postNum}`,
        creatorName: newComment.reviewerName,
        platform: 'Approval Portal Comment',
        action: 'changes_requested',
        feedback: `[Comment on Post ${postNum}: ${newComment.postTitle}]\nFrom: ${newComment.reviewerName}\n\nComment: ${newComment.comment}`,
        caption: newComment.postTitle,
      });
    } catch (notifyErr) {
      console.warn('Could not dispatch comment email notification:', notifyErr);
    }

    return NextResponse.json({ success: true, comment: newComment });
  } catch (err: unknown) {
    console.error('Error saving approval comment:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
