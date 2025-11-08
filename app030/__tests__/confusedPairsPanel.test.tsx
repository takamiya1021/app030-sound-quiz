import { render, screen } from "@testing-library/react";

import { ConfusedPairsPanel } from "@/app/components/ConfusedPairsPanel";
import { useQuizStore } from "@/store/useQuizStore";

jest.mock("@/store/useQuizStore");

describe("ConfusedPairsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders fallback when no pairs", () => {
    (useQuizStore as jest.Mock).mockImplementation((selector) =>
      selector({ progress: { confusedPairs: [] } } as any),
    );
    render(<ConfusedPairsPanel />);
    expect(screen.getByText(/まだ間違えやすい/)).toBeInTheDocument();
  });

  it("lists top confused pairs", () => {
    (useQuizStore as jest.Mock).mockImplementation((selector) =>
      selector({
        progress: { confusedPairs: [{ sound1: "inst-01", sound2: "inst-02", count: 3 }] },
      } as any),
    );
    render(<ConfusedPairsPanel />);
    expect(screen.getByText(/回ミス/)).toBeInTheDocument();
  });
});
