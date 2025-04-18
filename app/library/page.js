"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";


export default function Library() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [booksPerPage, setBooksPerPage] = useState(20); 

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("https://openlibrary.org/search.json?q=book&limit=1000");
        const data = await response.json();
        if (data && data.docs && data.docs.length > 0) {
          setBooks(data.docs);
        } else {
          console.error("No books found in the data:", data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching books:", error);
        setLoading(false);
      }
    };
    fetchBooks();
  }, []);
  
  const filteredAndSortedBooks = useMemo(() => {
    let filteredBooks = [...books];

    if (searchQuery) {
      filteredBooks = filteredBooks.filter((book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (book.author_name &&
          book.author_name.some((author) =>
            author.toLowerCase().includes(searchQuery.toLowerCase())
          ))
      );
    }

    if (sortOption === "title") {
      filteredBooks = filteredBooks.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortOption === "author") {
      filteredBooks = filteredBooks.sort((a, b) => {
        const authorA = a.author_name?.[0]?.toLowerCase() || "";
        const authorB = b.author_name?.[0]?.toLowerCase() || "";
        return authorA.localeCompare(authorB);
      });
    }

    return filteredBooks;
  }, [books, searchQuery, sortOption]);

  useEffect(() => {
    setCurrentPage(1); 
  }, [searchQuery]);

  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = filteredAndSortedBooks.slice(indexOfFirstBook, indexOfLastBook);

  const totalPages = Math.ceil(filteredAndSortedBooks.length / booksPerPage);

  const changePage = (page) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (loading) {
    return <div className="text-white text-lg mt-8">Loading books...</div>;
  }

  return (
    <div className="library-page flex flex-col items-center p-6 bg-gradient-to-b from-gray-900 to-black text-white font-sans min-h-screen">
   
      <div className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <input type="text" placeholder="Search by title or author..." className="w-full sm:w-2/3 px-4 py-2 rounded-md text-black bg-white" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}/>
        <select className="px-4 py-2 rounded-md text-black bg-white" value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
          <option value="">Sort By</option>
          <option value="title">Title (A-Z)</option>
          <option value="author">Author (A-Z)</option>
        </select>
      </div>

    <div className="w-full max-w-4xl grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
    {currentBooks.length > 0 ? (
    currentBooks.map((book) => (
      <Link
        key={book.key}
        href={`/book/${book.key.replace("/works/", "")}`}
        className="bg-gray-800 text-white p-2 rounded-xl shadow-md flex flex-col items-center transform transition duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer no-underline"
      >
        {book.cover_i ? (
          <img
            src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
            alt={`Cover of ${book.title}`}
            className="w-40 h-50 object-cover mb-3 rounded-t-lg transition duration-300"
          />
        ) : (
          <div className="w-24 h-32 bg-gray-400 flex items-center justify-center text-sm text-white mb-3 rounded-t-lg">
            No Cover Available
          </div>
        )}
        <h2 className="text-sm font-semibold text-center mb-1 text-white">{book.title}</h2>
        <p className="text-xs text-white text-center mb-2">
          {book.author_name?.slice(0, 2).join(", ")}
          {book.author_name?.length > 2 ? ", etc." : ""}
        </p>
      </Link>
    ))
    ) : (
    <div className="text-white text-lg">No books found.</div>
    )}
    </div>


      <div className="flex justify-center items-center mt-6 space-x-4">

        <button className={`px-4 py-2 text-lg font-semibold text-white rounded-md bg-blue-800 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => changePage(1)} disabled={currentPage === 1}>
          First
        </button>

        <button className={`px-4 py-2 text-lg font-semibold text-white rounded-md bg-blue-800 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        <span className="text-white text-lg">
          Page {currentPage} of {totalPages}
        </span>

        <button className={`px-4 py-2 text-lg font-semibold text-white rounded-md bg-blue-800 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </button>

        <button className={`px-4 py-2 text-lg font-semibold text-white rounded-md bg-blue-800 hover:bg-blue-600 transition duration-300 ease-in-out transform hover:scale-105 ${currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""}`} onClick={() => changePage(totalPages)} disabled={currentPage === totalPages}>
          Last
        </button>
      </div>
    </div>
  );
}
