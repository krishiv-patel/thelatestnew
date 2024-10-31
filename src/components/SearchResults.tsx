import React from 'react';
import { useLocation } from 'react-router-dom';
import Menu from './Menu';
import { FaLeaf, FaShoppingCart, FaShoppingBag } from 'react-icons/fa'; // Corrected the icon name

const useQuery = () => {
  return new URLSearchParams(useLocation().search);
};

// Define the type for menu items
type MenuItem = {
  id: string;
  name: string;
  description: string;
  image: string;
  benefits: string[];
  price: number;
  status: 'available' | 'coming_soon' | 'sold_out';
};

export default function SearchResults() {
  const query = useQuery();
  const searchTerm = query.get('query')?.toLowerCase() || '';

  // Define the addToCart function
  const addToCart = (item: MenuItem) => {
    // Implement the logic to add the item to the cart
    console.log(`Adding ${item.name} to cart`);
  };

  // Define the handleBuyNow function
  const handleBuyNow = (item: MenuItem) => {
    // Implement the logic for buying the item immediately
    console.log(`Buying ${item.name} now`);
  };

  // Assuming you have access to menuItems here or fetch them from context or API
  const allItems: MenuItem[] = [
    // ... your menuItems array
  ];

  const filteredItems = allItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm)
  );

  return (
    <div id="search-results" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Search Results for "{searchTerm}"
        </h2>
        {filteredItems.length === 0 ? (
          <p className="mt-6 text-gray-600">No products found.</p>
        ) : (
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map(item => (
              <div key={item.id} className="group relative bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="overflow-hidden rounded-t-lg">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-800">{item.name}</h3>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                  <ul className="mt-4 space-y-2">
                    {item.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-600">
                        <FaLeaf className="h-4 w-4 text-green-500 mr-2" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  {/* Price */}
                  <div className="mt-4 text-lg font-bold text-gray-900">
                    ${item.price.toFixed(2)}
                  </div>
                  {/* Conditional Buttons */}
                  <div className="mt-4 flex space-x-2">
                    {item.status === 'available' && (
                      <>
                        <button
                          onClick={() => addToCart(item)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        >
                          Add to Cart
                          <FaShoppingCart className="ml-2 h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleBuyNow(item)}
                          className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                        >
                          Buy Now
                          <FaShoppingBag className="ml-2 h-4 w-4" />
                        </button>
                      </>
                    )}
                    {item.status === 'coming_soon' && (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-yellow-100 cursor-not-allowed"
                      >
                        Coming Soon
                      </button>
                    )}
                    {item.status === 'sold_out' && (
                      <button
                        disabled
                        className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-red-100 cursor-not-allowed"
                      >
                        Sold Out
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 