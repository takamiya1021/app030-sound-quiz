import { render, screen } from "@testing-library/react";

import { ConfusedPairsPanel } from "@/app/components/ConfusedPairsPanel";
import { resetQuizStore, useQuizStore } from "@/store/useQuizStore";

describe("ConfusedPairsPanel", () => {
  beforeEach(() => {
    resetQuizStore();
  });

  it("renders fallback when no pairs", () => {
    render(<ConfusedPairsPanel />);
    expect(screen.getByText(/まだ間違えやすい/)).toBeInTheDocument();
  });

  it("lists top confused pairs", () => {
    useQuizStore.setState((state) => ({
      ...state,
      progress: {
        ...state.progress,
        confusedPairs: [{ sound1: "inst-01", sound2: "inst-02", count: 3 }],
      },
    }));

    render(<ConfusedPairsPanel />);
    expect(screen.getByText(/回ミス/)).toBeInTheDocument();
  });
});
