import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, ShoppingBag, ChevronLeft, Leaf } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);

  // In a real app, fetch product data from an API
  const product = {
    id: 1,
    name: 'Ionized Alkaline Water',
    description: 'Pure, ionized water with balanced pH levels for optimal hydration',
    category: 'water',
    images: [
      'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1559839914-17aae19cec71?ixlib=rb-4.0.3&auto=format&fit=crop&q=80',
    ],
    benefits: ['Enhanced hydration', 'Balanced pH levels', 'Detoxifying properties'],
    price: 2.99,
    status: 'available',
    rating: 4.5,
    reviews: 128,
    tags: ['hydration', 'alkaline', 'minerals'],
    nutritionalInfo: {
      pH: '8.5-9.5',
      minerals: ['Calcium', 'Magnesium', 'Potassium'],
      tds: '50-100 ppm',
    },
  };

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  });

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="min-h-screen bg-white py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-green-600 transition-colors mb-8"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Back to Products
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg"
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </motion.div>
            <div className="flex gap-4">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${
                    selectedImage === index ? 'border-green-600' : 'border-transparent'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="ml-1 text-lg font-medium">{product.rating}</span>
              </div>
              <span className="mx-2 text-gray-400">•</span>
              <span className="text-gray-600">{product.reviews} reviews</span>
            </div>

            <p className="mt-6 text-lg text-gray-600">{product.description}</p>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Benefits</h3>
              <ul className="mt-4 space-y-3">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center text-gray-600">
                    <Leaf className="h-5 w-5 text-green-500 mr-3" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-medium text-gray-900">Nutritional Information</h3>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">pH Level</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">{product.nutritionalInfo.pH}</dd>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-gray-500">TDS</dt>
                  <dd className="mt-1 text-lg font-medium text-gray-900">{product.nutritionalInfo.tds}</dd>
                </div>
              </dl>
            </div>

            <div className="mt-8 flex items-center justify-between">
              <p className="text-3xl font-bold text-gray-900">{formatter.format(product.price)}</p>
              <div className="flex space-x-4">
                <button
                  onClick={() => addToCart(product)}
                  className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}