'use client';

import { useCallback, useMemo, useState } from "react";

import sounds from "@/data/sounds";
import { SoundData } from "@/types";

const CATEGORY_ICONS: Record<string, string> = {
  楽器の音: "🎹",
  動物の鳴き声: "🐾",
  日常の音: "🏠",
  自然の音: "🌿",
  効果音: "✨",
};

export interface SoundLibraryCategory {
  id: string;
  label: string;
  icon: string;
  count: number;
}

export interface UseSoundLibraryResult {
  categories: SoundLibraryCategory[];
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sounds: SoundData[];
}

export function useSoundLibrary(initialCategory?: string): UseSoundLibraryResult {
  const categories = useMemo<SoundLibraryCategory[]>(() => {
    const map = new Map<string, SoundLibraryCategory>();

    sounds.forEach((sound) => {
      if (!map.has(sound.category)) {
        map.set(sound.category, {
          id: sound.category,
          label: sound.category,
          icon: CATEGORY_ICONS[sound.category] ?? "🎧",
          count: 0,
        });
      }

      map.get(sound.category)!.count += 1;
    });

    return Array.from(map.values());
  }, []);

  const defaultCategory =
    (initialCategory && categories.find((cat) => cat.id === initialCategory)?.id) ||
    categories[0]?.id ||
    "";

  const [activeCategory, setActiveCategoryState] = useState(defaultCategory);
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredSounds = useMemo(() => {
    return sounds.filter((sound) => {
      const matchesCategory = !activeCategory || sound.category === activeCategory;
      const matchesQuery =
        normalizedSearch.length === 0 ||
        sound.name.toLowerCase().includes(normalizedSearch) ||
        sound.description.toLowerCase().includes(normalizedSearch);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, normalizedSearch]);

  const setActiveCategory = useCallback(
    (category: string) => {
      if (category && categories.some((cat) => cat.id === category)) {
        setActiveCategoryState(category);
      }
    },
    [categories],
  );

  return {
    categories,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    sounds: filteredSounds,
  };
}
