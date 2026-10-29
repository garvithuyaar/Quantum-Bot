import axios from 'axios';

export default async function handler(req, res) {
  const { token } = req.query;
  
  if (!token) {
    console.log('❌ No token provided in request');
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const response = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Safely filter for servers where user has Manage Server (0x20) or Admin (0x8)
    const adminGuilds = response.data.filter(guild => {
      // If permissions is missing, default to 0n (BigInt zero)
      const perms = guild.permissions ? BigInt(guild.permissions) : BigInt(0);
      const isAdmin = (perms & BigInt(0x8)) === BigInt(0x8);
      const isManageGuild = (perms & BigInt(0x20)) === BigInt(0x20);
      
      return isAdmin || isManageGuild;
    });

    console.log(`✅ Found ${adminGuilds.length} admin servers.`);
    res.status(200).json(adminGuilds);
    
  } catch (error) {
    // This prints the EXACT error from Discord to your Vercel Logs
    console.error('🔥 Discord API Error:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
}
