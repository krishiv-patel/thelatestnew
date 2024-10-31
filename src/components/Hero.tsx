import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <div id="home" className="relative bg-white pt-16">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="relative z-10 pt-14 lg:w-full lg:max-w-2xl">
          <div className="relative px-6 py-32 sm:py-40 lg:px-8 lg:py-56 lg:pr-0">
            <motion.div
              className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-gray-900">
                Pure Nature in Every Sip
              </h1>
              <p className="mt-6 text-base sm:text-lg md:text-xl leading-7 text-gray-600">
                Experience the refreshing taste of 100% organic, cold-pressed
                juices. Carefully crafted to preserve nutrients and deliver
                maximum health benefits.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <a
                  href="#menu"
                  className="group rounded-full px-6 py-3 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all flex items-center"
                >
                  Explore Our Menu
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Hero Image for Large Screens */}
      <div className="absolute inset-y-0 right-0 w-1/2 hidden lg:block">
        <img
          className="aspect-[3/2] object-cover lg:aspect-auto h-full"
          src="https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-4.0.3&auto=format&fit=crop&q=80"
          alt="Various organic juices"
        />
      </div>

      {/* Hero Image for Mobile and Tablet */}
      <div className="absolute inset-y-0 right-0 w-full lg:w-1/2 md:hidden">
        <img
          className="object-cover w-full h-64 sm:h-80 md:h-96"
          src="https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?ixlib=rb-4.0.3&auto=format&fit=crop&q=80"
          alt="Various organic juices"
        />
      </div>
    </div>
  );
}
