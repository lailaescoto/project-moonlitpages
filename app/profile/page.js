'use client';

import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
        <span className="text-lg animate-pulse">Loading your profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f0f0f] text-white px-6 text-center">
        <h1 className="text-2xl sm:text-3xl font-semibold mb-4">You're not signed in</h1>
        <button onClick={() => router.push("/sign-in")} className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-all shadow-md">
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-12">
      <div className="max-w-3xl mx-auto space-y-10">

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-1">
              Welcome back!
            </h1>
            <p className="text-gray-400 text-sm sm:text-base">{user.email}</p>
          </div>
          <button onClick={handleSignOut} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-lg">
            Sign Out
          </button>
        </div>

        {/* Profile Picture */}
        {user.photoURL && (
          <div className="flex justify-center">
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-36 h-36 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
            />
          </div>
        )}

        {/* Account Info Card */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Account Details</h2>
          <div className="space-y-4 text-sm sm:text-base">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Email</span>
              <span>{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Account Created</span>
              <span>{new Date(user.metadata.creationTime).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
