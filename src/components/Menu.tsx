import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplet, Leaf, Sparkles, ShoppingCart, ShoppingBag, Star, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from '../hooks/useDebounce';

const categories = [
  { id: 'all', name: 'All', icon: Sparkles },
  { id: 'water', name: 'Water', icon: Droplet },
  { id: 'juice', name: 'Juices', icon: Leaf },
  { id: 'smoothie', name: 'Smoothies', icon: Sparkles },
];

type Product = {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  benefits: string[];
  price: number;
  status: 'available' | 'coming_soon' | 'sold_out';
  rating: number;
  reviews: number;
  tags: string[];
};

const menuItems: Product[] = [
  {
    id: 1,
    name: 'Ionized Alkaline Water',
    description: 'Pure, ionized water with balanced pH levels for optimal hydration',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Enhanced hydration', 'Balanced pH levels', 'Detoxifying properties'],
    price: 2.99,
    status: 'available',
    rating: 4.5,
    reviews: 128,
    tags: ['hydration', 'alkaline', 'minerals']
  },
  {
    id: 2,
    name: 'Natural Flavored Water',
    description: 'Pure water infused with natural fruit essences',
    category: 'water',
    image: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Zero calories', 'Natural flavors', 'Refreshing taste'],
    price: 3.49,
    status: 'coming_soon',
    rating: 4.2,
    reviews: 89,
    tags: ['flavored', 'natural', 'zero-calorie']
  },
  {
    id: 3,
    name: 'Natural Green Juice',
    description: 'Blend of fresh leafy greens and natural ingredients',
    category: 'juice',
    image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Rich in nutrients', 'Immune boosting', 'Natural energy'],
    price: 49,
    status: 'sold_out',
    rating: 4.8,
    reviews: 256,
    tags: ['green', 'healthy', 'organic']
  },
  {
    id: 4,
    name: 'Natural Fruit Juice',
    description: 'Freshly pressed seasonal fruits',
    category: 'juice',
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Vitamin rich', 'No added sugar', 'Fresh taste'],
    price: 39,
    status: 'available',
    rating: 4.6,
    reviews: 167,
    tags: ['fruit', 'fresh', 'seasonal']
  },
  {
    id: 5,
    name: 'Super Foods Dry Fruits Smoothie',
    description: 'Nutrient-dense blend with organic dry fruits',
    category: 'smoothie',
    image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    benefits: ['Protein rich', 'Natural sweetness', 'Sustained energy'],
    price: 59,
    status: 'available',
    rating: 4.9,
    reviews: 342,
    tags: ['superfood', 'protein', 'energy']
  }
];

const sortOptions = [
  { id: 'popular', name: 'Most Popular' },
  { id: 'rating', name: 'Highest Rated' },
  { id: 'price-low', name: 'Price: Low to High' },
  { id: 'price-high', name: 'Price: High to Low' }
];

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const debouncedSearch = useDebounce(searchQuery, 300);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    menuItems.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, []);

  const filteredAndSortedItems = useMemo(() => {
    let items = menuItems;

    // Category filter
    if (selectedCategory !== 'all') {
      items = items.filter(item => item.category === selectedCategory);
    }

    // Search filter
    if (debouncedSearch) {
      const search = debouncedSearch.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.tags.some(tag => tag.toLowerCase().includes(search))
      );
    }

    // Tags filter
    if (selectedTags.length > 0) {
      items = items.filter(item =>
        selectedTags.every(tag => item.tags.includes(tag))
      );
    }

    // Price range filter
    items = items.filter(item =>
      item.price >= priceRange.min && item.price <= priceRange.max
    );

    // Sorting
    return items.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return b.reviews - a.reviews;
      }
    });
  }, [selectedCategory, debouncedSearch, sortBy, priceRange, selectedTags]);

  const handleBuyNow = (item: Product) => {
    addToCart(item);
    navigate('/checkout');
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  return (
    <div
      id="menu"
      className="bg-white py-24 sm:py-32"
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Our 100% Organic Menu
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover our selection of natural and organic beverages
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-green-600 transition-colors"
          >
            <SlidersHorizontal className="h-5 w-5" />
            Filters
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            {sortOptions.map(option => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filters Panel */}
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
                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                      className="w-full"
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

        {/* Category Filter */}
        <div className="mt-8 flex justify-center gap-4 flex-wrap">
          {categories.map((category) => (
            <motion.button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.name}
            </motion.button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          <AnimatePresence>
            {filteredAndSortedItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                <div className="aspect-h-9 aspect-w-16 overflow-hidden rounded-t-2xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
                  />
                  {item.status !== 'available' && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-medium text-lg uppercase">
                        {item.status === 'coming_soon' ? 'Coming Soon' : 'Sold Out'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="ml-1 text-sm text-gray-600">
                        {item.rating} ({item.reviews})
                      </span>
                    </div>
                  </div>

                  <p className="mt-2 text-sm text-gray-600">
                    {item.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-4 space-y-2">
                    {item.benefits.map((benefit, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-600">
                        <Leaf className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-xl font-bold text-gray-900">
                      {formatter.format(item.price)}
                    </p>
                  </div>

                  {item.status === 'available' && (
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addToCart(item)}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </button>
                      <button
                        onClick={() => handleBuyNow(item)}
                        className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Buy Now
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAndSortedItems.length === 0 && (
          <div className="text-center mt-16">
            <p className="text-gray-500">No products found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}