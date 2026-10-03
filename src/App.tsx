import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { NotificationBanner } from './components/NotificationBanner';
import { CartDrawer } from './components/CartDrawer';
import { LoginView } from './views/LoginView';
import { StudentView } from './views/StudentView';
import { StaffView } from './views/StaffView';
import { SupplierView } from './views/SupplierView';
import { AdminView } from './views/AdminView';
import { MyOrdersView } from './views/MyOrdersView';

function AppContent() {
  const { currentUser } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  // If not logged in, render the clean Student Login / Create Account page
  // (with the top 3-bar hamburger for authorized Staff, Suppliers, and Admin)
  if (!currentUser) {
    return <LoginView onSuccess={() => setCurrentTab('home')} />;
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-orange-500 selection:text-white">
      {/* Real-time Notification Banner for Fast Delivery & Strikes */}
      <NotificationBanner />

      {/* Clean Professional Navbar with Bar-style Top Menu */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">
        {currentTab === 'my-orders' && currentUser.role === 'student' ? (
          <MyOrdersView />
        ) : (
          <>
            {currentUser.role === 'student' && (
              <StudentView onOpenCart={() => setIsCartOpen(true)} />
            )}

            {currentUser.role === 'employee' && <StaffView />}

            {currentUser.role === 'supplier' && <SupplierView />}

            {currentUser.role === 'admin' && <AdminView />}
          </>
        )}
      </main>

      {/* Cart Drawer for Students */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={() => {
          setCurrentTab('my-orders');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
