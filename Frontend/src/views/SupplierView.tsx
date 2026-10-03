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
    restockRequests,
    fulfillRestockRequest,
  } = useApp();

  const [showSupplyModal, setShowSupplyModal] = useState<boolean>(false);
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

  // Supplier restock requests from canteen staff
  const myRestockRequests = restockRequests.filter(
    (req) =>
      req.supplierId === currentSupplier.id ||
      myFoodItems.some((mfi) => mfi.id === req.foodItemId || mfi.name.toLowerCase() === req.foodItemName.toLowerCase())
  );
  const pendingRequests = myRestockRequests.filter((r) => r.status === 'pending');

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

  const handleOpenSupplyModal = (item?: (typeof myFoodItems)[0], defaultQuantity = 50) => {
    const today = new Date().toISOString().slice(0, 10);
    setSupplyDate(today);
    const dateFormatted = today.replace(/-/g, '');
    const targetItem = item || myFoodItems[0];
    if (targetItem) {
      setSelectedFoodItemId(targetItem.id);
    } else {
      setSelectedFoodItemId('');
    }
    setSupplyQuantity(defaultQuantity);
    const randomSuffix = Math.floor(10 + Math.random() * 90);
    setSupplyBatchNo(`BATCH-${dateFormatted}-${currentSupplier.code}-${randomSuffix}`);
    setSupplyError(null);
    setShowSupplyModal(true);
  };

  const handleQuickFulfill = (requestId: string) => {
    fulfillRestockRequest(requestId);
  };

  const handleCreateSupply = (e: React.FormEvent) => {
    e.preventDefault();
    setSupplyError(null);

    if (!selectedFoodItemId) {
      setSupplyError('Please select a food item from your authorized catalog.');
      return;
    }

    const catalogItem = myFoodItems.find((f) => f.id === selectedFoodItemId);
    if (!catalogItem) {
      setSupplyError('Selected food item is not in your authorized catalog.');
      return;
    }

    if (!supplyBatchNo.trim()) {
      setSupplyError('Please specify the Batch Number for this food delivery.');
      return;
    }

    const res = createSupplyBatch({
      supplierId: currentSupplier.id,
      itemName: catalogItem.name,
      foodItemId: selectedFoodItemId,
      quantity: Number(supplyQuantity),
      unit: supplyUnit,
      category: currentSupplier.category,
      batchNo: supplyBatchNo.trim(),
      supplyDate,
    });

    if (res.success) {
      setShowSupplyModal(false);
      setSelectedFoodItemId('');
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
      </div>

      {/* Supplier Metrics - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Authorized Menu</span>
          <div className="text-xl font-black text-stone-900">{myFoodItems.length} Items</div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Exclusive category</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Canteen Stock Left</span>
          <div className="text-xl font-black text-emerald-600">
            {myFoodItems.reduce((sum, item) => sum + item.quantity, 0)}
          </div>
          <span className="text-[10px] text-stone-500 block">Total portions in hub</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Batches Delivered</span>
          <div className="text-xl font-black text-stone-900">{mySupplyBatches.length}</div>
          <span className="text-[10px] text-blue-600 font-semibold block">To Canteen Hub</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-0.5">
          <span className="text-[11px] font-bold text-stone-500">Staff Restock Requests</span>
          <div className="text-xl font-black text-orange-600">{pendingRequests.length} Pending</div>
          <span className="text-[10px] text-orange-700 font-semibold block">Items to be supplied</span>
        </div>
      </div>

      {/* Incoming Restock Requests from Canteen Staff (Items to Supply) */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
                Items to be Supplied (Canteen Staff Requests)
              </h2>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Canteen staff monitors food portion levels and sends these requests when stock runs low.
            </p>
          </div>

          <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 self-start sm:self-auto">
            {pendingRequests.length} Pending Supply
          </span>
        </div>

        {myRestockRequests.length === 0 ? (
          <div className="p-8 text-center text-stone-400">
            <CheckCircle2 className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
            <p className="text-xs font-bold text-stone-600">No pending supply requests!</p>
            <p className="text-[11px]">All authorized food items are currently well-stocked in the canteen hub.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-4">Item to Supply</th>
                  <th className="p-4">Stock Left in Canteen</th>
                  <th className="p-4">Requested by Staff</th>
                  <th className="p-4">Staff Note & Reason</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Supplier Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myRestockRequests.map((req) => {
                  const matchingItem = myFoodItems.find(
                    (f) => f.id === req.foodItemId || f.name.toLowerCase() === req.foodItemName.toLowerCase()
                  );
                  const currentStockLeft = matchingItem ? matchingItem.quantity : req.currentStock;

                  return (
                    <tr key={req.id} className="hover:bg-stone-50/70 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-2.5">
                          {matchingItem && (
                            <img
                              src={matchingItem.imageUrl}
                              alt={req.foodItemName}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-bold text-stone-900 text-xs sm:text-sm">
                              {req.foodItemName}
                            </div>
                            <span className="text-[10px] text-stone-400">
                              Requested by {req.requestedBy}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                            currentStockLeft <= 0
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : currentStockLeft <= 10
                              ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          }`}
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>{currentStockLeft} portions left</span>
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <span className="font-black text-sm text-orange-600">
                          {req.requestedQuantity} portions
                        </span>
                      </td>

                      <td className="p-4 text-stone-600 max-w-xs italic text-[11px]">
                        "{req.notes || 'Routine restock requested'}"
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 font-bold text-amber-900 bg-amber-100 px-2.5 py-1 rounded-full text-[10px] animate-pulse">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Needs Supply</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Supplied & Restocked</span>
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        {req.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleQuickFulfill(req.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                              title="Instantly supply portions and restock canteen inventory"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Quick Supply</span>
                            </button>

                            <button
                              onClick={() => handleOpenSupplyModal(matchingItem, req.requestedQuantity)}
                              className="px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-xs transition cursor-pointer flex items-center gap-1"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>Custom Batch</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400">
                            Fulfilled {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
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
              className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
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
                  <div className="flex items-center justify-between mt-1.5 text-xs">
                    <span className="font-black text-stone-800">৳{item.price}</span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.quantity <= 0
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : item.quantity <= 10
                          ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                          : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      }`}
                    >
                      <Package className="w-2.5 h-2.5" />
                      <span>{item.quantity} in canteen stock</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Staff-only Batch No info & Supply Portions */}
              <div className="pt-2 border-t border-stone-200/70 text-xs flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] text-stone-600">
                    <span className="font-medium text-stone-500">Current Batch: </span>
                    <span className="font-mono font-bold text-orange-700 bg-orange-100/80 px-1.5 py-0.5 rounded border border-orange-200 text-[10px]">
                      {item.batchNo || 'No batch set'}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setEditingFoodBatch({
                        id: item.id,
                        name: item.name,
                        currentBatchNo: item.batchNo,
                      });
                      setFoodBatchInput(
                        item.batchNo ||
                          `BATCH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${currentSupplier.code}-01`
                      );
                    }}
                    className="text-[11px] font-bold text-stone-600 hover:text-stone-800 underline cursor-pointer"
                  >
                    Edit Batch
                  </button>
                </div>

                <button
                  onClick={() => handleOpenSupplyModal(item, 50)}
                  className="w-full py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Dispatch Supply for {item.name}</span>
                </button>
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
              Hub food deliveries with dates and batch numbers for canteen staff
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
                <th className="p-4">Delivery Date</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Food Item Supplied</th>
                <th className="p-4">Batch Number</th>
                <th className="p-4">Quantity & Unit</th>
                <th className="p-4">Hub Status</th>
                <th className="p-4">Hub Notes</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {mySupplyBatches.map((batch) => (
                <tr key={batch.id} className="hover:bg-stone-50/70 transition">
                  <td className="p-4 font-medium text-stone-800 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-bold">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{batch.supplyDate || new Date(batch.createdAt).toISOString().slice(0, 10)}</span>
                    </div>
                  </td>
                  <td className="p-4 font-bold text-stone-900 whitespace-nowrap">
                    {currentSupplier.name}
                  </td>
                  <td className="p-4 font-bold text-stone-900">{batch.itemName}</td>
                  <td className="p-4">
                    <span className="font-mono font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded text-[11px] border border-orange-200 inline-block">
                      {batch.batchNo}
                    </span>
                  </td>
                  <td className="p-4 font-semibold text-stone-700 whitespace-nowrap">
                    {batch.quantity} {batch.unit}
                  </td>
                  <td className="p-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full text-[10px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified at Hub
                    </span>
                  </td>
                  <td className="p-4 text-stone-600 max-w-xs italic text-[11px]">
                    {batch.hubNotes || 'Delivered on schedule. Temp & quality verified.'}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => {
                        setEditingBatchRecord({
                          id: batch.id,
                          itemName: batch.itemName,
                          currentBatchNo: batch.batchNo,
                          supplyDate: batch.supplyDate,
                        });
                        setNewBatchNoInput(batch.batchNo);
                        setNewSupplyDateInput(
                          batch.supplyDate || new Date().toISOString().slice(0, 10)
                        );
                      }}
                      className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] border border-orange-200 transition inline-flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Add/Edit Batch No</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 3: Student Reviews Traceability by Food Batch */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-base text-stone-900">
              Student Quality Reviews for {currentSupplier.name}
            </h3>
            <p className="text-xs text-stone-500">
              Customer taste ratings and feedback containing the exact supplied batch numbers
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            {myReviews.length} Reviews
          </span>
        </div>

        {myReviews.length === 0 ? (
          <div className="p-8 text-center text-stone-400 text-xs">
            No student reviews logged for your items yet.
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {myReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/60 transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-stone-900">
                      {rev.foodItemName}
                    </span>
                    <span className="font-mono font-bold text-orange-800 bg-orange-100/90 px-2 py-0.5 rounded text-[10px] border border-orange-200">
                      Batch: {rev.batchNo || 'BATCH-20261002-KK01'}
                    </span>
                  </div>
                  <p className="text-xs text-stone-700 italic">"{rev.comment}"</p>
                  <div className="flex items-center gap-2 text-[10px] text-stone-400">
                    <span>
                      By {rev.studentName} ({rev.studentBatch})
                    </span>
                    <span>•</span>
                    <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-black text-xs shrink-0 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{rev.rating}/5</span>
                </div>
              </div>
            ))}
          </div>
        )}
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
                {/* Select exclusively from existing Catalog Food Items */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Select Catalog Food Item to Supply *
                  </label>
                  <select
                    required
                    value={selectedFoodItemId}
                    onChange={(e) => setSelectedFoodItemId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-stone-900"
                  >
                    <option value="">-- Choose Food from Authorized Catalog --</option>
                    {myFoodItems.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} — ({f.quantity} portions left in canteen stock)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Supply Delivery Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={supplyDate}
                      onChange={(e) => setSupplyDate(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Assign Batch Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. BATCH-20261002-KK01"
                      value={supplyBatchNo}
                      onChange={(e) => setSupplyBatchNo(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold text-stone-800"
                    />
                  </div>
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

                {supplyError && (
                  <div className="p-2.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
                    {supplyError}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowSupplyModal(false)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Confirm Dispatch to Hub
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Batch Number & Delivery Date on Existing Supply Delivery */}
      {editingBatchRecord && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingBatchRecord(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <div className="p-2 rounded-xl bg-orange-600 text-white">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Update Batch Number & Delivery Date
                  </h3>
                  <p className="text-[11px] text-stone-500">{editingBatchRecord.itemName}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={newSupplyDateInput}
                    onChange={(e) => setNewSupplyDateInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-20261002-KK01"
                    value={newBatchNoInput}
                    onChange={(e) => setNewBatchNoInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold text-stone-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-amber-50 text-[11px] text-amber-900 border border-amber-200">
                  <span className="font-bold">Automatic Food Sync:</span> Updating this batch number will also update the linked food item. Only canteen staff can view this batch code.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingBatchRecord(null)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!newBatchNoInput.trim()) return;
                      updateSupplyBatchNo(
                        editingBatchRecord.id,
                        newBatchNoInput.trim(),
                        newSupplyDateInput
                      );
                      setEditingBatchRecord(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Save Batch Number
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Set Batch Number Directly on Food Item */}
      {editingFoodBatch && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setEditingFoodBatch(null)}
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-md rounded-3xl bg-white shadow-2xl border border-stone-200 p-6 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-stone-100">
                <div className="p-2 rounded-xl bg-orange-600 text-white">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900">
                    Set Active Food Batch Number
                  </h3>
                  <p className="text-[11px] text-stone-500">{editingFoodBatch.name}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Batch Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BATCH-20261002-KK01"
                    value={foodBatchInput}
                    onChange={(e) => setFoodBatchInput(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono font-bold text-stone-800"
                  />
                </div>

                <div className="p-3 rounded-xl bg-stone-100 text-[11px] text-stone-700 border border-stone-200">
                  <span className="font-bold">Staff-only Batch Code:</span> This batch number will be linked with the food item and its reviews. Students cannot see this code on the menu cards.
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingFoodBatch(null)}
                    className="px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-100 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!foodBatchInput.trim()) return;
                      updateFoodBatchNo(editingFoodBatch.id, foodBatchInput.trim());
                      setEditingFoodBatch(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    Save Batch to Food
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
