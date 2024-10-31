import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import Menu from './components/Menu';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Checkout from './components/Checkout';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Signup from './components/Signup';
import AdminDashboard from './components/AdminDashboard';
import Profile from './components/Profile';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsConditions from './components/TermsConditions';
import ProtectedRoute from './components/ProtectedRoute';
// import AdminRoute from './components/AdminRoute'; // Optional: Separate component for admin routes

function App() {
  return (
    <NotificationProvider>
      <CartProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-white">
              <Navbar />
              <main>
                <Routes>
                  <Route
                    path="/"
                    element={
                      <>
                        <section id="home">
                          <Hero />
                        </section>
                        <section id="features">
                          <Features />
                        </section>
                        <section id="menu">
                          <Menu />
                        </section>
                        <section id="contact">
                          <Contact />
                        </section>
                      </>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute adminOnly={true}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-conditions" element={<TermsConditions />} />
                  {/* Add more routes as needed */}
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </CartProvider>
    </NotificationProvider>
  );
}

export default App;

