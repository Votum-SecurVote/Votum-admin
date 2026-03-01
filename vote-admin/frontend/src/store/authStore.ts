import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'OBSERVER';

export interface AuthUser {
  id: string;
  role: UserRole;
  token: string;
  username?: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      login: (user: AuthUser) => {
        set({ user, isAuthenticated: true });
        localStorage.setItem('auth', JSON.stringify(user));
      },
      logout: () => {
        set({ user: null, isAuthenticated: false });
        localStorage.removeItem('auth');
      },
      hasRole: (role: UserRole | UserRole[]) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) {
          return role.includes(user.role);
        }
        return user.role === role;
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
