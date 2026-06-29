import { RootState } from '@/redux/store';
import { createSlice } from '@reduxjs/toolkit';
import { verifyToken } from '@/utils/verifyToken';

export type TUser = {
  userEmail?: string;
  email?: string;
  role: string;
  iat: number;
  exp: number;
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

// Restore token from localStorage so it survives full-page navigations
let tokenFromStorage: string | null = null;
try {
  tokenFromStorage = normalizeToken(localStorage.getItem('token'));
} catch (err) {
  tokenFromStorage = null;
}

const initialState: TAuthState = {
  user: tokenFromStorage ? (verifyToken(tokenFromStorage) as TUser | null) : null,
  token: tokenFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      const normalizedToken = normalizeToken(token);

      state.user = user ?? (normalizedToken ? (verifyToken(normalizedToken) as TUser | null) : null);
      state.token = normalizedToken;

      try {
        if (normalizedToken) {
          localStorage.setItem('token', normalizedToken);
        } else {
          localStorage.removeItem('token');
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
