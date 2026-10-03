import React from 'react';
import { useApp } from '../context/AppContext';
import { KhabarKoiLogo } from './KhabarKoiLogo';
import {
  ShoppingBag,
  Tv,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  User as UserIcon,
  Store,
  ShieldCheck,
  ChefHat,
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenCart: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenCart,
}) => {
  const { currentUser, cartCount, logout } = useApp();

  const getRoleBadge = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'student':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-200">
            <UserIcon className="w-3.5 h-3.5 text-orange-600" />
            <span>Student</span>
          </span>
        );
      case 'employee':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ChefHat className="w-3.5 h-3.5 text-emerald-600" />
            <span>Canteen Staff Station</span>
          </span>
        );
      case 'supplier':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <Store className="w-3.5 h-3.5 text-blue-600" />
            <span>Authorized Supplier</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Canteen Authority</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Real Logo in Light Mode */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('home')}
              className="text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
            >
              <KhabarKoiLogo variant="light" size="md" showTagline={true} layout="horizontal" />
            </button>

            {/* Top Menu Bar */}
            <nav className="hidden md:flex items-center bg-stone-100/90 p-1 rounded-2xl border border-stone-200/80 text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setCurrentTab('home')}
                className={`px-4 py-2 rounded-xl transition-all ${
                  currentTab === 'home'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {currentUser?.role === 'student' && 'Food Menu'}
                {currentUser?.role === 'employee' && 'Kitchen Order Queue'}
                {currentUser?.role === 'supplier' && 'My Supply Catalog'}
                {currentUser?.role === 'admin' && 'Authority Dashboard'}
              </button>

              {/* Student specific: My Orders */}
              {currentUser?.role === 'student' && (
                <button
                  onClick={() => setCurrentTab('my-orders')}
                  className={`px-4 py-2 rounded-xl transition-all ${
                    currentTab === 'my-orders'
                      ? 'bg-white text-stone-900 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  My Orders & Token
                </button>
              )}

              {/* Employee & Admin: Penalty Registry */}
              {(currentUser?.role === 'employee' || currentUser?.role === 'admin') && (
                <button
                  onClick={() => setCurrentTab('penalties')}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${
                    currentTab === 'penalties'
                      ? 'bg-white text-rose-700 shadow-xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                  <span>Penalty Registry</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Actions: Strikes, Cart, User Profile, Logout */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Student Strike Indicator */}
            {currentUser?.role === 'student' && (
              <div className="hidden sm:flex items-center">
                {currentUser.isSuspended ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                    <span>3/3 STRIKES (SUSPENDED)</span>
                  </div>
                ) : currentUser.strikes > 0 ? (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>{currentUser.strikes}/3 Strikes</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Good Standing</span>
                  </div>
                )}
              </div>
            )}

            {/* Cart Trigger (Students only) */}
            {currentUser?.role === 'student' && (
              <button
                onClick={onOpenCart}
                className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 transition font-bold text-xs sm:text-sm"
              >
                <ShoppingBag className="w-4 h-4 text-orange-600" />
                <span className="hidden sm:inline">Tray</span>
                {cartCount > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-black text-white bg-orange-600 rounded-full animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Role Badge & Profile */}
            <div className="hidden lg:flex items-center">{getRoleBadge()}</div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Sign Out"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-600 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
