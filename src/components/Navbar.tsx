import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Leaf, ShoppingCart, Menu, X } from 'lucide-react';
import { HashLink } from 'react-router-hash-link';
import CartDrawer from './cart/CartDrawer';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { user, loading, logout } = useAuth();

  const menuItems = [
    { name: 'Home', href: '/#home' },
    { name: 'Features', href: '/#features' },
    { name: 'Menu', href: '/#menu' },
    { name: 'Contact', href: '/#contact' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      // Optionally, navigate to home or login page
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally, show error notification
    }
  };

  return (
    <>
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Leaf className="h-8 w-8 text-green-600" />
              <span className="ml-2 text-xl font-bold text-green-800">Krishiv</span>
            </div>
            
            {/* Desktop Menu */}
            {!loading && (
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-4">
                  {menuItems.map((item) => (
                    <HashLink 
                      smooth 
                      to={item.href} 
                      className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors" 
                      key={item.name}
                    >
                      {item.name}
                    </HashLink>
                  ))}
                  {user ? (
                    <>
                      <Link 
                        to="/profile" 
                        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Profile
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/login" 
                        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Login
                      </Link>
                      <Link 
                        to="/signup" 
                        className="text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                  {/* Cart Button */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    aria-label="Open cart"
                  >
                    <ShoppingCart className="h-6 w-6" />
                    {getTotalItems() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                        {getTotalItems()}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative text-gray-700 hover:text-green-600 p-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
                aria-label="Open cart"
              >
                <ShoppingCart className="h-6 w-6" />
                {getTotalItems() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs">
                    {getTotalItems()}
                  </span>
                )}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {menuItems.map((item) => (
                <HashLink 
                  smooth 
                  to={item.href} 
                  className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium transition-colors" 
                  key={item.name}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </HashLink>
              ))}
              {!loading && (
                user ? (
                  <>
                    <Link 
                      to="/profile" 
                      className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={() => { handleLogout(); setIsOpen(false); }}
                      className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/login" 
                      className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      className="block text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Cart Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}