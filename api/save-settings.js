import connectDB from '../utils/db.js';
import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String, prefix: String, welcomeChannel: String, welcomeMessage: String,
  antiLink: Boolean, antiInvite: Boolean, antiSpam: Boolean,
  modLogChannel: String, msgLogChannel: String, customCommands: Array
});
const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    await connectDB();
    const { 
      guildId, prefix, welcomeChannel, welcomeMessage, 
      antiLink, antiInvite, antiSpam, modLogChannel, msgLogChannel, customCommands 
    } = req.body;

    await Guild.findOneAndUpdate(
      { guildId }, 
      { prefix, welcomeChannel, welcomeMessage, antiLink, antiInvite, antiSpam, modLogChannel, msgLogChannel, customCommands }, 
      { upsert: true, new: true }
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
