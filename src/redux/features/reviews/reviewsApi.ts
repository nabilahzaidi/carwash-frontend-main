import { baseApi } from '@/redux/api/baseApi';
import { createReview, deleteReview, listReviews } from '@/lib/firebase';

const reviewsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviews: builder.query({
      async queryFn() {
        try {
          const reviews = await listReviews();
          return { data: { success: true, data: reviews } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load reviews' },
            },
          };
        }
      },
      providesTags: ['reviews'],
    }),

    addReview: builder.mutation({
      async queryFn(data) {
        try {
          const review = await createReview(data as Record<string, unknown>);
          return { data: { success: true, data: review } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Review submission failed' },
            },
          };
        }
      },
      invalidatesTags: ['reviews'],
    }),

    deleteReview: builder.mutation({
      async queryFn(id) {
        try {
          const result = await deleteReview(String(id));
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Review deletion failed' },
            },
          };
        }
      },
      invalidatesTags: ['reviews'],
    }),
  }),
});

export const {
  useAddReviewMutation,
  useDeleteReviewMutation,
  useGetReviewsQuery,
} = reviewsApi;
