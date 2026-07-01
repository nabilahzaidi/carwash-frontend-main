import { baseApi } from '@/redux/api/baseApi';
import {
  createService,
  deleteService,
  getServiceById,
  listServices,
  updateService,
} from '@/lib/firebase';

const serviceApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getServices: builder.query({
      async queryFn(filters) {
        try {
          const services = await listServices(filters as Record<string, unknown> | undefined);
          return { data: { success: true, data: services } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load services' },
            },
          };
        }
      },
      providesTags: ['services'],
    }),

    getSingleServices: builder.query({
      async queryFn(id) {
        try {
          const service = await getServiceById(String(id));
          return { data: { success: true, data: service } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load service' },
            },
          };
        }
      },
      providesTags: ['services'],
    }),

    getAvailableServices: builder.query({
      async queryFn(payload) {
        try {
          const serviceId = String(payload?.serviceId || '');
          const date = String(payload?.date || '');
          const slots = await listAvailableSlots(serviceId, date);
          return { data: { success: true, data: slots } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Unable to load availability' },
            },
          };
        }
      },
      providesTags: ['services'],
    }),

    addService: builder.mutation({
      async queryFn(data) {
        try {
          const service = await createService(data as Record<string, unknown>);
          return { data: { success: true, data: service } };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Service creation failed' },
            },
          };
        }
      },
      invalidatesTags: ['services'],
    }),

    updateService: builder.mutation({
      async queryFn(data) {
        try {
          const result = await updateService(String(data.id), data as Record<string, unknown>);
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Service update failed' },
            },
          };
        }
      },
      invalidatesTags: ['services'],
    }),

    deleteService: builder.mutation({
      async queryFn(id) {
        try {
          const result = await deleteService(String(id));
          return { data: result };
        } catch (error: any) {
          return {
            error: {
              status: 400,
              data: { message: error?.message || 'Service deletion failed' },
            },
          };
        }
      },
      invalidatesTags: ['services'],
    }),
  }),
});

export const {
  useGetServicesQuery,
  useAddServiceMutation,
  useGetSingleServicesQuery,
  useGetAvailableServicesQuery,
  useDeleteServiceMutation,
  useUpdateServiceMutation,
} = serviceApi;
