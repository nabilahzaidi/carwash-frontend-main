import { RootState } from '@/redux/store';
import { createSlice } from '@reduxjs/toolkit';
import { verifyToken } from '@/utils/verifyToken';

export type TUser = {
  userEmail?: string;
  email?: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: unknown;
};

type TAuthState = {
  user: null | TUser;
  token: null | string;
};

const normalizeToken = (value: string | null | undefined): string | null => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const unquoted = trimmed.replace(/^['"]|['"]$/g, '');
  return unquoted || null;
};

const getStoredUser = (): TUser | null => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;

    const parsedUser = JSON.parse(rawUser) as TUser;
    return parsedUser && typeof parsedUser === 'object' ? parsedUser : null;
  } catch (err) {
    return null;
  }
};

// Restore token from localStorage so it survives full-page navigations
let tokenFromStorage: string | null = null;
try {
  tokenFromStorage = normalizeToken(localStorage.getItem('token'));
} catch (err) {
  tokenFromStorage = null;
}

const initialState: TAuthState = {
  user: getStoredUser() ?? (tokenFromStorage ? (verifyToken(tokenFromStorage) as TUser | null) : null),
  token: tokenFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      const normalizedToken = normalizeToken(token);
      const decodedUser = normalizedToken ? (verifyToken(normalizedToken) as TUser | null) : null;
      const resolvedUser = user ?? decodedUser;

      state.user = resolvedUser;
      state.token = normalizedToken;

      try {
        if (normalizedToken) {
          localStorage.setItem('token', normalizedToken);
        } else {
          localStorage.removeItem('token');
        }

        if (resolvedUser) {
          localStorage.setItem('user', JSON.stringify(resolvedUser));
        } else {
          localStorage.removeItem('user');
        }
      } catch (err) {
        // ignore localStorage errors
      }
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch (err) {
        // ignore
      }
    },
  },
});

export const { setUser, logout } = authSlice.actions;

export default authSlice.reducer;

export const useCurrentToken = (state: RootState) => state.auth.token;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const getStoredToken = (): string | null => {
  try {
    return normalizeToken(localStorage.getItem('token'));
  } catch (err) {
    return null;
  }
};
