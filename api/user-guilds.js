import axios from 'axios';

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const adminGuilds = response.data.filter(guild => {
      const permissions = BigInt(guild.permissions);
      return (permissions & BigInt(0x20)) === BigInt(0x20) || (permissions & BigInt(0x8)) === BigInt(0x8);
    });

    res.status(200).json(adminGuilds);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
}
