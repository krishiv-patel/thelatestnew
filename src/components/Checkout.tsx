import React, { useEffect, useState } from 'react';
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

type Address = {
  fullName: string;
  streetAddress: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
};

const Checkout: React.FC = () => {
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

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

  // Define constants for shipping and tax
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
              ...address,
              streetAddress: userProfile.address,
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
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (validateAddress()) {
        setCurrentStep(2);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => (prev > 1 ? prev - 1 : prev));
  };

  const validateAddress = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!address.fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    }
    if (!address.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required.';
    }
    if (!address.city.trim()) {
      newErrors.city = 'City is required.';
    }
    if (!address.state.trim()) {
      newErrors.state = 'State is required.';
    }
    if (!address.zipCode.trim()) {
      newErrors.zipCode = 'ZIP Code is required.';
    }
    if (!address.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * TAX_RATE;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + SHIPPING_COST + calculateTax();
  };

  const handleCheckout = async () => {
    setLoading(true);

    try {
      if (user && user.email) {
        // Update Cart's shippingAddress and paymentMethod
        await firestoreDB.updateCart(user.email, {
          shippingAddress: address,
          paymentMethod: paymentMethod,
        });

        // Update User Profile's address
        await firestoreDB.updateUserProfile(user.email, {
          address: address.streetAddress,
        });

        // Create Order in Firestore
        const order = {
          userEmail: user.email,
          items: cartItems,
          shippingAddress: address,
          paymentMethod,
          subtotal: calculateSubtotal(),
          shippingCost: SHIPPING_COST,
          tax: calculateTax(),
          totalAmount: calculateTotal(),
          createdAt: new Date(),
        };

        await firestoreDB.createOrder(user.email, order);

        showNotification('Checkout successful!', 'success');
        clearCart();
        setOrderSuccess(true);
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      showNotification('Checkout failed. Please try again.', 'error');
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
    return <OrderSuccess />;
  }

  return (
    <div className="flex justify-center items-center py-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-4xl">
        <CheckoutSteps currentStep={currentStep} />

        {currentStep === 1 && (
          <div className="space-y-6">
            <AddressForm address={address} errors={errors} onChange={handleAddressChange} />
            <OrderSummary
              cartItems={cartItems}
              subtotal={calculateSubtotal()}
              shippingCost={SHIPPING_COST}
              tax={calculateTax()}
              total={calculateTotal()}
            />
          </div>
        )}

        {currentStep === 2 && (
          <PaymentForm paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod} />
        )}

        {currentStep === 3 && <OrderSummary cartItems={cartItems} totalAmount={calculateTotal()} />}

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
              onClick={() => handleCheckout()}
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