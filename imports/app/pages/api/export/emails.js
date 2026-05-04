import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(500).json({ error: "missing public supabase env" });
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("profiles")
    .select("email, display_name, created_at")
    .not("email", "is", null);

  if (error) return res.status(500).json({ error: error.message });

  const rows = data.map(r => [r.email, r.display_name || "", r.created_at || ""]);
  const csv = ["email,display_name,created_at", ...rows.map(r=>r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=chapterhouse-emails.csv");
  res.status(200).send(csv);
}
