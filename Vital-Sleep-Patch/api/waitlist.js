// Vercel edge function — POST /api/waitlist
// Writes to Google Sheets via Apps Script webhook + sends Resend email

export const runtime = 'edge';

export default async function handler(req) {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { email, name, childAge } = body;
  if (!email) {
    return Response.json({ error: 'Email is required' }, { status: 400 });
  }

  const tasks = [];

  // 1. Write to Google Sheets
  const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
  if (sheetsUrl) {
    tasks.push(
      fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'waitlist', email, name: name ?? '', childAge: childAge ?? '' }),
        redirect: 'follow',
      }).catch(() => {})
    );
  }

  // 2. Send admin notification email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    tasks.push(
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Vital Health <onboarding@resend.dev>',
          to: [adminEmail],
          subject: `New waitlist signup: ${name || email}`,
          html: `
            <h2 style="color:#1E1B4B">New Waitlist Signup 🎉</h2>
            <table style="border-collapse:collapse;font-family:sans-serif">
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Email</td><td><strong>${email}</strong></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Name</td><td>${name || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Child Age</td><td>${childAge || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Time</td><td>${new Date().toUTCString()}</td></tr>
            </table>
          `,
        }),
      }).catch(() => {})
    );
  }

  await Promise.all(tasks);

  return Response.json({
    success: true,
    message: "You're on the list! We'll be in touch when we launch.",
    position: 1,
  });
}
