export type PedidoRowJoined = {
  id: number;
  created_at: string; // timestamptz
  total: number; // numeric
  items: unknown; // json
  session_id: number;
  name: string | null;
  phone: number | string | null;
};

export type UiOrder = {
  id: number;
  created_at: string;
  total: number;
  items: unknown;
  name: string | null;
  phone: number | string | null;
};
