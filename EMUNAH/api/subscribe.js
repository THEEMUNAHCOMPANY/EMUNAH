// File: EMUNAH/api/subscribe.js
const { createClient } = require('@supabase/supabase-js');

const url = process.env.SUPABASE_URL;
const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceRole) {
  throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}

const supabase = createClient(url, serviceRole, { auth: { persistSession: false } });

function digitsOnly(s = "") { return s.replace(/\D/g, ""); }
function validEmail(str = "") { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str); }

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, consent } = req.body || {};
    const phoneDigits = digitsOnly(phone || '');

    if (!name || !validEmail(email || '') || phoneDigits.length < 10 || !consent) {
      return res.status(400).json({ error: 'Invalid or missing fields' });
    }

    // Try to insert. If you made email/phone unique, duplicates will trigger code 23505.
    const { error } = await supabase
      .from('subscribers') // <-- make sure this matches your table name
      .insert({
        name,
        email: email.toLowerCase(),
        phone: phoneDigits,
        consent: true
      });

    if (error) {
      console.error('Supabase insert error:', error);
      const msg =
        (error.code === '23505' || /duplicate/i.test(error.message))
          ? 'You are already subscribed.'
          : 'Database error';
      return res.status(400).json({ error: msg });
    }

    return res.status(200).json({ ok: true, message: 'Subscribed! Welcome to EMUNAH.' });
  } catch (e) {
    console.error('subscribe handler error:', e);
    return res.status(500).json({ error: 'Server error' });
  }
};
