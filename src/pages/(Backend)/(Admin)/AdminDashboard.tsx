import { Link } from 'react-router-dom';
import Loading from '@/components/shared/Loading';
import Empty from '@/components/shared/Empty';
import { useGetBookingsQuery } from '@/redux/features/bookings/BookingApi';
import { useGetAllUserinfoQuery } from '@/redux/features/auths/authApi';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';

const AdminDashboard = () => {
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery(undefined);
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery({
    searchTerm: '',
    sortByPrice: '',
    servicelevel: [],
  });
  const { data: usersData, isLoading: usersLoading } = useGetAllUserinfoQuery(undefined);

  if (bookingsLoading || servicesLoading || usersLoading) {
    return <Loading />;
  }

  const bookings = bookingsData?.data ?? [];
  const services = servicesData?.data ?? [];
  const users = usersData?.data ?? [];

  const completedBookings = bookings.filter(
    (booking: any) => String(booking.status || '').toLowerCase() === 'completed'
  ).length;
  const pendingBookings = bookings.length - completedBookings;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-6 rounded-2xl border border-slate-200 bg-gradient-to-r from-primary/10 via-white to-slate-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Admin Overview</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800">Welcome back, admin</h2>
          <p className="mt-3 text-slate-600">
            Manage bookings, services, and customer accounts from one place.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/admin/bookings" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              View Bookings
            </Link>
            <Link to="/admin/service-management" className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Manage Services
            </Link>
          </div>
        </div>

        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80"
          alt="Admin dashboard preview"
          className="h-44 w-full rounded-2xl object-cover shadow-md md:w-72"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { title: 'Total Bookings', value: bookings.length, hint: `${completedBookings} completed` },
          { title: 'Pending Bookings', value: pendingBookings, hint: 'Needs attention' },
          { title: 'Services', value: services.length, hint: 'Active offerings' },
          { title: 'Users', value: users.length, hint: 'Registered accounts' },
        ].map((card) => (
          <div key={card.title} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{card.title}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-800">{card.value}</p>
            <p className="mt-1 text-sm text-slate-500">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-800">Recent Bookings</h3>
            <Link to="/admin/bookings" className="text-sm font-medium text-primary">
              See all
            </Link>
          </div>

          {bookings.length ? (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Slot</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.slice(0, 5).map((booking: any) => (
                    <tr key={booking._id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-800">{booking.customer?.name || 'Unknown'}</p>
                        <p className="text-slate-500">{booking.customer?.email || ''}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{booking.service?.name || '—'}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {booking.slot?.date || '—'}
                        <br />
                        {booking.slot?.startTime || ''} - {booking.slot?.endTime || ''}
                      </td>
                      <td className="py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${String(booking.status || '').toLowerCase() === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {booking.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <Empty text="No bookings found yet." />
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <h3 className="text-xl font-semibold text-slate-800">Quick Actions</h3>
          <div className="mt-4 flex flex-col gap-3">
            <Link to="/admin/service-management" className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Add or edit services
            </Link>
            <Link to="/admin/user-management" className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Review users
            </Link>
            <Link to="/admin/customer-enquiries" className="rounded-lg border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Open support enquiries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;