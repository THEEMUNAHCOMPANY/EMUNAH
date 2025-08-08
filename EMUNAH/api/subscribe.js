// File: api/subscribe.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // server-side only
  { auth: { persistSession: false } }
);

function digitsOnly(s = "") {
  return s.replace(/\D/g, "");
}
function validEmail(str = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, consent } = req.body || {};
    const phoneDigits = digitsOnly(phone);

    if (!name || !email || !phoneDigits || phoneDigits.length < 10 || !consent) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }
    if (!validEmail(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // optional metadata
    const ip =
      req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      req.socket?.remoteAddress ||
      null;
    const user_agent = req.headers['user-agent'] || null;

    // insert (change table/column names if yours differ)
    const { error } = await supabase.from('subscribers').insert({
      name,
      email: email.toLowerCase(),
      phone: phoneDigits,
      consent: true,
      ip,
      user_agent
    });

    if (error) {
      // Handle unique constraint errors nicely
      const msg = (error.code === '23505' || /duplicate/i.test(error.message))
        ? 'You are already subscribed.'
        : 'Database error';
      return res.status(400).json({ error: msg, detail: error.message });
    }

    return res.status(200).json({ ok: true, message: 'Subscribed! Welcome to EMUNAH.' });
  } catch (e) {
    console.error('subscribe error', e);
    return res.status(500).json({ error: 'Server error' });
  }
};
