import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { KhabarKoiLogo } from './../components/KhabarKoiLogo';
import {
  Menu,
  X,
  User as UserIcon,
  ChefHat,
  Store,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Mail,
  Lock,
  Sparkles,
  UserPlus,
  BookOpen,
  Building2,
} from 'lucide-react';

interface LoginViewProps {
  onSuccess: () => void;
}

type PortalType = 'student' | 'staff' | 'supplier' | 'admin';

export const LoginView: React.FC<LoginViewProps> = ({ onSuccess }) => {
  const { loginAs, registerStudent, users, suppliers } = useApp();

  // Active portal: 'student' | 'staff' | 'supplier' | 'admin'
  const [activePortal, setActivePortal] = useState<PortalType>('student');

  // Student sub-mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');

  // Other portals modal
  const [showOtherPortalsModal, setShowOtherPortalsModal] = useState(false);

  // Student Sign In State
  const [studentEmail, setStudentEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Student Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regStudentId, setRegStudentId] = useState('');
  const [regDept, setRegDept] = useState('Computer Science & Engineering');
  const [regBatch, setRegBatch] = useState('');
  const [regPhone, setRegPhone] = useState('+880 17');
  const [regError, setRegError] = useState<string | null>(null);

  // Staff Login State
  const [staffEmail, setStaffEmail] = useState('ratul.staff@campus.ac.bd');
  const [staffPin, setStaffPin] = useState('••••••');

  // Supplier Login State
  const [selectedSupplierId, setSelectedSupplierId] = useState('cp-five-star');
  const [supplierPin, setSupplierPin] = useState('••••••');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('shahriar.admin@campus.ac.bd');
  const [adminKey, setAdminKey] = useState('••••••');

  // 1. Student Submit
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const found = users.find(
      (u) =>
        u.role === 'student' &&
        (u.email.toLowerCase() === studentEmail.trim().toLowerCase() ||
          (u.studentId && u.studentId === studentEmail.trim()))
    );

    if (found) {
      loginAs('student', found.id);
      onSuccess();
    } else {
      const fallback = users.find((u) => u.role === 'student');
      if (fallback) {
        loginAs('student', fallback.id);
        onSuccess();
      } else {
        setLoginError('Student account not found. Please create a new account below.');
      }
    }
  };

  // 2. Student Register Submit
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    if (!regName.trim() || !regEmail.trim() || !regStudentId.trim()) {
      setRegError('Please fill in all required campus credentials.');
      return;
    }

    const res = registerStudent({
      name: regName.trim(),
      email: regEmail.trim(),
      studentId: regStudentId.trim(),
      department: regDept.trim(),
      batch: regBatch.trim(),
      phone: regPhone.trim(),
    });

    if (res.success) {
      onSuccess();
    } else {
      setRegError(res.error || 'Registration failed.');
    }
  };

  // 3. Staff Submit
  const handleStaffSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = users.find((u) => u.role === 'employee');
    if (staff) {
      loginAs('employee', staff.id);
    } else {
      loginAs('employee');
    }
    onSuccess();
  };

  // 4. Supplier Submit
  const handleSupplierSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const supUser = users.find((u) => u.role === 'supplier' && u.supplierId === selectedSupplierId);
    if (supUser) {
      loginAs('supplier', supUser.id);
    } else {
      loginAs('supplier');
    }
    onSuccess();
  };

  // 5. Admin Submit
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const admin = users.find((u) => u.role === 'admin');
    if (admin) {
      loginAs('admin', admin.id);
    } else {
      loginAs('admin');
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center py-10 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-orange-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      {/* Top 3-Bar Icon Button: Other Portals */}
      <div className="fixed top-6 right-6 z-40">
        <button
          onClick={() => setShowOtherPortalsModal(true)}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white shadow-lg border border-stone-200/80 text-stone-700 hover:text-stone-900 hover:border-orange-500 hover:shadow-orange-500/10 transition group"
          title="Other Portals"
        >
          {/* 3-Bar Sign */}
          <div className="flex flex-col gap-1 items-center justify-center w-5">
            <span className="w-5 h-0.5 bg-stone-700 rounded-full group-hover:bg-orange-600 transition" />
            <span className="w-5 h-0.5 bg-stone-700 rounded-full group-hover:bg-orange-600 transition" />
            <span className="w-5 h-0.5 bg-stone-700 rounded-full group-hover:bg-orange-600 transition" />
          </div>
          <span className="text-xs font-bold text-stone-800 hidden sm:inline">Other Portals</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* KhabarKoi Logo with centered "Khuda Lagse" */}
        <div className="inline-block mb-2">
          <KhabarKoiLogo size="xl" showTagline={true} />
        </div>
      </div>

      {/* Main Card Dynamic per Active Portal */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-lg relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-stone-200/80">
          
          {/* ===================== PORTAL 1: STUDENT ===================== */}
          {activePortal === 'student' && (
            <>
              {/* STUDENT SIGN IN */}
              {authMode === 'signin' && (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-stone-100">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700 mb-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>Student Portal</span>
                    </div>
                    <h2 className="text-xl font-black text-stone-900 tracking-tight">Student Login</h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Sign in to browse food items, order without waiters, and track your tokens.
                    </p>
                  </div>

                  <form onSubmit={handleStudentSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Campus Email or Student ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={studentEmail}
                          onChange={(e) => setStudentEmail(e.target.value)}
                          placeholder="Email or Student ID"
                          className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                        />
                      </div>
                    </div>

                    {loginError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                    >
                      <span>Enter Student Canteen</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </form>

                  {/* Create New Account Button: Appears only on click */}
                  <div className="pt-4 border-t border-stone-100 text-center">
                    <p className="text-xs text-stone-500 mb-2.5">Don't have a student account yet?</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('register');
                        setRegError(null);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 hover:border-orange-300 text-stone-800 hover:text-orange-700 font-bold text-xs transition flex items-center justify-center gap-2"
                    >
                      <UserPlus className="w-4 h-4 text-orange-600" />
                      <span>Create New Account</span>
                    </button>
                  </div>
                </div>
              )}

              {/* CREATE STUDENT ACCOUNT FORM */}
              {authMode === 'register' && (
                <div className="space-y-4">
                  <div className="pb-3 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setLoginError(null);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </button>
                    <h2 className="text-xl font-black text-stone-900 tracking-tight">
                      Create Student Account
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Register with your campus info to enjoy fast-delivery food pickup & ৳500 welcome credits.
                    </p>
                  </div>

                  <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">
                        Full Name *
                      </label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          placeholder="e.g. Rafiqul Islam"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Campus Email *
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            placeholder="rafiq.cse@campus.ac.bd"
                            value={regEmail}
                            onChange={(e) => setRegEmail(e.target.value)}
                            className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Student ID Number *
                        </label>
                        <div className="relative">
                          <BookOpen className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            placeholder="e.g. 2301045"
                            value={regStudentId}
                            onChange={(e) => setRegStudentId(e.target.value)}
                            className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Department *
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <select
                            value={regDept}
                            onChange={(e) => setRegDept(e.target.value)}
                            className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                          >
                            <option value="Computer Science & Engineering">CSE</option>
                            <option value="Business Administration">BBA</option>
                            <option value="Electrical & Electronic Engineering">EEE</option>
                            <option value="Economics">Economics</option>
                            <option value="Civil Engineering">Civil</option>
                            <option value="Pharmacy">Pharmacy</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-700 block mb-1">
                          Academic Batch *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. CSE 23rd Batch"
                          value={regBatch}
                          onChange={(e) => setRegBatch(e.target.value)}
                          className="w-full text-xs font-medium px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-[11px] text-orange-950 flex items-center gap-2 font-medium">
                      <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                      <span>
                        New account perks: <strong>৳500 Welcome Balance</strong> and verified Batch review rights!
                      </span>
                    </div>

                    {regError && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                        {regError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Complete Registration & Enter Canteen</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => setAuthMode('signin')}
                        className="text-xs font-bold text-stone-600 hover:text-stone-900 hover:underline"
                      >
                        Already have an account? Sign In →
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}

          {/* ===================== PORTAL 2: STAFF ===================== */}
          {activePortal === 'staff' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-100">
                <button
                  type="button"
                  onClick={() => setActivePortal('student')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Student Login</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 mb-1.5 block">
                  <ChefHat className="w-3.5 h-3.5" />
                  <span>Kitchen & Counter Operations</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Staff Login</h2>
              </div>

              <form onSubmit={handleStaffSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Staff Email / Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={staffEmail}
                      onChange={(e) => setStaffEmail(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Staff Access PIN
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={staffPin}
                      onChange={(e) => setStaffPin(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                >
                  <ChefHat className="w-4 h-4" />
                  <span>Enter Staff Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* ===================== PORTAL 3: SUPPLIER ===================== */}
          {activePortal === 'supplier' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-100">
                <button
                  type="button"
                  onClick={() => setActivePortal('student')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Student Login</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 mb-1.5 block">
                  <Store className="w-3.5 h-3.5" />
                  <span>Authorized Vendors & Kitchens</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Supplier Login</h2>
              </div>

              <form onSubmit={handleSupplierSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Select Authorized Supplier
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-stone-300 rounded-xl px-3 py-2.5 text-stone-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {suppliers.map((sup) => (
                      <option key={sup.id} value={sup.id}>
                        {sup.name} ({sup.categoryTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Vendor Access Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={supplierPin}
                      onChange={(e) => setSupplierPin(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                >
                  <Store className="w-4 h-4" />
                  <span>Enter Supplier Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          )}

          {/* ===================== PORTAL 4: ADMIN ===================== */}
          {activePortal === 'admin' && (
            <div className="space-y-4">
              <div className="pb-3 border-b border-stone-100">
                <button
                  type="button"
                  onClick={() => setActivePortal('student')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-orange-600 mb-2 transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Student Login</span>
                </button>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 mb-1.5 block">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Canteen Management Authority</span>
                </div>
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Admin Login</h2>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Authority Admin ID / Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Master Security Key
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="w-full text-xs font-medium pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-stone-900"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 group"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Enter Admin Portal</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          )}

        </div>
      </div>

      {/* ===================== OTHER PORTALS MODAL ===================== */}
      {/* "just show staff, supplier, and admin no extra written only 3 words for 3 different portal" */}
      {showOtherPortalsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-stone-950/70 backdrop-blur-xs transition-opacity"
            onClick={() => setShowOtherPortalsModal(false)}
          />

          {/* Compact Modal Box */}
          <div className="relative w-full max-w-xs bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 z-10 space-y-3">
            {/* Header with close X button */}
            <div className="flex items-center justify-between pb-2 border-b border-stone-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400">
                Other Portals
              </span>
              <button
                onClick={() => setShowOtherPortalsModal(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* ONLY 3 WORDS / BUTTONS FOR THE 3 PORTALS: NO EXTRA WRITTEN TEXT */}
            <div className="space-y-2.5 pt-1">
              {/* 1. Staff */}
              <button
                onClick={() => {
                  setActivePortal('staff');
                  setShowOtherPortalsModal(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-200/80 font-black text-sm transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <ChefHat className="w-4 h-4 text-emerald-700" />
                  <span>Staff</span>
                </div>
                <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 2. Supplier */}
              <button
                onClick={() => {
                  setActivePortal('supplier');
                  setShowOtherPortalsModal(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-blue-50 hover:bg-blue-100/90 text-blue-900 border border-blue-200/80 font-black text-sm transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4 text-blue-700" />
                  <span>Supplier</span>
                </div>
                <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </button>

              {/* 3. Admin */}
              <button
                onClick={() => {
                  setActivePortal('admin');
                  setShowOtherPortalsModal(false);
                }}
                className="w-full py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100/90 text-purple-900 border border-purple-200/80 font-black text-sm transition flex items-center justify-between group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  <span>Admin</span>
                </div>
                <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
