import QuestionBrowser from "@/app/components/question-browser";
import { getQuestionGroups } from "@/lib/questions";

export default function Home() {
  const groups = getQuestionGroups();

  return <QuestionBrowser groups={groups} />;
}
