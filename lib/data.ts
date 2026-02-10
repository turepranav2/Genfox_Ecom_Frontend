export interface Product {
  id: number
  name: string
  description: string
  price: number
  originalPrice: number
  discount: number
  rating: number
  reviews: number
  image: string
  category: string
  brand: string
  inStock: boolean
  supplierId: number
  specs: Record<string, string>
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  date: string
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled"
  items: { name: string; qty: number; price: number }[]
  total: number
  address: string
  paymentMethod: string
  customer?: string
  supplierId?: number
}

export interface Supplier {
  id: number
  name: string
  email: string
  phone: string
  status: "Active" | "Pending" | "Rejected"
  totalProducts: number
  totalOrders: number
  revenue: number
  commission: number
  joinedDate: string
}

export interface UserProfile {
  name: string
  email: string
  phone: string
  addresses: { id: number; label: string; full: string; isDefault: boolean }[]
}

export const categories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Beauty",
  "Sports",
  "Books",
  "Toys",
  "Grocery",
]

export const products: Product[] = [
  {
    id: 1,
    name: "Samsung Galaxy S24 Ultra",
    description:
      "The Samsung Galaxy S24 Ultra features a stunning 6.8-inch Dynamic AMOLED display, Snapdragon 8 Gen 3 processor, 200MP camera system, and the built-in S Pen for productivity.",
    price: 129999,
    originalPrice: 144999,
    discount: 10,
    rating: 4.5,
    reviews: 2345,
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    category: "Electronics",
    brand: "Samsung",
    inStock: true,
    supplierId: 1,
    specs: { Display: "6.8 inch AMOLED", Processor: "Snapdragon 8 Gen 3", RAM: "12 GB", Storage: "256 GB" },
  },
  {
    id: 2,
    name: "Apple MacBook Air M3",
    description:
      "The MacBook Air M3 delivers exceptional performance with the Apple M3 chip, 15.3-inch Liquid Retina display, 18-hour battery life, and a fanless design.",
    price: 134900,
    originalPrice: 149900,
    discount: 10,
    rating: 4.7,
    reviews: 1890,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=400&fit=crop",
    category: "Electronics",
    brand: "Apple",
    inStock: true,
    supplierId: 1,
    specs: { Display: "15.3 inch Retina", Processor: "Apple M3", RAM: "8 GB", Storage: "256 GB SSD" },
  },
  {
    id: 3,
    name: "Nike Air Max 270 Running Shoes",
    description: "Lightweight and breathable Nike Air Max 270 running shoes with Max Air unit for all-day comfort.",
    price: 8995,
    originalPrice: 12995,
    discount: 31,
    rating: 4.3,
    reviews: 5678,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    category: "Fashion",
    brand: "Nike",
    inStock: true,
    supplierId: 2,
    specs: { Type: "Running", Material: "Mesh", Sole: "Rubber", Weight: "280g" },
  },
  {
    id: 4,
    name: "Sony WH-1000XM5 Headphones",
    description:
      "Industry-leading noise cancellation headphones with exceptional sound quality, 30-hour battery life, and multipoint connection.",
    price: 24990,
    originalPrice: 34990,
    discount: 29,
    rating: 4.6,
    reviews: 3456,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    category: "Electronics",
    brand: "Sony",
    inStock: true,
    supplierId: 1,
    specs: { Type: "Over-ear", "Noise Cancellation": "Yes", Battery: "30 hours", Connectivity: "Bluetooth 5.2" },
  },
  {
    id: 5,
    name: "Levi's 501 Original Jeans",
    description: "The iconic Levi's 501 Original Fit jeans with straight leg, button fly, and classic five-pocket styling.",
    price: 2999,
    originalPrice: 4599,
    discount: 35,
    rating: 4.2,
    reviews: 8901,
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    category: "Fashion",
    brand: "Levi's",
    inStock: true,
    supplierId: 2,
    specs: { Fit: "Original", Material: "100% Cotton", Wash: "Medium Indigo", Closure: "Button Fly" },
  },
  {
    id: 6,
    name: "Instant Pot Duo 7-in-1",
    description:
      "The Instant Pot Duo is a 7-in-1 electric pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer.",
    price: 5999,
    originalPrice: 8999,
    discount: 33,
    rating: 4.4,
    reviews: 12345,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&h=400&fit=crop",
    category: "Home & Kitchen",
    brand: "Instant Pot",
    inStock: true,
    supplierId: 3,
    specs: { Capacity: "6 Quart", Functions: "7-in-1", Material: "Stainless Steel", Wattage: "1000W" },
  },
  {
    id: 7,
    name: "Maybelline Fit Me Foundation",
    description: "Lightweight, natural coverage foundation that blends seamlessly with skin for a smooth finish.",
    price: 499,
    originalPrice: 699,
    discount: 29,
    rating: 4.1,
    reviews: 6789,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&h=400&fit=crop",
    category: "Beauty",
    brand: "Maybelline",
    inStock: true,
    supplierId: 4,
    specs: { Type: "Liquid", Coverage: "Medium", "Skin Type": "All", SPF: "18" },
  },
  {
    id: 8,
    name: "Yonex Nanoray Light Badminton Racket",
    description: "Lightweight badminton racket with Nanomesh + Carbon Nanotube frame for quick racket handling.",
    price: 2490,
    originalPrice: 3490,
    discount: 29,
    rating: 4.3,
    reviews: 456,
    image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop",
    category: "Sports",
    brand: "Yonex",
    inStock: false,
    supplierId: 5,
    specs: { Weight: "77g", Material: "Carbon Nanotube", Balance: "Head Light", "String Tension": "30 lbs" },
  },
  {
    id: 9,
    name: "JBL Charge 5 Bluetooth Speaker",
    description:
      "Portable Bluetooth speaker with powerful JBL Original Pro Sound, IP67 waterproof and dustproof, and 20 hours of playtime.",
    price: 11999,
    originalPrice: 15999,
    discount: 25,
    rating: 4.5,
    reviews: 2345,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    category: "Electronics",
    brand: "JBL",
    inStock: true,
    supplierId: 1,
    specs: { Battery: "20 hours", Waterproof: "IP67", Output: "40W", Connectivity: "Bluetooth 5.1" },
  },
  {
    id: 10,
    name: "Atomic Habits by James Clear",
    description:
      "A revolutionary guide to building good habits and breaking bad ones. One of the best-selling self-help books of all time.",
    price: 399,
    originalPrice: 799,
    discount: 50,
    rating: 4.8,
    reviews: 34567,
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    category: "Books",
    brand: "Penguin",
    inStock: true,
    supplierId: 5,
    specs: { Pages: "320", Language: "English", Format: "Paperback", Publisher: "Penguin Random House" },
  },
  {
    id: 11,
    name: "Philips Trimmer BT3211",
    description: "DuraPower technology for 4x longer-lasting performance. Skin-friendly blades with rounded tips.",
    price: 1349,
    originalPrice: 1795,
    discount: 25,
    rating: 4.2,
    reviews: 9876,
    image: "https://images.unsplash.com/photo-1621607512214-68297480165e?w=400&h=400&fit=crop",
    category: "Electronics",
    brand: "Philips",
    inStock: true,
    supplierId: 1,
    specs: { Runtime: "60 min", "Charging Time": "1 hour", Blades: "Stainless Steel", Waterproof: "Yes" },
  },
  {
    id: 12,
    name: "LEGO Creator 3-in-1 Set",
    description: "Build a cozy house, a canal houseboat, or a modern city house with this 3-in-1 LEGO Creator set.",
    price: 3499,
    originalPrice: 4999,
    discount: 30,
    rating: 4.6,
    reviews: 1234,
    image: "https://images.unsplash.com/photo-1587654780291-39c9404d7dd0?w=400&h=400&fit=crop",
    category: "Toys",
    brand: "LEGO",
    inStock: true,
    supplierId: 5,
    specs: { Pieces: "808", Age: "8+", Dimensions: "26x19x14 cm", Theme: "Creator" },
  },
]

