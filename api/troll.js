import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const isTrolled = await kv.get('isTrolled');
      return res.status(200).json({ trolled: !!isTrolled });
    }

    if (req.method === 'POST') {
      const { trolled } = req.body;
      await kv.set('isTrolled', !!trolled);
      return res.status(200).json({ trolled: !!trolled });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
