export type Chat = {
  id: number;
  date: string;
  type?: string;
  message?: string | null;
  user_id: number;
  users: User[] | User;
};

export type ChatGroup = {
  user_id: number;
  name: string;
  phone: string;
  latest: Chat;
  hasPendingOrder?: boolean;
};

export type Session = {
  user_id: number;
  user_name: string | null;
  user_phone: string | null;
  last_chat_id: number | null;
  last_date: string | null;
  last_type: string | null;
  last_message: string | null;
  has_pending_order: boolean | null;
};

export type User = {
  id: number;
  display_name: string;
  real_name: string | null;
  phone: string;
  created_at: string;
};

export type Pedido = {
  id: number;
  created_at: string;
  user_id: number;
  status: string;
};
