import { use } from "react";

import { QuizScreen } from "@/app/components/QuizScreen";

interface QuizPageProps {
  searchParams: Promise<{
    category?: string;
    difficulty?: string;
  }>;
}

export default function QuizPage({ searchParams }: QuizPageProps) {
  const params = use(searchParams) ?? {};
  return (
    <QuizScreen
      category={params.category ?? null}
      difficulty={params.difficulty ?? null}
    />
  );
}
