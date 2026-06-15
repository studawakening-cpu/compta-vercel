export default async function handler(req, res) {
  const { code, error } = req.query;
  if (error) return res.status(400).send(`Erreur OAuth: ${error}`);
  if (!code) return res.status(400).send('Code manquant');

  const CLIENT_ID = '475047895217-6uh2kfvqdo9kouad2aqe1b2n45t4v7i6a.apps.googleusercontent.com';
  const CLIENT_SECRET = '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';
  const REDIRECT_URI = 'https://compta-vercel.vercel.app/api/auth/callback';

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ code, client_id: CLIENT_ID, client_secret: CLIENT_SECRET, redirect_uri: REDIRECT_URI, grant_type: 'authorization_code' })
    });
    const tokens = await tokenRes.json();
    if (tokens.error) return res.status(400).send(`Erreur token: ${tokens.error_description}`);
    const params = new URLSearchParams({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token || '',
      expires_in: tokens.expires_in || 3600
    });
    return res.redirect(`/?${params.toString()}`);
  } catch (err) {
    return res.status(500).send(`Erreur: ${err.message}`);
  }
}
