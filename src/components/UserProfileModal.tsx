import React, { useState } from "react";
import { UserProfile, DietaryPreference, MedicalCondition } from "../types";
import { X, UserCheck, HeartPulse, Phone, Shield, Check } from "lucide-react";

interface UserProfileModalProps {
  userProfile: UserProfile;
  onSaveProfile: (profile: UserProfile) => void;
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

const medicalConditionsList: MedicalCondition[] = [
  "Diabetes",
  "Hypertension",
  "IBS",
  "High Cholesterol",
  "Celiac / Gluten Intolerance",
  "PCOS",
  "Acid Reflux",
  "None",
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userProfile,
  onSaveProfile,
  onClose,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...userProfile });

  const toggleCondition = (condition: MedicalCondition) => {
    if (condition === "None") {
      setFormData({ ...formData, medicalConditions: ["None"] });
      return;
    }

    let updated = formData.medicalConditions.filter((c) => c !== "None");
    if (updated.includes(condition)) {
      updated = updated.filter((c) => c !== condition);
    } else {
      updated.push(condition);
    }

    if (updated.length === 0) updated = ["None"];
    setFormData({ ...formData, medicalConditions: updated });
  };

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
            <h2 className="text-lg font-serif-italic text-stone-900 font-bold">
              Health & Aesthetic Context Profile
            </h2>
          </div>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 min-w-[40px] min-h-[40px] flex items-center justify-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed font-medium">
          All AI evaluations (health verdicts, recipe generation, vault analysis, and voice processing) strictly factor in these parameters to protect your health goals.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-800 font-bold mb-1">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1">Age</label>
              <input
                type="number"
                min={1}
                max={120}
                required
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-800 font-bold mb-1.5">Food Habit / Dietary Preference *</label>
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
            <label className="block text-stone-800 font-bold mb-1.5">
              Medical Conditions (Select All Applicable)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {medicalConditionsList.map((cond) => {
                const isSelected = formData.medicalConditions.includes(cond);
                return (
                  <button
                    type="button"
                    key={cond}
                    onClick={() => toggleCondition(cond)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl border text-left text-xs transition min-h-[42px] ${
                      isSelected
                        ? "bg-amber-100 border-amber-300 text-amber-950 font-bold"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-emerald-50"
                    }`}
                  >
                    <span>{cond}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-800" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-800 font-bold mb-1">WhatsApp Phone Number</label>
              <input
                type="text"
                placeholder="+1 (555) 234-5678"
                value={formData.whatsappPhone}
                onChange={(e) => setFormData({ ...formData, whatsappPhone: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
              />
            </div>

            <div>
              <label className="block text-stone-800 font-bold mb-1">Daily Calorie Target</label>
              <input
                type="number"
                step={50}
                value={formData.dailyCalorieGoal}
                onChange={(e) => setFormData({ ...formData, dailyCalorieGoal: Number(e.target.value) })}
                className="w-full bg-stone-50 border border-stone-200 rounded-full px-4 py-2.5 text-stone-900 font-medium focus:outline-none focus:border-emerald-600 min-h-[44px]"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2.5 pt-3 border-t border-stone-200">
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
              Save Profile Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