export const orders: Order[] = [
  {
    id: "GF-2026-001",
    date: "2026-01-15",
    status: "Delivered",
    items: [
      { name: "Samsung Galaxy S24 Ultra", qty: 1, price: 129999 },
      { name: "Sony WH-1000XM5", qty: 1, price: 24990 },
    ],
    total: 154989,
    address: "123 MG Road, Bengaluru, Karnataka 560001",
    paymentMethod: "Cash on Delivery",
    customer: "Rahul Sharma",
    supplierId: 1,
  },
  {
    id: "GF-2026-002",
    date: "2026-01-20",
    status: "Shipped",
    items: [{ name: "Nike Air Max 270", qty: 2, price: 17990 }],
    total: 17990,
    address: "456 Park Street, Kolkata, West Bengal 700016",
    paymentMethod: "Cash on Delivery",
    customer: "Priya Patel",
    supplierId: 2,
  },
  {
    id: "GF-2026-003",
    date: "2026-02-01",
    status: "Processing",
    items: [
      { name: "Instant Pot Duo", qty: 1, price: 5999 },
      { name: "Atomic Habits", qty: 1, price: 399 },
    ],
    total: 6398,
    address: "789 Anna Salai, Chennai, Tamil Nadu 600002",
    paymentMethod: "Cash on Delivery",
    customer: "Amit Kumar",
    supplierId: 3,
  },
  {
    id: "GF-2026-004",
    date: "2026-02-05",
    status: "Pending",
    items: [{ name: "Apple MacBook Air M3", qty: 1, price: 134900 }],
    total: 134900,
    address: "321 FC Road, Pune, Maharashtra 411004",
    paymentMethod: "Cash on Delivery",
    customer: "Sneha Reddy",
    supplierId: 1,
  },
  {
    id: "GF-2026-005",
    date: "2026-02-08",
    status: "Cancelled",
    items: [{ name: "Levi's 501 Jeans", qty: 3, price: 8997 }],
    total: 8997,
    address: "654 Civil Lines, Jaipur, Rajasthan 302006",
    paymentMethod: "Cash on Delivery",
    customer: "Vikram Singh",
    supplierId: 2,
  },
]

