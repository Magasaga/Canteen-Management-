import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, Order } from '../types';
import { DisciplinaryModal } from '../components/DisciplinaryModal';
import {
  ChefHat,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  UserX,
  CreditCard,
  Banknote,
  Search,
  MapPin,
  ShieldAlert,
  Phone,
  User,
  Package,
  Send,
  Truck,
  Filter,
  CheckCircle2,
  X,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { playOrderReadyChime } from '../utils/audio';

export const StaffView: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    markOrderCollected,
    currentUser,
    penalties,
    users,
    pardonStudent,
    foodItems,
    restockRequests,
    requestRestock,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'inventory' | 'penalties'>('queue');
  const [searchToken, setSearchToken] = useState<string>('');
  const [disciplinaryOrder, setDisciplinaryOrder] = useState<Order | null>(null);

  // Inventory Search & Filters
  const [inventorySearch, setInventorySearch] = useState<string>('');
  const [inventoryFilter, setInventoryFilter] = useState<'all' | 'low_stock' | 'out_of_stock'>('all');
  const [restockModalItem, setRestockModalItem] = useState<FoodItem | null>(null);
  const [restockReqQty, setRestockReqQty] = useState<number>(50);
  const [restockReqNotes, setRestockReqNotes] = useState<string>('');
  const [restockSuccessMsg, setRestockSuccessMsg] = useState<string | null>(null);

  // Filter orders - Single Main Canteen Counter
  const activeOrders = orders.filter((o) => {
    const isPending =
      o.status === 'placed' || o.status === 'preparing' || o.status === 'ready_for_pickup';
    const matchesSearch =
      o.tokenNumber.toLowerCase().includes(searchToken.toLowerCase()) ||
      o.studentName.toLowerCase().includes(searchToken.toLowerCase());

    return isPending && matchesSearch;
  });

  const readyOrders = activeOrders.filter((o) => o.status === 'ready_for_pickup');
  const kitchenOrders = activeOrders.filter(
    (o) => o.status === 'placed' || o.status === 'preparing'
  );

  const handleMarkReady = (orderId: string) => {
    playOrderReadyChime();
    updateOrderStatus(orderId, 'ready_for_pickup', currentUser?.name);
  };

  // Filter food items for inventory tab
  const filteredFoodItems = foodItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(inventorySearch.toLowerCase()) ||
      item.category.toLowerCase().includes(inventorySearch.toLowerCase());

    if (!matchesSearch) return false;

    if (inventoryFilter === 'low_stock') {
      return item.quantity > 0 && item.quantity <= 10;
    }
    if (inventoryFilter === 'out_of_stock') {
      return item.quantity <= 0;
    }
    return true;
  });

  const handleOpenRestockModal = (item: FoodItem) => {
    setRestockModalItem(item);
    setRestockReqQty(50);
    setRestockReqNotes(`Stock low (${item.quantity} portions left). Requesting fresh supply batch.`);
    setRestockSuccessMsg(null);
  };

  const handleSendRestockRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockModalItem) return;

    const res = requestRestock(restockModalItem.id, restockReqQty, restockReqNotes);
    if (res.success) {
      setRestockSuccessMsg(`Request sent to ${restockModalItem.supplierName}!`);
      setTimeout(() => {
        setRestockModalItem(null);
        setRestockSuccessMsg(null);
      }, 900);
    }
  };

  // Suspended students count
  const suspendedStudents = users.filter((u) => u.isSuspended);

  // Overall stock stats
  const totalStockPortions = foodItems.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = foodItems.filter((i) => i.quantity <= 10).length;
  const pendingRequestsCount = restockRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
              Canteen Operations
            </span>
            <span className="text-xs text-stone-400">Duty Officer: {currentUser?.name}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2 text-white">
            Main Canteen Kitchen & Inventory Operations
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
            Single counter hub: monitor food stock levels, request supplier deliveries, advance cooking tokens,
            and manage order collections.
          </p>
        </div>

        {/* Quick Tabs: Kitchen Queue vs Inventory vs Penalties */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-800 p-1.5 rounded-2xl border border-stone-700">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Queue ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Food Stock & Restock ({lowStockCount > 0 ? `${lowStockCount} low` : `${foodItems.length} items`})</span>
          </button>

          <button
            onClick={() => setActiveTab('penalties')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'penalties'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Penalties ({penalties.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: KITCHEN QUEUE */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          {/* Single Counter Indicator & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-700 bg-white border border-stone-200 px-3.5 py-2 rounded-xl shadow-2xs">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>Counter: Main Canteen Counter (Single Dedicated Station)</span>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search token or student..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* 2-Columns: Ready for Pickup vs Cooking in Kitchen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section 1: READY FOR PICKUP */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
                    Ready for Pickup ({readyOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Awaiting student collection</span>
              </div>

              {readyOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <p className="text-xs font-bold text-stone-600">No pending collections!</p>
                  <p className="text-[11px]">All ready meals have been picked up by students.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {readyOrders.map((ord) => {
                    const student = users.find((u) => u.id === ord.studentId);
                    const studentStrikes = student?.strikes || 0;
                    const studentPhone = ord.studentPhone || student?.phone || '+880 1712-345678';
                    const studentIdNo = student?.studentId;

                    return (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-white border-2 border-emerald-500/80 shadow-md space-y-3.5 relative overflow-hidden"
                      >
                        {/* Status bar */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-2xl font-black text-stone-900">
                                #{ord.tokenNumber}
                              </span>
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Ready for Pickup
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex items-center gap-1 text-xs font-bold text-stone-800">
                                <User className="w-3.5 h-3.5 text-stone-400" />
                                <span>{ord.studentName}</span>
                              </div>
                              <span className="text-stone-300">·</span>
                              <span className="text-[11px] font-medium text-stone-500">
                                {ord.studentBatch}
                              </span>
                              {studentIdNo && (
                                <span className="font-mono text-[10px] bg-stone-100 px-1.5 py-0.5 rounded text-stone-600">
                                  ID: {studentIdNo}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-sm text-stone-900">৳{ord.totalAmount}</span>
                            <div className="mt-0.5">
                              {ord.paymentMethod === 'online' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <CreditCard className="w-3 h-3" />
                                  <span>Paid Online</span>
                                </span>
                              ) : ord.paymentStatus === 'settled_at_hub' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                  <Banknote className="w-3 h-3" />
                                  <span>Cash Collected</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-900 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300 animate-pulse">
                                  <Banknote className="w-3 h-3" />
                                  <span>Collect ৳{ord.totalAmount} Cash</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="font-bold text-stone-800">
                                {item.quantity}x {item.name}
                              </span>
                              <span className="font-medium text-stone-500">
                                ৳{item.price * item.quantity}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Contact details & strike warnings */}
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-stone-100">
                          <div className="flex items-center gap-3">
                            <a
                              href={`tel:${studentPhone}`}
                              className="inline-flex items-center gap-1 text-stone-600 hover:text-orange-600 font-semibold"
                            >
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              <span>{studentPhone}</span>
                            </a>

                            {studentStrikes > 0 && (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <AlertTriangle className="w-3 h-3" />
                                <span>{studentStrikes}/3 Strikes</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Violation / Unclaimed Report Button */}
                            <button
                              onClick={() => setDisciplinaryOrder(ord)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition cursor-pointer flex items-center gap-1"
                              title="Report Student Unclaimed Food Violation"
                            >
                              <UserX className="w-3.5 h-3.5" />
                              <span>Unclaimed</span>
                            </button>

                            {/* Mark Collected */}
                            <button
                              onClick={() => markOrderCollected(ord.id)}
                              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Mark Collected</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: COOKING IN KITCHEN */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
                    Cooking in Kitchen ({kitchenOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Advance order queue</span>
              </div>

              {kitchenOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-stone-500" />
                  <p className="text-xs font-bold text-stone-600">Kitchen is all clear!</p>
                  <p className="text-[11px]">No pending cooking tokens in queue.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {kitchenOrders.map((ord) => {
                    const isPreparing = ord.status === 'preparing';

                    return (
                      <div
                        key={ord.id}
                        className={`p-5 rounded-2xl bg-white border shadow-xs space-y-3 transition ${
                          isPreparing ? 'border-amber-400 bg-amber-50/20' : 'border-stone-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-stone-900">
                                #{ord.tokenNumber}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  isPreparing
                                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                    : 'bg-stone-100 text-stone-700 border border-stone-200'
                                }`}
                              >
                                {isPreparing ? 'Cooking' : 'Placed'}
                              </span>
                            </div>
                            <span className="text-xs text-stone-600 font-semibold block mt-0.5">
                              {ord.studentName} ({ord.studentBatch})
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-xs text-stone-900">৳{ord.totalAmount}</span>
                            <span className="text-[10px] text-stone-400 block">
                              {ord.paymentMethod === 'online' ? 'Online' : 'Cash at Counter'}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="space-y-1.5 text-xs bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <span className="font-bold text-stone-800">
                                {item.quantity}x {item.name}
                              </span>
                              {item.notes && (
                                <span className="text-[10px] text-amber-700 italic">"{item.notes}"</span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Advance Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-stone-500">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex items-center gap-2">
                            {ord.status === 'placed' && (
                              <button
                                onClick={() => updateOrderStatus(ord.id, 'preparing', currentUser?.name)}
                                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition cursor-pointer"
                              >
                                Start Cooking
                              </button>
                            )}

                            {/* Mark Order Ready & Sound Chime */}
                            <button
                              onClick={() => handleMarkReady(ord.id)}
                              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Order Ready (Chime)</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FOOD STOCK INVENTORY & SUPPLIER REQUESTS */}
      {activeTab === 'inventory' && (
        <div className="space-y-6">
          {/* Inventory Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-stone-500">Total Food Items</span>
              <div className="text-2xl font-black text-stone-900">{foodItems.length}</div>
              <span className="text-[10px] text-stone-400 block">In Canteen Catalog</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-stone-500">Total Portions Left</span>
              <div className="text-2xl font-black text-emerald-600">{totalStockPortions}</div>
              <span className="text-[10px] text-emerald-700 font-semibold block">Across all counters</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-stone-500">Low Stock Portions (≤10)</span>
              <div className="text-2xl font-black text-amber-600">{lowStockCount}</div>
              <span className="text-[10px] text-amber-700 font-semibold block">Need restock request</span>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-1">
              <span className="text-xs font-bold text-stone-500">Supplier Restock Requests</span>
              <div className="text-2xl font-black text-orange-600">{pendingRequestsCount} Pending</div>
              <span className="text-[10px] text-orange-700 font-semibold block">Awaiting supplier delivery</span>
            </div>
          </div>

          {/* Search, Filter & Controls */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search food item, supplier, or category..."
                value={inventorySearch}
                onChange={(e) => setInventorySearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex items-center gap-1.5 w-full sm:w-auto">
              <button
                onClick={() => setInventoryFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  inventoryFilter === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                All Items ({foodItems.length})
              </button>
              <button
                onClick={() => setInventoryFilter('low_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  inventoryFilter === 'low_stock'
                    ? 'bg-amber-500 text-white'
                    : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                Low Stock (≤10)
              </button>
              <button
                onClick={() => setInventoryFilter('out_of_stock')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  inventoryFilter === 'out_of_stock'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                Out of Stock
              </button>
            </div>
          </div>

          {/* Food Items Stock Table & Hit Request */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                  <Package className="w-4 h-4 text-orange-600" />
                  <span>Canteen Food Stock & Total Items Left</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Staff can check live inventory counts and send urgent supply requests directly to suppliers.
                </p>
              </div>

              <span className="text-xs font-bold text-stone-600">
                Showing {filteredFoodItems.length} of {foodItems.length} items
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Food Item</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Total Actually Left</th>
                    <th className="p-4">Batch Number</th>
                    <th className="p-4 text-right">Action for Staff</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredFoodItems.map((item) => {
                    const isLow = item.quantity > 0 && item.quantity <= 10;
                    const isOut = item.quantity <= 0;
                    const hasPendingReq = restockRequests.some(
                      (r) => r.foodItemId === item.id && r.status === 'pending'
                    );

                    return (
                      <tr key={item.id} className="hover:bg-stone-50/70 transition">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-stone-900 text-xs sm:text-sm">{item.name}</div>
                              <div className="text-[11px] text-stone-400 line-clamp-1 max-w-xs">{item.description}</div>
                            </div>
                          </div>
                        </td>

                        <td className="p-4 font-semibold text-stone-600 whitespace-nowrap">
                          {item.category}
                        </td>

                        <td className="p-4 font-bold text-stone-800 whitespace-nowrap">
                          {item.supplierName}
                        </td>

                        <td className="p-4 font-black text-stone-900 whitespace-nowrap">
                          ৳{item.price}
                        </td>

                        {/* TOTAL ACTUALLY LEFT */}
                        <td className="p-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-black inline-flex items-center gap-1.5 ${
                                isOut
                                  ? 'bg-rose-100 text-rose-800 border border-rose-300'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                              }`}
                            >
                              <Package className="w-3.5 h-3.5" />
                              <span>{item.quantity} portions left</span>
                            </span>

                            {hasPendingReq && (
                              <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                                Request Pending
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="p-4 font-mono text-[11px] text-stone-600 whitespace-nowrap">
                          <span className="bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                            {item.batchNo || 'No batch'}
                          </span>
                        </td>

                        {/* HIT REQUEST TO SUPPLIER BUTTON */}
                        <td className="p-4 text-right whitespace-nowrap">
                          <button
                            onClick={() => handleOpenRestockModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Request Supply</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ACTIVE RESTOCK REQUESTS REGISTRY */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-stone-900 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Active Supplier Restock Requests</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Requests sent by canteen staff to suppliers for restocking food items.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {restockRequests.length} Total Requests
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Requested Item</th>
                    <th className="p-4">Supplier</th>
                    <th className="p-4">Requested Qty</th>
                    <th className="p-4">Stock at Request</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Requested By</th>
                    <th className="p-4">Staff Note</th>
                    <th className="p-4">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {restockRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4 font-bold text-stone-900">{req.foodItemName}</td>
                      <td className="p-4 font-semibold text-stone-800">{req.supplierName}</td>
                      <td className="p-4 font-black text-orange-600">{req.requestedQuantity} portions</td>
                      <td className="p-4 text-stone-600">{req.currentStock} portions</td>
                      <td className="p-4">
                        {req.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full text-[10px] animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Pending Supply</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Supplied & Restocked</span>
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-stone-600">{req.requestedBy}</td>
                      <td className="p-4 text-stone-600 max-w-xs truncate italic">
                        "{req.notes || 'Routine restock'}"
                      </td>
                      <td className="p-4 text-stone-400 text-[11px] whitespace-nowrap">
                        {new Date(req.createdAt).toLocaleDateString()} {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PENALTIES & UNCLAIMED FOOD VIOLATION REGISTRY */}
      {activeTab === 'penalties' && (
        <div className="space-y-6">
          {/* Active Suspensions Banner */}
          {suspendedStudents.length > 0 && (
            <div className="p-5 rounded-3xl bg-rose-600 text-white shadow-lg space-y-3">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-base font-black">
                    Active 1-Week Canteen Suspensions ({suspendedStudents.length})
                  </h3>
                  <p className="text-xs text-rose-100">
                    Students barred from placing orders due to reaching 3 unclaimed food violations.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                {suspendedStudents.map((std) => (
                  <div
                    key={std.id}
                    className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-white text-sm">{std.name}</div>
                      <div className="text-rose-200 text-[11px]">{std.batch}</div>
                      <div className="mt-2 text-[11px] text-white/90">
                        {std.suspensionReason || '3 unclaimed meals logged.'}
                      </div>
                    </div>

                    <button
                      onClick={() => pardonStudent(std.id)}
                      className="mt-3 py-1.5 px-3 rounded-xl bg-white text-rose-700 hover:bg-rose-50 font-bold text-[11px] shadow-xs transition self-start cursor-pointer"
                    >
                      Pardon & Clear Strikes
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Infraction Log Table */}
          <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base text-stone-900">
                  Unclaimed Order Infraction Records
                </h3>
                <p className="text-xs text-stone-500">
                  Policy: 3 strikes for uncollected food triggers automatic 1-week suspension.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                {penalties.length} Violations Logged
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-4">Student & Batch</th>
                    <th className="p-4">Token #</th>
                    <th className="p-4">Strike Number</th>
                    <th className="p-4">Status / Penalty</th>
                    <th className="p-4">Officer Reason Note</th>
                    <th className="p-4">Reported By</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {penalties.map((pen) => (
                    <tr key={pen.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4">
                        <div className="font-bold text-stone-900">{pen.studentName}</div>
                        <div className="text-[10px] text-stone-500">{pen.studentBatch}</div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-800">
                          {pen.tokenNumber}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`font-black px-2 py-1 rounded-md text-xs ${
                            pen.strikeNumber === 3
                              ? 'bg-rose-100 text-rose-800'
                              : pen.strikeNumber === 2
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-100 text-stone-700'
                          }`}
                        >
                          Strike {pen.strikeNumber} / 3
                        </span>
                      </td>

                      <td className="p-4">
                        {pen.resultedInSuspension ? (
                          <span className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 text-[10px]">
                            <ShieldAlert className="w-3 h-3" />
                            1-Week Suspended
                          </span>
                        ) : (
                          <span className="text-stone-500 text-[11px]">Formal Warning Note</span>
                        )}
                      </td>

                      <td className="p-4 text-stone-700 font-medium max-w-xs">
                        "{pen.note}"
                      </td>

                      <td className="p-4 text-stone-600">{pen.reportedByEmployee}</td>

                      <td className="p-4 text-stone-400 text-[11px]">
                        {new Date(pen.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RESTOCK REQUEST MODAL */}
      {restockModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setRestockModalItem(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
              {/* Header */}
              <div className="bg-orange-50 border-b border-orange-100 p-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={restockModalItem.imageUrl}
                    alt={restockModalItem.name}
                    className="w-12 h-12 rounded-xl object-cover border border-orange-200"
                  />
                  <div>
                    <h3 className="text-base font-bold text-stone-900 leading-snug">
                      Request Supply for {restockModalItem.name}
                    </h3>
                    <p className="text-xs text-orange-700 font-semibold">
                      Supplier: {restockModalItem.supplierName}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setRestockModalItem(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSendRestockRequest} className="p-6 space-y-4">
                {/* Current Stock Actually Left */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-stone-700">Currently in Canteen Stock:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                    {restockModalItem.quantity} portions left
                  </span>
                </div>

                {/* Quantity Input */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Portions to Request from Supplier *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    required
                    value={restockReqQty}
                    onChange={(e) => setRestockReqQty(Number(e.target.value))}
                    className="w-full text-sm p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold"
                  />
                  <span className="text-[11px] text-stone-400 mt-1 block">
                    Suggested batch size: 30 - 100 portions
                  </span>
                </div>

                {/* Staff Note */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Urgency & Shift Note for Supplier
                  </label>
                  <textarea
                    rows={2}
                    value={restockReqNotes}
                    onChange={(e) => setRestockReqNotes(e.target.value)}
                    placeholder="e.g. Lunch rush surge, please deliver fresh batch ASAP."
                    className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                  />
                </div>

                {restockSuccessMsg && (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>{restockSuccessMsg}</span>
                  </div>
                )}

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRestockModalItem(null)}
                    className="px-4 py-2 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Hit Request to Supplier</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Disciplinary Strike Modal */}
      {disciplinaryOrder && (
        <DisciplinaryModal
          order={disciplinaryOrder}
          isOpen={!!disciplinaryOrder}
          onClose={() => setDisciplinaryOrder(null)}
        />
      )}
    </div>
  );
};
