import axios from 'axios';

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const response = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user' });
  }
}