export const suppliers: Supplier[] = [
  {
    id: 1,
    name: "TechWorld Electronics",
    email: "tech@genfox.com",
    phone: "+91 98765 43210",
    status: "Active",
    totalProducts: 156,
    totalOrders: 1234,
    revenue: 4567890,
    commission: 456789,
    joinedDate: "2024-03-15",
  },
  {
    id: 2,
    name: "FashionHub India",
    email: "fashion@genfox.com",
    phone: "+91 98765 43211",
    status: "Active",
    totalProducts: 89,
    totalOrders: 890,
    revenue: 1234567,
    commission: 123457,
    joinedDate: "2024-05-20",
  },
  {
    id: 3,
    name: "HomeEssentials",
    email: "home@genfox.com",
    phone: "+91 98765 43212",
    status: "Active",
    totalProducts: 234,
    totalOrders: 567,
    revenue: 890123,
    commission: 89012,
    joinedDate: "2024-07-10",
  },
  {
    id: 4,
    name: "GlamBeauty Co",
    email: "beauty@genfox.com",
    phone: "+91 98765 43213",
    status: "Pending",
    totalProducts: 45,
    totalOrders: 0,
    revenue: 0,
    commission: 0,
    joinedDate: "2026-01-25",
  },
  {
    id: 5,
    name: "SportsMart",
    email: "sports@genfox.com",
    phone: "+91 98765 43214",
    status: "Rejected",
    totalProducts: 12,
    totalOrders: 0,
    revenue: 0,
    commission: 0,
    joinedDate: "2026-02-01",
  },
]

export const userProfile: UserProfile = {
  name: "Rahul Sharma",
  email: "rahul.sharma@email.com",
  phone: "+91 98765 43210",
  addresses: [
    {
      id: 1,
      label: "Home",
      full: "123 MG Road, Bengaluru, Karnataka 560001",
      isDefault: true,
    },
    {
      id: 2,
      label: "Office",
      full: "456 Whitefield Main Road, Bengaluru, Karnataka 560066",
      isDefault: false,
    },
  ],
}

export const adminUsers = [
  { id: 1, name: "Rahul Sharma", email: "rahul@email.com", orders: 12, spent: 245890, joined: "2024-03-15", status: "Active" as const },
  { id: 2, name: "Priya Patel", email: "priya@email.com", orders: 8, spent: 67890, joined: "2024-05-20", status: "Active" as const },
  { id: 3, name: "Amit Kumar", email: "amit@email.com", orders: 5, spent: 34567, joined: "2024-07-10", status: "Active" as const },
  { id: 4, name: "Sneha Reddy", email: "sneha@email.com", orders: 15, spent: 456789, joined: "2024-01-05", status: "Active" as const },
  { id: 5, name: "Vikram Singh", email: "vikram@email.com", orders: 3, spent: 12345, joined: "2025-11-20", status: "Blocked" as const },
]

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price)
}
