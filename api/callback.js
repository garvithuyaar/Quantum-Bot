import axios from 'axios';
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect('https://quantum-discord.vercel.app/?error=no_code');
  }

  try {
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: 'https://quantum-discord.vercel.app/api/callback',
    }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

    const accessToken = tokenResponse.data.access_token;
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const user = userResponse.data;

    if (user.email) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
      });

      const mailOptions = {
        from: `"Quantum Bot" <${process.env.GMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to Quantum! 🚀',
        html: `<h2>Welcome to Quantum, ${user.username}!</h2><p>Your Discord account has been linked successfully.</p>`
      };
      transporter.sendMail(mailOptions).catch(console.error);
    }

    res.redirect(`https://quantum-discord.vercel.app/dashboard.html?token=${accessToken}`);
  } catch (error) {
    console.error('OAuth Error:', error.response ? error.response.data : error.message);
    res.redirect('https://quantum-discord.vercel.app/?error=auth_failed');
  }
}
