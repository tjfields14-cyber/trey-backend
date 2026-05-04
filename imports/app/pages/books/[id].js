import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function BookDetails(){
  const { query } = useRouter();
  const id = query.id;
  const [book,setBook]=useState(null);
  const [reviews,setReviews]=useState([]);
  const [rating,setRating]=useState(5);
  const [comment,setComment]=useState("");
  const [msg,setMsg]=useState("");
  const [user,setUser]=useState(null);

  useEffect(()=>{ (async()=>{
    if(!supabase || !id) return;
    const { data:b } = await supabase.from("book_catalog_stats").select("*").eq("id",id).single();
    setBook(b||null);
    const { data:r } = await supabase.from("reviews_public").select("*").eq("book_id",id).order("created_at",{ascending:false});
    setReviews(r||[]);
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user||null);
  })(); },[id]);

  async function submitReview(e){
    e.preventDefault();
    setMsg("");
    if(!user) return setMsg("Please log in via /admin/login first.");
    const n = Number(rating);
    if(!(n>=1 && n<=5)) return setMsg("Rating must be 1–5.");
    const { error } = await supabase.from("reviews").insert([{ book_id:id, rating:n, comment }]);
    if(error){ setMsg("❌ "+error.message); return; }
    setMsg("✅ Review submitted");
    setComment("");
    const { data:r } = await supabase.from("reviews_public").select("*").eq("book_id",id).order("created_at",{ascending:false});
    setReviews(r||[]);
  }

  if(!supabase) return <p>Add Supabase keys in .env.local and restart.</p>;
  if(!book) return <p>Loading…</p>;

  return (<div className="grid" style={{gridTemplateColumns:'300px 1fr'}}>
    {book.cover_url && <img src={book.cover_url} alt={book.title} style={{height:420,objectFit:'cover',borderRadius:12}}/>}
    <div>
      <h1>{book.title}</h1>
      <div className="badge">{book.genre_name||"—"}</div>
      <p style={{color:'#666',marginTop:6}}>by {book.author}</p>
      <p style={{marginTop:10}}>{book.description}</p>
      {book.file_url && <div style={{marginTop:12}}><a className="btn" href={book.file_url} target="_blank" rel="noreferrer">Read / Download</a></div>}
    </div>

    <div style={{gridColumn:'1 / -1', marginTop:20}}>
      <h2>Reviews</h2>
      {reviews.length===0 && <p>No reviews yet.</p>}
      <ul style={{listStyle:'none',paddingLeft:0,display:'grid',gap:10}}>
        {reviews.map(r=>(<li key={r.id} className="card">
          <strong>{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</strong>
          <div style={{marginTop:6}}>{r.comment||"—"}</div>
          <div style={{color:'#777',fontSize:12,marginTop:4}}>{new Date(r.created_at).toLocaleString()}</div>
        </li>))}
      </ul>

      <h3 style={{marginTop:16}}>Leave a review</h3>
      {!user && <p><a href="/admin/login">Log in</a> to review.</p>}
      {user && (<form onSubmit={submitReview} style={{display:'grid',gap:8,maxWidth:420}}>
        <label>Rating:
          <select value={rating} onChange={e=>setRating(e.target.value)}>
            {[5,4,3,2,1].map(n=><option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <textarea rows={4} placeholder="Your thoughts…" value={comment} onChange={e=>setComment(e.target.value)} />
        <button className="btn" type="submit">Submit</button>
        <p>{msg}</p>
      </form>)}
    </div>
  </div>);
}