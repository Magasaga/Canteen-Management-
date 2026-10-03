import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem, Order } from '../types';
import { ReviewModal } from '../components/ReviewModal';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  Bell,
  MessageSquare,
  CreditCard,
  Banknote,
  MapPin,
  Utensils,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const MyOrdersView: React.FC = () => {
  const { orders, currentUser, foodItems } = useApp();
  const [selectedItemToReview, setSelectedItemToReview] = useState<FoodItem | null>(null);

  const myOrders = orders.filter((o) => o.studentId === currentUser?.id);

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'placed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Order Placed
          </span>
        );
      case 'preparing':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            Preparing in Kitchen
          </span>
        );
      case 'ready_for_pickup':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-stone-950 uppercase tracking-wider animate-pulse flex items-center gap-1 shadow-sm">
            <Bell className="w-3.5 h-3.5" />
            Fast Delivery Out!
          </span>
        );
      case 'collected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-200">
            Delivered
          </span>
        );
      case 'unclaimed':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            Unclaimed (Violation)
          </span>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200">
        <div>
          <h1 className="text-2xl font-black text-stone-900">My Canteen Orders & Tokens</h1>
          <p className="text-xs text-stone-500">
            Account: {currentUser?.name} ({currentUser?.batch || 'Student'})
          </p>
        </div>

        {currentUser && currentUser.strikes > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <span>Strikes on Record: {currentUser.strikes}/3</span>
          </div>
        )}
      </div>

      {myOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-stone-200 text-stone-400">
          <Utensils className="w-12 h-12 mx-auto mb-2 opacity-30 text-orange-500" />
          <h3 className="font-bold text-stone-700">No orders yet</h3>
          <p className="text-xs mt-1">Head to the food menu to order biryani, coffee, or snacks!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => (
            <div
              key={order.id}
              className={`p-5 sm:p-6 rounded-3xl bg-white border transition shadow-xs ${
                order.status === 'ready_for_pickup'
                  ? 'border-2 border-emerald-500 shadow-emerald-500/10'
                  : order.status === 'unclaimed'
                  ? 'border-rose-200 bg-rose-50/20'
                  : 'border-stone-200/90'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex flex-col items-center justify-center">
                    <span className="text-[10px] font-black uppercase text-orange-600">Token</span>
                    <span className="text-lg font-black text-orange-600 leading-none">
                      {order.tokenNumber.replace('KK-', '')}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-base text-stone-900">
                        Token #{order.tokenNumber}
                      </span>
                      {getStatusBadge(order.status)}
                    </div>
                    <span className="text-xs text-stone-400 mt-0.5 block">
                      Ordered {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {order.batchTime}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-lg font-black text-stone-900 block">৳{order.totalAmount}</span>
                  <span className="text-[11px] font-bold text-stone-500">
                    {order.paymentMethod === 'online' ? 'Online Paid' : 'Pay on Hub (Cash)'}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="py-3 space-y-1.5 text-xs text-stone-700">
                {order.items.map((item, idx) => {
                  const targetFood = foodItems.find((f) => f.id === item.foodItemId);
                  return (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="font-semibold text-stone-800">
                        {item.quantity}x {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-stone-500">৳{item.price * item.quantity}</span>
                        {targetFood && order.status === 'collected' && (
                          <button
                            onClick={() => setSelectedItemToReview(targetFood)}
                            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1"
                          >
                            <MessageSquare className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Location & Notes */}
              <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-stone-600">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-stone-800">{order.pickupCounter || 'Main Canteen Counter'}</span>
                </div>

                {order.unclaimedNote && (
                  <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-medium">
                    Violation Note: "{order.unclaimedNote}"
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {selectedItemToReview && (
        <ReviewModal
          foodItem={selectedItemToReview}
          isOpen={!!selectedItemToReview}
          onClose={() => setSelectedItemToReview(null)}
        />
      )}
    </div>
  );
};
