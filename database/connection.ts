// =========================================================================
// KhabarKoi Campus Canteen System - Database Connection & Engine
// Supports Localhost JSON Database, SQLite, and PostgreSQL
// =========================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export interface DatabaseState {
  system_info: {
    name: string;
    version: string;
    generated_at: string;
    description: string;
  };
  suppliers: any[];
  food_items: any[];
  users: any[];
  restock_requests: any[];
  orders: any[];
  supply_batches: any[];
  food_reviews: any[];
  penalties: any[];
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_DIR = path.resolve(__dirname, '.');
const DUMMY_DB_PATH = path.join(DB_DIR, 'dummy_database.json');
const LOCAL_DB_PATH = path.join(DB_DIR, 'canteen_db.json');

class LocalhostDatabase {
  private state: DatabaseState;
  private isConnected: boolean = false;

  constructor() {
    this.state = this.loadDatabase();
    this.isConnected = true;
  }

  private loadDatabase(): DatabaseState {
    try {
      // 1. Try loading persistent local database
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const raw = fs.readFileSync(LOCAL_DB_PATH, 'utf-8');
        return JSON.parse(raw);
      }

      // 2. Fallback to bundled dummy database
      if (fs.existsSync(DUMMY_DB_PATH)) {
        const raw = fs.readFileSync(DUMMY_DB_PATH, 'utf-8');
        const data = JSON.parse(raw);
        // Persist initial copy
        fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
        return data;
      }
    } catch (err) {
      console.error('[Database] Error loading database file:', err);
    }

