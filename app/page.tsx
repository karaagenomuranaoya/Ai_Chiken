"use client";

import { useMemo, useState } from "react";

type PromptItem = {
  title: string;
  body: string;
  level: "入門" | "基礎" | "応用" | "整理";
};

type Category = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  prompts: PromptItem[];
};

const categories: Category[] = [
  {
    id: "aws-cloud-practitioner",
    name: "AWSクラウドプラクティショナー",
    subtitle: "クラウドの全体像から試験範囲まで",
    description:
      "AWSの基本概念、主要サービス、料金、セキュリティ、Well-Architectedを順番に確認します。",
    prompts: [
      {
        title: "クラウドの基本概念を地図にする",
        level: "入門",
        body: "AWSクラウドプラクティショナーの学習を始めます。クラウドコンピューティングの基本概念を、オンプレミスとの違い、メリット、責任共有モデル、代表的な利用シーンの順に体系化して説明してください。最後に理解確認の質問を5つ出してください。",
      },
      {
        title: "主要サービスを用途別に分類する",
        level: "基礎",
        body: "AWSの主要サービスを、コンピューティング、ストレージ、データベース、ネットワーク、セキュリティ、監視のカテゴリに分けて、試験で押さえるべき観点で説明してください。サービス名の暗記ではなく、どんな課題にどのサービスを使うかで整理してください。",
      },
      {
        title: "料金とサポートを試験目線で整理する",
        level: "基礎",
        body: "AWSクラウドプラクティショナー試験に出る料金モデル、コスト管理、請求、サポートプランについて、混同しやすい用語を比較表にして説明してください。最後に、よくあるひっかけ問題のパターンを教えてください。",
      },
      {
        title: "模擬試験後の弱点分析をする",
        level: "整理",
        body: "AWSクラウドプラクティショナーの模擬試験結果をもとに弱点分析をしたいです。私が間違えた問題や迷った問題を貼るので、出題領域、誤解している概念、復習すべき順番、次に解くべき問題タイプに分けて整理してください。",
      },
    ],
  },
  {
    id: "world-history",
    name: "世界史",
    subtitle: "時代・地域・因果関係でたどる",
    description:
      "出来事の丸暗記ではなく、文明、交易、宗教、帝国、革命をつながりで見ます。",
    prompts: [
      {
        title: "世界史の大きな時代区分をつかむ",
        level: "入門",
        body: "世界史を体系的に学びたいです。古代、中世、近世、近代、現代の大きな時代区分ごとに、中心テーマ、代表的な地域、重要な変化を整理してください。細かい年号より、何がどう変わったのかを重視してください。",
      },
      {
        title: "文明の成立を比較する",
        level: "基礎",
        body: "メソポタミア、エジプト、インダス、中国文明を比較して、自然環境、政治、文字、宗教、交易の観点から共通点と違いを説明してください。最後に、比較して覚えるための質問を10個作ってください。",
      },
      {
        title: "交易路から世界史をつなぐ",
        level: "応用",
        body: "シルクロード、インド洋交易、大西洋交易を軸に、世界史のつながりを説明してください。商品、宗教、技術、疫病、帝国の拡大がどのように結びついたかを因果関係で整理してください。",
      },
      {
        title: "革命の連鎖を理解する",
        level: "整理",
        body: "イギリス革命、アメリカ独立革命、フランス革命、産業革命を、背景、主体、結果、後世への影響で比較してください。暗記すべきポイントと、論述で使える因果関係を分けて説明してください。",
      },
    ],
  },
  {
    id: "linear-algebra",
    name: "線形代数",
    subtitle: "ベクトルから固有値まで",
    description:
      "計算手順だけでなく、空間・写像・基底という見取り図から理解します。",
    prompts: [
      {
        title: "線形代数の全体像を作る",
        level: "入門",
        body: "線形代数を体系的に学びたいです。ベクトル、行列、連立一次方程式、線形写像、基底、次元、固有値・固有ベクトルがどのようにつながるのか、学習順に沿って説明してください。抽象概念は図を言葉で描くように説明してください。",
      },
      {
        title: "行列を線形写像として理解する",
        level: "基礎",
        body: "行列を単なる数字の表ではなく、空間を変形する線形写像として理解したいです。2次元の具体例を使って、回転、拡大縮小、射影、せん断を説明し、それぞれの行列がベクトルに何をしているのかを示してください。",
      },
      {
        title: "基底と次元の混乱をほどく",
        level: "基礎",
        body: "線形代数の基底、張る、一次独立、次元が混乱しています。直感的な説明、厳密な定義、具体例、よくある誤解の順で整理してください。最後に、自分で判定するための練習問題を5つ出してください。",
      },
      {
        title: "固有値の意味を応用まで見る",
        level: "応用",
        body: "固有値と固有ベクトルの意味を、計算手順だけでなく、線形変換の中で方向が保たれるという直感から説明してください。対角化、主成分分析、微分方程式への応用にどうつながるかも概観してください。",
      },
    ],
  },
];

const levelStyles: Record<PromptItem["level"], string> = {
  入門: "bg-mist-600 text-white",
  基礎: "bg-mist-100 text-ink",
  応用: "bg-mist-200 text-ink",
  整理: "bg-white text-ink",
};

