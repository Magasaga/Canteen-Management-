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
  const [batchTime, setBatchTime] = useState<string>('12:30 PM - 1:15 PM (Lunch Rush)');
  const [pickupCounter, setPickupCounter] = useState<string>('Main Canteen Hub (Counter A/B)');
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

  const vat = Math.round(cartTotal * 0.05); // 5% campus tax/service fee
  const grandTotal = cartTotal + vat;

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
              {/* Batch Time & Pickup Slot */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-orange-600" />
                  <span>Meal Pickup Batch Time</span>
                </label>
                <select
                  value={batchTime}
                  onChange={(e) => setBatchTime(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="11:45 AM - 12:30 PM (Morning Slot)">11:45 AM - 12:30 PM (Morning Slot)</option>
                  <option value="12:30 PM - 1:15 PM (Lunch Rush)">12:30 PM - 1:15 PM (Lunch Rush)</option>
                  <option value="1:15 PM - 2:00 PM (Afternoon Batch)">1:15 PM - 2:00 PM (Afternoon Batch)</option>
                  <option value="2:30 PM - 3:30 PM (Snacks & Tea)">2:30 PM - 3:30 PM (Snacks & Tea)</option>
                </select>
              </div>

              {/* Pickup Counter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Serving Station (Main Canteen Hub)</span>
                </label>
                <select
                  value={pickupCounter}
                  onChange={(e) => setPickupCounter(e.target.value)}
                  className="w-full text-xs font-medium bg-white border border-stone-300 rounded-lg px-3 py-2 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="Main Canteen Hub (Counter A - Heavy Meals & Rice)">
                    Counter A: Heavy Meals & Rice (Khans & Olympia)
                  </option>
                  <option value="Main Canteen Hub (Counter B - Fast Food & Fry Station)">
                    Counter B: CP Chicken & Burgers
                  </option>
                  <option value="Express Cafe Counter (Brew Cafe & Aarong Chiller)">
                    Express Counter C: Brew Cafe & Aarong Dairy
                  </option>
                </select>
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
                    Hand cash directly to the cashier at the pickup counter when your token is called.
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-1 text-xs pt-2 border-t border-stone-200">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>৳{cartTotal}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Campus Service Fee & VAT (5%)</span>
                  <span>৳{vat}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-stone-900 pt-1">
                  <span>Grand Total</span>
                  <span className="text-orange-600">৳{grandTotal}</span>
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
                className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generating Token...</span>
                ) : (
                  <>
                    <span>Confirm & Generate Token</span>
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
