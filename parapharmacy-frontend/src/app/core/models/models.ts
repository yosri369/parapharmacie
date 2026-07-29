export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  stock: number;
  minStockLevel: number;
  imageUrl: string;
  images?: string[];
  categoryId: number;
  categoryName: string;
  brand: string;
  rating: number;
  reviewCount: number;
  tags?: string;
  active: boolean;
  featured: boolean;
  onSale: boolean;
  createdAt?: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string;
  active: boolean;
  parentId?: number;
  parentName?: string;
  productCount: number;
}

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  productPrice: number;
  productSalePrice?: number;
  quantity: number;
  subtotal: number;
  stock: number;
}

export interface Order {
  id: number;
  userId: number;
  userEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  shippingFirstName: string;
  shippingLastName: string;
  shippingAddress: string;
  shippingCity: string;
  shippingCountry: string;
  shippingPhone: string;
  notes?: string;
  createdAt: string;
}

export interface OrderItem {
  productId: number;
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  age?: number;
  gender?: string;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: string;
  age?: number;
  gender?: string;
  createdAt?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  authorName: string;
  authorAvatar?: string;
  published: boolean;
  readTimeMinutes: number;
  createdAt: string;
  publishedAt: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userFirstName: string;
  userLastName: string;
  rating: number;
  title?: string;
  comment?: string;
  verified: boolean;
  createdAt: string;
}

export interface ReviewCreateRequest {
  rating: number;
  title?: string;
  comment?: string;
}

export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  estimatedDeliveryDays: number;
  createdAt?: string;
}

export type PurchaseRequestStatus = 'PENDING' | 'ORDERED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface PurchaseRequestItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface PurchaseRequest {
  id: number;
  supplier: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: PurchaseRequestStatus;
  totalAmount: number;
  items: PurchaseRequestItem[];
}
