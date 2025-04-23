'use client';

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState, use } from "react";
import { useAuth } from "../../auth-context";
import { db } from "../../_utils/firebase";
import { collection, doc, addDoc, deleteDoc, onSnapshot, setDoc } from "firebase/firestore";
import Image from 'next/image';

export default function BookPage({ params }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [book, setBook] = useState(null);
  const [authorNames, setAuthorNames] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [coverUrl, setCoverUrl] = useState(null);
  const [genres, setGenres] = useState([]);
  const [publishDate, setPublishDate] = useState("");
  const router = useRouter();

  const ArrowLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  );

  const getCoverUrl = (covers) => {
    return covers?.[0] ? `https://covers.openlibrary.org/b/id/${covers[0]}-L.jpg` : null;
  };

  const fetchBookData = async () => {
    try {
      const res = await fetch(`https://openlibrary.org/works/${id}.json`);
      if (!res.ok) throw new Error('Failed to fetch book');
      const data = await res.json();
      
      const bookGenres = data.subjects?.slice(0, 5) || [];
      setGenres(bookGenres);
      
      if (data.first_publish_date) {
        setPublishDate(data.first_publish_date);
      } else if (data.publish_date) {
        setPublishDate(Array.isArray(data.publish_date) 
          ? data.publish_date[0] 
          : data.publish_date);
      }
      
      return data;
    } catch (error) {
      console.error("Book fetch error:", error);
      throw error;
    }
  };

  const fetchAuthorNames = async (authors) => {
    try {
      return await Promise.all(
        authors.map(async (a) => {
          const res = await fetch(`https://openlibrary.org${a.author.key}.json`);
          if (!res.ok) return "Unknown Author";
          const data = await res.json();
          return data.name || "Unknown Author";
        })
      );
    } catch (error) {
      console.error("Author fetch error:", error);
      return ["Unknown Author"];
    }
  };

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bookData = await fetchBookData();
      setBook(bookData);
      setCoverUrl(getCoverUrl(bookData.covers));

      if (bookData.authors) {
        const names = await fetchAuthorNames(bookData.authors);
        setAuthorNames(names);
      }
    } catch (error) {
      setError(error.message);
      if (error.message.includes('404')) {
        notFound();
      }
    } finally {
      setLoading(false);
    }
  };


  const setupFavoriteListener = () => {
    if (!user) return () => {};
    
    const favoriteRef = doc(db, "users", user.uid, "favorites", id);
    return onSnapshot(favoriteRef, (doc) => {
      setIsFavorite(doc.exists());
    }, (error) => {
      console.error("Favorite listener error:", error);
    });
  };


  const setupCommentsListener = () => {
    const commentsRef = collection(db, "books", id, "comments");
    return onSnapshot(commentsRef, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()?.toISOString()
      }));
      setComments(commentsData);
    }, (error) => {
      console.error("Comments listener error:", error);
      setError("Failed to load comments");
    });
  };

  useEffect(() => {
    const cleanupPromise = loadData().then(() => {
      const unsubscribeFavorite = setupFavoriteListener();
      const unsubscribeComments = setupCommentsListener();
      return () => {
        unsubscribeFavorite();
        unsubscribeComments();
      };
    });

    return () => {
      cleanupPromise.then(cleanup => cleanup && cleanup());
    };
  }, [id, user]);

 
  const handleAddComment = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }

    if (!newComment.trim()) return;

    try {
      const commentsRef = collection(db, "books", id, "comments");
      await addDoc(commentsRef, {
        userId: user.uid,
        userName: user.displayName || user.email.split('@')[0],
        text: newComment,
        createdAt: new Date(),
        userPhoto: user.photoURL || null
      });
      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      setError("Failed to add comment");
    }
  };


  const handleDeleteComment = async (commentId, commentUserId) => {
    if (!user || user.uid !== commentUserId) return;
    
    try {
      const commentRef = doc(db, "books", id, "comments", commentId);
      await deleteDoc(commentRef);
    } catch (error) {
      console.error("Error deleting comment:", error);
      setError("Failed to delete comment");
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      router.push("/sign-in");
      return;
    }
  
    try {
      const favoriteRef = doc(db, "favorites", id);
      const userFavoriteRef = doc(db, "users", user.uid, "favorites", id);
      
      if (isFavorite) {
        await deleteDoc(userFavoriteRef);
 
        await updateDoc(favoriteRef, {
          users: arrayRemove(user.uid)
        });
      } else {
        await setDoc(userFavoriteRef, {
          title: book.title,
          addedAt: new Date(),
          coverId: book.covers?.[0] || null
        });

        await setDoc(favoriteRef, {
          bookId: id,
          title: book.title,
          coverId: book.covers?.[0] || null,
          users: arrayUnion(user.uid)
        }, { merge: true });
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      setError("Failed to update favorite status");
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400 mx-auto"></div>
          <p>Loading book details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <h2 className="text-2xl text-red-400">Error Loading Book</h2>
          <p className="text-gray-300">{error}</p>
          <button
            onClick={loadData}
            className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!book) return notFound();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors mb-4"
        >
          <ArrowLeftIcon />
          Back
        </button>

        {/* Book Header Section */}
        <div className="flex flex-col md:flex-row gap-6">
          {coverUrl ? (
            <Image 
            src={coverUrl} 
            alt={book.title} 
            width={192} 
            height={288}
            className="object-cover rounded-lg shadow"
            priority
          />
          ) : (
            <div className="w-48 h-72 bg-gray-800 rounded-lg shadow flex items-center justify-center">
              <span className="text-gray-500">No cover available</span>
            </div>
          )}
          
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>
            
            {authorNames.length > 0 && (
              <p className="text-lg text-gray-300">
                by {authorNames.join(", ")}
              </p>
            )}

            {/* Publication Date */}
            {publishDate && (
              <p className="text-gray-400 text-sm">
                First published: {publishDate}
              </p>
            )}

            <div className="flex items-center gap-4">
              <button 
                onClick={toggleFavorite}
                className={`flex items-center gap-2 px-4 py-2 rounded font-semibold transition ${
                  isFavorite 
                    ? "bg-yellow-400 text-black hover:bg-yellow-300" 
                    : "bg-white/10 text-white hover:bg-white/20"
                }`}
              >
                {isFavorite ? "★ Favorited" : "☆ Favorite"}
              </button>
            </div>

            {/* Description */}
            {book.description && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2">Description</h3>
                <p className="text-gray-300">
                  {typeof book.description === 'string' 
                    ? book.description 
                    : book.description.value || "No description available"}
                </p>
              </div>
            )}
          </div>
        </div>

         {/* Genres */}
         {genres.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {genres.map((genre, index) => (
                  <span 
                    key={index} 
                    className="bg-yellow-400/20 text-yellow-400 px-3 py-1 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

        {/* Comments Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Reviews ({comments.length})</h2>
          
          {user ? (
            <div className="space-y-3">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write your review here..." 
                className="w-full bg-white/10 border border-white/20 rounded p-3 text-white placeholder-gray-400" 
                rows={4}
              />
              <button 
                onClick={handleAddComment}
                className="bg-yellow-400 hover:bg-yellow-300 text-black px-4 py-2 rounded font-semibold transition"
              >
                Submit Review
              </button>
            </div>
          ) : (
            <div className="bg-white/10 p-4 rounded text-center">
              <p className="text-gray-300">Please <button onClick={() => router.push("/sign-in")} className="text-yellow-400 hover:underline">sign in</button> to see reviews and leave one yourself!</p>
            </div>
          )}

          <div className="space-y-4">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="bg-white/5 p-4 rounded-lg relative">
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
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-300 ml-11">{comment.text}</p>
                  {user?.uid === comment.userId && (
                    <button
                      onClick={() => handleDeleteComment(comment.id, comment.userId)}
                      className="absolute top-2 right-2 text-red-400 hover:text-red-300 text-sm"
                      title="Delete comment"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-4">No reviews yet. Be the first to review!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}