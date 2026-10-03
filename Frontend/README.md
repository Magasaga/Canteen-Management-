# 💻 KhabarKoi Frontend Client

A responsive React 19 + TypeScript + Vite + Tailwind CSS single page web application for students, canteen staff, suppliers, and administration.

---

## 🚀 Running on Localhost

```bash
# 1. Enter the Frontend folder
cd Frontend

# 2. Install dependencies (if running standalone)
npm install

# 3. Start development server on port 3000
npm run dev
```

Visit `http://localhost:3000` in your web browser.

---

## 📂 Architecture & Directory Layout

```
Frontend/
├── src/
│   ├── components/         # Reusable UI widgets (CartDrawer, DisciplinaryModal, ReviewModal, etc.)
│   ├── views/              # Role-specific portal views:
│   │   ├── StudentView.tsx     # Student catalog, live stock display, ordering
│   │   ├── StaffView.tsx       # Kitchen token queue, stock level monitoring & supplier restock requester
│   │   ├── SupplierView.tsx    # Authorized vendor catalog, canteen stock levels & supply batch dispatcher
│   │   ├── AdminView.tsx       # Authority analytics, discipline enforcement & supplier access control
│   │   ├── MyOrdersView.tsx    # Student order token tracker
│   │   └── LoginView.tsx       # Multi-role authentication & student registration
│   ├── context/            # React Context (AppContext) providing state & live data management
│   ├── types/              # Comprehensive TypeScript interfaces & types
│   ├── data/               # Default catalog & mock data presets
│   ├── utils/              # Audio chimes and formatting helpers
│   ├── App.tsx             # Root router & layout
│   └── main.tsx            # Application entrypoint
├── index.html              # HTML shell
├── package.json            # Frontend dependencies
├── vite.config.ts          # Vite build & Tailwind configuration
└── tsconfig.json           # TypeScript configuration
```
