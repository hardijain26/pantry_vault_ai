/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  PantryItem,
  UserProfile,
  MediaItem,
  CommunityPost,
} from "./types";
import {
  initialPantryItems,
  initialUserProfile,
  initialMediaVault,
  initialCommunityPosts,
} from "./data/initialData";
import { Header } from "./components/Header";
import { PantryView } from "./components/PantryView";
import { NutritionalDashboard } from "./components/NutritionalDashboard";
import { WhatsAppAlerts } from "./components/WhatsAppAlerts";
import { MediaVault } from "./components/MediaVault";
import { DIYRecipeGenerator } from "./components/DIYRecipeGenerator";
import { VoiceRecipeTranscriber } from "./components/VoiceRecipeTranscriber";
import { SeasonalHarvestMap } from "./components/SeasonalHarvestMap";
import { CommunityFeed } from "./components/CommunityFeed";
import { UserProfileModal } from "./components/UserProfileModal";

export default function App() {
  // Persistent State with LocalStorage
  const [activeTab, setActiveTab] = useState<string>("pantry");
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("vegpantry_profile");
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    const saved = localStorage.getItem("vegpantry_items");
    return saved ? JSON.parse(saved) : initialPantryItems;
  });

  const [savedVault, setSavedVault] = useState<MediaItem[]>(() => {
    const saved = localStorage.getItem("vegpantry_media");
    return saved ? JSON.parse(saved) : initialMediaVault;
  });

  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem("vegpantry_community");
    return saved ? JSON.parse(saved) : initialCommunityPosts;
  });

  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem("vegpantry_profile", JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem("vegpantry_items", JSON.stringify(pantryItems));
  }, [pantryItems]);

  useEffect(() => {
    localStorage.setItem("vegpantry_media", JSON.stringify(savedVault));
  }, [savedVault]);

  useEffect(() => {
    localStorage.setItem("vegpantry_community", JSON.stringify(communityPosts));
  }, [communityPosts]);

  // Pantry Handlers
  const handleUpdateQuantity = (id: string, delta: number) => {
    setPantryItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta),
              lastUpdated: new Date().toISOString(),
            }
          : item
      )
    );
  };

  const handleAddItem = (newItem: Omit<PantryItem, "id">) => {
    const item: PantryItem = {
      ...newItem,
      id: "p_" + Date.now(),
    };
    setPantryItems((prev) => [item, ...prev]);
  };

  const handleAddBulkItems = (bulkItems: Omit<PantryItem, "id">[]) => {
    const formatted: PantryItem[] = bulkItems.map((b, idx) => ({
      ...b,
      id: "p_bulk_" + Date.now() + "_" + idx,
    }));
    setPantryItems((prev) => [...formatted, ...prev]);
  };

  const handleEditItem = (updated: PantryItem) => {
    setPantryItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteItem = (id: string) => {
    setPantryItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Media Vault Handlers
  const handleSaveMedia = (media: MediaItem) => {
    setSavedVault((prev) => [media, ...prev]);
  };

  const handleDeleteMedia = (id: string) => {
    setSavedVault((prev) => prev.filter((m) => m.id !== id));
  };

  // Community Feed Handlers
  const handleToggleLike = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const liked = !post.likedByMe;
          return {
            ...post,
            likedByMe: liked,
            likes: liked ? post.likes + 1 : Math.max(0, post.likes - 1),
          };
        }
        return post;
      })
    );
  };

  const handleAddComment = (postId: string, text: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const newComment = {
            id: "cm_" + Date.now(),
            author: userProfile.name || "Chef",
            text,
            time: "Just now",
          };
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  };

  const handleCreateCommunityPost = (post: Omit<CommunityPost, "id" | "likes" | "comments" | "createdAt">) => {
    const newPost: CommunityPost = {
      ...post,
      id: "c_" + Date.now(),
      likes: 1,
      likedByMe: true,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
  };

  // Low Stock Items Count
  const lowStockCount = pantryItems.filter((item) => item.quantity <= item.threshold).length;

  return (
    <div className="min-h-screen bg-white text-stone-900 font-sans selection:bg-emerald-800 selection:text-white">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
        userProfile={userProfile}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main View Container */}
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

        {activeTab === "harvest" && (
          <SeasonalHarvestMap
            pantryItems={pantryItems}
            userProfile={userProfile}
            onAddIngredientToPantry={handleAddItem}
            onNavigateToPantry={() => setActiveTab("pantry")}
          />
        )}

        {activeTab === "nutrition" && (
          <NutritionalDashboard
            items={pantryItems}
            userProfile={userProfile}
            onNavigateToPantry={() => setActiveTab("pantry")}
            onSetStockReminder={() => setActiveTab("alerts")}
          />
        )}

        {activeTab === "alerts" && (
          <WhatsAppAlerts
            items={pantryItems}
            userProfile={userProfile}
            onUpdateQuantity={handleUpdateQuantity}
          />
        )}

        {activeTab === "media" && (
          <MediaVault
            savedVault={savedVault}
            userProfile={userProfile}
            onSaveMedia={handleSaveMedia}
            onDeleteMedia={handleDeleteMedia}
          />
        )}

        {activeTab === "diy" && (
          <DIYRecipeGenerator
            pantryItems={pantryItems}
            userProfile={userProfile}
            onPostToCommunity={handleCreateCommunityPost}
          />
        )}

        {activeTab === "voice" && (
          <VoiceRecipeTranscriber
            userProfile={userProfile}
            onAddIngredientToPantry={handleAddItem}
            onPublishToCommunity={handleCreateCommunityPost}
            onNavigateToCommunity={() => setActiveTab("community")}
          />
        )}

        {activeTab === "community" && (
          <CommunityFeed
            posts={communityPosts}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onCreatePost={handleCreateCommunityPost}
            userDietaryPreference={userProfile.dietaryPreference}
          />
        )}
      </main>

      {/* User Profile Health Modal */}
      {showProfileModal && (
        <UserProfileModal
          userProfile={userProfile}
          onSaveProfile={setUserProfile}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </div>
  );
}
