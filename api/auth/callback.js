module.exports = async function handler(req, res) {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Erreur OAuth: ${error}`);
  if (!code) return res.status(400).send('Code manquant');

  const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const REDIRECT_URI = 'https://compta-vercel.vercel.app/api/auth/callback';

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' }).toString()
    });
    const tokens = await tokenRes.json();
    if (tokens.error) return res.status(400).send(`Erreur token: ${tokens.error_description}`);
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: tokens.expires_in || 3600
    });
    res.writeHead(302, { Location: `/?${params.toString()}` });
    res.end();
  } catch (err) {
    res.status(500).send(`Erreur: ${err.message}`);
  }
};
