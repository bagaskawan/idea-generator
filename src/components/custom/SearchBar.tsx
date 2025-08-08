// components/SearchBar.tsx
"use client";
import { useState } from "react";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  const [category, setCategory] = useState("Shots");

  return (
    <div className="flex items-center bg-gray-100 rounded-full px-6 py-3 w-full max-w-xl border border-zinc-300">
      {/* Input */}
      <input
        type="text"
        placeholder="What are you looking for?"
        className="w-60 flex-grow bg-transparent text-sm placeholder-zinc-500 text-zinc-800 outline-none"
      />

      {/* Search Button */}
      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-zinc-700 text-white transition duration-200">
        <FaSearch size={12} />
      </button>
    </div>
  );
}
