"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { difficulties, type BigGenreGroup, type Difficulty, type Question } from "@/lib/question-types";

const difficultyStyles: Record<Difficulty, string> = {
  入門: "bg-mist-600 text-white",
  基本: "bg-mist-100 text-ink",
  応用: "bg-white text-ink",
};

type QuestionBrowserProps = {
  groups: BigGenreGroup[];
};

function firstSmallGenre(groups: BigGenreGroup[], bigGenreName: string) {
  return groups.find((group) => group.name === bigGenreName)?.smallGenres[0]?.name ?? "";
}

export default function QuestionBrowser({ groups }: QuestionBrowserProps) {
  const [activeBigGenre, setActiveBigGenre] = useState(groups[0]?.name ?? "");
  const [activeSmallGenre, setActiveSmallGenre] = useState(firstSmallGenre(groups, activeBigGenre));
  const [activeDifficulties, setActiveDifficulties] = useState<Difficulty[]>([...difficulties]);
  const [copyState, setCopyState] = useState<{
    key: string;
    status: "copied" | "failed";
  } | null>(null);

  const bigGenre = useMemo(
    () => groups.find((group) => group.name === activeBigGenre) ?? groups[0],
    [activeBigGenre, groups],
  );

  const smallGenre = useMemo(
    () =>
      bigGenre?.smallGenres.find((group) => group.name === activeSmallGenre) ??
      bigGenre?.smallGenres[0],
    [activeSmallGenre, bigGenre],
  );

  const filteredQuestions = useMemo(
    () =>
      (smallGenre?.questions ?? []).filter((question) =>
        activeDifficulties.includes(question.difficulty),
      ),
    [activeDifficulties, smallGenre],
  );

  function selectBigGenre(name: string) {
    setActiveBigGenre(name);
    setActiveSmallGenre(firstSmallGenre(groups, name));
  }

  function toggleDifficulty(difficulty: Difficulty) {
    setActiveDifficulties((current) =>
      current.includes(difficulty)
        ? current.filter((item) => item !== difficulty)
        : [...current, difficulty],
    );
  }

  async function copyQuestion(question: Question) {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = question.body;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      if (!copied) {
        throw new Error("Copy command failed");
      }
    };

    try {
      if (navigator.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(question.body);
        } catch {
          fallbackCopy();
        }
      } else {
        fallbackCopy();
      }
      setCopyState({ key: questionKey(question), status: "copied" });
    } catch {
      setCopyState({ key: questionKey(question), status: "failed" });
    }
    window.setTimeout(() => setCopyState(null), 1800);
  }

  if (!groups.length || !bigGenre || !smallGenre) {
    return (
      <main className="grid min-h-screen place-items-center px-5 text-ink">
        <p className="rounded-lg bg-white px-5 py-4 font-bold shadow-soft">
          質問JSONがまだ登録されていません。
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist-100 text-ink">
      <section className="relative overflow-hidden bg-mist-500 px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-45">
          <div className="absolute left-[8%] top-[24%] h-px w-[30vw] rotate-12 bg-white/45" />
          <div className="absolute right-[12%] top-[34%] h-px w-[26vw] -rotate-12 bg-white/45" />
          <div className="absolute bottom-[18%] left-[16%] h-px w-[40vw] -rotate-6 bg-white/35" />
        </div>

        <header className="relative z-10 flex items-center justify-between gap-4">
          <a href="#top" className="flex items-center gap-3 text-xl font-bold tracking-normal sm:text-2xl">
            <Image
              src="/ai-chiken-logo.png"
              alt="AI知圏"
              width={44}
              height={44}
              className="h-11 w-11 rounded-lg border border-white/55 object-cover shadow-soft"
            />
            <span>AI知圏</span>
          </a>
        </header>

        <div
          id="top"
          className="relative z-10 grid gap-8 pb-8 pt-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center"
        >
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-white/85">
              Prompt Compass for Learning
            </p>
            <h1 className="text-5xl font-black leading-[1.05] tracking-normal sm:text-7xl lg:text-8xl">
              AI知圏
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
              JSONで育てていける、体系的な質問プロンプト集。大ジャンル、小ジャンル、難易度から目的の問いへ進めます。
            </p>
          </div>

          <Image
            src="/ai-chiken-logo.png"
            alt="AI知圏のロゴ"
            width={560}
            height={560}
            priority
            className="mx-auto w-full max-w-[560px] rounded-lg border border-white/60 object-cover shadow-soft"
          />
        </div>
      </section>

      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-mist-600">
                大ジャンル
              </p>
              <div className="grid gap-2">
                {groups.map((group) => (
                  <button
                    key={group.name}
                    onClick={() => selectBigGenre(group.name)}
                    className={`min-h-12 rounded-md px-4 text-left text-sm font-black transition ${
                      activeBigGenre === group.name
                        ? "bg-mist-600 text-white shadow-soft"
                        : "bg-white text-ink shadow-sm hover:bg-mist-200"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-mist-600">
                小ジャンル
              </p>
              <div className="grid gap-2">
                {bigGenre.smallGenres.map((group) => (
                  <button
                    key={group.name}
                    onClick={() => setActiveSmallGenre(group.name)}
                    className={`min-h-12 rounded-md px-4 text-left text-sm font-black transition ${
                      smallGenre.name === group.name
                        ? "bg-white text-ink shadow-soft ring-2 ring-mist-500"
                        : "bg-white/70 text-ink shadow-sm hover:bg-white"
                    }`}
                  >
                    {group.name}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div>
            <div className="mb-6 flex flex-col justify-between gap-5 border-b border-mist-300 pb-5 md:flex-row md:items-end">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.22em] text-mist-600">
                  Question Sets
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                  {bigGenre.name} / {smallGenre.name}
                </h2>
                <p className="mt-3 text-base leading-7 text-ink/72">
                  {smallGenre.questions.length}件の質問を番号順に表示しています。
                </p>
              </div>

              <fieldset className="rounded-lg bg-white p-3 shadow-sm">
                <legend className="mb-2 px-1 text-xs font-black uppercase tracking-[0.18em] text-mist-600">
                  難易度
                </legend>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((difficulty) => (
                    <label
                      key={difficulty}
                      className="flex min-h-10 cursor-pointer items-center gap-2 rounded-md border border-mist-300 bg-mist-100 px-3 text-sm font-bold"
                    >
                      <input
                        type="checkbox"
                        checked={activeDifficulties.includes(difficulty)}
                        onChange={() => toggleDifficulty(difficulty)}
                        className="h-4 w-4 accent-mist-600"
                      />
                      {difficulty}
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            {filteredQuestions.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {filteredQuestions.map((question) => {
                  const key = questionKey(question);

                  return (
                    <article
                      key={key}
                      className="rounded-lg border border-mist-300 bg-white p-5 shadow-soft"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-mist-200 px-3 py-1 text-xs font-black text-ink">
                              No. {question.id}
                            </span>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${difficultyStyles[question.difficulty]}`}
                            >
                              {question.difficulty}
                            </span>
                          </div>
                          <h3 className="mt-4 text-xl font-black leading-snug tracking-normal">
                            {question.heading}
                          </h3>
                        </div>
                        <button
                          onClick={() => copyQuestion(question)}
                          className="min-h-11 shrink-0 rounded-md bg-mist-600 px-4 text-sm font-black text-white transition hover:bg-mist-500 focus:outline-none focus:ring-4 focus:ring-mist-300"
                          aria-label={`${question.heading}をコピー`}
                        >
                          {copyState?.key === key && copyState.status === "copied"
                            ? "コピー済み"
                            : copyState?.key === key && copyState.status === "failed"
                              ? "失敗"
                              : "コピー"}
                        </button>
                      </div>
                      <p className="mt-4 line-clamp-5 text-sm leading-7 text-ink/72">
                        {question.body}
                      </p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-mist-300 bg-white p-6 text-sm font-bold text-ink/72 shadow-sm">
                選択中の難易度に一致する質問はありません。
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function questionKey(question: Question) {
  return `${question.sourceFile}:${question.smallGenre}:${question.id}`;
}
