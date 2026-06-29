import { readFileSync } from "node:fs";
import path from "node:path";
import { questionFileNames } from "@/data/question-files";
import { type Question } from "@/lib/question-types";

type RawQuestion = Record<string, unknown>;

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim() !== "");
}

function assertStringArray(
  value: unknown,
  fileName: string,
  index: number,
  field: string,
): asserts value is string[] {
  if (!isStringArray(value)) {
    throw new Error(`${fileName} の ${index + 1} 件目: ${field} は空でない文字列の配列にしてください。`);
  }
}

function assertQuestion(value: unknown, fileName: string, index: number): asserts value is RawQuestion {
  if (!value || typeof value !== "object") {
    throw new Error(`${fileName} の ${index + 1} 件目がオブジェクトではありません。`);
  }

  const question = value as Record<string, unknown>;
  const requiredTextFields = ["heading", "body"] as const;

  for (const field of requiredTextFields) {
    if (typeof question[field] !== "string" || question[field].trim() === "") {
      throw new Error(`${fileName} の ${index + 1} 件目: ${field} は空でない文字列にしてください。`);
    }
  }

  if (!Number.isInteger(question.id) || Number(question.id) < 1) {
    throw new Error(`${fileName} の ${index + 1} 件目: id は1以上の整数にしてください。`);
  }

  assertStringArray(question.tags, fileName, index, "tags");
}

function asTrimmedString(value: unknown) {
  return String(value).trim();
}

function trimStringArray(values: string[]) {
  return values.map((value) => value.trim());
}

export function getQuestions(): Question[] {
  const questions = questionFileNames.flatMap((fileName) => {
    const filePath = path.join(process.cwd(), "data", "questions", fileName);
    const parsed = JSON.parse(readFileSync(filePath, "utf8")) as unknown;

    if (!Array.isArray(parsed)) {
      throw new Error(`${fileName} のルートは配列にしてください。`);
    }

    return parsed.map((question, index) => {
      assertQuestion(question, fileName, index);

      return {
        id: Number(question.id),
        tags: trimStringArray(question.tags as string[]),
        heading: asTrimmedString(question.heading),
        body: asTrimmedString(question.body),
      };
    });
  });

  return questions.sort((first, second) => second.id - first.id);
}
