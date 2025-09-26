"use client";
import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="w-80 flex items-center bg-background rounded-full px-4 py-2 max-w-xl border border-foreground">
      {/* Input */}
      <input
        type="text"
        placeholder="What are you looking for?"
        className=" flex-grow bg-transparent text-sm placeholder-muted-foreground text-foreground outline-none"
      />
      <button className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground transition duration-200">
        <FaSearch size={12} />
      </button>
    </div>
  );
}
