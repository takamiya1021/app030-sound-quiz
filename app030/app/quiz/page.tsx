import { QuizScreen } from "@/app/components/QuizScreen";

interface QuizPageProps {
  searchParams?: {
    category?: string;
    difficulty?: string;
  };
}

export default function QuizPage({ searchParams }: QuizPageProps) {
  return (
    <QuizScreen
      category={searchParams?.category ?? null}
      difficulty={searchParams?.difficulty ?? null}
    />
  );
}
