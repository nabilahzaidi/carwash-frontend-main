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

// Restore token from localStorage so it survives full-page navigations
let tokenFromStorage: string | null = null;
try {
  tokenFromStorage = localStorage.getItem('token');
} catch (err) {
  tokenFromStorage = null;
}

const initialState: TAuthState = {
  user: tokenFromStorage ? (verifyToken(tokenFromStorage) as TUser) : null,
  token: tokenFromStorage,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      const { user, token } = action.payload;
      state.user = user;
      state.token = token;
      try {
        if (token) localStorage.setItem('token', token);
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
