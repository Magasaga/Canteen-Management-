import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  FoodItem,
  FoodReview,
  Order,
  OrderStatus,
  PaymentMethod,
  PenaltyStrikeRecord,
  Supplier,
  SupplierCategory,
  SupplyBatch,
  User,
  UserRole,
} from '../types';
import {
  INITIAL_FOOD_ITEMS,
  INITIAL_ORDERS,
  INITIAL_PENALTIES,
  INITIAL_REVIEWS,
  INITIAL_SUPPLIERS,
  INITIAL_SUPPLIES,
  INITIAL_USERS,
} from '../data/mockData';
import { playOrderReadyChime } from '../utils/audio';

export interface CartItem {
  foodItem: FoodItem;
  quantity: number;
  notes?: string;
}

interface NotificationAlert {
  id: string;
  title: string;
  message: string;
  tokenNumber?: string;
  type: 'ready' | 'strike' | 'info' | 'success';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  suppliers: Supplier[];
  foodItems: FoodItem[];
  orders: Order[];
  reviews: FoodReview[];
  supplies: SupplyBatch[];
  penalties: PenaltyStrikeRecord[];
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  activeNotification: NotificationAlert | null;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  dismissNotification: () => void;
  // Auth
  loginAs: (role: UserRole, specificId?: string) => void;
  registerStudent: (data: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    batch: string;
    phone?: string;
  }) => { success: boolean; user?: User; error?: string };
  logout: () => void;
  // Cart
  addToCart: (foodItem: FoodItem, quantity?: number, notes?: string) => { success: boolean; error?: string };
  removeFromCart: (foodItemId: string) => void;
  updateCartQuantity: (foodItemId: string, quantity: number) => void;
  clearCart: () => void;
  // Ordering
  placeOrder: (params: {
    paymentMethod: PaymentMethod;
    batchTime: string;
    pickupCounter: string;
  }) => { success: boolean; order?: Order; error?: string };
  updateOrderStatus: (orderId: string, status: OrderStatus, employeeName?: string) => void;
  markOrderCollected: (orderId: string) => void;
  markOrderUnclaimed: (orderId: string, employeeName: string, reasonNote: string) => { strikes: number; suspended: boolean };
  // Food management
  addFoodItem: (newItem: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>) => { success: boolean; error?: string };
  toggleFoodAvailability: (foodItemId: string) => void;
  updateFoodPrice: (foodItemId: string, price: number) => void;
  updateFoodImage: (foodItemId: string, imageUrl: string) => void;
  updateFoodBatchNo: (foodItemId: string, batchNo: string, supplyDate?: string) => void;
  // Reviews
  addReview: (params: {
    foodItemId: string;
    rating: number;
    comment: string;
    batchTime: string;
    batchNo?: string;
  }) => { success: boolean; error?: string };
  // Supply batches
  createSupplyBatch: (params: {
    supplierId: string;
    itemName: string;
    quantity: number;
    unit: string;
    category: SupplierCategory;
    batchNo?: string;
    supplyDate?: string;
    foodItemId?: string;
  }) => { success: boolean; error?: string };
  updateSupplyBatchNo: (supplyId: string, batchNo: string, supplyDate?: string) => void;
  verifySupplyBatch: (supplyId: string, hubNotes: string) => void;
  // Penalty management
  pardonStudent: (studentId: string) => void;
  // Database management (Removal / Partial Deletion)
  removeStudent: (studentId: string) => void;
  removeSupplier: (supplierId: string) => void;
  deleteFoodItem: (foodItemId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'khabarkoi_state_v2_';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or fallback
  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'current_user');
    // Default to the first student
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [foodItems, setFoodItems] = useState<FoodItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'food_items');
    if (!saved) return INITIAL_FOOD_ITEMS;
    try {
      const parsed: FoodItem[] = JSON.parse(saved);
      // Synchronize image URLs, batch numbers, and remove deprecated items
      return INITIAL_FOOD_ITEMS.map((fresh) => {
        const found = parsed.find((p) => p.id === fresh.id);
        const defaultBatchNo =
          fresh.batchNo ||
          `BATCH-20261002-${
            fresh.supplierId === 'khans-kitchen'
              ? 'KK01'
              : fresh.supplierId === 'brew-cafe'
              ? 'BC01'
              : fresh.supplierId === 'cp-five-star'
              ? 'CP01'
              : fresh.supplierId === 'aarong-dairy'
              ? 'AD01'
              : 'HUB01'
          }`;
        return found
          ? {
              ...fresh,
              imageUrl: found.imageUrl || fresh.imageUrl,
              price: found.price ?? fresh.price,
              isAvailable: found.isAvailable ?? fresh.isAvailable,
              rating: found.rating ?? fresh.rating,
              reviewCount: found.reviewCount ?? fresh.reviewCount,
              batchNo: found.batchNo || defaultBatchNo,
              supplyDate: found.supplyDate || fresh.supplyDate || '2026-10-02',
            }
          : {
              ...fresh,
              batchNo: defaultBatchNo,
              supplyDate: fresh.supplyDate || '2026-10-02',
            };
      });
    } catch {
      return INITIAL_FOOD_ITEMS;
    }
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [reviews, setReviews] = useState<FoodReview[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [supplies, setSupplies] = useState<SupplyBatch[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'supplies');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIES;
  });

  const [penalties, setPenalties] = useState<PenaltyStrikeRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'penalties');
    return saved ? JSON.parse(saved) : INITIAL_PENALTIES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + 'suppliers');
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeNotification, setActiveNotification] = useState<NotificationAlert | null>(null);

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'suppliers', JSON.stringify(suppliers));
  }, [suppliers]);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'food_items', JSON.stringify(foodItems));
  }, [foodItems]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'supplies', JSON.stringify(supplies));
  }, [supplies]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'penalties', JSON.stringify(penalties));
  }, [penalties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PREFIX + 'cart', JSON.stringify(cart));
  }, [cart]);

  // Keep currentUser state in sync with users array (e.g. if strikes or suspension change)
  useEffect(() => {
    if (currentUser) {
      const updated = users.find((u) => u.id === currentUser.id);
      if (updated && (updated.strikes !== currentUser.strikes || updated.isSuspended !== currentUser.isSuspended)) {
        setCurrentUser(updated);
      }
    }
  }, [users, currentUser]);

  const dismissNotification = () => {
    setActiveNotification(null);
  };

  // Auth
  const loginAs = (role: UserRole, specificId?: string) => {
    let targetUser: User | undefined;
    if (specificId) {
      targetUser = users.find((u) => u.id === specificId);
    } else {
      targetUser = users.find((u) => u.role === role);
    }

    if (targetUser) {
      setCurrentUser(targetUser);
      setActiveNotification({
        id: Date.now().toString(),
        title: `Logged in as ${targetUser.name}`,
        message: `Role: ${role.toUpperCase()} ${targetUser.batch ? `(${targetUser.batch})` : ''}`,
        type: 'info',
      });
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerStudent = (data: {
    name: string;
    email: string;
    studentId: string;
    department: string;
    batch: string;
    phone?: string;
  }): { success: boolean; user?: User; error?: string } => {
    // Check if email or student ID already exists
    const existing = users.find(
      (u) =>
        u.email.toLowerCase() === data.email.trim().toLowerCase() ||
        (data.studentId && u.studentId === data.studentId.trim())
    );

    if (existing) {
      return { success: false, error: 'A student with this campus email or ID already exists.' };
    }

    const newUser: User = {
      id: `std-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      role: 'student',
      studentId: data.studentId.trim(),
      department: data.department.trim(),
      batch: data.batch.trim(),
      strikes: 0,
      isSuspended: false,
      balance: 0,
    };

    setUsers((prev) => [newUser, ...prev]);
    setCurrentUser(newUser);

    setActiveNotification({
      id: Date.now().toString(),
      title: `Welcome, ${newUser.name}!`,
      message: `Account created successfully (${newUser.batch}). You can now place fast-delivery orders!`,
      type: 'success',
    });

    return { success: true, user: newUser };
  };

  // Cart operations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.foodItem.price * item.quantity, 0);

  const addToCart = (foodItem: FoodItem, quantity = 1, notes?: string): { success: boolean; error?: string } => {
    // Check if current user is suspended
    if (currentUser?.isSuspended) {
      return {
        success: false,
        error: `Cannot add items. Your account is suspended until ${new Date(currentUser.suspendedUntil || '').toLocaleDateString()} due to 3 unclaimed orders.`,
      };
    }

    if (!foodItem.isAvailable) {
      return { success: false, error: `${foodItem.name} is currently sold out.` };
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.foodItem.id === foodItem.id);
      if (existing) {
        return prev.map((item) =>
          item.foodItem.id === foodItem.id
            ? { ...item, quantity: item.quantity + quantity, notes: notes || item.notes }
            : item
        );
      }
      return [...prev, { foodItem, quantity, notes }];
    });

    return { success: true };
  };

  const removeFromCart = (foodItemId: string) => {
    setCart((prev) => prev.filter((item) => item.foodItem.id !== foodItemId));
  };

  const updateCartQuantity = (foodItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(foodItemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.foodItem.id === foodItemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Place Order
  const placeOrder = ({
    paymentMethod,
    batchTime,
    pickupCounter,
  }: {
    paymentMethod: PaymentMethod;
    batchTime: string;
    pickupCounter: string;
  }): { success: boolean; order?: Order; error?: string } => {
    if (!currentUser) {
      return { success: false, error: 'Please log in as a student to place orders.' };
    }

    if (currentUser.isSuspended) {
      return {
        success: false,
        error: `Account Suspended! You have 3 unclaimed food strikes. Suspended until ${new Date(currentUser.suspendedUntil || '').toLocaleDateString()}. Please visit the Canteen Authority office.`,
      };
    }

    if (cart.length === 0) {
      return { success: false, error: 'Your cart is empty. Please add delicious meals first!' };
    }

    // Generate unique Token: KK-105, KK-106...
    const nextTokenNum = 100 + orders.length + 1;
    const tokenNumber = `KK-${nextTokenNum}`;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      tokenNumber,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentEmail: currentUser.email,
      studentBatch: currentUser.batch || 'Campus Student',
      studentPhone: currentUser.phone || ('+880 17' + Math.floor(10000000 + Math.random() * 90000000)),
      items: cart.map((ci) => ({
        foodItemId: ci.foodItem.id,
        name: ci.foodItem.name,
        price: ci.foodItem.price,
        quantity: ci.quantity,
        notes: ci.notes,
        batchNo: ci.foodItem.batchNo || 'BATCH-20261002-HUB01',
      })),
      totalAmount: cartTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'online' ? 'paid' : 'pay_on_hub_pending',
      status: 'placed',
      pickupCounter: pickupCounter || 'Main Canteen Counter',
      batchTime: batchTime || 'Fast Delivery (5-10 Mins)',
      createdAt: new Date().toISOString(),
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();

    // Show initial confirmation
    setActiveNotification({
      id: Date.now().toString(),
      title: `Order Placed! Token #${tokenNumber}`,
      message: `Your food is being prepared. It will be delivered in a few minutes!`,
      tokenNumber,
      type: 'success',
    });

    return { success: true, order: newOrder };
  };

  // Status updates
  const updateOrderStatus = (orderId: string, status: OrderStatus, employeeName?: string) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;

        const updated: Order = {
          ...ord,
          status,
          employeeHandlerName: employeeName || ord.employeeHandlerName || 'Canteen Hub Staff',
        };

        if (status === 'ready_for_pickup') {
          updated.readyAt = new Date().toISOString();
          updated.notifiedStudent = true;

          // Play Sound Chime
          if (soundEnabled) {
            playOrderReadyChime();
          }

          // Trigger high-priority fast delivery notification
          setActiveNotification({
            id: Date.now().toString(),
            title: `🚀 Food is Ready! Token #${ord.tokenNumber}`,
            message: `Out for fast delivery to you in a few minutes!`,
            tokenNumber: ord.tokenNumber,
            type: 'ready',
          });
        } else if (status === 'collected') {
          updated.collectedAt = new Date().toISOString();
          if (updated.paymentStatus === 'pay_on_hub_pending') {
            updated.paymentStatus = 'settled_at_hub';
          }
        }

        return updated;
      })
    );
  };

  const markOrderCollected = (orderId: string) => {
    updateOrderStatus(orderId, 'collected');
  };

  // Disciplinary Penalty Strike Logic
  const markOrderUnclaimed = (
    orderId: string,
    employeeName: string,
    reasonNote: string
  ): { strikes: number; suspended: boolean } => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return { strikes: 0, suspended: false };

    const student = users.find((u) => u.id === targetOrder.studentId);
    const currentStrikes = student ? student.strikes : 0;
    const newStrikeCount = currentStrikes + 1;
    const willSuspend = newStrikeCount >= 3;

    // 7 days penalty expiration date
    const oneWeekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // 1. Update Order status
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              status: 'unclaimed',
              unclaimedAt: new Date().toISOString(),
              unclaimedNote: reasonNote,
              employeeHandlerName: employeeName,
            }
          : ord
      )
    );

    // 2. Update Student User Strikes & Suspension
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== targetOrder.studentId) return u;
        return {
          ...u,
          strikes: newStrikeCount,
          isSuspended: willSuspend,
          suspendedUntil: willSuspend ? oneWeekLater : u.suspendedUntil,
          suspensionReason: willSuspend
            ? `3 uncollected food orders logged by Canteen Management. Penalized for 1 week.`
            : u.suspensionReason,
        };
      })
    );

    // 3. Record Penalty Log
    const newPenalty: PenaltyStrikeRecord = {
      id: `pen-${Date.now()}`,
      studentId: targetOrder.studentId,
      studentName: targetOrder.studentName,
      studentBatch: targetOrder.studentBatch,
      orderId: targetOrder.id,
      tokenNumber: targetOrder.tokenNumber,
      reportedByEmployee: employeeName,
      note: reasonNote,
      strikeNumber: newStrikeCount,
      resultedInSuspension: willSuspend,
      suspensionEndDate: willSuspend ? oneWeekLater : undefined,
      createdAt: new Date().toISOString(),
    };

    setPenalties((prev) => [newPenalty, ...prev]);

    // Push notification alert
    setActiveNotification({
      id: Date.now().toString(),
      title: willSuspend ? `⚠️ 1-WEEK PENALTY ENFORCED: ${targetOrder.studentName}` : `⚠️ Strike ${newStrikeCount}/3 Logged`,
      message: willSuspend
        ? `Student received 3rd strike for unclaimed food #${targetOrder.tokenNumber}. Account suspended for 7 days!`
        : `Unclaimed order #${targetOrder.tokenNumber} recorded. Total strikes: ${newStrikeCount}/3.`,
      type: 'strike',
    });

    return { strikes: newStrikeCount, suspended: willSuspend };
  };

  // Pardon student
  const pardonStudent = (studentId: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== studentId) return u;
        return {
          ...u,
          strikes: 0,
          isSuspended: false,
          suspendedUntil: undefined,
          suspensionReason: undefined,
        };
      })
    );

    setActiveNotification({
      id: Date.now().toString(),
      title: 'Strikes Cleared',
      message: 'Student strikes reset to 0 and suspension lifted by Authority.',
      type: 'info',
    });
  };

  // Food Management (Admin)
  const addFoodItem = (newItem: Omit<FoodItem, 'id' | 'rating' | 'reviewCount'>): { success: boolean; error?: string } => {
    const item: FoodItem = {
      ...newItem,
      id: `food-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };
    setFoodItems((prev) => [item, ...prev]);
    return { success: true };
  };

  const toggleFoodAvailability = (foodItemId: string) => {
    setFoodItems((prev) =>
      prev.map((item) => (item.id === foodItemId ? { ...item, isAvailable: !item.isAvailable } : item))
    );
  };

  const updateFoodPrice = (foodItemId: string, price: number) => {
    setFoodItems((prev) =>
      prev.map((item) => (item.id === foodItemId ? { ...item, price } : item))
    );
  };

  const updateFoodImage = (foodItemId: string, imageUrl: string) => {
    setFoodItems((prev) =>
      prev.map((item) => (item.id === foodItemId ? { ...item, imageUrl } : item))
    );
  };

  const updateFoodBatchNo = (foodItemId: string, batchNo: string, supplyDate?: string) => {
    const today = supplyDate || new Date().toISOString().slice(0, 10);
    let updatedItemName = '';
    setFoodItems((prev) =>
      prev.map((item) => {
        if (item.id === foodItemId) {
          updatedItemName = item.name;
          return { ...item, batchNo, supplyDate: today };
        }
        return item;
      })
    );

    // Also sync the most recent supply batch for this food item
    setSupplies((prev) =>
      prev.map((sb) => {
        if (
          sb.foodItemId === foodItemId ||
          (updatedItemName && sb.itemName.toLowerCase() === updatedItemName.toLowerCase())
        ) {
          return { ...sb, batchNo, supplyDate: today };
        }
        return sb;
      })
    );

    setActiveNotification({
      id: Date.now().toString(),
      title: 'Food Batch Number Saved',
      message: `Batch [${batchNo}] assigned to ${updatedItemName || 'item'}. Only canteen staff/hub can see this.`,
      type: 'success',
    });
  };

  // Reviews
  const addReview = ({
    foodItemId,
    rating,
    comment,
    batchTime,
    batchNo,
  }: {
    foodItemId: string;
    rating: number;
    comment: string;
    batchTime: string;
    batchNo?: string;
  }): { success: boolean; error?: string } => {
    if (!currentUser) return { success: false, error: 'Must be logged in to leave a review.' };

    const foodItem = foodItems.find((f) => f.id === foodItemId);
    if (!foodItem) return { success: false, error: 'Food item not found.' };

    const resolvedBatchNo = batchNo || foodItem.batchNo || 'BATCH-20261002-HUB01';

    const newReview: FoodReview = {
      id: `rev-${Date.now()}`,
      foodItemId,
      foodItemName: foodItem.name,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentBatch: currentUser.batch || 'Student',
      batchTime: batchTime || 'Lunch Slot',
      batchNo: resolvedBatchNo,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    setReviews((prev) => [newReview, ...prev]);

    // Recalculate food item rating
    setFoodItems((prev) =>
      prev.map((item) => {
        if (item.id !== foodItemId) return item;
        const totalRatings = item.rating * item.reviewCount + rating;
        const newCount = item.reviewCount + 1;
        return {
          ...item,
          rating: Number((totalRatings / newCount).toFixed(1)),
          reviewCount: newCount,
        };
      })
    );

    setActiveNotification({
      id: Date.now().toString(),
      title: 'Review Published',
      message: `Thank you for reviewing ${foodItem.name}! Your batch feedback for [${resolvedBatchNo}] was recorded.`,
      type: 'success',
    });

    return { success: true };
  };

  // Supply batches (Supplier specific)
  const createSupplyBatch = ({
    supplierId,
    itemName,
    quantity,
    unit,
    category,
    batchNo,
    supplyDate,
    foodItemId,
  }: {
    supplierId: string;
    itemName: string;
    quantity: number;
    unit: string;
    category: SupplierCategory;
    batchNo?: string;
    supplyDate?: string;
    foodItemId?: string;
  }): { success: boolean; error?: string } => {
    const supplier = suppliers.find((s) => s.id === supplierId);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    // Strict category validation!
    if (supplier.category !== category) {
      return {
        success: false,
        error: `Category mismatch! ${supplier.name} is only authorized to supply ${supplier.categoryTitle}.`,
      };
    }

    const todayDate = supplyDate || new Date().toISOString().slice(0, 10);
    const dateFormatted = todayDate.replace(/-/g, '');
    const finalBatchNo =
      batchNo?.trim() ||
      `BATCH-${dateFormatted}-${supplier.code || 'SUP'}-${Math.floor(10 + Math.random() * 90)}`;

    const newBatch: SupplyBatch = {
      id: `sb-${Date.now()}`,
      batchNo: finalBatchNo,
      supplyDate: todayDate,
      supplierId,
      supplierName: supplier.name,
      foodItemId,
      itemName,
      category,
      quantity,
      unit,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setSupplies((prev) => [newBatch, ...prev]);

    // "that batch no will be at the food also only stuff can see this"
    setFoodItems((prev) =>
      prev.map((item) => {
        const isMatch =
          (foodItemId && item.id === foodItemId) ||
          item.name.toLowerCase() === itemName.toLowerCase() ||
          (item.supplierId === supplierId && itemName.toLowerCase().includes(item.name.toLowerCase()));
        if (isMatch) {
          return {
            ...item,
            batchNo: finalBatchNo,
            supplyDate: todayDate,
            isAvailable: true,
          };
        }
        return item;
      })
    );

    setActiveNotification({
      id: Date.now().toString(),
      title: 'Supply Batch Dispatched',
      message: `Batch ${finalBatchNo} for ${itemName} has been logged and assigned to campus food item.`,
      type: 'success',
    });

    return { success: true };
  };

  const updateSupplyBatchNo = (supplyId: string, newBatchNo: string, newSupplyDate?: string) => {
    let affectedItemName = '';
    let affectedFoodItemId: string | undefined;
    const today = newSupplyDate || new Date().toISOString().slice(0, 10);
    setSupplies((prev) =>
      prev.map((s) => {
        if (s.id === supplyId) {
          affectedItemName = s.itemName;
          affectedFoodItemId = s.foodItemId;
          return { ...s, batchNo: newBatchNo, supplyDate: today };
        }
        return s;
      })
    );

    setFoodItems((prev) =>
      prev.map((item) => {
        const matches =
          (affectedFoodItemId && item.id === affectedFoodItemId) ||
          (affectedItemName && (
            item.name.toLowerCase() === affectedItemName.toLowerCase() ||
            affectedItemName.toLowerCase().includes(item.name.toLowerCase()) ||
            item.name.toLowerCase().includes(affectedItemName.toLowerCase())
          ));
        if (matches) {
          return { ...item, batchNo: newBatchNo, supplyDate: today };
        }
        return item;
      })
    );

    setActiveNotification({
      id: Date.now().toString(),
      title: 'Batch Number Saved',
      message: `Batch [${newBatchNo}] logged for ${affectedItemName || 'supply'}. Only staff and canteen officers can view this internal batch code.`,
      type: 'success',
    });
  };

  const verifySupplyBatch = (supplyId: string, hubNotes: string) => {
    setSupplies((prev) =>
      prev.map((s) =>
        s.id === supplyId
          ? {
              ...s,
              status: 'verified_at_hub',
              hubNotes,
              deliveredAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const deleteFoodItem = (foodItemId: string) => {
    setFoodItems((prev) => prev.filter((item) => item.id !== foodItemId));
    setActiveNotification({
      id: Date.now().toString(),
      title: 'Item Deleted',
      message: 'Food item removed from campus menu.',
      type: 'info',
    });
  };

  const removeStudent = (studentId: string) => {
    const studentUser = users.find((u) => u.id === studentId || u.studentId === studentId);
    setUsers((prev) => prev.filter((u) => u.id !== studentId && u.studentId !== studentId));
    if (currentUser && (currentUser.id === studentId || currentUser.studentId === studentId)) {
      setCurrentUser(null);
    }
    setActiveNotification({
      id: Date.now().toString(),
      title: 'Student Removed',
      message: `Account for ${studentUser?.name || studentId} removed from campus database.`,
      type: 'info',
    });
  };

  const removeSupplier = (supplierId: string) => {
    const sup = suppliers.find((s) => s.id === supplierId);
    setSuppliers((prev) => prev.filter((s) => s.id !== supplierId));
    // Also remove their associated items from the food items catalog
    setFoodItems((prev) => prev.filter((item) => item.supplierId !== supplierId));
    setActiveNotification({
      id: Date.now().toString(),
      title: 'Supplier Removed',
      message: `Supplier ${sup?.name || supplierId} and their items removed from database.`,
      type: 'info',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        suppliers,
        foodItems,
        orders,
        reviews,
        supplies,
        penalties,
        cart,
        cartCount,
        cartTotal,
        activeNotification,
        soundEnabled,
        setSoundEnabled,
        dismissNotification,
        loginAs,
        registerStudent,
        logout,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        placeOrder,
        updateOrderStatus,
        markOrderCollected,
        markOrderUnclaimed,
        addFoodItem,
        toggleFoodAvailability,
        updateFoodPrice,
        updateFoodImage,
        updateFoodBatchNo,
        deleteFoodItem,
        removeStudent,
        removeSupplier,
        addReview,
        createSupplyBatch,
        updateSupplyBatchNo,
        verifySupplyBatch,
        pardonStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
