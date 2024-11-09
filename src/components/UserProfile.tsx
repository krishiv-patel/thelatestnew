import React, { useEffect, useState } from 'react';
import { getUserEmail, firestoreDB } from '../utils/firestoreUtils';
import { auth } from '../firebase';
import { CreditCard, MapPin, Package, Settings, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PersonalInfo from './profile/PersonalInfo';
import OrderHistory from './profile/OrderHistory';
import ShippingAddresses from './profile/ShippingAddresses';
import Preferences from './profile/Preferences';
import Security from './profile/Security';

const UserProfile: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [lastLogin, setLastLogin] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('personal');

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user && user.email) {
        const userData = await firestoreDB.getUserByEmail(user.email);
        if (userData) {
          setEmail(userData.email);
          setName(userData.name);
          setLastLogin(userData.lastLogin.toDate());
          // Fetch other advanced parameters as needed
        }
      }
    };

    fetchUserData();
  }, []);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'shipping', label: 'Shipping Addresses', icon: MapPin },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: 'easeOut',
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold text-gray-900 mb-8"
        >
          My Account
        </motion.h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="lg:w-64 flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-lg shadow-lg overflow-hidden backdrop-blur-sm bg-white/80"
            >
              {tabs.map((tab, index) => {
                const Icon = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      transition: { delay: index * 0.1 },
                    }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </motion.button>
                );
              })}
            </motion.div>
          </nav>

          {/* Main Content */}
          <motion.div
            className="flex-1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-white rounded-lg shadow-lg p-6 backdrop-blur-sm bg-white/80">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  {activeTab === 'personal' && (
                    <div>
                      <h2 className="text-2xl font-semibold mb-4">User Profile</h2>
                      <p><strong>Email:</strong> {email}</p>
                      <p><strong>Name:</strong> {name}</p>
                      <p><strong>Last Login:</strong> {lastLogin ? lastLogin.toLocaleString() : 'N/A'}</p>
                      {/* Display other advanced parameters */}
                    </div>
                  )}
                  {activeTab === 'personal' && <PersonalInfo />}
                  {activeTab === 'orders' && <OrderHistory />}
                  {activeTab === 'shipping' && <ShippingAddresses />}
                  {activeTab === 'preferences' && <Preferences />}
                  {activeTab === 'security' && <Security />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default UserProfile;