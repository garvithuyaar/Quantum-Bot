import connectDB from '../utils/db.js';
import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String, prefix: String, welcomeChannel: String, welcomeMessage: String
});
const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);

export default async function handler(req, res) {
  await connectDB();
  const { guildId } = req.query;
  try {
    const settings = await Guild.findOne({ guildId });
    if (!settings) return res.status(200).json({ prefix: '!', welcomeChannel: '', welcomeMessage: 'Welcome {user} to the server!' });
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to load settings' });
  }
}