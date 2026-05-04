import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BooksList(){
  const [books,setBooks]=useState([]);
  const [search,setSearch]=useState("");
  const [genre,setGenre]=useState("");
  const [loading,setLoading]=useState(true);

  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("book_catalog_stats")
      .select("*")
      .order("created_at",{ascending:false});
    if(!error) setBooks(data||[]);
    setLoading(false);
  })(); },[]);

  const genres = useMemo(()=>{
    const s = new Set(); (books||[]).forEach(b=> b.genre_name && s.add(b.genre_name));
    return Array.from(s).sort();
  },[books]);

  const filtered = useMemo(()=>{
    const t = search.trim().toLowerCase();
    return (books||[]).filter(b=>{
      const okS = !t || (`${b.title} ${b.author} ${b.description||""} ${b.genre_name||""}`.toLowerCase().includes(t));
      const okG = !genre || b.genre_name===genre;
      return okS && okG;
    });
  },[books,search,genre]);

  if(!supabase) return <p>Add Supabase keys in <code>.env.local</code> then restart.</p>;
  if(loading) return <p>Loading…</p>;

  return (<div>
    <div className="card" style={{marginBottom:12,display:'grid',gap:10,gridTemplateColumns:'1fr 220px'}}>
      <input className="input" placeholder="Search title, author, description…" value={search} onChange={e=>setSearch(e.target.value)} />
      <select className="input" value={genre} onChange={e=>setGenre(e.target.value)}>
        <option value="">All genres</option>
        {genres.map(g=> <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
    <div className="grid">
      {filtered.length? filtered.map(b=> (
        <article key={b.id} className="card">
          {b.cover_url && <img src={b.cover_url} alt={b.title} style={{height:260,objectFit:'cover',borderRadius:10}}/>}
          <h3 style={{margin:'8px 0 2px'}}>{b.title}</h3>
          <div className="badge">{b.genre_name||"—"}</div>
          <p style={{color:'#666',marginTop:6}}>by {b.author}</p>
          <div style={{marginTop:6,fontSize:14}}><strong>{"★".repeat(Math.round(b.avg_rating||0))}{"☆".repeat(5-Math.round(b.avg_rating||0))}</strong> ({b.review_count} reviews)</div>
          <a href={`/books/${b.id}`} className="btn" style={{marginTop:8,display:'inline-block'}}>Details</a>
        </article>
      )) : <p>No books found.</p>}
    </div>
  </div>);
}