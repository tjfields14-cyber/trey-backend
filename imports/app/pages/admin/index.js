import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Admin(){
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    const { data:{ user } } = await supabase.auth.getUser();
    setUser(user||null);
    if(user){
      const { data: recs } = await supabase.from("admins").select("*").eq("email", user.email);
      setIsAdmin((recs||[]).length>0);
    }
  })(); },[]);
  if(!supabase) return <p>Add Supabase keys in .env.local</p>;
  if(!user) return <p><a href="/admin/login">Log in</a> to access admin.</p>;
  if(!isAdmin) return <p>You are signed in, but not an admin.</p>;
  return (<div className="card">
  <h1>Admin Dashboard</h1>
  <ul>
    <li><a href="/genres">Manage Genres</a></li>
    <li><a href="/admin/upload">Upload Book</a></li>
    <li><a href="/admin/books">Books Manager</a></li>
    <li><a href="/admin/reviews">Review Moderation</a></li>
    <li><a href="/api/export/emails" target="_blank" rel="noreferrer">Export Emails (profiles.csv)</a></li>
    <li><a href="/api/export/reviews" target="_blank" rel="noreferrer">Export Reviews (csv)</a></li>
  </ul>
  <p style={{marginTop:8,color:"#666"}}>Admin-only exports of Auth users (requires token): <code>GET /api/export/emails-admin</code></p>
</div>);
}