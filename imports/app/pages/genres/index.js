import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function GenresPage(){
  const [genres,setGenres]=useState([]);
  const [name,setName]=useState("");
  const [user,setUser]=useState(null);
  const [isAdmin,setIsAdmin]=useState(false);
  const [msg,setMsg]=useState("");

  async function load(){
    const { data } = await supabase.from("genres").select("*").order("name",{ascending:true});
    setGenres(data||[]);
  }

  useEffect(()=>{ (async()=>{
    if(!supabase) return;
    await load();
    const { data:{ user } } = await supabase.auth.getUser();
    setUser(user||null);
    if(user){
      const { data: recs } = await supabase.from("admins").select("*").eq("email", user.email);
      setIsAdmin((recs||[]).length>0);
    }
  })(); },[]);

  async function add(){
    setMsg("");
    if(!isAdmin) return setMsg("Admins only.");
    const nm = name.trim(); if(!nm) return;
    const { error } = await supabase.from("genres").insert([{ name: nm }]);
    if(error) setMsg("❌ "+error.message);
    else { setName(""); load(); }
  }

  async function remove(id){
    setMsg("");
    if(!isAdmin) return setMsg("Admins only.");
    const { error } = await supabase.from("genres").delete().eq("id",id);
    if(error) setMsg("❌ "+error.message); else load();
  }

  if(!supabase) return <p>Add Supabase keys in .env.local and restart.</p>;

  return (<div>
    <h1>Genres</h1>
    <ul className="grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))'}}>
      {genres.map(g=>(<li key={g.id} className="card" style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <span>{g.name}</span>
        {isAdmin && <button className="btn secondary" onClick={()=>remove(g.id)}>Delete</button>}
      </li>))}
    </ul>

    {isAdmin ? (
      <div className="card" style={{marginTop:12}}>
        <div className="flex">
          <input className="input" placeholder="New genre…" value={name} onChange={e=>setName(e.target.value)} />
          <button className="btn" onClick={add}>Add</button>
        </div>
        <p style={{marginTop:8}}>{msg}</p>
      </div>
    ) : (
      <p style={{marginTop:12,color:'#666'}}>Log in as an admin to add or delete genres.</p>
    )}
  </div>);
}