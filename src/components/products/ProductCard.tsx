import React from 'react';
import { motion } from 'framer-motion';
import { Leaf, ShoppingCart, ShoppingBag, Star } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Link } from 'react-router-dom';
import { Product } from '../../types/product';

interface ProductCardProps {
  product: Product;
  onBuyNow: (product: Product) => void;
  index: number;
}

export default function ProductCard({ product, onBuyNow, index }: ProductCardProps) {
  const { addToCart } = useCart();

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative bg-white rounded-2xl shadow-sm ring-1 ring-gray-200 hover:shadow-lg hover:scale-105 transition-all duration-300"
    >
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-h-9 aspect-w-16 overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-110"
          />
          {product.status !== 'available' && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-medium text-lg uppercase">
                {product.status === 'coming_soon' ? 'Coming Soon' : 'Sold Out'}
              </span>
            </div>
          )}
        </div>
      </Link>

      <div className="p-6">
        <div className="flex justify-between items-start">
          <Link to={`/product/${product.id}`}>
            <h3 className="text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="flex items-center">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="ml-1 text-sm text-gray-600">
              {product.rating} ({product.reviews})
            </span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {product.tags.map(tag => (
            <span
              key={tag}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        <ul className="mt-4 space-y-2">
          {product.benefits.map((benefit, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-600">
              <Leaf className="h-4 w-4 text-green-500 mr-2" />
              {benefit}
            </li>
          ))}
        </ul>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">
            {formatter.format(product.price)}
          </p>
        </div>

        {product.status === 'available' && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Add to Cart
            </button>
            <button
              onClick={() => onBuyNow(product)}
              className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Buy Now
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}