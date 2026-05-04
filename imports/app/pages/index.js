export default function Home(){
  return (<div className="card">
    <h1>Welcome to Chapterhouse</h1>
    <p>This is the Supabase-connected build. Make sure you've set <code>.env.local</code> with your keys and run the SQL.</p>
    <ul>
      <li>Books (live from DB): <strong>/books</strong></li>
      <li>Genres (public list; admin can add/remove): <strong>/genres</strong></li>
      <li>Admin login: <strong>/admin/login</strong></li>
    </ul>
  </div>);
}