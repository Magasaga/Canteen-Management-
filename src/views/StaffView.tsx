import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'queue' | 'penalties'>('queue');
  const [searchToken, setSearchToken] = useState<string>('');
  const [disciplinaryOrder, setDisciplinaryOrder] = useState<Order | null>(null);

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

  // Suspended students count
  const suspendedStudents = users.filter((u) => u.isSuspended);

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
            Main Canteen Kitchen & Fast-Delivery Queue
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1 max-w-xl">
            Single counter fast-delivery hub: advance cooking tokens, trigger the rapid dispatch chime,
            and complete orders delivered to students within minutes.
          </p>
        </div>

        {/* Quick Tabs: Kitchen Queue vs Penalties */}
        <div className="flex flex-wrap items-center gap-2 bg-stone-800 p-1.5 rounded-2xl border border-stone-700">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'queue'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>Kitchen Queue ({activeOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('penalties')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
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

          {/* 2-Columns: Fast-Delivery Dispatched vs Cooking in Kitchen */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section 1: READY / DISPATCHED FOR FAST DELIVERY */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
                    Dispatched for Fast Delivery ({readyOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Delivering in a few minutes</span>
              </div>

              {readyOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400">
                  <CheckCircle className="w-10 h-10 mx-auto mb-2 opacity-30 text-emerald-600" />
                  <p className="text-xs font-bold text-stone-600">No pending deliveries!</p>
                  <p className="text-[11px]">All ready meals have been dispatched and delivered.</p>
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
                        className="p-5 rounded-3xl bg-white border-2 border-emerald-500/70 shadow-sm space-y-3 transition hover:shadow-md"
                      >
                        {/* Token Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                              Order Token
                            </span>
                            <span className="text-3xl font-black text-stone-900 tracking-tight">
                              {ord.tokenNumber}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800">
                              <Bell className="w-3.5 h-3.5 text-emerald-600 animate-bounce" />
                              Fast Delivery Out
                            </span>
                            <span className="block text-[10px] text-stone-400 mt-1">
                              Slot: {ord.batchTime}
                            </span>
                          </div>
                        </div>

                        {/* Student Details & Phone Number */}
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 text-xs space-y-1.5">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 font-bold text-stone-900 text-xs">
                                <User className="w-3.5 h-3.5 text-stone-600" />
                                <span>{ord.studentName}</span>
                                <span className="text-[11px] font-medium text-stone-500">
                                  ({ord.studentBatch})
                                </span>
                              </div>
                              <div className="flex items-center gap-3 mt-1 text-[11px]">
                                <a
                                  href={`tel:${studentPhone}`}
                                  className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition"
                                  title="Student Contact Number"
                                >
                                  <Phone className="w-3 h-3 text-emerald-600" />
                                  <span>{studentPhone}</span>
                                </a>
                                {studentIdNo && (
                                  <span className="text-stone-500 font-medium">
                                    ID: <strong className="text-stone-700">{studentIdNo}</strong>
                                  </span>
                                )}
                              </div>
                            </div>
                            {studentStrikes > 0 && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                                {studentStrikes}/3 Strikes
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px] pt-1 border-t border-stone-200/60">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>Main Canteen Counter</span>
                          </div>
                        </div>

                        {/* Items with Staff-only Internal Batch No */}
                        <div className="text-xs text-stone-600 font-medium space-y-1">
                          {ord.items.map((item, idx) => {
                            const food = foodItems.find((f) => f.id === item.foodItemId);
                            const batchCode = food?.batchNo || item.batchNo;
                            return (
                              <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-stone-800">
                                    {item.quantity}x {item.name}
                                  </span>
                                  {batchCode && (
                                    <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-100/90 px-1.5 py-0.5 rounded border border-orange-200">
                                      Batch: {batchCode}
                                    </span>
                                  )}
                                </div>
                                <span className="font-semibold text-stone-800">
                                  ৳{item.price * item.quantity}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Payment & Action Buttons */}
                        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="text-xs font-bold">
                            {ord.paymentMethod === 'online' ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Paid Online (৳{ord.totalAmount})</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                                <Banknote className="w-3.5 h-3.5" />
                                <span>Cash on Delivery (Collect ৳{ord.totalAmount})</span>
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Mark Delivered */}
                            <button
                              onClick={() => markOrderCollected(ord.id)}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Delivered to Student</span>
                            </button>

                            {/* Mark Unclaimed / Disciplinary Strike */}
                            <button
                              onClick={() => setDisciplinaryOrder(ord)}
                              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition"
                              title="Flag Unclaimed / Student Not Present"
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: PREPARING IN KITCHEN */}
            <div className="lg:col-span-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h2 className="text-base font-black text-stone-900 uppercase tracking-wide">
                    Now Cooking / In Prep ({kitchenOrders.length})
                  </h2>
                </div>
                <span className="text-xs text-stone-500">Order ticket queue</span>
              </div>

              {kitchenOrders.length === 0 ? (
                <div className="p-8 rounded-3xl bg-white border border-stone-200 text-center text-stone-400">
                  <Clock className="w-10 h-10 mx-auto mb-2 opacity-30 text-amber-600" />
                  <p className="text-xs font-bold text-stone-600">Kitchen tickets all clear!</p>
                  <p className="text-[11px]">Incoming student orders will appear here automatically.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {kitchenOrders.map((ord) => {
                    const student = users.find((u) => u.id === ord.studentId);
                    const studentPhone = ord.studentPhone || student?.phone || '+880 1712-345678';
                    const studentIdNo = student?.studentId;

                    return (
                      <div
                        key={ord.id}
                        className="p-4 rounded-3xl bg-white border border-stone-200/90 shadow-2xs space-y-3 hover:border-amber-400 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-black text-stone-900">
                                {ord.tokenNumber}
                              </span>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800">
                                <User className="w-3.5 h-3.5 text-stone-500" />
                                <span>{ord.studentName}</span>
                              </div>
                            </div>

                            {/* Student Phone Number & ID */}
                            <div className="flex items-center gap-2.5 mt-1">
                              <a
                                href={`tel:${studentPhone}`}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md hover:bg-emerald-100 transition"
                                title="Call student"
                              >
                                <Phone className="w-3 h-3 text-emerald-600" />
                                <span>{studentPhone}</span>
                              </a>
                              {studentIdNo && (
                                <span className="text-[11px] text-stone-500 font-medium">
                                  ID: <strong className="text-stone-700">{studentIdNo}</strong>
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 block mt-0.5">Main Canteen Counter</span>
                          </div>

                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                            {ord.status === 'placed' ? 'New Order' : 'On Stove / Grill'}
                          </span>
                        </div>

                        {/* Items with Staff-only Internal Batch No */}
                        <div className="p-3 rounded-xl bg-stone-50 border border-stone-100 text-xs space-y-1.5 font-medium text-stone-700">
                          {ord.items.map((i, idx) => {
                            const food = foodItems.find((f) => f.id === i.foodItemId);
                            const batchCode = food?.batchNo || i.batchNo;
                            return (
                              <div key={idx} className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-stone-800">
                                    {i.quantity}x {i.name}
                                  </span>
                                  {batchCode && (
                                    <span className="text-[10px] font-mono font-bold text-orange-800 bg-orange-100/90 px-1.5 py-0.5 rounded border border-orange-200">
                                      Batch: {batchCode}
                                    </span>
                                  )}
                                </div>
                                <span className="text-stone-500">৳{i.price * i.quantity}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Advance Actions */}
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[11px] font-bold text-stone-500">
                            {ord.batchTime}
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

                            {/* Sound Fast Delivery Chime & Dispatch */}
                            <button
                              onClick={() => handleMarkReady(ord.id)}
                              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <Bell className="w-3.5 h-3.5" />
                              <span>Dispatch Fast Delivery (Chime)</span>
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

      {/* TAB 2: PENALTIES & UNCLAIMED FOOD VIOLATION REGISTRY */}
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
                      <div className="font-black text-sm text-white">{std.name}</div>
                      <div className="text-[11px] text-rose-200 font-medium">
                        ID: {std.studentId} · {std.batch}
                      </div>
                      <div className="text-[11px] text-white/90 mt-1">
                        Suspension active until: {new Date(std.suspendedUntil || '').toLocaleDateString()}
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
