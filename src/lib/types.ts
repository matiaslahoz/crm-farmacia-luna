export type Chat = {
  id: number;
  date: string;
  type?: string;
  message?: string | null;
  user_id: number;
  users?: User | null;
};

export type ChatGroup = {
  user_id: number;
  name?: string;
  phone?: string;
  chats: Chat[];
  latest: Chat;
  hasPendingOrder?: boolean;
};

export type UserRow = {
  id: number;
  display_name: string;
  real_name: string | null;
  phone: string;
  created_at: string;
};

export type ChatRow = {
  id: number;
  date: string;
  type?: string;
  message?: string | null;
  user_id: number;
  users: UserRow | UserRow[] | null;
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
