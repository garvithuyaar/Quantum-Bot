import connectDB from '../utils/db.js';
import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String, prefix: String, welcomeChannel: String, welcomeMessage: String
});
const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  await connectDB();
  const { guildId, prefix, welcomeChannel, welcomeMessage } = req.body;

  try {
    await Guild.findOneAndUpdate({ guildId }, { prefix, welcomeChannel, welcomeMessage }, { upsert: true, new: true });
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save settings' });
  }
}