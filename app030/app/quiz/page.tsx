import { QuizScreen } from "@/app/components/QuizScreen";

interface QuizPageProps {
  searchParams?: Promise<{
    category?: string;
    difficulty?: string;
  }>;
}

export default async function QuizPage({ searchParams }: QuizPageProps) {
  const params = (await searchParams) ?? {};
  return (
    <QuizScreen
      category={params.category ?? null}
      difficulty={params.difficulty ?? null}
    />
  );
}
