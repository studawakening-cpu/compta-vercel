module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const accessToken = req.headers.authorization?.replace('Bearer ', '');
  if (!accessToken) return res.status(401).json({ error: 'Token manquant' });

  const { action, messageId } = req.body;

  try {
    if (action === 'list') {
      // Search for emails with attachments that look like invoices/accounting docs
      const query = 'has:attachment (facture OR invoice OR releve OR bulletin OR attestation OR urssaf OR audiens OR apollon OR "note de frais") newer_than:30d';
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=20`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.status(200).json(await r.json());
    }

    if (action === 'get') {
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.status(200).json(await r.json());
    }

    if (action === 'attachment') {
      const { attachmentId } = req.body;
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}/attachments/${attachmentId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.status(200).json(await r.json());
    }

    return res.status(400).json({ error: 'Action inconnue' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
