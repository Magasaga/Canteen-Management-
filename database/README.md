# 🗄️ KhabarKoi Canteen Database Documentation

This folder contains the complete, production-ready relational database architecture and dummy datasets for the **KhabarKoi** smart university canteen system.

---

## 📁 Files Included

| File | Purpose |
| :--- | :--- |
| `schema.sql` | **ANSI SQL Schema (DDL)**: Standard table definitions, constraints, foreign keys, and indexes compatible with PostgreSQL, SQLite, and MySQL. |
| `seed.sql` | **Full Dummy SQL Data (DML)**: Insert statements for all suppliers, initial food catalog items with stock quantities, test users, initial orders, reviews, and restock requests. |
| `dummy_database.json` | **Standalone JSON Database**: Complete nested JSON dataset ready for MongoDB, Lowdb, or instant mock servers without requiring any SQL service installed. |
| `connection.ts` | **Database Adapter & Client**: Zero-dependency local persistence engine that connects to localhost, handles automatic fallback to `dummy_database.json`, and saves live state. |
| `init_db.ts` | **CLI Initialization Tool**: Command-line utility to test connectivity and re-seed the local database. |

---

## 🏗️ Entity Relationship Summary

```
                      +-------------------+
                      |     Suppliers     |
                      +-------------------+
                                | 1
                                |
                                | *
                      +-------------------+
                      |    Food_Items     | <-------+
                      +-------------------+         |
                                | 1                 |
                                |                   |
                                | *                 |
+---------------+     +-------------------+         |
|     Users     | <---|      Orders       |         |
+---------------+     +-------------------+         |
        | 1                     | 1                 |
        |                       |                   |
        | *                     | *                 |
+---------------+     +-------------------+         |
|   Penalties   |     |    Order_Items    | --------+
+---------------+     +-------------------+

+-----------------------+     +-----------------------+
|   Restock_Requests    |     |    Supply_Batches     |
+-----------------------+     +-----------------------+
(Staff -> Supplier)           (Supplier -> Hub Delivery)
```

---

## 🚀 How to Connect on Localhost

### Option 1: Zero-Config Local Engine (Default)
No database installation needed! The project includes a pre-configured local database engine that automatically loads `dummy_database.json` and creates a persistent `canteen_db.json` on disk:
```bash
# Verify database connection and view status
npx tsx database/init_db.ts

# Reset local database to fresh dummy data
npx tsx database/init_db.ts --reset
```

### Option 2: Connect to Local PostgreSQL
1. Create a database in your local PostgreSQL:
   ```sql
   CREATE DATABASE khabarkoi_canteen;
   ```
2. Run the schema and seed scripts:
   ```bash
   psql -U postgres -d khabarkoi_canteen -f database/schema.sql
   psql -U postgres -d khabarkoi_canteen -f database/seed.sql
   ```
3. Set your environment variable in `.env`:
   ```env
   DATABASE_URL=postgres://postgres:password@localhost:5432/khabarkoi_canteen
   ```

### Option 3: Connect to Local SQLite
```bash
sqlite3 canteen.db < database/schema.sql
sqlite3 canteen.db < database/seed.sql
```

---

## 📊 Included Dummy Datasets
- **7 Campus Suppliers**: Brew Cafe, Khans Kitchen, Olympia, Burger Lab, CP Five Star, Aarong Dairy, Campus Beverage Hub.
- **10+ Food Catalog Items**: With accurate portion counts (`quantity`), batch numbers (`batchNo`), preparation times, prices, and reviews.
- **Multi-Role Users**: Pre-seeded accounts for Students, Canteen Staff (`ratul.canteen@campus.ac.bd`), Suppliers, and Campus Authority.
- **Active Restock Requests**: Pending restock requests from staff with portion sizes and urgency notes.
