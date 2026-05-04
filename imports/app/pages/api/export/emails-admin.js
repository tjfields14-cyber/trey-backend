import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const token = req.headers["x-admin-export-token"];
  if (token !== process.env.TEST_CLEANUP_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !serviceKey) return res.status(500).json({ error: "missing server env" });

  const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
  const { data, error } = await admin.auth.admin.listUsers();
  if (error) return res.status(500).json({ error: error.message });

  const users = data?.users || [];
  const rows = users.map(u => [u.email || "", u.user_metadata?.name || "", u.created_at || ""]);
  const csv = ["email,name,created_at", ...rows.map(r=>r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=chapterhouse-auth-users.csv");
  res.status(200).send(csv);
}
