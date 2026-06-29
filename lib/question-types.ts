export const difficulties = ["入門", "基本", "応用"] as const;

export type Difficulty = (typeof difficulties)[number];

export type Question = {
  bigGenre: string;
  smallGenre: string;
  id: number;
  difficulty: Difficulty;
  heading: string;
  body: string;
  sourceFile: string;
};

export type SmallGenreGroup = {
  name: string;
  questions: Question[];
};

export type BigGenreGroup = {
  name: string;
  smallGenres: SmallGenreGroup[];
};
