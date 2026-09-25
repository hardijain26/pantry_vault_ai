/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import type { Session } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";
import { PantryItem, UserProfile } from "./types";
import { supabase } from "./lib/supabase";
import { loadProfile, saveProfile, loadPantry, upsertItems, deleteItem } from "./lib/db";
import { Header } from "./components/Header";
import { PantryView } from "./components/PantryView";
import { WhatsAppAlerts } from "./components/WhatsAppAlerts";
import { DIYRecipeGenerator } from "./components/DIYRecipeGenerator";
import { VoiceRecipeTranscriber } from "./components/VoiceRecipeTranscriber";
import { UserProfileModal } from "./components/UserProfileModal";
import { AuthScreen } from "./components/AuthScreen";
import { Toaster } from "./components/Toaster";

const newId = () => crypto.randomUUID();

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [activeTab, setActiveTab] = useState<string>("pantry");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // ---- Auth ------------------------------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const userId = session?.user.id;

  // ---- Load this user's data -------------------------------------------------
  const reload = useCallback(async () => {
    if (!userId) return;
    setLoadingData(true);
    try {
      const [profile, items] = await Promise.all([loadProfile(userId), loadPantry()]);
      setUserProfile(profile);
      setPantryItems(items);
      setSyncError(null);
    } catch (err: any) {
      setSyncError(err.message || "Couldn't load your pantry.");
    } finally {
      setLoadingData(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) reload();
    else {
      setUserProfile(null);
      setPantryItems([]);
    }
  }, [userId, reload]);

  // Save to the database; on failure show an error and re-sync from the server.
  const persist = (op: Promise<void>) =>
    op.catch((err) => {
      setSyncError(`Couldn't save your change: ${err.message || err}. Reloading your pantry.`);
      reload();
    });

  // ---- Pantry handlers (update screen first, then save) ---------------------
  const handleUpdateQuantity = (id: string, delta: number) => {
    const current = pantryItems.find((i) => i.id === id);
    if (!current) return;
    const updated = { ...current, quantity: Math.max(0, current.quantity + delta), lastUpdated: new Date().toISOString() };
    setPantryItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
    persist(upsertItems([updated]));
  };

  const handleAddItem = (newItem: Omit<PantryItem, "id">) => {
    const item: PantryItem = { ...newItem, id: newId() };
    setPantryItems((prev) => [item, ...prev]);
    persist(upsertItems([item]));
  };

  const handleAddBulkItems = (bulkItems: Omit<PantryItem, "id">[]) => {
    const items: PantryItem[] = bulkItems.map((b) => ({ ...b, id: newId() }));
    setPantryItems((prev) => [...items, ...prev]);
    persist(upsertItems(items));
  };

  const handleEditItem = (updated: PantryItem) => {
    setPantryItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    persist(upsertItems([updated]));
  };

  const handleDeleteItem = (id: string) => {
    setPantryItems((prev) => prev.filter((i) => i.id !== id));
    persist(deleteItem(id));
  };

  const handleSaveProfile = (p: UserProfile) => {
    setUserProfile(p);
    if (userId) persist(saveProfile(userId, p));
  };

  const handleSignOut = async () => {
    setShowProfileModal(false);
    await supabase.auth.signOut();
  };

  // ---- Render ----------------------------------------------------------------
  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
      </div>
    );
  }

  if (!session)
    return (
      <>
        <Toaster />
        <AuthScreen />
      </>
    );

  if (!userProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-4 text-center">
        {loadingData || !syncError ? (
          <Loader2 className="w-6 h-6 animate-spin text-emerald-700" />
        ) : (
          <>
            <p className="text-sm text-stone-800 max-w-sm">{syncError}</p>
            <div className="flex gap-3">
              <button onClick={reload} className="px-4 py-2 bg-emerald-800 text-white text-xs font-bold rounded-full">
                Try again
              </button>
              <button onClick={handleSignOut} className="px-4 py-2 text-stone-600 text-xs font-bold">
                Sign out
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  const lowStockCount = pantryItems.filter((item) => item.quantity <= item.threshold).length;

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-emerald-800 selection:text-white">
      <Toaster />
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {syncError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-start justify-between gap-3 bg-amber-50 border border-amber-300 text-amber-950 text-xs rounded-2xl p-3">
            <span>{syncError}</span>
            <button onClick={() => setSyncError(null)} className="font-bold shrink-0">
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 lg:pb-8">
        {activeTab === "pantry" && (
          <PantryView
            items={pantryItems}
            onUpdateQuantity={handleUpdateQuantity}
            onAddItem={handleAddItem}
            onAddBulkItems={handleAddBulkItems}
            onEditItem={handleEditItem}
            onDeleteItem={handleDeleteItem}
          />
        )}

        {activeTab === "alerts" && (
          <WhatsAppAlerts items={pantryItems} userProfile={userProfile} onUpdateQuantity={handleUpdateQuantity} />
        )}

        {activeTab === "diy" && <DIYRecipeGenerator pantryItems={pantryItems} userProfile={userProfile} />}

        {activeTab === "voice" && (
          <VoiceRecipeTranscriber userProfile={userProfile} onAddIngredientToPantry={handleAddItem} />
        )}
      </main>

      {showProfileModal && (
        <UserProfileModal
          userProfile={userProfile}
          email={session.user.email || ""}
          onSaveProfile={handleSaveProfile}
          onSignOut={handleSignOut}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
