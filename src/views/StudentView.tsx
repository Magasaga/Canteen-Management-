import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import { ReviewModal } from '../components/ReviewModal';
import {
  Search,
  Plus,
  Clock,
  Star,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Coffee,
  Flame,
  Utensils,
  Milk,
  GlassWater,
  ChefHat,
  MessageSquare,
  ShieldAlert,
  Award,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface StudentViewProps {
  onOpenCart: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ onOpenCart }) => {
  const { foodItems, addToCart, currentUser, orders, reviews } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reviewModalItem, setReviewModalItem] = useState<FoodItem | null>(null);
  const [isTopListExpanded, setIsTopListExpanded] = useState<boolean>(false);

  // Compute Food of the Day & Top Rated List dynamically from student reviews & ratings
  const topRatedFoods = [...foodItems].sort((a, b) => b.rating - a.rating).slice(0, 5);
  const bestFoodOfDay = topRatedFoods[0];
  const bestFoodReview = reviews.find((r) => r.foodItemId === bestFoodOfDay?.id);

  // Filter items
  const filteredItems = foodItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      item.category.toLowerCase().replace(/\s+/g, '_') === selectedCategory ||
      (selectedCategory === 'heavy_meals' && item.category === 'Heavy Meals') ||
      (selectedCategory === 'cafe' && item.category === 'Cafe') ||
      (selectedCategory === 'fast_food' && item.category === 'Fast Food') ||
      (selectedCategory === 'chicken' && item.category === 'Chicken') ||
      (selectedCategory === 'milk_dairy' && item.category === 'Milk & Dairy') ||
      (selectedCategory === 'beverages' && item.category === 'Beverages');

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Current student's active orders
  const myActiveOrders = orders.filter(
    (o) =>
      o.studentId === currentUser?.id &&
      (o.status === 'placed' || o.status === 'preparing' || o.status === 'ready_for_pickup')
  );

  const categories = [
    { id: 'all', label: 'All Items', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { id: 'cafe', label: 'Brew Cafe', icon: <Coffee className="w-3.5 h-3.5" /> },
    { id: 'heavy_meals', label: 'Biryani & Rice (Khans/Olympia)', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'fast_food', label: 'Burgers & Fries', icon: <Utensils className="w-3.5 h-3.5" /> },
    { id: 'chicken', label: 'CP 5-Star Chicken Only', icon: <ChefHat className="w-3.5 h-3.5" /> },
    { id: 'milk_dairy', label: 'Aarong Dairy & Laban', icon: <Milk className="w-3.5 h-3.5" /> },
    { id: 'beverages', label: 'Cold Drinks', icon: <GlassWater className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
      {/* Minimalist Slim Active Token Bar */}
      {myActiveOrders.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 rounded-2xl bg-stone-900 text-white shadow-xs border border-stone-800 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping shrink-0" />
            <span className="text-[11px] font-black uppercase tracking-wider text-orange-400">
              Active Token:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {myActiveOrders.map((ord) => (
                <span
                  key={ord.id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold ${
                    ord.status === 'ready_for_pickup'
                      ? 'bg-emerald-600 text-white animate-pulse shadow-xs'
                      : 'bg-stone-800 text-stone-200 border border-stone-700'
                  }`}
                >
                  <span>#{ord.tokenNumber}</span>
                  <span className="text-[10px] font-semibold opacity-90">
                    {ord.status === 'ready_for_pickup'
                      ? 'Fast Delivery Dispatched'
                      : 'Cooking in Kitchen'}
                  </span>
                </span>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-stone-400 hidden sm:block">
            Fast delivery in a few minutes after ordering
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TOP FOOD OF THE DAY: Much Smaller, Compact & Expandable List              */}
      {/* ========================================================================= */}
      {bestFoodOfDay && (
        <div className="rounded-2xl bg-white border border-stone-200 shadow-2xs overflow-hidden transition-all duration-300">
          {/* Compact Top Bar */}
          <div className="p-3 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-white uppercase tracking-wider shrink-0 shadow-2xs">
                <Award className="w-3 h-3" />
                <span>Best Food of the Day</span>
              </span>

              {/* Small 36x36 photo thumbnail */}
              <img
                src={bestFoodOfDay.imageUrl}
                alt={bestFoodOfDay.name}
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                }}
                className="w-9 h-9 rounded-xl object-cover border border-stone-200 shrink-0"
              />

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                    {bestFoodOfDay.name}
                  </span>
                  <div className="flex items-center text-amber-500 text-xs font-black shrink-0">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    <span className="ml-0.5">{bestFoodOfDay.rating.toFixed(1)}</span>
                  </div>
                </div>
                <span className="text-[10px] text-stone-400 hidden sm:inline">
                  {bestFoodOfDay.supplierName} · Top rated by student reviews
                </span>
              </div>
            </div>

            {/* Actions: Price, Order & Expand List Toggle */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs sm:text-sm font-black text-stone-900">৳{bestFoodOfDay.price}</span>

              <button
                onClick={() => addToCart(bestFoodOfDay, 1)}
                disabled={!bestFoodOfDay.isAvailable || currentUser?.isSuspended}
                className="px-2.5 py-1 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Order</span>
              </button>

              <button
                onClick={() => setIsTopListExpanded(!isTopListExpanded)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs transition"
                title="Expand Top Rated Foods List"
              >
                <span>{isTopListExpanded ? 'Hide' : 'Top List'}</span>
                {isTopListExpanded ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Expandable Top 5 Rated Food List */}
          {isTopListExpanded && (
            <div className="border-t border-stone-100 bg-stone-50/70 p-3 sm:p-4 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider px-1">
                <span>Top Rated by Campus Students</span>
                <span>Sorted by Star Rating</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {topRatedFoods.map((item, index) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white border border-stone-200/90 shadow-2xs gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        index === 0
                          ? 'bg-amber-400 text-amber-950'
                          : index === 1
                          ? 'bg-stone-300 text-stone-800'
                          : index === 2
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {index + 1}
                      </span>
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                        }}
                        className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-stone-900 truncate">{item.name}</div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                          <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                          <span>{item.rating.toFixed(1)}</span>
                          <span className="text-stone-400 font-normal">({item.reviewCount})</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs font-black text-stone-900">৳{item.price}</span>
                      <button
                        onClick={() => addToCart(item, 1)}
                        disabled={!item.isAvailable || currentUser?.isSuspended}
                        className="p-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white transition disabled:opacity-50"
                        title="Add to Tray"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Verified Student Quote for the #1 Item */}
              {bestFoodReview && (
                <div className="mt-2 p-2 rounded-xl bg-white border border-amber-200/80 text-[11px] text-stone-600 flex items-center gap-2">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 shrink-0" />
                  <span className="italic truncate">
                    "{bestFoodReview.comment}" — <strong className="font-semibold">{bestFoodReview.studentName}</strong>
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search & Category Filter Navigation */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Kacchi, Cappuccino, CP Fried Chicken, Laban..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-2xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
            />
          </div>

          <span className="text-xs text-stone-500 font-medium">
            Showing {filteredItems.length} menu items
          </span>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 hover:border-stone-300'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Food Items Catalog: Much smaller picture cards (Compact & Clean) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-16 text-center text-stone-400">
            <Utensils className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p className="font-bold text-stone-600">No food items found matching your filter</p>
            <p className="text-xs">Try selecting another category or clear search</p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isBest = item.id === bestFoodOfDay?.id;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl border p-3 shadow-2xs hover:shadow-md transition-all flex items-center gap-3.5 group relative ${
                  isBest
                    ? 'border-amber-300 bg-amber-50/20'
                    : 'border-stone-200/90'
                }`}
              >
                {/* MUCH SMALLER PICTURE: compact 72x72px thumbnail */}
                <div className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-stone-100 border border-stone-200">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=300&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute bottom-1 right-1">
                    <span className="flex items-center gap-0.5 px-1 py-0.2 rounded text-[9px] font-bold bg-black/75 text-white backdrop-blur-xs">
                      <Clock className="w-2.5 h-2.5 text-orange-400" />
                      <span>{item.prepTimeMinutes}m</span>
                    </span>
                  </div>
                </div>

                {/* Content & Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-wide text-orange-600 truncate">
                        {item.supplierName}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-500">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{item.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-stone-900 truncate mt-0.5 group-hover:text-orange-600 transition">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 leading-snug">
                      {item.description}
                    </p>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-stone-100">
                    <span className="text-sm font-black text-stone-900">৳{item.price}</span>

                    <div className="flex items-center gap-1.5">
                      {/* Review Modal Trigger */}
                      <button
                        onClick={() => setReviewModalItem(item)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-orange-600 hover:bg-orange-50 border border-stone-200 transition"
                        title="Rate & Review with Batch Time"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>

                      {/* Add to Tray */}
                      <button
                        onClick={() => addToCart(item, 1)}
                        disabled={!item.isAvailable || currentUser?.isSuspended}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-2xs transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Student Reviews Feed with Batch Times */}
      <div className="pt-6 border-t border-stone-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-base font-black text-stone-900 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Student Batch Review Log</span>
            </h2>
            <p className="text-xs text-stone-500">
              Every review records serving batch time and student academic batch.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between text-xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3 h-3 ${
                          s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-stone-900 truncate">{rev.foodItemName}</h4>
                <p className="text-[11px] text-stone-600 mt-1 italic line-clamp-2 leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>

              <div className="pt-2 border-t border-stone-100 text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-stone-800 font-semibold">
                  <span>{rev.studentName}</span>
                  <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold text-[9px]">
                    Verified Student
                  </span>
                </div>
                <div className="flex items-center justify-between text-stone-500 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5 text-stone-400" />
                    <span>{rev.batchTime}</span>
                  </div>
                  {rev.batchNo && (
                    <span className="font-mono font-bold text-orange-800 bg-orange-100/90 px-1.5 py-0.5 rounded text-[9px] border border-orange-200">
                      Batch: {rev.batchNo}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalItem && (
        <ReviewModal
          foodItem={reviewModalItem}
          isOpen={!!reviewModalItem}
          onClose={() => setReviewModalItem(null)}
        />
      )}
    </div>
  );
};
