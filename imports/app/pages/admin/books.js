import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminBooks(){
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [books,setBooks]=useState([]);
  const [genres,setGenres]=useState([]);
  const [search,setSearch]=useState("");
  const [msg,setMsg]=useState("");

  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    const { data:{ user } } = await supabase.auth.getUser();
    setUser(user||null);
    if(user){
      const { data: recs } = await supabase.from("admins").select("*").eq("email", user.email);
      setIsAdmin((recs||[]).length>0);
    }
    const { data: g } = await supabase.from("genres").select("*").order("name",{ascending:true});
    setGenres(g||[]);
    await loadBooks();
  })(); },[]);

  async function loadBooks(){
    const { data } = await supabase.from("book_catalog_stats").select("*").order("created_at",{ascending:false});
    setBooks(data||[]);
  }

  async function save(b){
    setMsg("");
    const payload = { title:b.title, author:b.author, description:b.description, genre_id:b.genre_id||null };
    const { error } = await supabase.from("books").update(payload).eq("id", b.id);
    if(error) setMsg("❌ "+error.message); else setMsg("✅ Saved");
  }

  async function remove(id){
    if(!confirm("Delete this book?")) return;
    const { error } = await supabase.from("books").delete().eq("id", id);
    if(error) setMsg("❌ "+error.message); else { setMsg("✅ Deleted"); loadBooks(); }
  }

  const filtered = useMemo(()=>{
    const t=search.toLowerCase().trim();
    return (books||[]).filter(b => !t || (`${b.title} ${b.author} ${b.genre_name||""}`).toLowerCase().includes(t));
  },[books,search]);

  if(!supabase) return <p>Add Supabase keys in .env.local</p>;
  if(!user) return <p><a href="/admin/login">Log in</a> to manage books.</p>;
  if(!isAdmin) return <p>Access denied (admin only).</p>;

  return (
    <div>
      <h1>Admin — Books</h1>
      <div className="card" style={{display:"flex",gap:10,marginBottom:12}}>
        <input className="input" placeholder="Search…" value={search} onChange={e=>setSearch(e.target.value)}/>
        <a className="btn" href="/admin/upload">+ Upload Book</a>
      </div>
      <p style={{minHeight:24}}>{msg}</p>
      <ul className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))'}}>
        {filtered.map(b=>(
          <li key={b.id} className="card">
            {b.cover_url && <img src={b.cover_url} alt={b.title} style={{height:180,objectFit:'cover',borderRadius:8}}/>}
            <input className="input" defaultValue={b.title} onChange={e=>b.title=e.target.value} />
            <input className="input" defaultValue={b.author} onChange={e=>b.author=e.target.value} />
            <select className="input" defaultValue={b.genre_id||""} onChange={e=>b.genre_id=e.target.value||null}>
              <option value="">— genre —</option>
              {genres.map(g=> <option key={g.id} value={g.id}>{g.name}</option>)}
            </select>
            <textarea className="input" rows={3} defaultValue={b.description||""} onChange={e=>b.description=e.target.value}></textarea>
            <div style={{display:"flex",gap:8}}>
              <button className="btn" onClick={()=>save(b)}>Save</button>
              <button className="btn" style={{background:"#c0392b"}} onClick={()=>remove(b.id)}>Delete</button>
              <a className="btn secondary" href={`/books/${b.id}`} target="_blank" rel="noreferrer">View</a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
