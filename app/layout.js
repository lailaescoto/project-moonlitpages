import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: 'Moonlit Pages',
  description: 'A cozy space for book lovers.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
    <body className="bg-[#041a3b] text-white font-sans">
      <Navbar />
      <main>{children}</main>
    </body>
  </html>
  );
}
