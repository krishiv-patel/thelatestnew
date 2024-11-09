import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types/product';

const formatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
});

export default function ProductDetails() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addToCart, removeFromCart, decreaseQuantity, cartItems } = useCart();

  const [product, setProduct] = React.useState<Product | undefined>(undefined);

  React.useEffect(() => {
    const fetchProduct = async () => {
      // Implement your product fetching logic here
      // For example:
      // const fetchedProduct = await firestoreDB.getProductById(productId);
      // setProduct(fetchedProduct);
    };
    fetchProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading product details...</p>
      </div>
    );
  }

  const isInCart = cartItems.some(ci => ci.id === product.id);
  const cartItem = cartItems.find(ci => ci.id === product.id);

  const handleBuyNow = () => {
    addToCart(product);
    navigate('/checkout');
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row items-center">
        {/* Product Image */}
        <img
          src={product.image}
          alt={product.name}
          className="w-full md:w-1/2 h-auto object-cover rounded-lg"
        />
        <div className="md:ml-8 mt-6 md:mt-0">
          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <p className="mt-4 text-2xl font-semibold text-gray-900">{formatter.format(product.price)}</p>
          <div className="mt-6 flex items-center space-x-4">
            {/* Add to Cart Button */}
            <button
              onClick={() => addToCart(product)}
              className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Add to Cart
            </button>
            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              className="flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors"
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Buy Now
            </button>
          </div>
          {isInCart && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-700">In Your Cart</h3>
              <div className="flex items-center mt-2 space-x-4">
                {/* Decrease Quantity Button */}
                <button
                  onClick={() => decreaseQuantity(product.id)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  -
                </button>
                <span>{cartItem?.quantity}</span>
                {/* Increase Quantity Button */}
                <button
                  onClick={() => addToCart(product)}
                  className="text-gray-600 hover:text-gray-800 focus:outline-none"
                >
                  +
                </button>
                {/* Remove Item Button */}
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-red-600 hover:text-red-800 focus:outline-none ml-4"
                  aria-label={`Remove ${product.name} from cart`}
                >
                  🗑️
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}