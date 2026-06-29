import QuestionBrowser from "@/app/components/question-browser";
import { getQuestions } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default function Home() {
  const questions = getQuestions();

  return <QuestionBrowser questions={questions} />;
}
