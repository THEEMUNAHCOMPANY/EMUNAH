// File: api/subscribe.js
// Vercel automatically treats files in /api as serverless functions.
// For Supabase integration next, we'll install @supabase/supabase-js (server-side) and insert into a table.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, phone, consent } = req.body || {};
  if (!name || !email || !phone || !consent) {
    return res.status(400).json({ error: "Missing fields" });
  }

  // TODO: plug in Supabase here (server-side ONLY)
  // Example (coming next step):
  //   import { createClient } from '@supabase/supabase-js'
  //   const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  //   await supabase.from('subscribers').insert({ name, email, phone, consent: true })

  return res.status(200).json({ ok: true, message: "Subscribed! Welcome to EMUNAH." });
}