export default function Home() {
  const [activeId, setActiveId] = useState(categories[0].id);
  const [copyState, setCopyState] = useState<{
    title: string;
    status: "copied" | "failed";
  } | null>(null);

  const activeCategory = useMemo(
    () => categories.find((category) => category.id === activeId) ?? categories[0],
    [activeId],
  );

  async function copyPrompt(prompt: PromptItem) {
    const fallbackCopy = () => {
      const textarea = document.createElement("textarea");
      textarea.value = prompt.body;
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
          await navigator.clipboard.writeText(prompt.body);
        } catch {
          fallbackCopy();
        }
      } else {
        fallbackCopy();
      }
      setCopyState({ title: prompt.title, status: "copied" });
    } catch {
      setCopyState({ title: prompt.title, status: "failed" });
    }
    window.setTimeout(() => setCopyState(null), 1800);
  }

  return (
    <main className="min-h-screen overflow-hidden">
      <section className="relative flex min-h-screen flex-col px-5 py-5 text-white sm:px-8 lg:px-12">
        <div className="pointer-events-none absolute inset-0 opacity-55">
          <div className="absolute left-[8%] top-[18%] h-px w-[30vw] rotate-12 bg-white/45" />
          <div className="absolute right-[12%] top-[30%] h-px w-[26vw] -rotate-12 bg-white/45" />
          <div className="absolute bottom-[21%] left-[16%] h-px w-[40vw] -rotate-6 bg-white/35" />
        </div>

        <header className="relative z-10 flex items-center justify-between gap-4">
          <a
            href="#top"
            className="flex items-center gap-3 text-xl font-bold tracking-normal sm:text-2xl"
          >
            <img
              src="/ai-chiken-logo.png"
              alt="AI知圏"
              className="h-11 w-11 rounded-lg border border-white/55 object-cover shadow-soft"
            />
            <span>AI知圏</span>
          </a>
          <nav className="hidden items-center gap-2 rounded-full border border-white/45 bg-mist-600/25 px-2 py-2 backdrop-blur md:flex">
            {categories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="rounded-full px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/24"
                onClick={() => setActiveId(category.id)}
              >
                {category.name}
              </a>
            ))}
          </nav>
        </header>

        <div
          id="top"
          className="relative z-10 grid flex-1 content-center gap-8 pb-8 pt-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center"
        >
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.28em] text-white/85">
              Prompt Compass for Learning
            </p>
            <h1 className="text-5xl font-black leading-[1.05] tracking-normal sm:text-7xl lg:text-8xl">
              AI知圏
            </h1>
            <p className="mt-6 max-w-xl text-lg font-medium leading-8 text-white/90 sm:text-xl">
              AIと学ぶときに迷子にならないための、体系的な質問プロンプト集。
              ぶつ切りの答えではなく、一連の知識をたどる羅針盤を置いています。
            </p>
          </div>

          <div className="grid gap-5">
            <img
              src="/ai-chiken-logo.png"
              alt="AI知圏のロゴ"
              className="mx-auto w-full max-w-[620px] rounded-lg border border-white/60 object-cover shadow-soft"
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {categories.map((category) => (
                <button
                  id={category.id}
                  key={category.id}
                  onClick={() => setActiveId(category.id)}
                  className={`group min-h-36 rounded-lg border p-5 text-left shadow-soft backdrop-blur transition ${
                    activeId === category.id
                      ? "border-white bg-white/34"
                      : "border-white/40 bg-mist-600/20 hover:bg-white/25"
                  }`}
                >
                  <span className="text-xs font-bold uppercase tracking-[0.22em] text-white/78">
                    Category
                  </span>
                  <h2 className="mt-3 text-lg font-black leading-tight text-white">
                    {category.name}
                  </h2>
                  <p className="mt-3 text-sm font-medium leading-6 text-white/86">
                    {category.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-mist-100 px-5 py-10 text-ink sm:px-8 lg:px-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.22em] text-mist-600">
                Question Sets
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                {activeCategory.name}
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-7 text-ink/75">
                {activeCategory.description}
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-mist-200 p-1 shadow-soft">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveId(category.id)}
                  className={`min-h-11 rounded-md px-3 text-sm font-bold transition ${
                    activeId === category.id
                      ? "bg-white text-ink shadow-sm"
                      : "text-ink/80 hover:bg-white/70"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {activeCategory.prompts.map((prompt) => (
              <article
                key={prompt.title}
                className="rounded-lg border border-mist-300 bg-white p-5 shadow-soft"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${levelStyles[prompt.level]}`}
                    >
                      {prompt.level}
                    </span>
                    <h3 className="mt-4 text-xl font-black leading-snug tracking-normal">
                      {prompt.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => copyPrompt(prompt)}
                    className="min-h-11 shrink-0 rounded-md bg-mist-600 px-4 text-sm font-black text-white transition hover:bg-mist-500 focus:outline-none focus:ring-4 focus:ring-mist-300"
                    aria-label={`${prompt.title}をコピー`}
                  >
                    {copyState?.title === prompt.title && copyState.status === "copied"
                      ? "コピー済み"
                      : copyState?.title === prompt.title && copyState.status === "failed"
                        ? "失敗"
                        : "コピー"}
                  </button>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-7 text-ink/72">
                  {prompt.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
