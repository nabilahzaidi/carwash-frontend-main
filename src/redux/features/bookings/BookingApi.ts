import { baseApi } from '@/redux/api/baseApi';
import {
  createBooking,
  deleteBooking,
  getBookingById,
  listBookings,
  updateBooking,
} from '@/lib/firebase';

const bookingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBookings: builder.query({
      async queryFn() {
        try {
          const bookings = await listBookings();
          return { data: { success: true, data: bookings } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load bookings' },
            },
          };
        }
      },
      providesTags: ['bookings'],
    }),

    getMyBookings: builder.query({
      async queryFn(_arg, _queryApi, _extraOptions) {
        try {
          const bookings = await listBookings();
          return { data: { success: true, data: bookings } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load your bookings' },
            },
          };
        }
      },
      providesTags: ['bookings'],
    }),

    getSingleBooking: builder.query({
      async queryFn(id) {
        try {
          const booking = await getBookingById(String(id));
          return { data: { success: true, data: booking } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load booking' },
            },
          };
        }
      },
      providesTags: ['bookings'],
    }),

    addBooking: builder.mutation({
      async queryFn(data) {
        try {
          const booking = await createBooking(data as Record<string, unknown>);
          return { data: { success: true, data: booking } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Booking creation failed' },
            },
          };
        }
      },
      invalidatesTags: ['bookings'],
    }),

    initiateQuickPayment: builder.mutation({
      async queryFn(data) {
        return { data: { success: true, data, message: 'Payment stub ready' } };
      },
    }),

    updateBooking: builder.mutation({
      async queryFn(data) {
        try {
          const result = await updateBooking(String(data.id), data as Record<string, unknown>);
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Booking update failed' },
            },
          };
        }
      },
      invalidatesTags: ['bookings'],
    }),

    deleteBooking: builder.mutation({
      async queryFn(id) {
        try {
          const result = await deleteBooking(String(id));
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Booking deletion failed' },
            },
          };
        }
      },
      invalidatesTags: ['bookings'],
    }),
  }),
});

export const {
  useAddBookingMutation,
  useDeleteBookingMutation,
  useGetBookingsQuery,
  useGetSingleBookingQuery,
  useUpdateBookingMutation,
  useGetMyBookingsQuery,
  useInitiateQuickPaymentMutation,
} = bookingApi;
