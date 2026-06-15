module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const accessToken = authHeader.replace('Bearer ', '');
  const { action, folderId, fileName, fileContent, mimeType, spreadsheetId, range, values } = req.body;

  try {
    if (action === 'upload') {
      const metadata = { name: fileName, parents: [folderId] };
      const boundary = 'boundary123456789';
      const body = `--${boundary}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(metadata)}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${fileContent}\r\n--${boundary}--`;
      const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': `multipart/related; boundary="${boundary}"` },
        body
      });
      return res.status(200).json(await uploadRes.json());
    }

    if (action === 'listFolders') {
      const driveRes = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType%3D'application%2Fvnd.google-apps.folder'+and+'${folderId}'+in+parents+and+trashed%3Dfalse&fields=files(id,name)&pageSize=50`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      return res.status(200).json(await driveRes.json());
    }

    if (action === 'sheetsAppend') {
      const sheetsRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ values })
      });
      return res.status(200).json(await sheetsRes.json());
    }

    return res.status(400).json({ error: 'Action inconnue' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
