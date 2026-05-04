import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminReviews(){
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [rows,setRows]=useState([]);
  const [filter,setFilter]=useState("pending");
  const [msg,setMsg]=useState("");

  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    const { data:{ user } } = await supabase.auth.getUser();
    setUser(user||null);
    if(user){
      const { data: recs } = await supabase.from("admins").select("*").eq("email", user.email);
      setIsAdmin((recs||[]).length>0);
    }
    load();
  })(); },[]);

  async function load() {
    if(!supabase) return;
    let q = supabase.from("reviews").select("id, book_id, rating, comment, status, flagged, created_at").order("created_at",{ascending:false});
    if (filter) q = q.eq("status", filter);
    const { data, error } = await q;
    if(!error) setRows(data||[]);
  }

  async function setStatus(id, status){
    setMsg("");
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if(error) setMsg("❌ "+error.message); else { setMsg("✅ Updated"); load(); }
  }

  async function toggleFlag(id, flagged){
    setMsg("");
    const { error } = await supabase.from("reviews").update({ flagged }).eq("id", id);
    if(error) setMsg("❌ "+error.message); else load();
  }

  if(!supabase) return <p>Add Supabase keys in .env.local</p>;
  if(!user) return <p><a href="/admin/login">Log in</a> to moderate.</p>;
  if(!isAdmin) return <p>Access denied (admin only).</p>;

  return (
    <div>
      <h1>Review Moderation</h1>
      <div className="card" style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
        <select className="input" value={filter} onChange={e=>setFilter(e.target.value)}>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="">All</option>
        </select>
        <button className="btn" onClick={load}>Refresh</button>
        <span>{msg}</span>
      </div>
      <ul className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'}}>
        {rows.map(r=>(
          <li key={r.id} className="card">
            <div><strong>★{r.rating}</strong> · {new Date(r.created_at).toLocaleString()}</div>
            <div style={{margin:"6px 0"}}>{r.comment || "—"}</div>
            <div className="flex">
              <button className="btn" onClick={()=>setStatus(r.id, "approved")}>Approve</button>
              <button className="btn secondary" onClick={()=>setStatus(r.id, "rejected")}>Reject</button>
              <label className="btn secondary" style={{display:"inline-flex",gap:6,alignItems:"center"}}>
                <input type="checkbox" checked={!!r.flagged} onChange={e=>toggleFlag(r.id, e.target.checked)} />
                Flag
              </label>
            </div>
            <div className="badge" style={{marginTop:6}}>Status: {r.status}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
