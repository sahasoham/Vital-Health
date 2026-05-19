// Vercel edge function — GET /api/waitlist/count
// Reads the row count from Google Sheets via Apps Script webhook

export const runtime = 'edge';

export default async function handler(req) {
  if (req.method !== 'GET') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const sheetsUrl = process.env.SHEETS_WEBHOOK_URL;
  if (!sheetsUrl) {
    return Response.json({ count: 0 });
  }

  try {
    const url = new URL(sheetsUrl);
    url.searchParams.set('action', 'count');
    const res = await fetch(url.toString(), { redirect: 'follow' });
    const data = await res.json();
    return Response.json({ count: data.count ?? 0 });
  } catch {
    return Response.json({ count: 0 });
  }
}
