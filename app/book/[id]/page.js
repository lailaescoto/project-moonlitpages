'use client';

import { notFound, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { use } from "react";

export default function BookPage(props) {
  const { id } = use(props.params);

  const [book, setBook] = useState(null);
  const [authorNames, setAuthorNames] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const fetchBook = async () => {
      const res = await fetch(`https://openlibrary.org/works/${id}.json`);
      if (!res.ok) return notFound();

      const data = await res.json();
      setBook(data);

      if (data.authors) {
        const names = await Promise.all(
          data.authors.map(async (a) => {
            const authorRes = await fetch(`https://openlibrary.org${a.author.key}.json`);
            const authorData = await authorRes.json();
            return authorData.name;
          })
        );
        setAuthorNames(names);
      }
    };


    fetchBook();
  }, [id]);

  if (!book) return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center p-6">
      Loading...
    </div>
  );

  const coverUrl = book.covers?.[0]
    ? `https://covers.openlibrary.org/b/id/${book.covers[0]}-L.jpg`
    : "/placeholder.jpg";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <button onClick={() => router.back()} className="text-sm text-white hover:underline mb-4">
          ← Back to Library
        </button>

        <div className="flex flex-col md:flex-row gap-6">
          <img src={coverUrl} alt={book.title} className="w-48 h-72 object-cover rounded-lg shadow"/>
          <div className="flex-1 space-y-4">
            <h1 className="text-3xl font-bold">{book.title}</h1>

            {authorNames.length > 0 && (
              <p className="text-lg text-gray-300">
                by {authorNames.map((name, i) => (
                  <span key={i}>
                    {name}
                    {i < authorNames.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            )}

            {book.created && (
              <p className="text-gray-400 text-sm">
                First published: {new Date(book.created.value).toLocaleDateString()}
              </p>
            )}

            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-lg">★ 0.0</span>
              <span className="text-gray-400 text-sm">(0 ratings)</span>
            </div>

            <button className="bg-white text-black font-semibold px-4 py-2 rounded hover:bg-yellow-300 transition">
              ⭐ Favorite
            </button>
          </div>
        </div>

        {book.description && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Description</h2>
            <p className="text-gray-300">
              {typeof book.description === "string"
                ? book.description
                : book.description.value}
            </p>
          </div>
        )}

        {book.subjects && (
          <div>
            <h2 className="text-xl font-semibold mb-2">Genres</h2>
            <div className="flex flex-wrap gap-2">
              {book.subjects.slice(0, 10).map((genre, i) => (
                <span key={i} className="bg-white/10 text-sm px-3 py-1 rounded-full">
                  {genre}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-xl font-semibold mb-2">Reviews</h2>
          <textarea placeholder="Write your review here..." className="w-full bg-white/10 border border-white/20 rounded p-3 text-white placeholder-gray-400" rows={4} ></textarea>
          <button className="mt-2 bg-white text-black px-4 py-2 rounded hover:bg-yellow-300 transition">
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
