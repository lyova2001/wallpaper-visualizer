import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <Link className="block" href={'wallpaper'}>Link to visualizer</Link>
    </div>
  );
}
