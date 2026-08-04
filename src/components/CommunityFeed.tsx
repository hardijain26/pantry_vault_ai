import React, { useState } from "react";
import { CommunityPost, DietaryPreference } from "../types";
import {
  Users,
  Heart,
  MessageCircle,
  Share2,
  Send,
  Plus,
  Sparkles,
  X,
  UserCheck,
} from "lucide-react";
import { AestheticProduceArt } from "./ProduceIcons";

interface CommunityFeedProps {
  posts: CommunityPost[];
  onToggleLike: (postId: string) => void;
  onAddComment: (postId: string, text: string) => void;
  onCreatePost: (post: Omit<CommunityPost, "id" | "likes" | "comments" | "createdAt">) => void;
  userDietaryPreference: DietaryPreference;
}

export const CommunityFeed: React.FC<CommunityFeedProps> = ({
  posts,
  onToggleLike,
  onAddComment,
  onCreatePost,
  userDietaryPreference,
}) => {
  const [filterDiet, setFilterDiet] = useState<string>("All");
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New Post Form State
  const [newPost, setNewPost] = useState({
    authorName: "",
    recipeTitle: "",
    recipeDescription: "",
    dietCategory: userDietaryPreference,
    prepTime: "20 mins",
    ingredientsText: "",
    instructionsText: "",
  });

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (text && text.trim()) {
      onAddComment(postId, text.trim());
      setCommentInputs({ ...commentInputs, [postId]: "" });
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.recipeTitle.trim()) return;

    onCreatePost({
      authorName: newPost.authorName.trim() || "Vegetarian Foodie",
      authorDiet: newPost.dietCategory as DietaryPreference,
      recipeTitle: newPost.recipeTitle.trim(),
      recipeDescription: newPost.recipeDescription.trim() || "Organic home recipe",
      dietCategory: newPost.dietCategory,
      prepTime: newPost.prepTime,
      healthScore: 9,
      ingredients: newPost.ingredientsText.split("\n").filter(Boolean),
      instructions: newPost.instructionsText.split("\n").filter(Boolean),
    });

    setShowCreateModal(false);
  };

  const filteredPosts = posts.filter((post) => {
    if (filterDiet === "All") return true;
    return post.dietCategory === filterDiet || post.authorDiet === filterDiet;
  });

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Aesthetic Produce Hero Banner */}
      <AestheticProduceArt variant="harvest" />

      {/* Top Banner */}
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-[#5A5A40] bg-[#E8D8C3]/50 px-3 py-1 rounded-full border border-[#5A5A40]/15 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#B45309]" /> Organic Vegetarian Community
              </span>
              <span className="text-xs text-[#5A5A40]/60 font-medium">
                HappyCow Inspired Exchange
              </span>
            </div>
            <h1 className="text-3xl font-serif-italic text-[#2D2D2D] mt-2 tracking-tight">
              Vegetarian & Vegan Community Recipe Feed
            </h1>
            <p className="text-xs text-[#5A5A40]/70 mt-1 max-w-2xl">
              Explore, share, and exchange zero-waste pantry creations with fellow plant-based, Jain, and gut-health enthusiasts around the world.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full text-xs font-semibold shadow-xs transition whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Post Custom Recipe</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="mt-6 pt-4 border-t border-[#5A5A40]/10 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Pure Vegetarian", "Vegan", "Jain", "High-Protein Veg", "Gut Healing"].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterDiet(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition whitespace-nowrap ${
                filterDiet === tag
                  ? "bg-[#5A5A40] text-white font-bold"
                  : "bg-[#F9F8F4] text-[#5A5A40] hover:text-[#2D2D2D] border border-[#5A5A40]/15"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Feed Posts */}
      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-3xl p-6 border border-[#5A5A40]/10 shadow-xs space-y-4"
          >
            {/* Post Author Header */}
            <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E8D8C3] text-[#5A5A40] flex items-center justify-center font-bold text-xs shadow-xs border border-[#5A5A40]/20">
                  {post.authorName ? post.authorName.charAt(0) : "V"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#2D2D2D]">{post.authorName}</span>
                    <span className="text-[10px] bg-[#E8D8C3]/60 text-[#5A5A40] px-2.5 py-0.5 rounded-full font-bold">
                      {post.authorDiet}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#5A5A40]/60">
                    Shared {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <span className="text-xs font-bold text-[#5A5A40] bg-[#F9F8F4] px-3 py-1 rounded-full border border-[#5A5A40]/15">
                Score: {post.healthScore}/10
              </span>
            </div>

            {/* Recipe Content */}
            <div>
              <h3 className="text-lg font-serif-italic text-[#2D2D2D]">
                {post.recipeTitle}
              </h3>
              <p className="text-xs text-[#5A5A40]/80 mt-1 leading-relaxed">
                {post.recipeDescription}
              </p>
            </div>

            {/* Ingredients snippet */}
            {post.ingredients && post.ingredients.length > 0 && (
              <div className="bg-[#F9F8F4] p-3.5 rounded-2xl border border-[#5A5A40]/10 text-xs">
                <span className="font-bold text-[#5A5A40] block mb-1">Key Ingredients:</span>
                <div className="flex flex-wrap gap-1.5">
                  {post.ingredients.map((ing, i) => (
                    <span key={i} className="bg-white text-[#5A5A40] px-2.5 py-0.5 rounded-full border border-[#5A5A40]/10 text-[10px] font-medium">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Likes & Comments */}
            <div className="pt-2 border-t border-[#5A5A40]/10 flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-[#5A5A40]">
                <button
                  onClick={() => onToggleLike(post.id)}
                  className={`flex items-center gap-1.5 transition ${
                    post.likedByMe ? "text-[#F27D26] font-bold" : "hover:text-[#2D2D2D]"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.likedByMe ? "fill-[#F27D26] text-[#F27D26]" : ""}`} />
                  <span>{post.likes} Likes</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#5A5A40]" />
                  <span>{post.comments.length} Comments</span>
                </div>
              </div>
            </div>

            {/* Comments List & Input */}
            <div className="bg-[#F9F8F4] p-4 rounded-2xl border border-[#5A5A40]/10 space-y-3">
              {post.comments.map((cm) => (
                <div key={cm.id} className="text-xs text-[#2D2D2D] border-b border-[#5A5A40]/10 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#5A5A40] text-[11px]">{cm.author}</span>
                    <span className="text-[10px] text-[#5A5A40]/50">{cm.time}</span>
                  </div>
                  <p className="mt-0.5 text-[#2D2D2D]">{cm.text}</p>
                </div>
              ))}

              <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a community comment..."
                  value={commentInputs[post.id] || ""}
                  onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                  className="flex-1 bg-white border border-[#5A5A40]/20 rounded-full px-4 py-2 text-xs text-[#2D2D2D] placeholder-[#5A5A40]/40 focus:outline-none focus:border-[#5A5A40]"
                />
                <button
                  type="submit"
                  className="p-2 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white rounded-full transition"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE POST MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-[#2D2D2D]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#5A5A40]/20 rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#5A5A40]/10 pb-3">
              <h3 className="text-lg font-serif-italic text-[#2D2D2D]">
                Share Recipe with VegPantry Community
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#5A5A40]/60 hover:text-[#5A5A40]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Your Name</label>
                <input
                  type="text"
                  placeholder="E.g., Chef Aria"
                  value={newPost.authorName}
                  onChange={(e) => setNewPost({ ...newPost, authorName: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full px-4 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Recipe Title *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g., Sprouted Moong & Tempeh Salad"
                  value={newPost.recipeTitle}
                  onChange={(e) => setNewPost({ ...newPost, recipeTitle: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full px-4 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Description / Tagline</label>
                <input
                  type="text"
                  placeholder="A refreshing, gut-nourishing probiotic salad..."
                  value={newPost.recipeDescription}
                  onChange={(e) => setNewPost({ ...newPost, recipeDescription: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-full px-4 py-2 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Ingredients (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="1 cup Sprouted Moong&#10;100g Tempeh&#10;1 tbsp Olive Oil"
                  value={newPost.ingredientsText}
                  onChange={(e) => setNewPost({ ...newPost, ingredientsText: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-2xl p-3 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div>
                <label className="block text-[#5A5A40] font-bold mb-1">Method / Instructions (one per line)</label>
                <textarea
                  rows={3}
                  placeholder="1. Steam sprouted moong for 5 mins&#10;2. Pan sear tempeh..."
                  value={newPost.instructionsText}
                  onChange={(e) => setNewPost({ ...newPost, instructionsText: e.target.value })}
                  className="w-full bg-[#F9F8F4] border border-[#5A5A40]/20 rounded-2xl p-3 text-[#2D2D2D] focus:outline-none focus:border-[#5A5A40]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2 text-[#5A5A40]/70 hover:text-[#5A5A40]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#5A5A40] hover:bg-[#5A5A40]/90 text-white font-semibold rounded-full shadow-xs"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
