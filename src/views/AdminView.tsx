import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, SupplierCategory } from '../types';
import {
  ShieldCheck,
  Plus,
  DollarSign,
  Package,
  Store,
  AlertTriangle,
  Database,
  CheckCircle,
  FileText,
  Search,
  Sparkles,
  UserX,
  Edit2,
  Trash2,
  Image as ImageIcon,
  Upload,
  Camera,
  Users,
  ShoppingBag,
  Truck,
  Phone,
  CheckCircle2,
  Download,
  Copy,
  Check,
  CreditCard,
  Banknote,
  Clock,
  MapPin,
} from 'lucide-react';

interface AdminViewProps {}

export const AdminView: React.FC<AdminViewProps> = () => {
  const {
    foodItems,
    addFoodItem,
    toggleFoodAvailability,
    updateFoodPrice,
    updateFoodImage,
    deleteFoodItem,
    removeStudent,
    removeSupplier,
    suppliers,
    supplies,
    penalties,
    orders,
    users,
    pardonStudent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'items' | 'students' | 'suppliers' | 'supplies' | 'penalties'
  >('items');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchItem, setSearchItem] = useState<string>('');
  const [searchStudent, setSearchStudent] = useState<string>('');
  const [searchSupplier, setSearchSupplier] = useState<string>('');
  const [studentFilter, setStudentFilter] = useState<'all' | 'active' | 'suspended'>('all');

  // Editing Item Picture Modal State
  const [editingImageItem, setEditingImageItem] = useState<FoodItem | null>(null);
  const [newImageInputUrl, setNewImageInputUrl] = useState<string>('');

  // Form State for Adding Food Item
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<number>(150);
  const [category, setCategory] = useState<
    'Cafe' | 'Heavy Meals' | 'Fast Food' | 'Chicken' | 'Milk & Dairy' | 'Beverages'
  >('Heavy Meals');
  const [supplierId, setSupplierId] = useState('khans-kitchen');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800'
  );
  const [prepTimeMinutes, setPrepTimeMinutes] = useState<number>(5);
  const [formError, setFormError] = useState<string | null>(null);

  // Quick preset sample food photos to make adding items super effortless
  const samplePhotos = [
    {
      label: 'Clear Mineral Water Bottle',
      url: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Golden Panko Onion Rings',
      url: 'https://images.unsplash.com/photo-1639024471287-03518883512d?w=800&auto=format&fit=crop&q=80',
    },
    {
      label: 'Biryani Handi',
      url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800',
    },
    {
      label: 'Artisan Latte',
      url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800',
    },
    {
      label: 'Chocolate Truffle',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800',
    },
    {
      label: 'Crispy Fried Chicken',
      url: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=800',
    },
    {
      label: 'Mango Laban Bottle',
      url: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800',
    },
    {
      label: 'Smash Beef Burger',
      url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    },
  ];

  // Handle manual file upload from device
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'add' | 'edit') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Please select an image smaller than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      if (result) {
        if (target === 'add') {
          setImageUrl(result);
        } else {
          setNewImageInputUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  // Auto-sync supplier when category changes according to user rules!
  const handleCategoryChange = (newCat: typeof category) => {
    setCategory(newCat);
    if (newCat === 'Cafe') setSupplierId('brew-cafe');
    else if (newCat === 'Heavy Meals') setSupplierId('khans-kitchen');
    else if (newCat === 'Chicken') setSupplierId('cp-five-star');
    else if (newCat === 'Milk & Dairy') setSupplierId('aarong-dairy');
    else if (newCat === 'Fast Food') setSupplierId('burger-lab');
    else if (newCat === 'Beverages') setSupplierId('campus-beverages');
  };

  const handleAddFoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const sup = suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      setFormError('Please select a valid supplier.');
      return;
    }

    // Strict validation
    if (category === 'Chicken' && sup.id !== 'cp-five-star') {
      setFormError('Rule Enforcement: Chicken items can only be supplied by CP Five Star.');
      return;
    }
    if (category === 'Milk & Dairy' && sup.id !== 'aarong-dairy') {
      setFormError('Rule Enforcement: Milk and dairy items must be supplied by Aarong Dairy.');
      return;
    }
    if (category === 'Cafe' && sup.id !== 'brew-cafe') {
      setFormError('Rule Enforcement: Cafe items must be supplied by Brew Cafe.');
      return;
    }

    addFoodItem({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      supplierId: sup.id,
      supplierName: sup.name,
      imageUrl: imageUrl.trim(),
      prepTimeMinutes: Number(prepTimeMinutes),
      isAvailable: true,
    });

    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  // Metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const activeOrdersCount = orders.filter(
    (o) => o.status === 'placed' || o.status === 'preparing' || o.status === 'ready_for_pickup'
  ).length;
  const suspendedCount = users.filter((u) => u.isSuspended).length;

  const filteredItems = foodItems.filter((i) =>
    i.name.toLowerCase().includes(searchItem.toLowerCase()) ||
    i.category.toLowerCase().includes(searchItem.toLowerCase()) ||
    i.supplierName.toLowerCase().includes(searchItem.toLowerCase())
  );

  // Students Filtering & Management
  const studentsList = users.filter((u) => u.role === 'student');
  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      (s.studentId && s.studentId.includes(searchStudent)) ||
      (s.phone && s.phone.includes(searchStudent)) ||
      (s.department && s.department.toLowerCase().includes(searchStudent.toLowerCase())) ||
      s.email.toLowerCase().includes(searchStudent.toLowerCase());
    const matchesFilter =
      studentFilter === 'all' ||
      (studentFilter === 'active' && !s.isSuspended) ||
      (studentFilter === 'suspended' && s.isSuspended);
    return matchesSearch && matchesFilter;
  });

  // Suppliers Filtering
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.code.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.categoryTitle.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchSupplier.toLowerCase()) ||
      s.phone.includes(searchSupplier)
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Top Banner - Made smaller without the Add New Food Item button */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-wider">
              Directorate of Campus Services
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Authority Panel</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
            KhabarKoi Administrative Console
          </h1>
          <p className="text-xs text-stone-400 max-w-2xl leading-normal">
            Master canteen database: authorize food items, inspect all students, suppliers & orders, and manage campus access.
          </p>
        </div>
      </div>

      {/* Clean Metrics (Compact cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Total Sales</span>
          <div className="text-xl font-black text-stone-900">৳{totalRevenue}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">{orders.length} orders</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Active Students</span>
          <div className="text-xl font-black text-stone-900">{studentsList.length}</div>
          <span className="text-[10px] text-stone-500 block">Registered users</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Suppliers</span>
          <div className="text-xl font-black text-stone-900">{suppliers.length}</div>
          <span className="text-[10px] text-blue-600 font-semibold block">Authorized vendors</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Suspensions</span>
          <div className="text-xl font-black text-rose-600">{suspendedCount}</div>
          <span className="text-[10px] text-rose-600 font-semibold block">3-strike penalty</span>
        </div>
      </div>

      {/* Navigation Tabs - Complete Database Coverage */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'items'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Menu Catalog ({foodItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'students'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students Database ({studentsList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('suppliers')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'suppliers'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Store className="w-3.5 h-3.5" />
          <span>Suppliers Database ({suppliers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supplies')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'supplies'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Truck className="w-3.5 h-3.5" />
          <span>Hub Deliveries ({supplies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('penalties')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition whitespace-nowrap ${
            activeTab === 'penalties'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Disciplinary ({penalties.length})</span>
        </button>
      </div>

      {/* TAB 1: FOOD ITEMS CATALOG MANAGEMENT */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food item or supplier..."
                value={searchItem}
                onChange={(e) => setSearchItem(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              />
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Food Item</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Item Details</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Assigned Supplier</th>
                    <th className="p-4">Price (BDT)</th>
                    <th className="p-4">Prep Time</th>
                    <th className="p-4">Availability</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-stone-900">{item.name}</div>
                            <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                              {item.description}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-orange-50 text-orange-800">
                          {item.category}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-stone-800">
                        {item.supplierName}
                      </td>

                      <td className="p-4">
                        <span className="font-black text-sm text-stone-900">৳{item.price}</span>
                      </td>

                      <td className="p-4 text-stone-600 font-medium">
                        {item.prepTimeMinutes} mins
                      </td>

                      <td className="p-4">
                        <button
                          onClick={() => toggleFoodAvailability(item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition ${
                            item.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Sold Out'}
                        </button>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingImageItem(item);
                              setNewImageInputUrl(item.imageUrl);
                            }}
                            className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 text-stone-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                            title="Update picture for this food item"
                          >
                            <ImageIcon className="w-3 h-3 text-orange-600" />
                            <span>Edit Picture</span>
                          </button>

                          <button
                            onClick={() => {
                              const newPrice = prompt(`Enter new price in ৳ for ${item.name}:`, item.price.toString());
                              if (newPrice && !isNaN(Number(newPrice))) {
                                updateFoodPrice(item.id, Number(newPrice));
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3 text-stone-500" />
                            <span>Edit Price</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to remove "${item.name}" from the menu catalog?`)) {
                                deleteFoodItem(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-stone-200 hover:bg-rose-50 hover:border-rose-200 text-stone-400 hover:text-rose-600 transition"
                            title="Delete food item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS DATABASE (Full Directory & Disciplinary Removal) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by student name, ID, phone, department..."
                value={searchStudent}
                onChange={(e) => setSearchStudent(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setStudentFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  studentFilter === 'all'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                All Students ({studentsList.length})
              </button>
              <button
                onClick={() => setStudentFilter('active')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  studentFilter === 'active'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Active ({studentsList.filter((s) => !s.isSuspended).length})
              </button>
              <button
                onClick={() => setStudentFilter('suspended')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  studentFilter === 'suspended'
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                Suspended ({studentsList.filter((s) => s.isSuspended).length})
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Student Name & Contact</th>
                    <th className="p-4">Campus Student ID</th>
                    <th className="p-4">Department & Batch</th>
                    <th className="p-4">Campus Balance</th>
                    <th className="p-4">Strikes</th>
                    <th className="p-4">Account Status</th>
                    <th className="p-4 text-right">Administrative Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No student accounts matching search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4">
                          <div className="font-bold text-stone-900 text-sm">{std.name}</div>
                          <div className="text-[11px] text-stone-500 font-medium">{std.email}</div>
                          {std.phone && (
                            <a
                              href={`tel:${std.phone}`}
                              className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-bold mt-0.5 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{std.phone}</span>
                            </a>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                            {std.studentId || std.id}
                          </span>
                        </td>

                        <td className="p-4">
                          <div className="font-semibold text-stone-800">{std.department || 'General Campus'}</div>
                          <div className="text-[11px] text-stone-500">{std.batch || 'Enrolled Student'}</div>
                        </td>

                        <td className="p-4">
                          <span className="font-black text-sm text-emerald-600">
                            ৳{std.balance ?? 0}
                          </span>
                        </td>

                        <td className="p-4">
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[11px] ${
                              std.strikes >= 3
                                ? 'bg-rose-100 text-rose-800'
                                : std.strikes > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {std.strikes}/3 Strikes
                          </span>
                        </td>

                        <td className="p-4">
                          {std.isSuspended ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                                <AlertTriangle className="w-3 h-3" />
                                Suspended
                              </span>
                              {std.suspensionReason && (
                                <p className="text-[10px] text-rose-600 max-w-xs mt-0.5 line-clamp-1 italic">
                                  {std.suspensionReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              Active Good Standing
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {std.strikes > 0 && (
                              <button
                                onClick={() => pardonStudent(std.id)}
                                className="px-2.5 py-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] transition"
                                title="Pardon student strikes"
                              >
                                Pardon
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Are you sure you want to remove student "${std.name}" (ID: ${std.studentId || std.id}) from the database?`
                                  )
                                ) {
                                  removeStudent(std.id);
                                }
                              }}
                              className="px-2.5 py-1 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition inline-flex items-center gap-1"
                              title="Partially remove this student from campus database"
                            >
                              <Trash2 className="w-3 h-3 text-rose-600" />
                              <span>Remove Student</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SUPPLIER RULES & COUNTERS */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search vendor name, code, category, contact..."
                value={searchSupplier}
                onChange={(e) => setSearchSupplier(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
              />
            </div>
            <span className="text-xs text-stone-500 font-semibold">
              {filteredSuppliers.length} Authorized Suppliers Active
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSuppliers.map((sup) => (
              <div
                key={sup.id}
                className="p-5 rounded-3xl bg-white border border-stone-200 shadow-2xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                      {sup.code}
                    </span>
                    <span className="text-xs font-bold text-amber-500">★ {sup.rating}</span>
                  </div>

                  <h3 className="font-black text-base text-stone-900">{sup.name}</h3>
                  <span className="text-xs font-bold text-orange-600 block mt-0.5">
                    {sup.categoryTitle}
                  </span>

                  <p className="text-xs text-stone-600 mt-2 leading-relaxed bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    {sup.allowedItemsDescription}
                  </p>
                </div>

                <div className="pt-3 border-t border-stone-100 text-xs space-y-2 text-stone-500">
                  <div>
                    <span className="font-semibold text-stone-700">Pickup Counter:</span>{' '}
                    <span className="text-stone-900 font-medium">{sup.supplyHubCounter}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-stone-700">Contact Person:</span>{' '}
                    <span className="text-stone-900 font-medium">
                      {sup.contactPerson} ({sup.phone})
                    </span>
                  </div>

                  {/* Partial Removal of Supplier */}
                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Are you sure you want to remove supplier "${sup.name}" (${sup.code})? This will also remove all their food items from the canteen menu.`
                        )
                      ) {
                        removeSupplier(sup.id);
                      }
                    }}
                    className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove Supplier from Database</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DISCIPLINARY & SUSPENSION REGISTRY */}
      {activeTab === 'penalties' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between">
            <div>
              <span className="font-bold">Official Canteen Disciplinary Policy:</span> 3 unclaimed food
              strikes trigger an automatic 1-week suspension. Authority can review notes and pardon
              genuine cases.
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Student & Batch</th>
                    <th className="p-4">Token</th>
                    <th className="p-4">Strike Count</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Officer Violation Note</th>
                    <th className="p-4">Reported By</th>
                    <th className="p-4 text-right">Pardon / Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {penalties.map((pen) => {
                    const student = users.find((u) => u.id === pen.studentId);
                    return (
                      <tr key={pen.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4 font-bold text-stone-900">
                          <div>{pen.studentName}</div>
                          <div className="text-[10px] text-stone-500 font-normal">{pen.studentBatch}</div>
                        </td>

                        <td className="p-4 font-bold text-stone-700">{pen.tokenNumber}</td>

                        <td className="p-4">
                          <span
                            className={`font-black px-2 py-0.5 rounded text-[11px] ${
                              pen.strikeNumber === 3
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            Strike {pen.strikeNumber}/3
                          </span>
                        </td>

                        <td className="p-4">
                          {student?.isSuspended ? (
                            <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded text-[10px]">
                              1-Week Suspended
                            </span>
                          ) : (
                            <span className="text-stone-500 text-[10px]">Warning Recorded</span>
                          )}
                        </td>

                        <td className="p-4 text-stone-600 max-w-xs italic">
                          "{pen.note}"
                        </td>

                        <td className="p-4 text-stone-500">{pen.reportedByEmployee}</td>

                        <td className="p-4 text-right">
                          <button
                            onClick={() => pardonStudent(pen.studentId)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-[11px] transition"
                          >
                            Pardon Strikes
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: HUB SUPPLY DELIVERIES LOG */}
      {activeTab === 'supplies' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Vendor Supply Batch Logs (Direct to Main Canteen Hub)
                </h3>
                <p className="text-xs text-stone-500">
                  Verified deliveries received and inspected at canteen hub stations
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
                {supplies.length} Total Deliveries
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Batch ID</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Delivered Item</th>
                    <th className="p-4">Quantity</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Hub Staff Inspection Notes</th>
                    <th className="p-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {supplies.map((supBatch) => (
                    <tr key={supBatch.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4 font-mono font-bold text-stone-900">{supBatch.id}</td>
                      <td className="p-4 font-bold text-stone-800">{supBatch.supplierName}</td>
                      <td className="p-4 font-semibold text-stone-900">{supBatch.itemName}</td>
                      <td className="p-4 text-stone-700 font-bold">
                        {supBatch.quantity} {supBatch.unit}
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                          {supBatch.category}
                        </span>
                      </td>
                      <td className="p-4 text-stone-600 max-w-xs italic">
                        {supBatch.hubNotes || 'Verified at Hub counter.'}
                      </td>
                      <td className="p-4 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ADD NEW FOOD ITEM MODAL (Authority Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowAddModal(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-600 text-white">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">Add New Food Item</h3>
                    <p className="text-xs text-stone-500">Configure menu item, price & picture</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleAddFoodSubmit} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Food Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Special Beef Tehari Box"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Brief description of seasoning, portion size, and sides..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Price in BDT (৳) *
                    </label>
                    <input
                      type="number"
                      required
                      min={10}
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Prep Time (Mins) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={30}
                      value={prepTimeMinutes}
                      onChange={(e) => setPrepTimeMinutes(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                    />
                  </div>
                </div>

                {/* Category & Supplier Assignment */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={(e) => handleCategoryChange(e.target.value as any)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                    >
                      <option value="Cafe">Cafe (Coffee & Cake)</option>
                      <option value="Heavy Meals">Heavy Meals (Biryani/Rice)</option>
                      <option value="Fast Food">Fast Food & Burgers</option>
                      <option value="Chicken">Chicken (CP Five Star ONLY)</option>
                      <option value="Milk & Dairy">Milk & Dairy (Aarong ONLY)</option>
                      <option value="Beverages">Beverages & Cold Drinks</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Assign Supplier *
                    </label>
                    <select
                      value={supplierId}
                      onChange={(e) => setSupplierId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                    >
                      {suppliers.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Image URL with Preset Pickers & Device File Upload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">Food Picture</label>
                    <span className="text-[10px] text-stone-400">URL or Device Upload</span>
                  </div>

                  {/* Live preview */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <img
                      src={imageUrl}
                      alt="Food preview"
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[11px] font-bold text-stone-800 block truncate">
                        Live Picture Preview
                      </span>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {imageUrl.startsWith('data:') ? 'Custom uploaded image file' : imageUrl}
                      </span>
                    </div>
                  </div>

                  {/* Manual URL Input */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Option A: Paste Image Web URL
                    </label>
                    <input
                      type="url"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                    />
                  </div>

                  {/* Option B: Upload from Device */}
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                      Option B: Upload Picture from Device / Computer
                    </label>
                    <label className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-dashed border-stone-300 hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 cursor-pointer transition text-xs font-bold text-stone-700">
                      <Upload className="w-4 h-4 text-orange-600" />
                      <span>Choose Photo File from Device</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(e, 'add')}
                      />
                    </label>
                  </div>

                  {/* Quick Photo Presets */}
                  <div className="pt-1">
                    <span className="text-[10px] font-semibold text-stone-500 block mb-1">
                      Option C: Or choose from sample high-res canteen photos:
                    </span>
                    <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                      {samplePhotos.map((photo, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setImageUrl(photo.url)}
                          className="px-2 py-1 rounded-md text-[10px] bg-stone-100 hover:bg-orange-50 hover:text-orange-700 border border-stone-200 transition font-medium"
                        >
                          {photo.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {formError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                    {formError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    Publish to Canteen Menu
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT FOOD ITEM PICTURE MODAL (Authority Manual Upload / Change) */}
      {editingImageItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingImageItem(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-600 text-white">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-stone-900">
                      Update Food Item Picture
                    </h3>
                    <p className="text-xs text-stone-500">{editingImageItem.name}</p>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <img
                  src={newImageInputUrl || editingImageItem.imageUrl}
                  alt={editingImageItem.name}
                  className="w-36 h-36 rounded-2xl object-cover border border-stone-200 shadow-xs"
                />
                <span className="text-[11px] font-semibold text-stone-600 mt-2">
                  Live Picture Preview
                </span>
              </div>

              {/* Manual URL entry */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Option 1: Paste Image Web URL
                </label>
                <input
                  type="url"
                  value={newImageInputUrl}
                  onChange={(e) => setNewImageInputUrl(e.target.value)}
                  placeholder="https://example.com/food-picture.jpg"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-900"
                />
              </div>

              {/* Manual Device File Upload */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Option 2: Upload From Device / Computer
                </label>
                <label className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-dashed border-stone-300 hover:border-orange-500 bg-stone-50 hover:bg-orange-50/50 cursor-pointer transition text-xs font-bold text-stone-700">
                  <Upload className="w-4 h-4 text-orange-600" />
                  <span>Choose Photo File from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'edit')}
                  />
                </label>
              </div>

              {/* Preset sample photos */}
              <div>
                <span className="text-[10px] font-semibold text-stone-500 block mb-1">
                  Option 3: Or choose from preset sample photos:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {samplePhotos.map((photo, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewImageInputUrl(photo.url)}
                      className="px-2 py-1 rounded-md text-[10px] bg-stone-100 hover:bg-orange-50 hover:text-orange-700 border border-stone-200 transition font-medium"
                    >
                      {photo.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditingImageItem(null)}
                  className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (newImageInputUrl.trim()) {
                      updateFoodImage(editingImageItem.id, newImageInputUrl.trim());
                      setEditingImageItem(null);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs"
                >
                  Save Picture
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
