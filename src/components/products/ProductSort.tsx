import React from 'react';

interface SortOption {
  id: string;
  name: string;
}

interface ProductSortProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
  options: SortOption[];
}

export default function ProductSort({ sortBy, setSortBy, options }: ProductSortProps) {
  return (
    <select
      value={sortBy}
      onChange={(e) => setSortBy(e.target.value)}
      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
      aria-label="Sort products"
    >
      {options.map(option => (
        <option key={option.id} value={option.id}>
          {option.name}
        </option>
      ))}
    </select>
  );
}