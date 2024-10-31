import React from 'react';
import { Search } from 'lucide-react';

interface ProductSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function ProductSearch({ searchQuery, setSearchQuery }: ProductSearchProps) {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
      <input
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
        aria-label="Search products"
      />
    </div>
  );
}