export type ChartPoint = { label: string; value: number };

export type Period = "day" | "week" | "month" | "year";

export type Options = {
  key: Period;
  label: string;
};

export type ChatsCardsRow = {
  today_convos: number | string | null;
  new_numbers_today: number | string | null;
  requires_human: number | string | null;
  orders_today: number | string | null;
};

export type ChatsChartRow = {
  bucket: string;
  value: number | string;
};
