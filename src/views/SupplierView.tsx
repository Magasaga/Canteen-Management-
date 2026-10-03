import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SupplierCategory } from '../types';
import {
  Store,
  ShieldCheck,
  Package,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Truck,
  DollarSign,
  Coffee,
  Flame,
  ChefHat,
  Milk,
  GlassWater,
  Utensils,
  Lock,
  Tag,
  Calendar,
  Edit2,
  Star,
  MessageSquare,
} from 'lucide-react';

export const SupplierView: React.FC = () => {
  const {
    currentUser,
    suppliers,
    foodItems,
    supplies,
    createSupplyBatch,
    updateSupplyBatchNo,
    updateFoodBatchNo,
    orders,
    reviews,
  } = useApp();

  const [showSupplyModal, setShowSupplyModal] = useState<boolean>(false);
  const [supplyItemName, setSupplyItemName] = useState<string>('');
  const [selectedFoodItemId, setSelectedFoodItemId] = useState<string>('');
  const [supplyQuantity, setSupplyQuantity] = useState<number>(50);
  const [supplyUnit, setSupplyUnit] = useState<string>('Portions');
  const [supplyDate, setSupplyDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [supplyBatchNo, setSupplyBatchNo] = useState<string>('');
  const [supplyError, setSupplyError] = useState<string | null>(null);

  // Modal for editing batch number after delivery
  const [editingBatchRecord, setEditingBatchRecord] = useState<{
    id: string;
    itemName: string;
    currentBatchNo: string;
    supplyDate?: string;
  } | null>(null);
  const [newBatchNoInput, setNewBatchNoInput] = useState<string>('');
  const [newSupplyDateInput, setNewSupplyDateInput] = useState<string>('');

  // Modal for directly setting food item batch
  const [editingFoodBatch, setEditingFoodBatch] = useState<{
    id: string;
    name: string;
    currentBatchNo?: string;
  } | null>(null);
  const [foodBatchInput, setFoodBatchInput] = useState<string>('');

  const currentSupplier =
    suppliers.find((s) => s.id === currentUser?.supplierId) || suppliers[0];

  // =========================================================================
  // STRICT SUPPLIER ISOLATION: Zero Cross-Visibility!
  // One supplier can only view and inspect their OWN items and supply batches.
  // =========================================================================
  const myFoodItems = foodItems.filter((item) => item.supplierId === currentSupplier.id);
  const mySupplyBatches = supplies.filter((batch) => batch.supplierId === currentSupplier.id);
  const myReviews = reviews.filter((rev) =>
    myFoodItems.some((mfi) => mfi.id === rev.foodItemId || mfi.name.toLowerCase() === rev.foodItemName.toLowerCase())
  );

  // Calculate this supplier's total portions ordered
  const myPortionsSold = orders.reduce((sum, order) => {
    const matchingItems = order.items.filter((oi) =>
      myFoodItems.some((mfi) => mfi.id === oi.foodItemId)
    );
    return sum + matchingItems.reduce((s, mi) => s + mi.quantity, 0);
  }, 0);

  const myGrossRevenue = orders.reduce((sum, order) => {
    const matchingItems = order.items.filter((oi) =>
      myFoodItems.some((mfi) => mfi.id === oi.foodItemId)
    );
    return sum + matchingItems.reduce((s, mi) => s + mi.price * mi.quantity, 0);
  }, 0);

  const getCategoryIcon = (cat: SupplierCategory) => {
    switch (cat) {
      case 'cafe':
        return <Coffee className="w-4 h-4 text-amber-500" />;
      case 'heavy_meals':
        return <Flame className="w-4 h-4 text-orange-500" />;
      case 'chicken':
        return <ChefHat className="w-4 h-4 text-rose-500" />;
      case 'milk_dairy':
        return <Milk className="w-4 h-4 text-blue-400" />;
      case 'beverage':
        return <GlassWater className="w-4 h-4 text-teal-400" />;
      case 'fast_food':
        return <Utensils className="w-4 h-4 text-yellow-400" />;
    }
  };

  const handleOpenSupplyModal = (item?: (typeof myFoodItems)[0]) => {
    const today = new Date().toISOString().slice(0, 10);
    setSupplyDate(today);
    const dateFormatted = today.replace(/-/g, '');
    const targetItem = item || myFoodItems[0];
    if (targetItem) {
      setSelectedFoodItemId(targetItem.id);
      setSupplyItemName(targetItem.name);
    } else {
      setSelectedFoodItemId('');
      setSupplyItemName('');
    }
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setSupplyBatchNo(`BATCH-${dateFormatted}-${currentSupplier.code}-${randomSuffix}`);
    setSupplyError(null);
    setShowSupplyModal(true);
  };

  const handleCreateSupply = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplyError(null);

    if (!supplyItemName.trim()) {
      setSupplyError('Please enter the supply item name.');
      return;
    }

    if (!supplyBatchNo.trim()) {
      setSupplyError('Please specify the Batch Number for this food delivery.');
      return;
    }

    const res = createSupplyBatch({
      supplierId: currentSupplier.id,
      itemName: supplyItemName.trim(),
      foodItemId: selectedFoodItemId || undefined,
      quantity: Number(supplyQuantity),
      unit: supplyUnit,
      category: currentSupplier.category,
      batchNo: supplyBatchNo.trim(),
      supplyDate,
    });

    if (res.success) {
      setShowSupplyModal(false);
      setSupplyItemName('');
      setSupplyBatchNo('');
    } else {
      setSupplyError(res.error || 'Failed to dispatch supply batch.');
    }
  };

  const handleEditBatchNo = (batchId: string, currentBatchNo: string, itemName: string) => {
    const updated = prompt(`Enter updated Batch Number for ${itemName}:`, currentBatchNo);
    if (updated && updated.trim()) {
      updateSupplyBatchNo(batchId, updated.trim());
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4">
      {/* Top Banner - Made smaller and removed switch supplier box */}
      <div className="bg-stone-900 text-white rounded-2xl p-4 sm:p-5 shadow-sm border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
              <Lock className="w-3 h-3" />
              Supplier Portal
            </span>
            <span className="text-[11px] text-stone-400 font-medium">Code: {currentSupplier.code}</span>
          </div>

          <h1 className="text-lg sm:text-xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>{currentSupplier.name}</span>
            <span className="p-1 rounded-lg bg-white/10 shrink-0">
              {getCategoryIcon(currentSupplier.category)}
            </span>
          </h1>

          <p className="text-xs text-stone-300 max-w-2xl leading-normal">
            {currentSupplier.allowedItemsDescription}
          </p>
        </div>

        <div className="sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Designated Counter</span>
          <span className="font-bold text-xs text-orange-400">{currentSupplier.supplyHubCounter}</span>
        </div>
      </div>

      {/* Supplier Metrics - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Menu Items</span>
          <div className="text-xl font-black text-stone-900">{myFoodItems.length}</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Authorized</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Batches Delivered</span>
          <div className="text-xl font-black text-stone-900">{mySupplyBatches.length}</div>
          <span className="text-[10px] text-blue-600 font-semibold block">To Canteen Hub</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Portions Sold</span>
          <div className="text-xl font-black text-stone-900">{myPortionsSold}</div>
          <span className="text-[10px] text-stone-500 block">Student orders</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Gross Sales</span>
          <div className="text-xl font-black text-orange-600">৳{myGrossRevenue}</div>
          <span className="text-[10px] text-stone-500 block">Settled</span>
        </div>
      </div>

      {/* Strict Rule Reminder Banner - Compact */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 flex items-center gap-2.5 text-xs leading-normal">
        <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
        <div className="text-[11px]">
          <span className="font-bold">Authorized Category: </span>
          {currentSupplier.id === 'brew-cafe' && (
            <span>Brew Cafe is strictly authorized for coffees, cakes, and cafe items.</span>
          )}
          {(currentSupplier.id === 'khans-kitchen' || currentSupplier.id === 'olympia') && (
            <span>{currentSupplier.name} is strictly authorized for heavy meal platters (Biryani, Tehari, Polao).</span>
          )}
          {currentSupplier.id === 'cp-five-star' && (
            <span>CP Five Star holds exclusive authority for CP fried chicken, strips, and chicken items only.</span>
          )}
          {currentSupplier.id === 'aarong-dairy' && (
            <span>Aarong Dairy holds exclusive authority for dairy products (Laban, Doi, milk, paneer).</span>
          )}
          {currentSupplier.id === 'campus-beverages' && (
            <span>Campus Beverage Hub is authorized for cold sodas, juices, and mineral water.</span>
          )}
          {currentSupplier.id === 'burger-lab' && (
            <span>Burger Lab & Campus Bites is authorized for burgers, fries, nachos, and pizza.</span>
          )}
        </div>
      </div>

      {/* Section 1: My Exclusive Food Catalog (Other suppliers' items hidden) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              {currentSupplier.name} — Authorized Food Catalog
            </h2>
            <p className="text-xs text-stone-500">
              Only items belonging to {currentSupplier.name} are accessible in this view.
            </p>
          </div>

          <button
            onClick={() => setShowSupplyModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition"
          >
            <Truck className="w-4 h-4" />
            <span>Dispatch Supply Batch to Hub</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {myFoodItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center gap-3"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0 border border-stone-200"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-orange-600 uppercase">
                  {item.category}
                </span>
                <h4 className="font-bold text-xs text-stone-900 truncate">{item.name}</h4>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="font-black text-stone-800">৳{item.price}</span>
                  <span className="text-[11px] font-semibold text-stone-500">
                    Prep: {item.prepTimeMinutes}m
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: My Supply Batches & Hub Delivery Logs */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-stone-900">
              Supply Delivery Batches to Main Canteen Hub
            </h3>
            <p className="text-xs text-stone-500">
              Inventory verified and checked in at {currentSupplier.supplyHubCounter}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {mySupplyBatches.length} Deliveries
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="p-4">Batch ID</th>
                <th className="p-4">Item Delivered</th>
                <th className="p-4">Quantity & Unit</th>
                <th className="p-4">Category</th>
                <th className="p-4">Status</th>
                <th className="p-4">Hub Staff Inspection Notes</th>
                <th className="p-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {mySupplyBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-stone-50/70 transition">
                  <td className="p-4 font-mono font-bold text-stone-800">{batch.id}</td>
                  <td className="p-4 font-bold text-stone-900">{batch.itemName}</td>
                  <td className="p-4 font-semibold text-stone-700">
                    {batch.quantity} {batch.unit}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800">
                      {batch.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified at Hub
                    </span>
                  </td>
                  <td className="p-4 text-stone-600 max-w-xs italic">
                    {batch.hubNotes || 'Delivered on schedule. Temp and quality verified.'}
                  </td>
                  <td className="p-4 text-stone-400 text-[11px]">
                    {new Date(batch.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supply Dispatch Modal */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowSupplyModal(false)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-orange-600 text-white">
                    <Truck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-stone-900">
                      Dispatch Supply to Canteen Hub
                    </h3>
                    <p className="text-[11px] text-stone-500">{currentSupplier.name}</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleCreateSupply} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Supply Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={`e.g. ${
                      currentSupplier.id === 'brew-cafe'
                        ? 'Signature Dutch Truffle Cake Trays'
                        : currentSupplier.id === 'cp-five-star'
                        ? 'CP Crispy Marinated Chicken Cuts'
                        : currentSupplier.id === 'aarong-dairy'
                        ? 'Aarong Mango Laban 250ml Crates'
                        : 'Mutton Kacchi Biryani Handi'
                    }`}
                    value={supplyItemName}
                    onChange={(e) => setSupplyItemName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={supplyQuantity}
                      onChange={(e) => setSupplyQuantity(Number(e.target.value))}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Unit *</label>
                    <select
                      value={supplyUnit}
                      onChange={(e) => setSupplyUnit(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                    >
                      <option value="Portions">Portions</option>
                      <option value="Pieces">Pieces</option>
                      <option value="Bottles">Bottles</option>
                      <option value="Kilograms">Kilograms</option>
                      <option value="Trays">Trays</option>
                    </select>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 text-[11px] text-stone-600 border border-stone-200">
                  <span className="font-bold text-stone-800">Target Station:</span>{' '}
                  {currentSupplier.supplyHubCounter}
                </div>

                {supplyError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                    {supplyError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplyModal(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    Confirm Dispatch
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
