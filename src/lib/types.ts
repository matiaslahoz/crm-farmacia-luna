export type Session = {
  id: number;
  date: string; // timestamptz
  estado: string | null; // text
  phone: string | number | null; // numeric (usa string o number según preferencia)
  derivar_humano: boolean | null; // bool
  name: string | null; // text
};

export type Chat = {
  id: number;
  date: string;
  tipo: "ia" | "usuario";
  message: string | null;
  session_id: number; // FK a Session.id
};

export type Pedido = {
  id: number;
  date: string;
  total: number; // numeric
  pedido: unknown; // json
  session_id: number; // FK a Session.id
};
