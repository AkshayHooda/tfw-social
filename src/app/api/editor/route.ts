import { NextResponse } from 'next/server';
import { persistentStore } from '@/lib/persistent-store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = (body.password || '').toString().trim();
    const settings = await persistentStore.getSettings();
    const correctPassword = settings.editor_passcode || (process.env.EDITOR_PASSWORD || 'Akshay@987').trim();

    if (password !== correctPassword) {
      return NextResponse.json({ error: 'Incorrect editor passcode. Access denied.' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      message: 'Access granted',
      settings: {
        editor_passcode: settings.editor_passcode,
        portal_passcode: settings.portal_passcode,
        notification_email: settings.notification_email,
        smtp_user: settings.smtp_user || '',
      },
    });
  } catch (err: unknown) {
    console.error('Error authenticating editor:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { currentPassword, updates } = body;

    const currentSettings = await persistentStore.getSettings();
    const correctPassword = currentSettings.editor_passcode || (process.env.EDITOR_PASSWORD || 'Akshay@987').trim();

    if (currentPassword !== correctPassword) {
      return NextResponse.json({ error: 'Unauthorized. Current admin passcode is invalid.' }, { status: 403 });
    }

    const updated = await persistentStore.updateSettings(updates);

    return NextResponse.json({
      success: true,
      message: 'Admin settings saved successfully',
      settings: {
        editor_passcode: updated.editor_passcode,
        portal_passcode: updated.portal_passcode,
        notification_email: updated.notification_email,
        smtp_user: updated.smtp_user || '',
      },
    });
  } catch (err: unknown) {
    console.error('Error updating settings:', err);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
