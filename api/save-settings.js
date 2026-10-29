import connectDB from '../utils/db.js';
import mongoose from 'mongoose';

const GuildSchema = new mongoose.Schema({
  guildId: String, prefix: String, welcomeChannel: String, welcomeMessage: String
});
const Guild = mongoose.models.Guild || mongoose.model('Guild', GuildSchema);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    // Check if Vercel actually has the variable
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing in Vercel Environment Variables.");
    }

    await connectDB();
    const { guildId, prefix, welcomeChannel, welcomeMessage } = req.body;

    await Guild.findOneAndUpdate({ guildId }, { prefix, welcomeChannel, welcomeMessage }, { upsert: true, new: true });
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('🔥 DB Save Error:', error.message);
    // Send the exact error message back to the website
    res.status(500).json({ success: false, error: error.message }); 
  }
}
