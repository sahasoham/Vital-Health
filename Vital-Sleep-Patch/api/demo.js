// Vercel edge function — POST /api/demo
// Writes to Google Sheets via Apps Script webhook + sends detailed Resend email

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

  const { name, email, institution, jobTitle, calculatedUpside, inputs } = body;
  if (!name || !email || !institution) {
    return Response.json({ error: 'Name, email, and institution are required' }, { status: 400 });
  }

  const upsideFormatted = calculatedUpside
    ? `$${Math.round(calculatedUpside).toLocaleString()}`
    : '—';

  const tasks = [];

  // 1. Write to Google Sheets
  const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
  if (sheetsUrl) {
    tasks.push(
      fetch(sheetsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'demo',
          name,
          email,
          institution,
          jobTitle: jobTitle ?? '',
          calculatedUpside: calculatedUpside ?? 0,
        }),
        redirect: 'follow',
      }).catch(() => {})
    );
  }

  // 2. Send admin notification email via Resend
  const resendKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (resendKey && adminEmail) {
    const inputRows = inputs
      ? Object.entries(inputs)
          .map(([k, v]) => `<tr><td style="padding:4px 16px 4px 0;color:#6B7280;text-transform:capitalize">${k.replace(/_/g, ' ')}</td><td>${v}</td></tr>`)
          .join('')
      : '';

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
          subject: `New demo request: ${institution} (${upsideFormatted} upside)`,
          html: `
            <h2 style="color:#1E1B4B">New Hospital Demo Request 🏥</h2>
            <table style="border-collapse:collapse;font-family:sans-serif;margin-bottom:24px">
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Name</td><td><strong>${name}</strong></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Email</td><td><strong>${email}</strong></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Institution</td><td><strong>${institution}</strong></td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Job Title</td><td>${jobTitle || '—'}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Calculated Upside</td><td style="color:#7C3AED;font-weight:700">${upsideFormatted}</td></tr>
              <tr><td style="padding:6px 16px 6px 0;color:#6B7280">Time</td><td>${new Date().toUTCString()}</td></tr>
            </table>
            ${inputRows ? `<h3 style="color:#1E1B4B">Calculator Inputs</h3><table style="border-collapse:collapse;font-family:sans-serif">${inputRows}</table>` : ''}
          `,
        }),
      }).catch(() => {})
    );
  }

  await Promise.all(tasks);

  return Response.json({
    success: true,
    message: "Thanks! We'll be in touch within one business day.",
  });
}
