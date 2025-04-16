import Image from "next/image";

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-3 bg-gradient-to-b from-[#0a3975] to-[#021c42] text-white font-sans">
      <Image
            src="/moonlit-icon.png"
            alt="Moonlit Pages Logo"
            width={500}
            height={200}
          />
          {/* Logo drawn by me, asked ChatGPT to refine it */}
        <main className="flex flex-col items-center gap-8 text-center">
        <div className="px-6 py-3 rounded-xl border-2 border-white shadow-lg">
       <h1 className="text-4xl sm:text-5xl font-bold text-white" style={{ textShadow: "2px 2px 8px rgba(0, 0, 0, 0.7)" }}>
        Moonlit Pages
        </h1>
        </div>
          <p className="text-lg sm:text-xl max-w-xl text-white text-center drop-shadow-[0_2px_6px_rgba(255,255,255,0.25)]">
          A cozy digital space for book lovers to explore, review, and connect over their favorite reads.
          </p>
          <div className="flex gap-4 mt-4 flex-col sm:flex-row">
            <a
              href="/library"
              className="bg-white text-[#0b0c2a] px-6 py-3 rounded-full font-semibold hover:bg-[#b9b9b9] transition"
            >
              Explore Library
            </a>
            <a
              href="/login"
              className="bg-[#041a3b] border border-white text-white px-6 py-3 rounded-full font-semibold hover:bg-white hover:text-[#0b0c2a] transition"
            >
              Sign In
            </a>
          </div>
        </main>

        <footer className="mt-16 text-sm text-white/60">
          © {new Date().getFullYear()} Moonlit Pages. All rights reserved.
        </footer>
      </div>
  );
}
