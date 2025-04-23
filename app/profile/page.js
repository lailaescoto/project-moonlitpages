'use client';

import { useRouter } from "next/navigation";
import { useAuth } from "../auth-context";
import { useEffect, useState } from "react";
import { db } from "../_utils/firebase";
import { 
  collection, 
  query, 
  getDocs, 
  doc, 
  deleteDoc, 
  onSnapshot,
  collectionGroup 
} from "firebase/firestore";
import Link from "next/link";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [favorites, setFavorites] = useState([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);
  const [error, setError] = useState(null);
  const [publicComments, setPublicComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(true);


  useEffect(() => {
    if (!user) return;

    const unsubscribe = onSnapshot(
      collection(db, "users", user.uid, "favorites"),
      async (snapshot) => {
        const favoritesData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || `Book ${doc.id}`,
              addedAt: data.addedAt?.toDate()?.toISOString()
            };
          })
        );
        setFavorites(favoritesData);
        setLoadingFavorites(false);
      },
      (error) => {
        console.error("Error fetching favorites:", error);
        setError("Failed to load favorites");
        setLoadingFavorites(false);
      }
    );

    return () => unsubscribe();
  }, [user]);


  useEffect(() => {
    setLoadingComments(true);
    const commentsQuery = query(
      collectionGroup(db, "comments")
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const commentsData = snapshot.docs.map(doc => ({
          id: doc.id,
          bookId: doc.ref.parent.parent?.id,
          userId: doc.data().userId,
          userName: doc.data().userName,
          text: doc.data().text,
          createdAt: doc.data().createdAt?.toDate()?.toISOString(),
          userPhoto: doc.data().userPhoto
        }));
        setPublicComments(commentsData);
        setLoadingComments(false);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        setError("Failed to load comments");
        setLoadingComments(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const handleRemoveFavorite = async (bookId) => {
    try {
      const favoriteRef = doc(db, "users", user.uid, "favorites", bookId);

      setFavorites(prev => prev.filter(book => book.id !== bookId));
      await deleteDoc(favoriteRef);
    } catch (error) {
      console.error("Error removing favorite:", error);
      setError("Failed to remove favorite");
      setFavorites(favorites); 
    }
  };

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
        <button 
          onClick={() => router.push("/sign-in")} 
          className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-medium hover:bg-yellow-300 transition-all shadow-md"
        >
          Go to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-6 py-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {error && (
          <div className="bg-red-900/50 text-white p-4 rounded-lg">
            {error}
            <button onClick={() => setError(null)} className="float-right font-bold">×</button>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-bold mb-1">Welcome back!</h1>
            <p className="text-gray-400 text-sm sm:text-base">{user.email}</p>
          </div>
          <button 
            onClick={handleSignOut} 
            className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl font-medium transition-all shadow-lg"
          >
            Sign Out
          </button>
        </div>

        {user.photoURL && (
          <div className="flex justify-center">
            <img
              src={user.photoURL}
              alt={user.displayName || "User"}
              className="w-36 h-36 rounded-full border-4 border-yellow-400 shadow-lg object-cover"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Account Details */}
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

          {/* Favorites Section */}
          <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Your Favorite Books ({favorites.length})</h2>
            
            {loadingFavorites ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
              </div>
            ) : favorites.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>You haven&apos;t favorited any books yet</p>
                <Link href="/library" className="text-yellow-400 hover:underline mt-2 inline-block">
                  Browse Library
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {favorites.map((book) => (
                  <div key={book.id} className="flex justify-between items-center border-b border-gray-700 pb-3 last:border-0">
                    <div>
                      <Link 
                        href={`/book/${book.id}`} 
                        className="font-medium text-white hover:underline hover:text-yellow-400 transition-colors"
                      >
                        {book.title}
                      </Link>
                      <p className="text-gray-400 text-sm">
                        Added: {new Date(book.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemoveFavorite(book.id)}
                      className="text-red-400 hover:text-red-300 text-sm"
                      title="Remove from favorites"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Public Comments Section */}
        <div className="bg-[#1a1a1a] p-6 rounded-2xl shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Recent Community Comments</h2>
          
          {loadingComments ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : publicComments.length === 0 ? (
            <p className="text-gray-400">No comments yet. Be the first to comment!</p>
          ) : (
            <div className="space-y-4">
              {publicComments.slice(0, 10).map(comment => (
                <div key={comment.id} className="border-b border-gray-700 pb-4 last:border-0">
                  <div className="flex items-center gap-3 mb-2">
                    {comment.userPhoto ? (
                      <img 
                        src={comment.userPhoto} 
                        alt={comment.userName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center">
                        <span className="text-black font-medium text-sm">
                          {comment.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{comment.userName}</p>
                      <p className="text-gray-400 text-sm">
                        on <Link href={`/book/${comment.bookId}`} className="text-yellow-400 hover:underline">this book</Link>
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 ml-11">{comment.text}</p>
                  <p className="text-gray-400 text-sm ml-11">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}