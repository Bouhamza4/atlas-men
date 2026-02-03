export type Role = 'user' | 'admin' | 'moderator';

export type Profile = {
  id: string;
  email: string;
  role: Role;
  created_at: string;
};
