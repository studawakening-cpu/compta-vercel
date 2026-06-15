export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { refresh_token } = req.body;
  if (!refresh_token) return res.status(400).json({ error: 'refresh_token manquant' });

  const CLIENT_ID = '475047895217-6uh2kfvqdo9kouad2aqe1b2n45t4v7i6a.apps.googleusercontent.com';
  const CLIENT_SECRET = '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';

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ refresh_token, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, grant_type: 'refresh_token' })
    });
    const tokens = await tokenRes.json();
    return res.status(200).json(tokens);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
