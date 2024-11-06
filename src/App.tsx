import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoadingSpinner from './components/LoadingSpinner';
import NetworkStatus from './components/NetworkStatus';
import { CartProvider } from './context/CartContext';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components
const Hero = React.lazy(() => import('./components/Hero'));
const Features = React.lazy(() => import('./components/Features'));
const Menu = React.lazy(() => import('./components/Menu'));
const Contact = React.lazy(() => import('./components/Contact'));
const Checkout = React.lazy(() => import('./components/Checkout'));
const Login = React.lazy(() => import('./components/Login'));
const Signup = React.lazy(() => import('./components/Signup'));
const AdminDashboard = React.lazy(() => import('./components/AdminDashboard'));
const Profile = React.lazy(() => import('./components/Profile'));
const PrivacyPolicy = React.lazy(() => import('./components/PrivacyPolicy'));
const TermsConditions = React.lazy(() => import('./components/TermsConditions'));
const ProtectedRoute = React.lazy(() => import('./components/ProtectedRoute'));

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <CartProvider>
          <GoogleReCaptchaProvider reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}>
            <Router>
              <AuthProvider>
                <div className="min-h-screen bg-white flex flex-col">
                  <Navbar />
                  <main className="flex-grow">
                    <Suspense fallback={
                      <div className="flex justify-center items-center min-h-screen">
                        <LoadingSpinner size="large" />
                      </div>
                    }>
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
                      </Routes>
                    </Suspense>
                  </main>
                  <NetworkStatus />
                  <Footer />
                </div>
              </AuthProvider>
            </Router>
          </GoogleReCaptchaProvider>
        </CartProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;