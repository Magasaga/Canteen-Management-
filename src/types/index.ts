export type UserRole = 'student' | 'employee' | 'supplier' | 'admin';

export type SupplierCategory =
  | 'cafe'
  | 'heavy_meals'
  | 'fast_food'
  | 'chicken'
  | 'milk_dairy'
  | 'beverage';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  department?: string;
  batch?: string; // e.g. "CSE 21st Batch"
  phone?: string;
  supplierId?: string; // If role === 'supplier'
  strikes: number; // 0 to 3
  isSuspended: boolean;
  suspendedUntil?: string; // ISO date string
  suspensionReason?: string;
  avatar?: string;
  balance?: number; // Campus wallet balance
}

export interface Supplier {
  id: string;
  name: string;
  code: string;
  category: SupplierCategory;
  categoryTitle: string;
  allowedItemsDescription: string;
  contactPerson: string;
  phone: string;
  supplyHubCounter: string;
  activeItemsCount: number;
  rating: number;
  logoUrl?: string;
}

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'Cafe' | 'Heavy Meals' | 'Fast Food' | 'Chicken' | 'Milk & Dairy' | 'Beverages';
  supplierId: string;
  supplierName: string;
  imageUrl: string;
  prepTimeMinutes: number;
  isAvailable: boolean;
  rating: number;
  reviewCount: number;
  calorieCount?: number;
  isFeatured?: boolean;
  batchNo?: string; // Current batch number (only visible to staff/admin/suppliers)
  supplyDate?: string; // Date food batch was delivered (YYYY-MM-DD)
}

export type OrderStatus =
  | 'placed'
  | 'preparing'
  | 'ready_for_pickup'
  | 'collected'
  | 'unclaimed';

export type PaymentMethod = 'online' | 'hub_cash';
export type PaymentStatus = 'paid' | 'pay_on_hub_pending' | 'settled_at_hub';

export interface OrderItem {
  foodItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
  batchNo?: string;
}

export interface Order {
  id: string;
  tokenNumber: string; // e.g. "KK-104"
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBatch: string;
  studentPhone?: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  pickupCounter: string; // e.g. "Counter A", "Main Canteen Hub"
  batchTime: string; // e.g. "12:30 PM Lunch Batch"
  createdAt: string;
  readyAt?: string;
  collectedAt?: string;
  unclaimedAt?: string;
  unclaimedNote?: string;
  employeeHandlerId?: string;
  employeeHandlerName?: string;
  notifiedStudent?: boolean;
}

export interface FoodReview {
  id: string;
  foodItemId: string;
  foodItemName: string;
  studentId: string;
  studentName: string;
  studentBatch: string; // e.g. "CSE 21st Batch"
  batchTime: string; // e.g. "1:15 PM Lunch Rush"
  batchNo?: string; // Captured serving food batch number
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface SupplyBatch {
  id: string;
  batchNo: string; // Batch number added by supplier (e.g. "BATCH-20261002-KK01")
  supplyDate: string; // Date supplied (e.g. "2026-10-02")
  supplierId: string;
  supplierName: string;
  foodItemId?: string; // Matching food item
  itemName: string;
  category: SupplierCategory;
  quantity: number;
  unit: string; // "Portions", "Liters", "Cups", "Pieces"
  status: 'pending' | 'dispatched' | 'verified_at_hub';
  hubNotes?: string;
  deliveredAt?: string;
  createdAt: string;
}

export interface PenaltyStrikeRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentBatch: string;
  orderId: string;
  tokenNumber: string;
  reportedByEmployee: string;
  note: string;
  strikeNumber: number; // 1, 2, or 3
  resultedInSuspension: boolean;
  suspensionEndDate?: string;
  createdAt: string;
}
