import { baseApi } from '@/redux/api/baseApi';
import {
  getAllUsers,
  getUserProfileByEmail,
  signInWithFirebase,
  signOutFromFirebase,
  signUpWithFirebase,
  updateUserProfile,
  updateUserRole,
} from '@/lib/firebase';

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      async queryFn(userInfo) {
        try {
          const result = await signInWithFirebase(
            String(userInfo?.email || ''),
            String(userInfo?.password || '')
          );
          return { data: { success: true, data: result.user, token: result.token } };
        } catch (error: any) {
          return {
            error: {
              status: 401,
              data: { message: error?.message || 'Login failed' },
            },
          };
        }
      },
    }),

    signup: builder.mutation({
      async queryFn(userInfo) {
        try {
          const result = await signUpWithFirebase(userInfo);
          return { data: { success: true, data: result.user, token: result.token } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Signup failed' },
            },
          };
        }
      },
    }),

    getUserinfo: builder.query({
      async queryFn(userEmail) {
        try {
          const user = await getUserProfileByEmail(String(userEmail || ''));
          return { data: { success: true, data: user } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load user' },
            },
          };
        }
      },
      providesTags: ['auth'],
    }),

    getAllUserinfo: builder.query({
      async queryFn() {
        try {
          const users = await getAllUsers();
          return { data: { success: true, data: users } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load users' },
            },
          };
        }
      },
      providesTags: ['auth'],
    }),

    updateUserInfo: builder.mutation({
      async queryFn(data) {
        try {
          const result = await updateUserProfile(String(data.userId), data);
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Update failed' },
            },
          };
        }
      },
      invalidatesTags: ['auth'],
    }),

    updateUserRole: builder.mutation({
      async queryFn(data) {
        try {
          const result = await updateUserRole(String(data.userId), String(data.role));
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Role update failed' },
            },
          };
        }
      },
      invalidatesTags: ['auth'],
    }),

    logoutFirebase: builder.mutation({
      async queryFn() {
        try {
          await signOutFromFirebase();
          return { data: { success: true } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Logout failed' },
            },
          };
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetUserinfoQuery,
  useGetAllUserinfoQuery,
  useUpdateUserRoleMutation,
  useUpdateUserInfoMutation,
  useLogoutFirebaseMutation,
} = authApi;
