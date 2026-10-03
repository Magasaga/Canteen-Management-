import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order } from '../types';
import { AlertTriangle, ShieldAlert, X, UserX, Clock } from 'lucide-react';

interface DisciplinaryModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DisciplinaryModal: React.FC<DisciplinaryModalProps> = ({ order, isOpen, onClose }) => {
  const { markOrderUnclaimed, currentUser, users } = useApp();
  const [reasonNote, setReasonNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !order) return null;

  const targetStudent = users.find((u) => u.id === order.studentId);
  const currentStrikes = targetStudent?.strikes || 0;
  const nextStrikeCount = currentStrikes + 1;
  const willTriggerSuspension = nextStrikeCount >= 3;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reasonNote.trim()) return;

    setIsSubmitting(true);
    markOrderUnclaimed(
      order.id,
      currentUser?.name || 'Canteen Staff Duty Officer',
      reasonNote.trim()
    );
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-stone-900/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-rose-50 border-b border-rose-100 p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-600 text-white shrink-0 shadow-sm">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-rose-950">
                  Record Unclaimed Food Order
                </h3>
                <p className="text-xs text-rose-700 mt-0.5">
                  Official Canteen Management Disciplinary Log
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-rose-400 hover:text-rose-600 hover:bg-rose-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Student & Token Details */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Order Token:</span>
                <span className="font-black text-sm text-stone-900 px-2 py-0.5 rounded-lg bg-orange-100 text-orange-800">
                  {order.tokenNumber}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Student Name:</span>
                <span className="font-bold text-stone-800">{order.studentName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Batch / Dept:</span>
                <span className="font-medium text-stone-700">{order.studentBatch}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500 font-medium">Items Ordered:</span>
                <span className="font-medium text-stone-700 truncate max-w-[200px]">
                  {order.items.map((i) => `${i.quantity}x ${i.name}`).join(', ')}
                </span>
              </div>

              <div className="flex justify-between items-center pt-1 border-t border-stone-200">
                <span className="text-stone-500 font-medium">Current Violations:</span>
                <span className="font-black text-stone-900">
                  {currentStrikes} of 3 Strikes
                </span>
              </div>
            </div>

            {/* Consequence Projection Warning */}
            {willTriggerSuspension ? (
              <div className="p-3.5 rounded-2xl bg-rose-600 text-white space-y-1 shadow-md animate-pulse">
                <div className="flex items-center gap-2 font-bold text-xs">
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>3RD STRIKE DETECTED — 1-WEEK SUSPENSION ACTIVATION</span>
                </div>
                <p className="text-[11px] text-rose-100 leading-relaxed">
                  Submitting this report will place {order.studentName} under automatic 7-day
                  canteen suspension. The student will be blocked from ordering until next week.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  This action will log <span className="font-bold">Strike {nextStrikeCount} of 3</span>{' '}
                  against the student. If they commit 3 unclaimed order violations, a 1-week ban will apply.
                </div>
              </div>
            )}

            {/* Note Down Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Official Staff Reason & Observation Note *
              </label>
              <textarea
                required
                rows={3}
                placeholder="e.g., Food waited at Counter A for 35 mins. Called token over PA system 3 times. Student did not appear to collect tray."
                value={reasonNote}
                onChange={(e) => setReasonNote(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium text-stone-800"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !reasonNote.trim()}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <UserX className="w-4 h-4" />
                <span>
                  {willTriggerSuspension ? 'Enforce 1-Week Penalty' : `Record Strike ${nextStrikeCount}/3`}
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
