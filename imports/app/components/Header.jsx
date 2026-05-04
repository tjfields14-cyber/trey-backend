import Link from "next/link";
export default function Header(){
  return (<header className="header">
    <div className="container flex" style={{justifyContent:'space-between'}}>
      <div className="flex">
        <Link href="/"><strong>Chapterhouse</strong></Link>
        <Link href="/books">Books</Link>
        <Link href="/genres">Genres</Link>
      </div>
      <div className="flex">
        <Link href="/admin">Admin</Link>
      </div>
    </div>
  </header>);
}