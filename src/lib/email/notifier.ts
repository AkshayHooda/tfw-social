export interface NotificationPayload {
  postId: string;
  creatorName: string;
  platform: string;
  action: 'approved' | 'changes_requested' | 'rejected' | 'pending_review' | 'new_upload';
  feedback?: string | null;
  caption?: string | null;
  token?: string | null;
}

export async function sendNotificationEmail(payload: NotificationPayload) {
  const recipientEmail = process.env.EDITOR_NOTIFICATION_EMAIL || 'needingadvice01@gmail.com';
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'akshay@needingadvice.co.uk';
  const apiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tfw-social.vercel.app';

  const actionDisplay = 
    payload.action === 'approved' ? '✅ Post Approved by Client' :
    payload.action === 'rejected' ? '❌ Post Disapproved' :
    payload.action === 'changes_requested' ? '⚠️ Edits / Changes Requested' :
    '🚀 New Post Queued for Client Review';

  const reviewUrl = payload.token ? `${baseUrl}/review/${payload.token}` : `${baseUrl}/portal`;
  const isNewSubmission = payload.action === 'pending_review' || payload.action === 'new_upload';
  const actionButtonText = isNewSubmission ? 'Review & Sign-Off Post' : 'Open Editor Desk';
  const actionButtonUrl = isNewSubmission ? reviewUrl : `${baseUrl}/editor`;

  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #fbf7ee; border: 1px solid rgba(76,19,21,0.2); border-radius: 12px; color: #280c0d;">
      <div style="text-align: center; border-bottom: 2px solid #4c1315; padding-bottom: 16px; margin-bottom: 20px;">
        <h1 style="color: #4c1315; font-size: 22px; margin: 0;">The Finance Woman</h1>
        <p style="color: #ad9b58; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0;">Client Review Notification</p>
      </div>

      <div style="background: #ffffff; border-radius: 8px; padding: 20px; border: 1px solid rgba(76,19,21,0.1); margin-bottom: 20px;">
        <h2 style="color: #4c1315; font-size: 18px; margin-top: 0;">${actionDisplay}</h2>
        <p style="margin: 6px 0;"><strong>Platform:</strong> ${payload.platform.replace('_', ' ').toUpperCase()}</p>
        <p style="margin: 6px 0;"><strong>Client / Creator:</strong> ${payload.creatorName}</p>
        
        ${payload.caption ? `<div style="margin: 14px 0; padding: 12px; background: #f6f0e2; border-left: 3px solid #ad9b58; font-style: italic; font-size: 13px;">“${payload.caption}”</div>` : ''}

        ${payload.feedback ? `
          <div style="margin: 16px 0; padding: 14px; background: #fdf2f2; border: 1px solid #f8b4b4; border-radius: 6px;">
            <strong style="color: #9b1c1c; display: block; margin-bottom: 6px;">Client Notes & Requested Changes:</strong>
            <p style="margin: 0; color: #771d1d; white-space: pre-wrap; font-size: 14px;">${payload.feedback}</p>
          </div>
        ` : ''}

        ${isNewSubmission ? `
          <div style="margin: 16px 0; padding: 14px; background: #f6f0e2; border-radius: 6px; border: 1px solid #ad9b58;">
            <p style="margin: 0; font-size: 13px; color: #4c1315;"><strong>Portal Passcode:</strong> <code>FINANCE2026</code></p>
            <p style="margin: 6px 0 0 0; font-size: 12px; color: #666;">Direct Approval Link: <a href="${reviewUrl}" style="color: #4c1315; font-weight: bold;">${reviewUrl}</a></p>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${actionButtonUrl}" style="background-color: #4c1315; color: #fbf7ee; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 14px;">${actionButtonText}</a>
      </div>

      <p style="text-align: center; color: #888; font-size: 11px; margin-top: 30px;">
        Sent automatically from The Finance Woman Executive Review System
      </p>
    </div>
  `;

  console.log(`\n========================================`);
  console.log(`[EMAIL NOTIFICATION DISPATCHED]`);
  console.log(`From: ${fromEmail}`);
  console.log(`To: ${recipientEmail}`);
  console.log(`Subject: [The Finance Woman] ${actionDisplay}`);
  console.log(`Action: ${payload.action}`);
  console.log(`Feedback: ${payload.feedback || 'None'}`);
  console.log(`========================================\n`);

  // Check for SMTP credentials
  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''),
        },
      });

      const info = await transporter.sendMail({
        from: `"The Finance Woman" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: fromEmail,
        subject: `[The Finance Woman] ${actionDisplay} - ${payload.platform.replace('_', ' ').toUpperCase()}`,
        html: htmlContent,
      });

      console.log('✅ Real Email Dispatched Successfully via Gmail SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error('❌ Failed to send email via SMTP:', smtpErr);
      return { success: false, error: smtpErr.message || smtpErr };
    }
  }

  if (apiKey) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `The Finance Woman <${fromEmail}>`,
          to: recipientEmail,
          subject: `[The Finance Woman] ${actionDisplay} - ${payload.platform}`,
          html: htmlContent,
        }),
      });
      const data = await response.json();
      return { success: true, resendData: data };

    } catch (err) {
      console.error('Failed to send email via Resend:', err);
      return { success: false, error: err };
    }
  }

  // Fallback if no external SMTP or Resend key is configured yet: logs cleanly and returns success
  return { success: true, logged: true, recipient: recipientEmail };
}

export interface IdeaNotificationPayload {
  ideaId: string;
  creatorName: string;
  title: string;
  notes: string;
  links?: string[];
  images?: string[];
  raw_video_url?: string | null;
  category?: string;
  priority?: string;
  stage?: string;
}

export async function sendIdeaNotificationEmail(payload: IdeaNotificationPayload) {
  const recipientEmail = process.env.EDITOR_NOTIFICATION_EMAIL || 'needingadvice01@gmail.com';
  const fromEmail = process.env.NOTIFICATION_FROM_EMAIL || 'akshay@needingadvice.co.uk';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tfw-social.vercel.app';
  const editorUrl = `${baseUrl}/editor`;

  const brandTitle = payload.creatorName === 'In Business Together' ? 'In Business Together' : 'The Finance Woman';
  const brandSub = payload.creatorName === 'In Business Together' ? 'Financial Planning for Director Couples' : 'Executive Social Review Desk';
  const accentColor = payload.creatorName === 'In Business Together' ? '#A8442A' : '#4c1315';
  const isRawVideo = !!payload.raw_video_url;

  const htmlContent = `
    <div style="font-family: 'Georgia', serif; max-width: 620px; margin: 0 auto; padding: 26px; background-color: #fbf7ee; border: 1px solid rgba(76,19,21,0.2); border-radius: 14px; color: #280c0d;">
      <div style="text-align: center; border-bottom: 2px solid ${accentColor}; padding-bottom: 16px; margin-bottom: 22px;">
        <h1 style="color: ${accentColor}; font-size: 22px; margin: 0;">${brandTitle}</h1>
        <p style="color: #ad9b58; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; margin: 4px 0 0 0; font-weight: bold;">${brandSub}</p>
      </div>

      <div style="background: #ffffff; border-radius: 10px; padding: 22px; border: 1px solid rgba(76,19,21,0.12); margin-bottom: 22px;">
        <div style="display: inline-block; background-color: ${accentColor}; color: #fbf7ee; font-size: 11px; font-weight: bold; padding: 4px 10px; border-radius: 20px; margin-bottom: 12px; letter-spacing: 1px;">
          ${isRawVideo ? '📹 RAW FOOTAGE & VIDEO UPLOADED BY CLIENT' : '💡 NEW CLIENT CONTENT IDEA LOGGED'}
        </div>

        <h2 style="color: ${accentColor}; font-size: 19px; margin-top: 6px; margin-bottom: 12px;">
          ${payload.title || (isRawVideo ? 'Raw Video Submission' : 'New Content Concept')}
        </h2>

        <p style="margin: 4px 0; font-size: 13px;"><strong>Brand:</strong> ${brandTitle}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Format:</strong> ${(payload.category || 'Reel').toUpperCase()}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Priority:</strong> ${(payload.priority || 'Normal').toUpperCase()}</p>
        <p style="margin: 4px 0; font-size: 13px;"><strong>Lifecycle Stage:</strong> ${(payload.stage || (isRawVideo ? 'filmed' : 'idea')).toUpperCase()}</p>
        
        <div style="margin: 18px 0; padding: 14px 16px; background: #faf6eb; border-left: 4px solid ${accentColor}; border-radius: 4px; font-size: 14px; line-height: 1.6;">
          <strong>Client Notes &amp; Instructions:</strong>
          <p style="margin: 8px 0 0 0; white-space: pre-wrap; color: #1e293b;">${payload.notes}</p>
        </div>

        ${payload.raw_video_url ? `
          <div style="margin: 18px 0; padding: 14px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
            <strong style="color: #065f46; font-size: 13px; display: block; margin-bottom: 6px;">📹 Raw Video File Ready for Editing:</strong>
            <a href="${payload.raw_video_url}" style="background: #059669; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 12px; font-weight: bold; display: inline-block;" target="_blank">
              Download / Stream Raw Video (.mp4 / .mov) ↗
            </a>
          </div>
        ` : ''}

        ${payload.links && payload.links.length > 0 ? `
          <div style="margin: 16px 0; padding: 12px 14px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
            <strong style="color: #334155; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Reference &amp; Inspiration Links:</strong>
            <ul style="margin: 8px 0 0 0; padding-left: 20px; font-size: 13px;">
              ${payload.links.map(l => `<li style="margin-bottom: 4px;"><a href="${l}" style="color: ${accentColor}; font-weight: 600;" target="_blank">${l}</a></li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${payload.images && payload.images.length > 0 ? `
          <div style="margin: 16px 0;">
            <strong style="color: #334155; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Attached Reference Assets (${payload.images.length}):</strong>
            <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
              ${payload.images.map(img => `<img src="${img}" style="width: 90px; height: 90px; object-fit: cover; border-radius: 6px; border: 1px solid #cbd5e1;" />`).join('')}
            </div>
          </div>
        ` : ''}
      </div>

      <div style="text-align: center; margin-top: 24px;">
        <a href="${editorUrl}" style="background-color: ${accentColor}; color: #fbf7ee; padding: 12px 26px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 14px;">
          Open in Editor Desk &amp; Produce Draft →
        </a>
      </div>

      <p style="text-align: center; color: #888; font-size: 11px; margin-top: 26px;">
        Logged from the Client Portal for ${brandTitle}
      </p>
    </div>
  `;

  console.log(`\n[IDEA NOTIFICATION DISPATCHED] To: ${recipientEmail} | Title: ${payload.title}`);

  const smtpUser = process.env.SMTP_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpUser && smtpPass) {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: smtpUser,
          pass: smtpPass.replace(/\s+/g, ''),
        },
      });

      const info = await transporter.sendMail({
        from: `"${brandTitle}" <${smtpUser}>`,
        to: recipientEmail,
        replyTo: fromEmail,
        subject: `💡 [${brandTitle}] New Idea Logged: ${payload.title || 'Client Concept'}`,
        html: htmlContent,
      });

      console.log('✅ Idea Alert Dispatched via Gmail SMTP:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (smtpErr: any) {
      console.error('❌ Failed to send idea email via SMTP:', smtpErr);
      return { success: false, error: smtpErr.message || smtpErr };
    }
  }

  return { success: true, logged: true, recipient: recipientEmail };
}