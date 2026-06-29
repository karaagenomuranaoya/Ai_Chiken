"use client";

import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { type Question } from "@/lib/question-types";

const pageSize = 10;

type ActiveTab = "shuffle" | "search";

type QuestionBrowserProps = {
  questions: Question[];
};

export default function QuestionBrowser({ questions }: QuestionBrowserProps) {
  const [currentQuestions, setCurrentQuestions] = useState<Question[]>(questions);
  const [activeTab, setActiveTab] = useState<ActiveTab>("shuffle");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>(() =>
    questions.slice(0, pageSize),
  );
  const [copyState, setCopyState] = useState<{
    id: number;
    status: "copied" | "failed";
  } | null>(null);
  const copyResetTimer = useRef<number | null>(null);

  const sortedQuestions = useMemo(
    () => [...currentQuestions].sort((first, second) => second.id - first.id),
    [currentQuestions],
  );

  const availableTags = useMemo(() => {
    const tags = new Set<string>();

    for (const question of currentQuestions) {
      for (const tag of question.tags) {
        tags.add(tag);
      }
    }

    return Array.from(tags).sort((first, second) => first.localeCompare(second, "ja"));
  }, [currentQuestions]);

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
      return sortedQuestions;
    }

    return sortedQuestions.filter((question) =>
      normalizeText(`${question.tags.join(" ")} ${question.heading} ${question.body}`).includes(
        normalizedQuery,
      ),
    );
  }, [query, sortedQuestions]);

  const pageCount = Math.max(1, Math.ceil(filteredQuestions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pagedQuestions = filteredQuestions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setPage(1);
  }, [query]);

  useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  useEffect(() => {
    return () => {
      if (copyResetTimer.current) {
        window.clearTimeout(copyResetTimer.current);
      }
    };
  }, []);

  function shuffle() {
    setShuffledQuestions(pickRandomQuestions(currentQuestions, pageSize));
  }

  function addQuestion(question: Question) {
    setCurrentQuestions((current) => [question, ...current]);
    setShuffledQuestions((current) => [question, ...current].slice(0, pageSize));
    setQuery("");
    setPage(1);
    setActiveTab("search");
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
      setCopyState({ id: question.id, status: "copied" });
    } catch {
      setCopyState({ id: question.id, status: "failed" });
    }
    if (copyResetTimer.current) {
      window.clearTimeout(copyResetTimer.current);
    }

    copyResetTimer.current = window.setTimeout(() => setCopyState(null), 1400);
  }

  if (!questions.length) {
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
          <button
            type="button"
            onClick={() => setIsAdminOpen(true)}
            className="min-h-10 rounded-md border border-white/55 bg-white/10 px-4 text-sm font-black text-white transition hover:bg-white/20 focus:outline-none focus:ring-4 focus:ring-white/30"
          >
            管理者
          </button>
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
              問いをタグ、見出し、本文だけで管理するシンプルなプロンプト集。探す時は検索、偶然に任せる時はシャッフルで進めます。
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

      {isAdminOpen ? (
        <AdminDialog
          availableTags={availableTags}
          onClose={() => setIsAdminOpen(false)}
          onAdd={addQuestion}
        />
      ) : null}

      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-wrap gap-2 border-b border-mist-300 pb-5">
            <TabButton
              isActive={activeTab === "shuffle"}
              label="シャッフル"
              onClick={() => setActiveTab("shuffle")}
            />
            <TabButton
              isActive={activeTab === "search"}
              label="検索"
              onClick={() => setActiveTab("search")}
            />
          </div>

          {activeTab === "shuffle" ? (
            <section>
              <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-mist-600">
                    Shuffle
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                    ランダムな10個
                  </h2>
                </div>
                <button
                  type="button"
                  data-testid="shuffle-button"
                  onClick={shuffle}
                  className="min-h-12 rounded-md bg-mist-600 px-5 text-sm font-black text-white shadow-soft transition hover:bg-mist-500 focus:outline-none focus:ring-4 focus:ring-mist-300"
                >
                  シャッフル
                </button>
              </div>

              <QuestionGrid
                questions={shuffledQuestions}
                copyState={copyState}
                onCopy={copyQuestion}
              />
            </section>
          ) : (
            <section>
              <div className="mb-6 grid gap-4 border-b border-mist-300 pb-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.22em] text-mist-600">
                    Search
                  </p>
                  <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                    {filteredQuestions.length}件の質問
                  </h2>
                </div>
                <label className="block">
                  <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mist-600">
                    キーワード
                  </span>
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="タグ、見出し、本文を検索"
                    className="h-12 w-full rounded-md border border-mist-300 bg-white px-4 text-sm font-bold text-ink outline-none transition placeholder:text-ink/35 focus:border-mist-600 focus:ring-4 focus:ring-mist-200"
                  />
                </label>
              </div>

              {pagedQuestions.length ? (
                <>
                  <QuestionGrid
                    questions={pagedQuestions}
                    copyState={copyState}
                    onCopy={copyQuestion}
                  />
                  <Pagination
                    currentPage={currentPage}
                    pageCount={pageCount}
                    onPageChange={setPage}
                  />
                </>
              ) : (
                <div className="rounded-lg border border-mist-300 bg-white p-6 text-sm font-bold text-ink/72 shadow-sm">
                  検索に一致する質問はありません。
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}

function AdminDialog({
  availableTags,
  onClose,
  onAdd,
}: {
  availableTags: string[];
  onClose: () => void;
  onAdd: (question: Question) => void;
}) {
  const [password, setPassword] = useState("");
  const [heading, setHeading] = useState("");
  const [body, setBody] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [status, setStatus] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  function toggleTag(tag: string) {
    setSelectedTags((current) =>
      current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag],
    );
  }

  function addNewTag() {
    const tag = newTag.trim();

    if (!tag) {
      return;
    }

    setSelectedTags((current) => (current.includes(tag) ? current : [...current, tag]));
    setNewTag("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password,
          heading,
          body,
          tags: selectedTags,
        }),
      });
      const result = (await response.json()) as {
        message?: string;
        question?: Question;
      };

      if (!response.ok || !result.question) {
        throw new Error(result.message ?? "追加に失敗しました。");
      }

      onAdd(result.question);
      setHeading("");
      setBody("");
      setSelectedTags([]);
      setNewTag("");
      setStatus({ tone: "success", message: `No. ${result.question.id} を追加しました。` });
    } catch (error) {
      setStatus({
        tone: "error",
        message: error instanceof Error ? error.message : "追加に失敗しました。",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/55 px-4 py-6">
      <form
        onSubmit={submit}
        className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-5 shadow-soft sm:p-6"
      >
        <div className="mb-5 flex items-start justify-between gap-4 border-b border-mist-200 pb-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-mist-600">
              Admin
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-normal">
              質問を追加
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-10 rounded-md border border-mist-300 px-3 text-sm font-black text-ink transition hover:bg-mist-100"
          >
            閉じる
          </button>
        </div>

        <div className="grid gap-4">
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mist-600">
              パスワード
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-12 w-full rounded-md border border-mist-300 bg-white px-4 text-sm font-bold text-ink outline-none transition focus:border-mist-600 focus:ring-4 focus:ring-mist-200"
              autoComplete="current-password"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mist-600">
              見出し
            </span>
            <input
              value={heading}
              onChange={(event) => setHeading(event.target.value)}
              className="h-12 w-full rounded-md border border-mist-300 bg-white px-4 text-sm font-bold text-ink outline-none transition focus:border-mist-600 focus:ring-4 focus:ring-mist-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mist-600">
              質問
            </span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={7}
              className="w-full resize-y rounded-md border border-mist-300 bg-white px-4 py-3 text-sm font-bold leading-7 text-ink outline-none transition focus:border-mist-600 focus:ring-4 focus:ring-mist-200"
            />
          </label>

          <div>
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-mist-600">
              タグ
            </span>
            <div className="mb-3 flex gap-2">
              <input
                value={newTag}
                onChange={(event) => setNewTag(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addNewTag();
                  }
                }}
                placeholder="新しいタグ"
                className="h-11 min-w-0 flex-1 rounded-md border border-mist-300 bg-white px-4 text-sm font-bold text-ink outline-none transition placeholder:text-ink/35 focus:border-mist-600 focus:ring-4 focus:ring-mist-200"
              />
              <button
                type="button"
                onClick={addNewTag}
                className="min-h-11 rounded-md bg-mist-600 px-4 text-sm font-black text-white transition hover:bg-mist-500"
              >
                作成
              </button>
            </div>
            <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto rounded-md border border-mist-200 bg-mist-50 p-3">
              {availableTags.map((tag) => {
                const isSelected = selectedTags.includes(tag);

                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? "border-mist-600 bg-mist-600 text-white"
                        : "border-mist-300 bg-white text-ink/72 hover:bg-mist-100"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full bg-ink px-3 py-1 text-xs font-bold text-white"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {status ? (
            <p
              className={`rounded-md px-4 py-3 text-sm font-bold ${
                status.tone === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
              }`}
            >
              {status.message}
            </p>
          ) : null}

          <div className="flex justify-end gap-2 border-t border-mist-200 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-md border border-mist-300 px-5 text-sm font-black text-ink transition hover:bg-mist-100"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-11 rounded-md bg-mist-600 px-5 text-sm font-black text-white transition hover:bg-mist-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "追加中" : "追加"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TabButton({
  isActive,
  label,
  onClick,
}: {
  isActive: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-md px-5 text-sm font-black transition ${
        isActive
          ? "bg-mist-600 text-white shadow-soft"
          : "bg-white text-ink shadow-sm hover:bg-mist-200"
      }`}
    >
      {label}
    </button>
  );
}

function QuestionGrid({
  questions,
  copyState,
  onCopy,
}: {
  questions: Question[];
  copyState: { id: number; status: "copied" | "failed" } | null;
  onCopy: (question: Question) => void;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {questions.map((question) => (
        <QuestionCard
          key={question.id}
          question={question}
          copyStatus={copyState?.id === question.id ? copyState.status : null}
          onCopy={onCopy}
        />
      ))}
    </div>
  );
}

function QuestionCard({
  question,
  copyStatus,
  onCopy,
}: {
  question: Question;
  copyStatus: "copied" | "failed" | null;
  onCopy: (question: Question) => void;
}) {
  const isCopied = copyStatus === "copied";
  const isFailed = copyStatus === "failed";

  return (
    <article className="rounded-lg border border-mist-300 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-full bg-mist-200 px-3 py-1 text-xs font-black text-ink">
            No. {question.id}
          </span>
          <h3 className="mt-4 text-xl font-black leading-snug tracking-normal">
            {question.heading}
          </h3>
        </div>
        <button
          onClick={() => onCopy(question)}
          className={`relative grid h-11 w-20 shrink-0 place-items-center overflow-hidden rounded-md text-sm font-black text-white transition focus:outline-none focus:ring-4 focus:ring-mist-300 ${
            isCopied
              ? "bg-emerald-500"
              : isFailed
                ? "bg-rose-500"
                : "bg-mist-600 hover:bg-mist-500"
          }`}
          aria-label={
            isCopied
              ? `${question.heading}をコピーしました`
              : isFailed
                ? `${question.heading}のコピーに失敗しました`
                : `${question.heading}をコピー`
          }
        >
          <span
            className={`transition duration-300 ease-out ${
              copyStatus ? "scale-95 opacity-0" : "scale-100 opacity-100"
            }`}
          >
            コピー
          </span>
          <span
            aria-hidden="true"
            className={`absolute inset-0 grid place-items-center transition duration-300 ease-out ${
              isCopied ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            <span className="h-4 w-2.5 rotate-45 rounded-sm border-b-[3px] border-r-[3px] border-white" />
          </span>
          <span
            className={`absolute inset-0 grid place-items-center transition duration-300 ease-out ${
              isFailed ? "scale-100 opacity-100" : "scale-75 opacity-0"
            }`}
          >
            失敗
          </span>
        </button>
      </div>
      <p className="mt-4 line-clamp-5 text-sm leading-7 text-ink/72">
        {question.body}
      </p>
      <MetadataChips values={question.tags} />
    </article>
  );
}

function MetadataChips({ values }: { values: string[] }) {
  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-mist-200 pt-4">
      {values.map((value) => (
        <span
          key={value}
          className="rounded-full border border-mist-200 bg-white px-3 py-1 text-xs font-bold text-ink/72"
        >
          {value}
        </span>
      ))}
    </div>
  );
}

function Pagination({
  currentPage,
  pageCount,
  onPageChange,
}: {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-mist-300 pt-5">
      <p className="text-sm font-bold text-ink/72">
        {currentPage} / {pageCount}ページ
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="min-h-10 rounded-md border border-mist-300 bg-white px-4 text-sm font-black text-ink transition hover:bg-mist-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          前へ
        </button>
        {Array.from({ length: pageCount }, (_, index) => index + 1).map((page) => (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            className={`grid h-10 w-10 place-items-center rounded-md text-sm font-black transition ${
              page === currentPage
                ? "bg-mist-600 text-white shadow-soft"
                : "border border-mist-300 bg-white text-ink hover:bg-mist-100"
            }`}
          >
            {page}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
          disabled={currentPage === pageCount}
          className="min-h-10 rounded-md border border-mist-300 bg-white px-4 text-sm font-black text-ink transition hover:bg-mist-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          次へ
        </button>
      </div>
    </nav>
  );
}

function normalizeText(value: string) {
  return value.toLowerCase().normalize("NFKC").trim();
}

function pickRandomQuestions(questions: Question[], count: number) {
  const shuffled = [...questions];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}
