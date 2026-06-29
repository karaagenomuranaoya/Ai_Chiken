import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { type Question } from "@/lib/question-types";

const questionsFilePath = path.join(process.cwd(), "data", "questions", "questions.json");
const adminPassword = process.env.ADMIN_PASSWORD ?? "ai-chiken";

type QuestionRequest = {
  password?: unknown;
  heading?: unknown;
  body?: unknown;
  tags?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json()) as QuestionRequest;

  if (payload.password !== adminPassword) {
    return NextResponse.json({ message: "パスワードが違います。" }, { status: 401 });
  }

  if (typeof payload.heading !== "string" || payload.heading.trim() === "") {
    return NextResponse.json({ message: "見出しを入力してください。" }, { status: 400 });
  }

  if (typeof payload.body !== "string" || payload.body.trim() === "") {
    return NextResponse.json({ message: "質問を入力してください。" }, { status: 400 });
  }

  if (
    !Array.isArray(payload.tags) ||
    payload.tags.some((tag) => typeof tag !== "string" || tag.trim() === "")
  ) {
    return NextResponse.json({ message: "タグを1つ以上選んでください。" }, { status: 400 });
  }

  const questions = JSON.parse(await readFile(questionsFilePath, "utf8")) as Question[];
  const nextId = Math.max(0, ...questions.map((question) => question.id)) + 1;
  const tags = Array.from(new Set(payload.tags.map((tag) => String(tag).trim())));
  const question: Question = {
    id: nextId,
    tags,
    heading: payload.heading.trim(),
    body: payload.body.trim(),
  };

  questions.push(question);
  await writeFile(questionsFilePath, `${JSON.stringify(questions, null, 2)}\n`);

  return NextResponse.json({ question });
}
