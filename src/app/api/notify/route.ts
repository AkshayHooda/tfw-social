import { NextResponse } from 'next/server';
import { sendNotificationEmail, NotificationPayload } from '@/lib/email/notifier';

export async function POST(request: Request) {
  try {
    const body: NotificationPayload = await request.json();

    if (!body.postId || !body.action) {
      return NextResponse.json({ error: 'Missing required notification fields' }, { status: 400 });
    }

    const result = await sendNotificationEmail(body);
    return NextResponse.json({ success: true, result });
  } catch (err: unknown) {
    console.error('Error processing notification:', err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}