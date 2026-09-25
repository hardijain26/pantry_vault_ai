import React, { useState } from "react";
import { UserProfile, DietaryPreference } from "../types";
import { X, UserCheck, LogOut } from "lucide-react";

interface UserProfileModalProps {
  userProfile: UserProfile;
  email: string;
  onSaveProfile: (profile: UserProfile) => void;
  onSignOut: () => void;
  onClose: () => void;
}

const dietaryPreferences: DietaryPreference[] = [
  "Pure Vegetarian",
  "Vegan",
  "Jain",
  "Lacto-Vegetarian",
  "Ovo-Vegetarian",
  "High-Protein Veg",
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userProfile,
  email,
  onSaveProfile,
  onSignOut,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white border border-emerald-900/15 rounded-3xl p-5 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-5 animate-fadeIn">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-emerald-800" />
            <h2 className="text-lg font-serif-italic text-stone-900 font-bold">Your profile</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          Signed in as <strong>{email}</strong>. Recipes follow your food habit below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-800 font-bold mb-1">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
            />
          </div>

          <div>
            <label className="block text-stone-800 font-bold mb-1.5">Food habit *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {dietaryPreferences.map((pref) => {
                const isSelected = formData.dietaryPreference === pref;
                return (
                  <button
                    type="button"
                    key={pref}
                    onClick={() => setFormData({ ...formData, dietaryPreference: pref })}
                    className={`py-2.5 px-3 rounded-2xl border text-center font-bold transition text-xs min-h-[42px] ${
                      isSelected
                        ? "bg-emerald-800 border-emerald-800 text-white shadow-xs"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50"
                    }`}
                  >
                    {pref}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-stone-800 font-bold mb-1">WhatsApp number (for sharing lists)</label>
            <input
              type="tel"
              placeholder="+91 98765 43210"
              value={formData.whatsappPhone}
              onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
              className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onSignOut}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-stone-600 hover:text-red-700 font-semibold rounded-full min-h-[44px]"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
            <div className="flex flex-col-reverse sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-stone-600 hover:text-stone-900 font-semibold rounded-full min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-full shadow-xs transition min-h-[44px]"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
