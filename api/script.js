export default async function handler(req, res) {
  const SCRIPT_URL = process.env.APPS_SCRIPT_URL;

  try {
    if (req.method === 'GET') {
      const params = new URLSearchParams(req.query).toString();
      const url = params ? `${SCRIPT_URL}?${params}` : SCRIPT_URL;
      const response = await fetch(url);
      const data = await response.json();
      return res.json(data);
    }

    if (req.method === 'POST') {
      const response = await fetch(SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      });
      const data = await response.json();
      return res.json(data);
    }

    res.status(405).end();
  } catch {
    res.status(500).json({ success: false });
  }
}
