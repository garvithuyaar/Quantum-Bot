import axios from 'axios';
import connectDB from '../utils/db.js';
import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String, prefix: String, welcomeChannel: String, welcomeMessage: String,
  isPremium: { type: Boolean, default: false }
});
const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);

export default async function handler(req, res) {
  const { token } = req.query;
  if (!token) return res.status(401).json({ error: 'No token provided' });
  if (!process.env.DISCORD_TOKEN) return res.status(500).json({ error: 'DISCORD_TOKEN is missing in Vercel' });

  try {
    await connectDB();

    // 1. Fetch user's guilds
    const userRes = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Filter for servers where user has Manage Server (0x20) or Admin (0x8)
    const adminGuilds = userRes.data.filter(guild => {
      const perms = guild.permissions ? BigInt(guild.permissions) : BigInt(0);
      return (perms & BigInt(0x8)) === BigInt(0x8) || (perms & BigInt(0x20)) === BigInt(0x20);
    });

    if (adminGuilds.length === 0) return res.status(200).json([]);

    // 2. Fetch the servers where the BOT is present
    const botRes = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
    });
    const botGuildIds = new Set(botRes.data.map(g => g.id));

    // 3. Keep ONLY servers where the user is Admin AND the bot is present
    const mutualGuilds = adminGuilds.filter(guild => botGuildIds.has(guild.id));

    // 4. Enrich with database data (Premium status) and member counts
    const enrichedGuilds = await Promise.all(mutualGuilds.map(async (guild) => {
      const dbGuild = await Guild.findOne({ guildId: guild.id });
      
      let memberCount = 0;
      try {
        const botGuildRes = await axios.get(`https://discord.com/api/guilds/${guild.id}?with_counts=true`, {
          headers: { Authorization: `Bot ${process.env.DISCORD_TOKEN}` }
        });
        memberCount = botGuildRes.data.approximate_member_count;
      } catch (err) {
        // Ignore if fetching count fails
      }

      return {
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        memberCount: memberCount || 0,
        isPremium: dbGuild ? dbGuild.isPremium : false
      };
    }));

    res.status(200).json(enrichedGuilds);
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch guilds' });
  }
}
