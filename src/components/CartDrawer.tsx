import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PaymentMethod } from '../types';
import {
  X,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  Clock,
  MapPin,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (tokenNumber: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const { cart, cartTotal, removeFromCart, updateCartQuantity, placeOrder, currentUser, clearCart } =
    useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online');
  const [onlineProvider, setOnlineProvider] = useState<'bkash' | 'nagad' | 'student_wallet'>('bkash');
  const [batchTime, setBatchTime] = useState<string>('Fast Delivery (5-10 Mins)');
  const [pickupCounter] = useState<string>('Main Canteen Counter');
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setOrderError(null);

    if (currentUser?.isSuspended) {
      setOrderError(
        `Your account is suspended until ${new Date(
          currentUser.suspendedUntil || ''
        ).toLocaleDateString()} due to 3 unclaimed orders. You cannot place orders.`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = placeOrder({
        paymentMethod,
        batchTime,
        pickupCounter,
      });

      setIsSubmitting(false);

      if (res.success && res.order) {
        try {
          confetti({
            particleCount: 60,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {
          // ignore
        }
        onOrderSuccess(res.order.tokenNumber);
        onClose();
      } else {
        setOrderError(res.error || 'Could not place order');
      }
    }, 450);
  };

  const grandTotal = cartTotal; // VAT / Tax removed as requested

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
            <div>
              <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                <span>Your Canteen Tray</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">Fast delivery via Canteen Hub Pickup</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-200/60 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Strike Warning if any */}
          {currentUser && currentUser.strikes > 0 && !currentUser.isSuspended && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-2.5 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Notice ({currentUser.strikes}/3 Strikes):</span> Please collect
                your food within 15 minutes of token announcement. 3 unclaimed orders result in a 1-week
                canteen suspension.
              </div>
            </div>
          )}

          {/* Suspended Alert */}
          {currentUser?.isSuspended && (
            <div className="mx-5 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-2.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Ordering Blocked (Suspended):</span> You reached 3 strikes for
                unclaimed meals. Suspension ends{' '}
                {new Date(currentUser.suspendedUntil || '').toLocaleDateString()}.
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
            {cart.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-400">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-stone-700">Your Tray is Empty</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto">
                  Browse delicious meals from Brew Cafe, Khans Kitchen, CP Five Star, Aarong & more!
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.foodItem.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-stone-200/80 bg-stone-50/50 hover:bg-stone-50 transition"
                >
                  <img
                    src={item.foodItem.imageUrl}
                    alt={item.foodItem.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                    }}
                    className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                      {item.foodItem.name}
                    </h4>
                    <p className="text-[11px] text-stone-500 font-medium">
                      ৳{item.foodItem.price} · {item.foodItem.supplierName}
                    </p>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center border border-stone-300 rounded-lg bg-white shadow-2xs">
                        <button
                          onClick={() => updateCartQuantity(item.foodItem.id, item.quantity - 1)}
                          className="p-1 text-stone-600 hover:text-stone-900 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-stone-800">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.foodItem.id, item.quantity + 1)}
                          className="p-1 text-stone-600 hover:text-stone-900 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.foodItem.id)}
                        className="text-stone-400 hover:text-rose-500 p-1 transition"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-black text-xs sm:text-sm text-stone-900">
                      ৳{item.foodItem.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Checkout Configuration & Payment */}
          {cart.length > 0 && (
            <div className="border-t border-stone-200 p-5 bg-stone-50/70 space-y-4">
              {/* Fast-Delivery Timing */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Fast Delivery Timing (Arrives in Few Minutes)</span>
                </label>
                <select
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Fast Delivery (5-10 Mins)">Fast Delivery (5-10 Mins)</option>
                  <option value="12:30 PM - 1:00 PM (Lunch Slot)">12:30 PM - 1:00 PM (Lunch Slot)</option>
                  <option value="1:15 PM - 1:45 PM (Afternoon Slot)">1:15 PM - 1:45 PM (Afternoon Slot)</option>
                  <option value="2:30 PM - 3:15 PM (Snacks & Tea)">2:30 PM - 3:15 PM (Snacks & Tea)</option>
                </select>
              </div>

              {/* Single Dedicated Counter (No Other Counters) */}
              <div className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-bold text-stone-800">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>Counter: Main Canteen Counter</span>
                </div>
                <span className="text-[10px] font-black uppercase text-orange-700 bg-white px-2 py-0.5 rounded-full border border-orange-200">
                  Single Counter Hub
                </span>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700">Choose Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                      paymentMethod === 'online'
                        ? 'border-orange-500 bg-orange-50/80 text-orange-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-orange-600" />
                    <span>Pay Now (Online)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('hub_cash')}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-1 text-xs font-bold transition ${
                      paymentMethod === 'hub_cash'
                        ? 'border-orange-500 bg-orange-50/80 text-orange-900 shadow-xs'
                        : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                    }`}
                  >
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Pay on Hub (Cash)</span>
                  </button>
                </div>

                {/* Online Options */}
                {paymentMethod === 'online' && (
                  <div className="p-2.5 rounded-lg bg-white border border-stone-200 space-y-1.5 animate-in fade-in">
                    <span className="text-[11px] font-semibold text-stone-600 block">Instant Gateway:</span>
                    <div className="grid grid-cols-3 gap-1.5 text-xs font-semibold">
                      <button
                        type="button"
                        onClick={() => setOnlineProvider('bkash')}
                        className={`py-1.5 px-2 rounded-md border text-center transition ${
                          onlineProvider === 'bkash'
                            ? 'bg-pink-50 border-pink-500 text-pink-700 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        bKash
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnlineProvider('nagad')}
                        className={`py-1.5 px-2 rounded-md border text-center transition ${
                          onlineProvider === 'nagad'
                            ? 'bg-amber-50 border-amber-500 text-amber-700 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        Nagad
                      </button>
                      <button
                        type="button"
                        onClick={() => setOnlineProvider('student_wallet')}
                        className={`py-1.5 px-2 rounded-md border text-center transition ${
                          onlineProvider === 'student_wallet'
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold'
                            : 'border-stone-200 text-stone-600'
                        }`}
                      >
                        Card / ID
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'hub_cash' && (
                  <p className="text-[11px] text-stone-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                    Pay cash upon fast delivery at your table/seat or at the Main Canteen Counter.
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs pt-2 border-t border-stone-200">
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1">
                  <span>Total Payable</span>
                  <span className="text-orange-600 font-black">৳{grandTotal}</span>
                </div>
              </div>

              {orderError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                  {orderError}
                </div>
              )}

              {/* Checkout Button */}
              <button
                disabled={isSubmitting || currentUser?.isSuspended}
                onClick={handleCheckout}
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Dispatching Order...</span>
                ) : (
                  <>
                    <span>Place Fast-Delivery Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
