-- =========================================================================
-- KhabarKoi Campus Canteen System - Database Schema (DDL)
-- Compatible with PostgreSQL, SQLite, and MySQL
-- =========================================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL DEFAULT 'pbkdf2_campus_demo_hash',
  role VARCHAR(32) NOT NULL CHECK (role IN ('student', 'employee', 'supplier', 'admin')),
  student_id VARCHAR(64),
  department VARCHAR(128),
  batch VARCHAR(64),
  phone VARCHAR(32),
  supplier_id VARCHAR(64),
  strikes INTEGER NOT NULL DEFAULT 0,
  is_suspended BOOLEAN NOT NULL DEFAULT FALSE,
  suspended_until TIMESTAMP,
  suspension_reason TEXT,
  avatar VARCHAR(255),
  balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. SUPPLIERS TABLE
CREATE TABLE IF NOT EXISTS suppliers (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  code VARCHAR(32) UNIQUE NOT NULL,
  category VARCHAR(64) NOT NULL CHECK (category IN ('cafe', 'heavy_meals', 'fast_food', 'chicken', 'milk_dairy', 'beverage')),
  category_title VARCHAR(128) NOT NULL,
  allowed_items_description TEXT NOT NULL,
  contact_person VARCHAR(128) NOT NULL,
  phone VARCHAR(32) NOT NULL,
  supply_hub_counter VARCHAR(128) NOT NULL DEFAULT 'Main Canteen Counter',
  active_items_count INTEGER NOT NULL DEFAULT 0,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  logo_url VARCHAR(255),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. FOOD ITEMS TABLE
CREATE TABLE IF NOT EXISTS food_items (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  category VARCHAR(64) NOT NULL CHECK (category IN ('Cafe', 'Heavy Meals', 'Fast Food', 'Chicken', 'Milk & Dairy', 'Beverages')),
  supplier_id VARCHAR(64) NOT NULL,
  supplier_name VARCHAR(128) NOT NULL,
  image_url TEXT NOT NULL,
  prep_time_minutes INTEGER NOT NULL DEFAULT 10,
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  quantity INTEGER NOT NULL DEFAULT 50, -- Portions left in canteen stock
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
  review_count INTEGER NOT NULL DEFAULT 0,
  calorie_count INTEGER,
  is_featured BOOLEAN DEFAULT FALSE,
  batch_no VARCHAR(64) DEFAULT 'BATCH-20261002-HUB01',
  supply_date VARCHAR(32) DEFAULT '2026-10-02',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- 4. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
  id VARCHAR(64) PRIMARY KEY,
  token_number VARCHAR(32) NOT NULL UNIQUE,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  student_email VARCHAR(128) NOT NULL,
  student_batch VARCHAR(64) NOT NULL,
  student_phone VARCHAR(32),
  total_amount NUMERIC(10, 2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL CHECK (payment_method IN ('online', 'hub_cash')),
  payment_status VARCHAR(32) NOT NULL CHECK (payment_status IN ('paid', 'pay_on_hub_pending', 'settled_at_hub')),
  status VARCHAR(32) NOT NULL CHECK (status IN ('placed', 'preparing', 'ready_for_pickup', 'collected', 'unclaimed')),
  pickup_counter VARCHAR(128) NOT NULL DEFAULT 'Main Canteen Counter',
  batch_time VARCHAR(64) NOT NULL DEFAULT 'Standard Order',
  employee_handler_name VARCHAR(128),
  notified_student BOOLEAN DEFAULT FALSE,
  unclaimed_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ready_at TIMESTAMP,
  collected_at TIMESTAMP,
  unclaimed_at TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. ORDER ITEMS (LINE ITEMS)
CREATE TABLE IF NOT EXISTS order_items (
  id VARCHAR(64) PRIMARY KEY,
  order_id VARCHAR(64) NOT NULL,
  food_item_id VARCHAR(64) NOT NULL,
  name VARCHAR(128) NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  batch_no VARCHAR(64),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE RESTRICT
);

-- 6. RESTOCK REQUESTS (STAFF -> SUPPLIER)
CREATE TABLE IF NOT EXISTS restock_requests (
  id VARCHAR(64) PRIMARY KEY,
  food_item_id VARCHAR(64) NOT NULL,
  food_item_name VARCHAR(128) NOT NULL,
  supplier_id VARCHAR(64) NOT NULL,
  supplier_name VARCHAR(128) NOT NULL,
  requested_quantity INTEGER NOT NULL,
  current_stock INTEGER NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'supplied', 'cancelled')),
  requested_by VARCHAR(128) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- 7. SUPPLY BATCHES (DELIVERIES BY SUPPLIERS)
CREATE TABLE IF NOT EXISTS supply_batches (
  id VARCHAR(64) PRIMARY KEY,
  batch_no VARCHAR(64) NOT NULL,
  supply_date VARCHAR(32) NOT NULL,
  supplier_id VARCHAR(64) NOT NULL,
  supplier_name VARCHAR(128) NOT NULL,
  food_item_id VARCHAR(64),
  item_name VARCHAR(128) NOT NULL,
  category VARCHAR(64) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(32) NOT NULL DEFAULT 'Portions',
  status VARCHAR(32) NOT NULL DEFAULT 'verified_at_hub' CHECK (status IN ('pending', 'dispatched', 'verified_at_hub')),
  hub_notes TEXT,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
);

-- 8. FOOD REVIEWS TABLE
CREATE TABLE IF NOT EXISTS food_reviews (
  id VARCHAR(64) PRIMARY KEY,
  food_item_id VARCHAR(64) NOT NULL,
  food_item_name VARCHAR(128) NOT NULL,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  student_batch VARCHAR(64) NOT NULL,
  batch_time VARCHAR(64),
  batch_no VARCHAR(64),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (food_item_id) REFERENCES food_items(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 9. PENALTY STRIKE RECORDS TABLE
CREATE TABLE IF NOT EXISTS penalties (
  id VARCHAR(64) PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL,
  student_name VARCHAR(128) NOT NULL,
  student_batch VARCHAR(64) NOT NULL,
  order_id VARCHAR(64) NOT NULL,
  token_number VARCHAR(32) NOT NULL,
  reported_by_employee VARCHAR(128) NOT NULL,
  note TEXT NOT NULL,
  strike_number INTEGER NOT NULL CHECK (strike_number BETWEEN 1 AND 3),
  resulted_in_suspension BOOLEAN NOT NULL DEFAULT FALSE,
  suspension_end_date TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_food_items_supplier ON food_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_food_items_category ON food_items(category);
CREATE INDEX IF NOT EXISTS idx_orders_student ON orders(student_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_token ON orders(token_number);
CREATE INDEX IF NOT EXISTS idx_restock_supplier ON restock_requests(supplier_id);
CREATE INDEX IF NOT EXISTS idx_restock_status ON restock_requests(status);
