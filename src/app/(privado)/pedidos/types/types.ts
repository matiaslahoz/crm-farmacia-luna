export type UiOrder = {
  id: number;
  created_at: string;
  total: number;
  items: unknown;
  name: string | null;
  phone: number | string | null;
  status: string;
};
