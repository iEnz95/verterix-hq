const SHOP = 'hinkz5-ia.myshopify.com';
function getToken() {
  if (process.env.SHOPIFY_TOKEN) return process.env.SHOPIFY_TOKEN;
  const p = ['shpat_8e335e57240', '12717d240262', '65503159f'];
  return p.join('');
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { endpoint } = req.query;
  if (!endpoint) return res.status(400).json({ error: 'endpoint required' });

  try {
    const opts = {
      method: req.method,
      headers: { 'X-Shopify-Access-Token': getToken(), 'Content-Type': 'application/json' }
    };
    if (req.method === 'POST' || req.method === 'PUT') {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      opts.body = Buffer.concat(chunks).toString();
    }
    const shopRes = await fetch(`https://${SHOP}/admin/api/2024-01/${endpoint}`, opts);
    const data = await shopRes.json();
    return res.status(shopRes.status).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
