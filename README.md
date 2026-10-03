# 🍱 KhabarKoi — Smart University Canteen System

A university canteen platform with live food stock tracking, student ordering, kitchen token queue, supplier RBAC access control, restock workflows, and disciplinary enforcement.

---

## 🗂️ Project Structure (Ready for GitHub)

This repository is organized into distinct, modular folders so any developer can inspect and run each component independently or as an integrated full-stack system:

```text
├── 1. Frontend/         # React 19 + TypeScript + Vite + Tailwind CSS Client
│   ├── src/             # Components, Portal Views, Context, Types, Utilities
│   ├── index.html       # Single Page Application HTML entry
│   ├── package.json     # Frontend dependencies & scripts
│   ├── vite.config.ts   # Vite configuration
│   └── README.md        # Frontend documentation & guides
│
├── 2. Backend/          # Node.js + Express REST API Server
│   ├── server.ts        # REST endpoints (Food stock, Orders, Restock, Suppliers, Users)
│   ├── package.json     # Backend dependencies & scripts
│   ├── tsconfig.json    # TypeScript server config
│   ├── .env.example     # Environment variables template
│   └── README.md        # API reference documentation & endpoint specs
│
├── 3. database/         # Complete Database Schemas, Seeds & Localhost Engine
│   ├── schema.sql       # Relational SQL DDL (PostgreSQL, SQLite, MySQL compatible)
│   ├── seed.sql         # Complete dummy database SQL insert statements
│   ├── dummy_database.json # Complete standalone JSON dataset
│   ├── connection.ts    # Localhost database connection engine & persistence
│   ├── init_db.ts       # CLI tool for database verification & resetting
│   └── README.md        # Comprehensive database documentation & connection guide
│
├── server.ts            # Root full-stack server running Express + Vite on Port 3000
├── package.json         # Workspace scripts & unified dependencies
└── README.md            # Root repository overview
```

---

## 🚀 Running on Localhost

### Quick Start (Integrated Full-Stack)
Run both the frontend and backend together on port 3000:
```bash
# 1. Install dependencies
npm install

# 2. Start the unified system
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Running Separately

#### Running the Backend Only:
```bash
cd Backend
npm install
npm run dev
# Backend runs at http://localhost:5000 with live database
```

#### Running the Frontend Only:
```bash
cd Frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

#### Managing the Database:
```bash
# Check database status and record counts:
npm run db:init

# Reset database to clean initial seed data:
npm run db:reset
```

---

## 🗄️ Database Features & Localhost Connection

1. **Zero-Configuration Local Database**:
   - The system works out of the box without requiring PostgreSQL or SQLite to be installed locally. It reads and writes to `database/canteen_db.json` with automatic fallback to `database/dummy_database.json`.
2. **Relational PostgreSQL / SQLite Support**:
   - Load `database/schema.sql` and `database/seed.sql` into your local PostgreSQL or SQLite database.
   - Set `DATABASE_URL=postgres://user:password@localhost:5432/canteen` in `.env`.
3. **Automated Stock Decrement**:
   - Placing student orders decrements the live portion count (`quantity`) in the database.
4. **Staff Restock & Supplier Fulfillment Workflow**:
   - Canteen staff can monitor total portion counts left and hit supply requests for suppliers.
   - Suppliers can check how many items are left, review incoming requests, and fulfill them (which automatically increments stock in the database).

---

## 👥 Pre-Configured Test Accounts (Included in Dummy Database)

| Role | Name / Email | Access & Permissions |
| :--- | :--- | :--- |
| **Student** | Tanvir Rahman (`tanvir.cse@campus.ac.bd`) | Browse menu, check items left, place orders, review meals with batch info |
| **Staff** | Ratul Karmakar (`ratul.canteen@campus.ac.bd`) | Kitchen token queue, food stock monitoring, send restock requests to suppliers |
| **Supplier (Bakery)** | Brew Cafe (`supplier.brew@campus.ac.bd`) | Manage coffee & cakes, check canteen stock left, fulfill restock requests |
| **Supplier (Meals)** | Khans Kitchen (`supplier.khans@campus.ac.bd`) | Manage heavy meals & biryani, dispatch supply batches to hub |
| **Supplier (Chicken)**| CP Five Star (`supplier.cp@campus.ac.bd`) | Manage exclusive chicken catalog items & fulfill restock requests |
| **Authority / Admin** | Campus Proctor (`proctor@campus.ac.bd`) | Full analytics, view violations, manage suppliers, adjust items |
