import { renderHook, act } from "@testing-library/react";

import { useSoundLibrary } from "@/app/hooks/useSoundLibrary";

describe("useSoundLibrary", () => {
  it("provides categories and defaults to the first category", () => {
    const { result } = renderHook(() => useSoundLibrary());

    expect(result.current.categories.length).toBeGreaterThan(0);
    expect(result.current.activeCategory).toBe(result.current.categories[0]?.id);
    expect(result.current.sounds.every((sound) => sound.category === result.current.activeCategory)).toBe(true);
  });

  it("filters by category and search term", () => {
    const { result } = renderHook(() => useSoundLibrary());

    act(() => {
      result.current.setActiveCategory("動物の鳴き声");
      result.current.setSearchTerm("猫");
    });

    expect(result.current.activeCategory).toBe("動物の鳴き声");
    expect(result.current.sounds).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "動物の鳴き声", name: expect.stringMatching(/猫/) }),
      ]),
    );
  });
});