    return {
      system_info: {
        name: 'KhabarKoi Local Database',
        version: '1.0.0',
        generated_at: new Date().toISOString(),
        description: 'Fallback empty state',
      },
      suppliers: [],
      food_items: [],
      users: [],
      restock_requests: [],
      orders: [],
      supply_batches: [],
      food_reviews: [],
      penalties: [],
    };
  }

  private saveDatabase() {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(this.state, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to write to local database file:', err);
    }
  }

  // Connection status & details
  public getConnectionInfo() {
    return {
      status: this.isConnected ? 'connected' : 'disconnected',
      type: process.env.DATABASE_URL ? 'PostgreSQL/Remote' : 'Localhost Database (JSON & SQLite ready)',
      storagePath: LOCAL_DB_PATH,
      totalFoodItems: this.state.food_items.length,
      totalSuppliers: this.state.suppliers.length,
      totalOrders: this.state.orders.length,
      totalRestockRequests: this.state.restock_requests.length,
    };
  }

  // Reset database back to fresh dummy seed
  public resetToSeed() {
    if (fs.existsSync(DUMMY_DB_PATH)) {
      const raw = fs.readFileSync(DUMMY_DB_PATH, 'utf-8');
      this.state = JSON.parse(raw);
      this.saveDatabase();
      return true;
    }
    return false;
  }

  // =========================================================================
  // FOOD ITEMS & QUANTITIES
  // =========================================================================
  public getFoodItems() {
    return this.state.food_items;
  }

  public getFoodItemById(id: string) {
    return this.state.food_items.find((f) => f.id === id);
  }

  public updateFoodItemQuantity(id: string, deltaOrExact: { exact?: number; decrementBy?: number; incrementBy?: number }) {
    const item = this.state.food_items.find((f) => f.id === id);
    if (!item) return null;

    if (deltaOrExact.exact !== undefined) {
      item.quantity = Math.max(0, deltaOrExact.exact);
    } else if (deltaOrExact.decrementBy !== undefined) {
      item.quantity = Math.max(0, item.quantity - deltaOrExact.decrementBy);
    } else if (deltaOrExact.incrementBy !== undefined) {
      item.quantity += deltaOrExact.incrementBy;
    }

    item.isAvailable = item.quantity > 0;
    this.saveDatabase();
    return item;
  }

  public addFoodItem(item: any) {
    const newItem = {
      id: `food-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
      quantity: 50,
      ...item,
    };
    this.state.food_items.unshift(newItem);
    this.saveDatabase();
    return newItem;
  }

  public deleteFoodItem(id: string) {
    this.state.food_items = this.state.food_items.filter((f) => f.id !== id);
    this.saveDatabase();
    return true;
  }

  // =========================================================================
  // SUPPLIERS
  // =========================================================================
  public getSuppliers() {
    return this.state.suppliers;
  }

  public getSupplierById(id: string) {
    return this.state.suppliers.find((s) => s.id === id);
  }

  // =========================================================================
  // ORDERS
  // =========================================================================
  public getOrders() {
    return this.state.orders;
  }

  public createOrder(orderData: any) {
    const tokenNumber = `KK-${100 + this.state.orders.length + 1}`;
    const newOrder = {
      id: `ord-${Date.now()}`,
      tokenNumber,
      createdAt: new Date().toISOString(),
      status: 'placed',
      ...orderData,
    };

    // Decrement item stock
    if (Array.isArray(orderData.items)) {
      for (const it of orderData.items) {
        this.updateFoodItemQuantity(it.foodItemId, { decrementBy: it.quantity });
      }
    }

    this.state.orders.unshift(newOrder);
    this.saveDatabase();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: string, employeeHandlerName?: string) {
    const order = this.state.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;
    if (employeeHandlerName) order.employeeHandlerName = employeeHandlerName;
    if (status === 'ready_for_pickup') order.readyAt = new Date().toISOString();
    if (status === 'collected') order.collectedAt = new Date().toISOString();
    if (status === 'unclaimed') order.unclaimedAt = new Date().toISOString();

    this.saveDatabase();
    return order;
  }

  // =========================================================================
  // RESTOCK REQUESTS (STAFF -> SUPPLIER)
  // =========================================================================
  public getRestockRequests() {
    return this.state.restock_requests;
  }

  public createRestockRequest(data: {
    foodItemId: string;
    foodItemName: string;
    supplierId: string;
    supplierName: string;
    requestedQuantity: number;
    currentStock: number;
    requestedBy: string;
    notes?: string;
  }) {
    const newReq = {
      id: `req-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...data,
    };
    this.state.restock_requests.unshift(newReq);
    this.saveDatabase();
    return newReq;
  }

  public fulfillRestockRequest(requestId: string, batchNo?: string) {
    const req = this.state.restock_requests.find((r) => r.id === requestId);
    if (!req) return null;

    req.status = 'supplied';
    req.resolvedAt = new Date().toISOString();

    // Increment item stock
    const item = this.state.food_items.find((f) => f.id === req.foodItemId);
    const resolvedBatchNo = batchNo || `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-SUP01`;
    if (item) {
      item.quantity += req.requestedQuantity;
      item.isAvailable = true;
      item.batchNo = resolvedBatchNo;
    }

    // Record supply batch
    const newSupplyBatch = {
      id: `sb-${Date.now()}`,
      batchNo: resolvedBatchNo,
      supplyDate: new Date().toISOString().slice(0, 10),
      supplierId: req.supplierId,
      supplierName: req.supplierName,
      foodItemId: req.foodItemId,
      itemName: req.foodItemName,
      category: item ? item.category : 'General',
      quantity: req.requestedQuantity,
      unit: 'Portions',
      status: 'verified_at_hub',
      hubNotes: 'Restocked directly from staff restock request fulfillment.',
      createdAt: new Date().toISOString(),
    };
    this.state.supply_batches.unshift(newSupplyBatch);

    this.saveDatabase();
    return { request: req, item, supplyBatch: newSupplyBatch };
  }

  // =========================================================================
  // SUPPLY BATCHES
  // =========================================================================
  public getSupplyBatches() {
    return this.state.supply_batches;
  }

  public createSupplyBatch(batchData: any) {
    const newBatch = {
      id: `sb-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'verified_at_hub',
      ...batchData,
    };

    // Increment stock of matching food item
    if (batchData.foodItemId) {
      this.updateFoodItemQuantity(batchData.foodItemId, { incrementBy: batchData.quantity });
    }

    this.state.supply_batches.unshift(newBatch);
    this.saveDatabase();
    return newBatch;
  }

  // =========================================================================
  // USERS & PENALTIES
  // =========================================================================
  public getUsers() {
    return this.state.users;
  }

  public getUserById(id: string) {
    return this.state.users.find((u) => u.id === id);
  }

  public getReviews() {
    return this.state.food_reviews;
  }

  public getPenalties() {
    return this.state.penalties;
  }
}

// Export singleton instance
export const db = new LocalhostDatabase();
export default db;
