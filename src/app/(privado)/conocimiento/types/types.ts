export type DocKey = "kb_sinonimos" | "kb_institucional" | "kb_questions";

export type Panel = {
  key: DocKey;
  title: string;
  hint: string;
  icon: string;
};

export type RowSynonyms = { aliases: string; canonical: string };
