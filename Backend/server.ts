// =========================================================================
// KhabarKoi Campus Canteen System - Backend Express API Server
// =========================================================================

import express, { Request, Response } from 'express';
import path from 'path';
import { db } from '../database/connection';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// Enable CORS for localhost frontend development
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// -------------------------------------------------------------------------
// HEALTH & DATABASE STATUS
// -------------------------------------------------------------------------
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: db.getConnectionInfo(),
  });
});

// -------------------------------------------------------------------------
// 1. FOOD ITEMS API (With Live Quantity / Stock Management)
// -------------------------------------------------------------------------
app.get('/api/food-items', (req: Request, res: Response) => {
  const items = db.getFoodItems();
  res.json({ success: true, data: items, count: items.length });
});

app.get('/api/food-items/:id', (req: Request, res: Response) => {
  const item = db.getFoodItemById(req.params.id);
  if (!item) {
    res.status(404).json({ success: false, error: 'Food item not found' });
    return;
  }
  res.json({ success: true, data: item });
});

app.post('/api/food-items', (req: Request, res: Response) => {
  const { name, description, price, category, supplierId, supplierName, imageUrl, prepTimeMinutes, quantity } = req.body;
  if (!name || !price || !supplierId) {
    res.status(400).json({ success: false, error: 'Name, price, and supplier are required.' });
    return;
  }

  const newItem = db.addFoodItem({
    name,
    description: description || '',
    price: Number(price),
    category: category || 'Fast Food',
    supplierId,
    supplierName: supplierName || 'Canteen Vendor',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    prepTimeMinutes: Number(prepTimeMinutes) || 10,
    quantity: Number(quantity) || 50,
    isAvailable: true,
  });

  res.status(201).json({ success: true, data: newItem });
});

