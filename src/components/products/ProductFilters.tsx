import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';

interface ProductFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  priceRange: { min: number; max: number };
  setPriceRange: (range: { min: number; max: number }) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  allTags: string[];
  formatter: Intl.NumberFormat;
}

export default function ProductFilters({
  showFilters,
  setShowFilters,
  priceRange,
  setPriceRange,
  selectedTags,
  toggleTag,
  allTags,
  formatter,
}: ProductFiltersProps) {
  return (
    <>
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
      >
        <SlidersHorizontal className="h-5 w-5" />
        Filters
      </button>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-4 bg-gray-50 rounded-lg p-4 overflow-hidden"
          >
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="flex gap-4 items-center">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    className="w-full accent-green-600"
                  />
                  <span className="text-sm text-gray-600">
                    {formatter.format(priceRange.max)}
                  </span>
                </div>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                <h3 className="font-medium mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedTags.includes(tag)
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      } transition-colors`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}