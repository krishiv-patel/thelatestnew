import React from 'react';
import { Leaf, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
        {/* Social Media Icons */}
        <div className="flex justify-center space-x-6 md:order-2">
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Facebook className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Instagram className="h-6 w-6" />
          </a>
          <a href="#" className="text-gray-400 hover:text-gray-500">
            <Twitter className="h-6 w-6" />
          </a>
        </div>

        {/* Logo and Links */}
        <div className="mt-8 md:order-1 md:mt-0">
          <div className="flex items-center justify-center md:justify-start">
            <Leaf className="h-8 w-8 text-green-600" />
            <span className="ml-2 text-xl font-bold text-green-800">Krishiv</span>
          </div>
          <p className="mt-2 text-center text-xs leading-5 text-gray-500 md:text-left">
            &copy; {new Date().getFullYear()} Krishiv Organic Juices. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center md:justify-start space-x-4 text-xs text-gray-500">
            <Link to="/privacy-policy" className="hover:text-green-600">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms-conditions" className="hover:text-green-600">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}