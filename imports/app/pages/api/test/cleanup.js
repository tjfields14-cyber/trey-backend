import { createClient } from "@supabase/supabase-js";
export default async function handler(req, res) {
  const token = req.headers["x-cleanup-token"];
  if (token !== process.env.TEST_CLEANUP_TOKEN) {
    return res.status(401).json({ ok:false, error:"unauthorized" });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return res.status(500).json({ ok:false, error:"missing server env" });
  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  try {
    const testEmail = process.env.NEXT_PUBLIC_TEST_EMAIL;
    const { data: users, error: uErr } = await admin.auth.admin.listUsers();
    if (uErr) return res.status(500).json({ ok:false, error:uErr.message });
    const testUser = users?.users?.find(u => u.email?.toLowerCase() === testEmail?.toLowerCase());
    const testUserId = testUser?.id;
    if (testUserId) {
      await admin.from("reviews").delete().eq("user_id", testUserId);
      await admin.from("profiles").delete().eq("user_id", testUserId);
    }
    await admin.from("admins").delete().eq("email", testEmail);
    return res.json({ ok:true, cleared:true });
  } catch (e) {
    return res.status(500).json({ ok:false, error:e.message });
  }
}
