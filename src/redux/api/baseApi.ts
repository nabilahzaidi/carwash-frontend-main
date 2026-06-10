import {
  BaseQueryApi,
  BaseQueryFn,
  createApi,
  DefinitionType,
  FetchArgs,
  fetchBaseQuery,
} from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { toast } from 'sonner';
import { logout, setUser } from '../features/auths/authSlice';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';
const baseUrl = import.meta.env.DEV ? '/api' : `${API_BASE}/api`;

const baseQuery = fetchBaseQuery({
  baseUrl,
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.token;
    
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

const baseQueryWithRefreshToken: BaseQueryFn<
  FetchArgs,
  BaseQueryApi,
  DefinitionType
> = async (args, api, extraOptions): Promise<any> => {
  let result = await baseQuery(args, api, extraOptions);

  
  if (result?.error?.status === 404) {
    const errorMsg =(result.error.data as {message:string}).message;
    toast.error(errorMsg)
  }
  if (result?.error?.status === 403) {
    const errorMsg =(result.error.data as {message:string}).message;
    toast.error(errorMsg)
  }
  if (result?.error?.status === 401) {
    const refreshUrl = import.meta.env.DEV
      ? '/api/auth/refresh-token'
      : `${API_BASE}/api/auth/refresh-token`;

    const res = await fetch(refreshUrl, {
      method: 'POST',
      credentials: 'include',
    });

    const data = await res.json();

    if (data?.data?.accessToken) {
      const user = (api.getState() as RootState).auth.user;

      api.dispatch(
        setUser({
          user,
          token: data.data.accessToken,
        })
      );

      result = await baseQuery(args, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};


export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithRefreshToken,
  tagTypes: ['bookings', 'services', 'auth','slots',"reviews"],
  endpoints: () => ({}),
});
