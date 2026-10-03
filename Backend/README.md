# ⚙️ KhabarKoi Backend API Server

High-performance Express.js REST API providing canteen inventory, food order management, supplier restock workflow, token announcements, and multi-role RBAC.

---

## 🚀 Running on Localhost

```bash
# 1. Enter the backend directory
cd Backend

# 2. Start the development server (default port 5000)
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## 📡 Key REST API Endpoints

### 1. Health & Database Status
- `GET /api/health`: Verify API connectivity and active database type.

### 2. Food Items & Quantity Management
- `GET /api/food-items`: List all catalog food items with live portions left (`quantity`).
- `GET /api/food-items/:id`: Get a specific food item.
- `POST /api/food-items`: Create new catalog food item (with default quantity).
- `PATCH /api/food-items/:id/quantity`: Increment, decrement, or set exact remaining stock portions.
- `DELETE /api/food-items/:id`: Remove item from catalog.

### 3. Orders & Automated Stock Decrement
- `GET /api/orders`: List all active and historical student orders.
- `POST /api/orders`: Place student order with token assignment (automatically decrements stock).
- `PATCH /api/orders/:id/status`: Update order status (`placed` -> `preparing` -> `ready_for_pickup`).
- `PATCH /api/orders/:id/collect`: Mark order collected by student at the counter.

### 4. Staff Restock Requests & Supplier Fulfillment
- `GET /api/restock-requests`: View all restock requests.
- `POST /api/restock-requests`: Staff hits a supply request for a low-stock food item.
- `POST /api/restock-requests/:id/fulfill`: Supplier fulfills request (increments food item portions in canteen stock, generates batch code, marks request as supplied).

### 5. Suppliers & Deliveries
- `GET /api/suppliers`: List authorized suppliers and allowed food categories.
- `GET /api/supplies`: View hub supply deliveries and batch codes.
- `POST /api/supplies`: Supplier records new batch delivery to canteen hub.
