import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLogin(){
  const [email,setEmail]=useState(process.env.NEXT_PUBLIC_TEST_EMAIL || "");
  const [password,setPassword]=useState("");
  const [msg,setMsg]=useState("");

  async function signIn(e){
    e.preventDefault();
    if(!supabase) return setMsg("Add Supabase keys in .env.local first.");
    const testMode = process.env.NEXT_PUBLIC_TEST_MODE === "true";
    if(testMode){
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setMsg(error ? `❌ ${error.message}` : "✅ Logged in! Go to /admin");
      if(!error) window.location.href="/admin";
    }else{
      const { error } = await supabase.auth.signInWithOtp({ email });
      setMsg(error ? `❌ ${error.message}` : "✅ Check your email for a login link.");
    }
  }

  return (
    <div style={{maxWidth:420,margin:'64px auto',fontFamily:'sans-serif'}}>
      <h1>Admin Login</h1>
      <form onSubmit={signIn} style={{display:'grid',gap:12}}>
        <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="email" required/>
        {process.env.NEXT_PUBLIC_TEST_MODE === "true" && (
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" required/>
        )}
        <button type="submit">Sign In</button>
      </form>
      <p style={{marginTop:8}}>{msg}</p>
    </div>
  );
}
