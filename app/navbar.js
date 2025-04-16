import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-6 sm:px-10 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <Image
          src="/moonlit-icon.png"
          alt="Moonlit Pages Logo"
          width={40}
          height={40}
          className="rounded-full"
        />
        <span className="text-xl font-semibold text-zinc-800 dark:text-white">
          Moonlit Pages
        </span>
      </div>

      <ul className="hidden sm:flex items-center gap-6 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        <li>
          <Link href="/" className="hover:text-zinc-900 font-semibold dark:hover:text-white transition-colors">Home</Link>
        </li>
        <li>
          <Link href="/library" className="hover:text-zinc-900 font-semibold dark:hover:text-white transition-colors">Library</Link>
        </li>
        <li>
          <Link href="/profile" className="hover:text-zinc-900 font-semibold dark:hover:text-white transition-colors">Profile</Link>
        </li>
      </ul>
    </nav>
  );
}
