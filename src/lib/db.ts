import { supabase } from "./supabase";
import { PantryItem, UserProfile, DietaryPreference } from "../types";

// ---- Profiles ---------------------------------------------------------------

interface ProfileRow {
  id: string;
  name: string;
  dietary_preference: string;
  whatsapp_phone: string;
  plan: "trial" | "paid" | "expired";
  trial_ends_at: string;
}

const toProfile = (r: ProfileRow): UserProfile => ({
  name: r.name,
  dietaryPreference: r.dietary_preference as DietaryPreference,
  whatsappPhone: r.whatsapp_phone,
  plan: r.plan,
  trialEndsAt: r.trial_ends_at,
  theme: "organic-light",
});

export async function loadProfile(userId: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, name, dietary_preference, whatsapp_phone, plan, trial_ends_at")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return toProfile(data as ProfileRow);
}

export async function saveProfile(userId: string, p: UserProfile): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({
      name: p.name,
      dietary_preference: p.dietaryPreference,
      whatsapp_phone: p.whatsappPhone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);
  if (error) throw error;
}

// ---- Pantry items -----------------------------------------------------------

interface PantryRow {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
  expiry_date: string | null;
  details: Partial<PantryItem>;
  updated_at: string;
}

// Fields kept in their own columns; everything else goes into `details`.
const COLUMN_FIELDS = ["id", "name", "quantity", "unit", "threshold", "expiryDate", "lastUpdated"] as const;

const toItem = (r: PantryRow): PantryItem => ({
  nutrientCategory: "Other",
  foodGroup: "Other",
  caloriesPerUnit: 0,
  proteinPerUnit: 0,
  carbsPerUnit: 0,
  fatsPerUnit: 0,
  fiberPerUnit: 0,
  keyMicroNutrients: [],
  ...r.details,
  id: r.id,
  name: r.name,
  quantity: Number(r.quantity),
  unit: r.unit,
  threshold: Number(r.threshold),
  expiryDate: r.expiry_date ?? undefined,
  lastUpdated: r.updated_at,
});

const toRow = (item: PantryItem) => {
  const details: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(item)) {
    if (!(COLUMN_FIELDS as readonly string[]).includes(k)) details[k] = v;
  }
  return {
    id: item.id,
    name: item.name,
    quantity: Math.max(0, Number(item.quantity) || 0),
    unit: item.unit || "g",
    threshold: Math.max(0, Number(item.threshold) || 0),
    expiry_date: item.expiryDate || null,
    details,
    updated_at: new Date().toISOString(),
  };
};

export async function loadPantry(): Promise<PantryItem[]> {
  const { data, error } = await supabase
    .from("pantry_items")
    .select("id, name, quantity, unit, threshold, expiry_date, details, updated_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data as PantryRow[]).map(toItem);
}

export async function upsertItems(items: PantryItem[]): Promise<void> {
  if (items.length === 0) return;
  const { error } = await supabase.from("pantry_items").upsert(items.map(toRow));
  if (error) throw error;
}

export async function deleteItem(id: string): Promise<void> {
  const { error } = await supabase.from("pantry_items").delete().eq("id", id);
  if (error) throw error;
}
