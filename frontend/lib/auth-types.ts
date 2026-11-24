export type UserRole =
  | "student"
  | "teacher"
  | "mentor"
  | "coordinator"
  | "admin"
  | "management";

export type AccountKey =
  | "ashish"
  | "teacher"
  | "student"
  | "mentor"
  | "coordinator"
  | "admin"
  | "management";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  avatarUrl?: string;
  badge?: string;
  hasAcknowledgedConsent?: boolean;
}

export interface AuthState {
  user: UserProfile;
  token: string | null;
  isAuthenticated: boolean;
  activeRole: UserRole;
  activeAccountKey: AccountKey;
  isReadOnly: boolean;
  hasAcknowledgedConsent: boolean;
  login: (role?: UserRole) => void;
  setAuth: (user: UserProfile, token?: string) => void;
  setConsentAcknowledged: () => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}
