import React, { useEffect, useState, useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import firestoreDB from '../utils/firestore';
import CheckoutSteps from './checkout/CheckoutSteps';
import AddressForm from './checkout/AddressForm';
import PaymentForm from './checkout/PaymentForm';
import OrderSummary from './checkout/OrderSummary';
import OrderSuccess from './OrderSuccess';
import { Address } from '../types/address';
import { Order } from '../types/order';

const Checkout: React.FC = () => {
  const { cartItems, totalAmount, clearCart, updateQuantity } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity < 1) return; // Prevent quantity less than 1
    updateQuantity(id, quantity);
  };

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [address, setAddress] = useState<Address>({
    fullName: '',
    streetAddress: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [loading, setLoading] = useState<boolean>(false);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);

  // Constants for shipping and tax
  const SHIPPING_COST = 9.99;
  const TAX_RATE = 0.10; // 10% tax

  useEffect(() => {
    const fetchShippingAddress = async () => {
      if (user && user.email) {
        try {
          const cart = await firestoreDB.getCartByUserEmail(user.email);
          if (cart && cart.shippingAddress) {
            setAddress(cart.shippingAddress);
          } else if (userProfile && userProfile.address) {
            setAddress({
              fullName: `${userProfile.firstName} ${userProfile.lastName}`,
              streetAddress: userProfile.address.streetAddress || '',
              apartment: userProfile.address.apartment || '',
              city: userProfile.address.city || '',
              state: userProfile.address.state || '',
              zipCode: userProfile.address.zipCode || '',
              phone: userProfile.address.phone || '',
            });
          }
        } catch (error) {
          console.error('Error fetching shipping address:', error);
          showNotification('Failed to load shipping address.', 'error');
        }
      }
    };

    fetchShippingAddress();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, userProfile]);

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const calculateSubtotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  const calculateTax = useMemo(() => {
    return calculateSubtotal * TAX_RATE;
  }, [calculateSubtotal]);

  const calculateTotal = useMemo(() => {
    return calculateSubtotal + SHIPPING_COST + calculateTax;
  }, [calculateSubtotal, calculateTax]);

  const handleCheckout = async () => {
    setLoading(true);

    try {
      if (user && user.email) {
        // Validate all required fields in the address
        if (
          !address.fullName.trim() ||
          !address.streetAddress.trim() ||
          !address.city.trim() ||
          !address.state.trim() ||
          !address.zipCode.trim() ||
          !address.phone.trim()
        ) {
          showNotification('Please complete all required address fields.', 'error');
          setLoading(false);
          return;
        }

        // Calculate pricing fields
        const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const shipping = 9.99; // Fixed shipping cost; adjust as needed
        const tax = parseFloat((subtotal * 0.10).toFixed(2)); // 10% tax
        const total = parseFloat((subtotal + shipping + tax).toFixed(2));

        // Update Cart's shippingAddress and pricing fields
        await firestoreDB.updateCart(user.email, {
          shippingAddress: address,
          subtotal,
          shipping: shipping,
          tax,
          total,
          paymentMethod: paymentMethod,
        });

        // Update User Profile's address
        await firestoreDB.updateUserProfile(user.email, {
          address: address,
        });

        // Create Order in Firestore
        const order: Order = {
          userEmail: user.email,
          items: cartItems,
          shippingAddress: address,
          paymentMethod,
          subtotal,
          shippingCost: shipping,
          tax,
          totalAmount: total,
          createdAt: new Date(),
        };

        await firestoreDB.createOrder(order);

        showNotification('Checkout successful!', 'success');
        clearCart();
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification('Failed to complete checkout.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Processing your order...</div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-green-600 text-2xl">Your order has been placed successfully!</div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <CheckoutSteps currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="space-y-6">
            <AddressForm address={address} errors={errors} onChange={handleAddressChange} />
            <OrderSummary
              items={cartItems}
              subtotal={calculateSubtotal}
              shipping={SHIPPING_COST}
              tax={calculateTax}
              total={calculateTotal}
              onUpdateQuantity={handleQuantityChange}
            />
          </div>
        )}

        {currentStep === 2 && (
          <PaymentForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        )}

        {currentStep === 3 && (
          <OrderSummary
            items={cartItems}
            subtotal={calculateSubtotal}
            shipping={SHIPPING_COST}
            tax={calculateTax}
            total={calculateTotal}
            onUpdateQuantity={handleQuantityChange}
          />
        )}

        <div className="flex justify-between mt-6">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Back
            </button>
          )}
          {currentStep < 3 && (
            <button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Next
            </button>
          )}
          {currentStep === 3 && (
            <button
              onClick={handleCheckout}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Place Order
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout; 