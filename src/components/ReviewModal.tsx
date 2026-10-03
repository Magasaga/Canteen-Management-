import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FoodItem } from '../types';
import { Star, X, MessageSquare, Clock, GraduationCap } from 'lucide-react';

interface ReviewModalProps {
  foodItem: FoodItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({ foodItem, isOpen, onClose }) => {
  const { addReview, currentUser } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const batchTime = 'Standard Order';
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !foodItem) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    addReview({
      foodItemId: foodItem.id,
      rating,
      comment: comment.trim(),
      batchTime,
      batchNo: foodItem.batchNo,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-stone-200 overflow-hidden">
          {/* Header */}
          <div className="bg-orange-50 border-b border-orange-100 p-5 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <img
                src={foodItem.imageUrl}
                alt={foodItem.name}
                className="w-12 h-12 rounded-xl object-cover border border-orange-200"
              />
              <div>
                <h3 className="text-base font-bold text-stone-900 leading-snug">
                  Review {foodItem.name}
                </h3>
                <p className="text-xs text-orange-700 font-semibold">{foodItem.supplierName}</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Student & Batch Information Verified */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-orange-600" />
                  <span>Student Reviewer Info:</span>
                </span>
                <span className="font-bold text-stone-900">
                  {currentUser?.name || 'Anonymous Student'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-stone-500 font-medium">Academic Batch:</span>
                <span className="font-semibold text-orange-700 bg-orange-100 px-2 py-0.5 rounded-md text-[11px]">
                  {currentUser?.batch || 'CSE 21st Batch'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60">
                <span className="text-stone-500 font-medium">Supplied Food Batch:</span>
                <span className="font-mono font-bold text-stone-800 bg-stone-200 px-2 py-0.5 rounded text-[11px]">
                  {foodItem.batchNo || 'BATCH-20261002-KK01'}
                </span>
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">Overall Taste & Quality *</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-stone-300 hover:text-amber-400 focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        star <= rating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-stone-600 ml-2">
                  {rating === 5 ? 'Excellent 🌟' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : 'Needs improvement'}
                </span>
              </div>
            </div>

            {/* Review Comment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-orange-600" />
                <span>Your Review Feedback *</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience regarding food temperature, portion size, seasoning, and pickup speed..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 font-medium text-stone-800"
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
                disabled={isSubmitting || !comment.trim()}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
              >
                Publish Review
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
