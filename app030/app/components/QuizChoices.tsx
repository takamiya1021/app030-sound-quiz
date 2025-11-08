'use client';

interface QuizChoicesProps {
  choices: string[];
  selectedIndex: number | null;
  disabled?: boolean;
  onSelect: (choiceIndex: number) => void;
}

const LABELS = ["A", "B", "C", "D"];

export function QuizChoices({
  choices,
  selectedIndex,
  disabled = false,
  onSelect,
}: QuizChoicesProps) {
  return (
    <div className="grid gap-4">
      {choices.map((choice, index) => {
        const isSelected = selectedIndex === index;

        return (
          <button
            key={choice}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(index)}
            className={[
              "flex w-full items-center gap-4 rounded-2xl border px-5 py-4 text-left transition",
              isSelected
                ? "border-indigo-400 bg-indigo-500/20 text-white shadow-[0_10px_25px_rgba(99,102,241,0.35)]"
                : "border-white/10 bg-white/5 text-slate-100 hover:border-indigo-300/60",
              disabled ? "opacity-60" : "",
            ].join(" ")}
            aria-pressed={isSelected}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-sm font-semibold">
              {LABELS[index] ?? String.fromCharCode(65 + index)}
            </span>
            <span className="text-base">{choice}</span>
          </button>
        );
      })}
    </div>
  );
}
