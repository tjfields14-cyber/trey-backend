import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return res.status(500).json({ error: "missing public supabase env" });
  const supabase = createClient(url, key);

  const { data, error } = await supabase
    .from("reviews")
    .select("book_id, rating, comment, status, created_at");
  if (error) return res.status(500).json({ error: error.message });

  const header = "book_id,rating,comment,status,created_at";
  const rows = data.map(r => [r.book_id, r.rating, r.comment||"", r.status, r.created_at]);
  const csv = [header, ...rows.map(r=>r.map(x => `"${String(x).replace(/"/g,'""')}"`).join(","))].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=chapterhouse-reviews.csv");
  res.status(200).send(csv);
}
