import { readFileSync } from "node:fs";
import path from "node:path";
import { questionFileNames } from "@/data/question-files";
import { difficulties, type BigGenreGroup, type Difficulty, type Question } from "@/lib/question-types";

type RawQuestion = Omit<Question, "sourceFile">;

function isDifficulty(value: unknown): value is Difficulty {
  return typeof value === "string" && difficulties.includes(value as Difficulty);
}

function assertQuestion(value: unknown, fileName: string, index: number): asserts value is RawQuestion {
  if (!value || typeof value !== "object") {
    throw new Error(`${fileName} の ${index + 1} 件目がオブジェクトではありません。`);
  }

  const question = value as Record<string, unknown>;
  const requiredTextFields = ["bigGenre", "smallGenre", "heading", "body"] as const;

  for (const field of requiredTextFields) {
    if (typeof question[field] !== "string" || question[field].trim() === "") {
      throw new Error(`${fileName} の ${index + 1} 件目: ${field} は空でない文字列にしてください。`);
    }
  }

  if (!Number.isInteger(question.id) || Number(question.id) < 1) {
    throw new Error(`${fileName} の ${index + 1} 件目: id は1以上の整数にしてください。`);
  }

  if (!isDifficulty(question.difficulty)) {
    throw new Error(
      `${fileName} の ${index + 1} 件目: difficulty は ${difficulties.join(" / ")} のいずれかにしてください。`,
    );
  }
}

export function getQuestionGroups(): BigGenreGroup[] {
  const questions = questionFileNames.flatMap((fileName) => {
    const filePath = path.join(process.cwd(), "data", "questions", fileName);
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error(`${fileName} のルートは配列にしてください。`);
    }

    return parsed.map((question, index) => {
      assertQuestion(question, fileName, index);

      return {
        ...question,
        bigGenre: question.bigGenre.trim(),
        smallGenre: question.smallGenre.trim(),
        heading: question.heading.trim(),
        body: question.body.trim(),
        sourceFile: fileName,
      };
    });
  });

  const bigGenreMap = new Map<string, Map<string, Question[]>>();

  for (const question of questions) {
    const smallGenreMap = bigGenreMap.get(question.bigGenre) ?? new Map<string, Question[]>();
    const smallGenreQuestions = smallGenreMap.get(question.smallGenre) ?? [];

    smallGenreQuestions.push(question);
    smallGenreMap.set(question.smallGenre, smallGenreQuestions);
    bigGenreMap.set(question.bigGenre, smallGenreMap);
  }

  return Array.from(bigGenreMap, ([name, smallGenreMap]) => ({
    name,
    smallGenres: Array.from(smallGenreMap, ([smallGenreName, smallGenreQuestions]) => ({
      name: smallGenreName,
      questions: smallGenreQuestions.sort((first, second) => first.id - second.id),
    })),
  }));
}
