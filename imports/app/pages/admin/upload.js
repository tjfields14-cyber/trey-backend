import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadBook(){
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [genres,setGenres]=useState([]);
  const [form,setForm]=useState({ title:"", author:"", description:"", genre_id:"" });
  const [cover,setCover]=useState(null);
  const [epub,setEpub]=useState(null);
  const [msg,setMsg]=useState("");
  const [saving,setSaving]=useState(false);

  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    const { data:{ user } } = await supabase.auth.getUser();
    setUser(user||null);
    if(user){
      const { data: recs } = await supabase.from("admins").select("*").eq("email", user.email);
      setIsAdmin((recs||[]).length>0);
    }
    const { data:g } = await supabase.from("genres").select("*").order("name",{ascending:true});
    setGenres(g||[]);
  })(); },[]);

  function onChange(e){ setForm(f=>({...f,[e.target.name]:e.target.value})); }
  function onCover(e){ const f=e.target.files?.[0]; if(!f)return; if(!f.type.startsWith("image/")) return setMsg("❌ Cover must be an image"); setCover(f); }
  function onEpub(e){ const f=e.target.files?.[0]; if(!f)return; if(!f.name.toLowerCase().endsWith(".epub")) return setMsg("❌ File must be .epub"); setEpub(f); }

  async function submit(e){
    e.preventDefault(); setMsg("");
    if(!supabase) return setMsg("Add Supabase keys in .env.local");
    if(!user) return setMsg("Please log in");
    if(!isAdmin) return setMsg("Admins only");
    if(!form.title.trim()||!form.author.trim()) return setMsg("❌ Title & Author required");
    if(!cover || !epub) return setMsg("❌ Select a cover image and an .epub");

    setSaving(true);
    try{
      // upload cover
      const coverPath = `covers/${Date.now()}-${cover.name}`;
      const { data: cu, error: ce } = await supabase.storage.from("covers").upload(coverPath, cover, { upsert:false });
      if(ce) throw ce;
      const { data: cup } = await supabase.storage.from("covers").getPublicUrl(cu.path);
      const cover_url = cup.publicUrl;

      // upload epub
      const epubPath = `epubs/${Date.now()}-${epub.name}`;
      const { data: eu, error: ee } = await supabase.storage.from("epubs").upload(epubPath, epub, { upsert:false });
      if(ee) throw ee;
      const { data: eup } = await supabase.storage.from("epubs").getPublicUrl(eu.path);
      const file_url = eup.publicUrl;

      // insert book
      const { error: be } = await supabase.from("books").insert([{
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description?.trim()||"",
        genre_id: form.genre_id || null,
        cover_url, file_url
      }]);
      if(be) throw be;
      setMsg("✅ Book uploaded");
      setForm({ title:"", author:"", description:"", genre_id:"" });
      (e.target.reset && e.target.reset());
      setCover(null); setEpub(null);
    }catch(err){
      console.error(err);
      setMsg("❌ "+(err?.message||"Upload failed"));
    }finally{ setSaving(false); }
  }

  if(!supabase) return <p>Add Supabase keys in .env.local</p>;
  if(!user) return <p><a href="/admin/login">Log in</a> to upload books.</p>;
  if(!isAdmin) return <p>Access denied (admin only).</p>;

  return (
    <div>
      <h1>Upload a Book</h1>
      <form onSubmit={submit} style={{display:"grid",gap:12,maxWidth:720}}>
        <input className="input" name="title" placeholder="Title" onChange={onChange} />
        <input className="input" name="author" placeholder="Author" onChange={onChange} />
        <textarea className="input" name="description" placeholder="Short description" rows={4} onChange={onChange} />
        <div style={{display:"flex",gap:10}}>
          <select className="input" name="genre_id" onChange={onChange} defaultValue="">
            <option value="">Select genre…</option>
            {genres.map(g=> <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <a className="btn" href="/genres">Manage Genres</a>
        </div>
        <label>Cover image (jpg/png) <input type="file" accept="image/*" onChange={onCover} /></label>
        <label>EPUB file (.epub) <input type="file" accept=".epub" onChange={onEpub} /></label>
        <button className="btn" type="submit" disabled={saving}>{saving?"Uploading…":"Upload"}</button>
        <p>{msg}</p>
      </form>
    </div>
  );
}
