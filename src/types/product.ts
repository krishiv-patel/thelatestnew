export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  image: string;
  benefits: string[];
  price: number;
  status: 'available' | 'coming_soon' | 'sold_out';
  rating: number;
  reviews: number;
  tags: string[];
}

export interface CartItem extends Product {
  quantity: number;
}