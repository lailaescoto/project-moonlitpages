'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../auth-context';
import Link from 'next/link';

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user, signIn, signOut } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signIn(email, password);
      router.push("/profile");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // If user is already signed in, show different UI
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm text-center space-y-6">
          <h2 className="text-3xl font-semibold">Welcome Back!</h2>
          <p className="text-gray-300">You're already signed in as {user.email}</p>
          
          <div className="space-y-4">
            <Link href="/library" className="block w-full py-3 rounded-lg font-semibold bg-yellow-400 hover:bg-yellow-300 text-black transition-colors">
              Go to Library
            </Link>
            
            <Link href="/profile" className="block w-full py-3 rounded-lg font-semibold border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors">
              View Profile
            </Link>

            <p className="text-gray-400 text-sm mt-4">
              Not {user.email}?{' '}
              <button onClick={() => signOut()} className="text-yellow-400 hover:underline">
                Sign out
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <h2 className="text-3xl font-semibold text-center">Sign In</h2>
          
          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded-lg text-center">
              Invalid email or password. Please try again.
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none" placeholder="your@email.com"/>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:border-yellow-400 focus:outline-none" placeholder="••••••••" minLength={6}/>
          </div>

          <button type="submit" disabled={loading} className={`w-full py-2 rounded-lg font-semibold transition-colors ${ loading ? "bg-gray-600 cursor-not-allowed" : "bg-yellow-400 hover:bg-yellow-300 text-black"}`}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 mb-3">Don't have an account?</p>
          <Link href="/sign-up" className="inline-block w-full py-2 rounded-lg font-semibold border border-yellow-400 text-yellow-400 hover:bg-yellow-400/10 transition-colors">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}