app.patch('/api/food-items/:id/quantity', (req: Request, res: Response) => {
  const { quantity, delta } = req.body;
  const updated = db.updateFoodItemQuantity(req.params.id, {
    exact: quantity !== undefined ? Number(quantity) : undefined,
    incrementBy: delta !== undefined && delta > 0 ? delta : undefined,
    decrementBy: delta !== undefined && delta < 0 ? Math.abs(delta) : undefined,
  });

  if (!updated) {
    res.status(404).json({ success: false, error: 'Food item not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

app.delete('/api/food-items/:id', (req: Request, res: Response) => {
  const success = db.deleteFoodItem(req.params.id);
  res.json({ success });
});

// -------------------------------------------------------------------------
// 2. SUPPLIERS API
// -------------------------------------------------------------------------
app.get('/api/suppliers', (req: Request, res: Response) => {
  const suppliers = db.getSuppliers();
  res.json({ success: true, data: suppliers });
});

app.get('/api/suppliers/:id', (req: Request, res: Response) => {
  const supplier = db.getSupplierById(req.params.id);
  if (!supplier) {
    res.status(404).json({ success: false, error: 'Supplier not found' });
    return;
  }
  res.json({ success: true, data: supplier });
});

// -------------------------------------------------------------------------
// 3. ORDERS API (Decrements Food Item Quantities Automatically)
// -------------------------------------------------------------------------
app.get('/api/orders', (req: Request, res: Response) => {
  const orders = db.getOrders();
  res.json({ success: true, data: orders });
});

app.post('/api/orders', (req: Request, res: Response) => {
  const { studentId, studentName, studentEmail, studentBatch, items, paymentMethod, pickupCounter } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400).json({ success: false, error: 'Cart items cannot be empty.' });
    return;
  }

  // Stock check
  for (const item of items) {
    const liveItem = db.getFoodItemById(item.foodItemId);
    if (!liveItem || liveItem.quantity < item.quantity) {
      res.status(400).json({
        success: false,
        error: `Insufficient stock for ${item.name || 'item'}. Only ${liveItem ? liveItem.quantity : 0} portions left.`,
      });
      return;
    }
  }

  const totalAmount = items.reduce((sum: number, it: any) => sum + (it.price * it.quantity), 0);

  const newOrder = db.createOrder({
    studentId: studentId || 'std-guest',
    studentName: studentName || 'Campus Student',
    studentEmail: studentEmail || 'student@campus.ac.bd',
    studentBatch: studentBatch || 'Campus Student',
    items,
    totalAmount,
    paymentMethod: paymentMethod || 'online',
    paymentStatus: paymentMethod === 'online' ? 'paid' : 'pay_on_hub_pending',
    pickupCounter: pickupCounter || 'Main Canteen Counter',
    batchTime: 'Standard Order',
  });

  res.status(201).json({ success: true, data: newOrder });
});

app.patch('/api/orders/:id/status', (req: Request, res: Response) => {
  const { status, employeeHandlerName } = req.body;
  const updated = db.updateOrderStatus(req.params.id, status, employeeHandlerName);
  if (!updated) {
    res.status(404).json({ success: false, error: 'Order not found' });
    return;
  }
  res.json({ success: true, data: updated });
});

app.patch('/api/orders/:id/collect', (req: Request, res: Response) => {
  const updated = db.updateOrderStatus(req.params.id, 'collected');
  res.json({ success: !!updated, data: updated });
});

// -------------------------------------------------------------------------
// 4. RESTOCK REQUESTS API (Staff -> Supplier Workflow)
// -------------------------------------------------------------------------
app.get('/api/restock-requests', (req: Request, res: Response) => {
  const requests = db.getRestockRequests();
  res.json({ success: true, data: requests });
});

app.post('/api/restock-requests', (req: Request, res: Response) => {
  const { foodItemId, requestedQuantity, requestedBy, notes } = req.body;

  const foodItem = db.getFoodItemById(foodItemId);
  if (!foodItem) {
    res.status(404).json({ success: false, error: 'Food item not found' });
    return;
  }

  const newReq = db.createRestockRequest({
    foodItemId: foodItem.id,
    foodItemName: foodItem.name,
    supplierId: foodItem.supplierId,
    supplierName: foodItem.supplierName,
    requestedQuantity: Number(requestedQuantity) || 50,
    currentStock: foodItem.quantity,
    requestedBy: requestedBy || 'Canteen Staff',
    notes: notes || 'Stock running low in canteen hub.',
  });

  res.status(201).json({ success: true, data: newReq });
});

app.post('/api/restock-requests/:id/fulfill', (req: Request, res: Response) => {
  const { batchNo } = req.body;
  const result = db.fulfillRestockRequest(req.params.id, batchNo);

  if (!result) {
    res.status(404).json({ success: false, error: 'Restock request not found' });
    return;
  }

  res.json({
    success: true,
    message: 'Supply fulfilled and canteen food item quantity incremented successfully.',
    data: result,
  });
});

// -------------------------------------------------------------------------
// 5. SUPPLY BATCHES API (Supplier Deliveries)
// -------------------------------------------------------------------------
app.get('/api/supplies', (req: Request, res: Response) => {
  const supplies = db.getSupplyBatches();
  res.json({ success: true, data: supplies });
});

app.post('/api/supplies', (req: Request, res: Response) => {
  const { supplierId, supplierName, foodItemId, itemName, category, quantity, unit, batchNo } = req.body;

  const newBatch = db.createSupplyBatch({
    supplierId,
    supplierName,
    foodItemId,
    itemName,
    category,
    quantity: Number(quantity) || 50,
    unit: unit || 'Portions',
    batchNo: batchNo || `BATCH-${Date.now()}`,
    supplyDate: new Date().toISOString().slice(0, 10),
  });

  res.status(201).json({ success: true, data: newBatch });
});

// -------------------------------------------------------------------------
// 6. USERS, REVIEWS & PENALTIES
// -------------------------------------------------------------------------
app.get('/api/users', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getUsers() });
});

app.get('/api/reviews', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getReviews() });
});

app.get('/api/penalties', (req: Request, res: Response) => {
  res.json({ success: true, data: db.getPenalties() });
});

// Start standalone server when run directly
if (require.main === module || process.env.RUN_STANDALONE === 'true') {
  app.listen(PORT, () => {
    console.log(`[Backend] KhabarKoi Express API running on http://localhost:${PORT}`);
    console.log(`[Backend] Connected to: ${db.getConnectionInfo().type}`);
  });
}

export { app };
export default app;
