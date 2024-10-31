export interface Product {
  id: number;
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