export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  isVerified?: boolean;
}

export interface SessionPayload {
  id: string;
  email: string;
  name: string;
}
