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
      const { dateRange } = req.body;
      const afterStr = dateRange?.after || '';
      const beforeStr = dateRange?.before || '';
      // Two searches: accounting keywords + self-sent emails (tickets CB)
      const baseQuery = 'has:attachment (facture OR invoice OR releve OR bulletin OR attestation OR urssaf OR audiens OR apollon OR "note de frais" OR devis OR cotisation OR salaire OR paie OR ticket OR tickets)';
      const selfQuery = 'has:attachment from:me to:me';
      const query = `(${baseQuery} OR ${selfQuery})` + afterStr + beforeStr;
      const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(query)}&maxResults=50`, {
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
