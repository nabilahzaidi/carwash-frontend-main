
import { useGetBookingsQuery } from '@/redux/features/bookings/BookingApi';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { useGetAllUserinfoQuery } from '@/redux/features/auths/authApi';
import { Link } from 'react-router-dom';
import Loading from '@/components/shared/Loading';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AdminDashboard = () => {
  const { data: bookingsData, isLoading: bookingsLoading } = useGetBookingsQuery({});
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery({});
  const { data: usersData, isLoading: usersLoading } = useGetAllUserinfoQuery({});

  if (bookingsLoading || servicesLoading || usersLoading) {
    return <Loading />;
  }

  const bookings = bookingsData?.data || [];
  const services = servicesData?.data || [];
  const users = usersData?.data || [];

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter((b: any) => b.status === 'completed').length;
  const pendingBookings = bookings.filter((b: any) => b.status === 'pending').length;
  const activeServices = services.filter((s: any) => s.isActive !== false).length;

  const recentBookings = bookings.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back, admin</h1>
          <p className="text-slate-600 text-lg">Manage bookings, services, and customer accounts from one place.</p>
          <div className="flex gap-4 mt-6">
            <Link
              to="/admin/bookings"
              className="bg-slate-900 text-white px-6 py-3 rounded-md font-medium hover:bg-slate-800 transition"
            >
              View Bookings
            </Link>
            <Link
              to="/admin/service-management"
              className="border border-slate-300 text-slate-900 px-6 py-3 rounded-md font-medium hover:bg-slate-50 transition"
            >
              Manage Services
            </Link>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="w-80 h-48 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
            <div className="text-center text-white">
              <svg
                className="w-32 h-32 mx-auto mb-2 opacity-80"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="text-sm">Car Wash</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Total Bookings</h3>
          <p className="text-4xl font-bold text-slate-900 mb-2">{totalBookings}</p>
          <p className="text-slate-500 text-sm">{completedBookings} completed</p>
        </div>

        {/* Pending Bookings */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Pending Bookings</h3>
          <p className="text-4xl font-bold text-orange-600 mb-2">{pendingBookings}</p>
          <p className="text-slate-500 text-sm">Needs attention</p>
        </div>

        {/* Services */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Services</h3>
          <p className="text-4xl font-bold text-slate-900 mb-2">{activeServices}</p>
          <p className="text-slate-500 text-sm">Active offerings</p>
        </div>

        {/* Users */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Users</h3>
          <p className="text-4xl font-bold text-slate-900 mb-2">{users.length}</p>
          <p className="text-slate-500 text-sm">Registered accounts</p>
        </div>
      </div>

      {/* Recent Bookings & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Recent Bookings</h2>
            <Link to="/admin/bookings" className="text-blue-600 hover:text-blue-800 font-medium">
              See all
            </Link>
          </div>

          {recentBookings.length > 0 ? (
            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="text-slate-600">Customer</TableHead>
                    <TableHead className="text-slate-600">Service</TableHead>
                    <TableHead className="text-slate-600">Date</TableHead>
                    <TableHead className="text-slate-600">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentBookings.map((booking: any) => (
                    <TableRow key={booking._id} className="hover:bg-slate-50">
                      <TableCell className="font-medium">{booking.customer?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.service?.name || 'N/A'}</TableCell>
                      <TableCell>{booking.slot?.date || 'N/A'}</TableCell>
                      <TableCell>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            booking.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : booking.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1) || 'Unknown'}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md border border-slate-200 p-12 text-center">
              <svg
                className="w-12 h-12 mx-auto mb-4 text-slate-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-slate-600 text-lg">No bookings found yet.</p>
              <p className="text-slate-500 text-sm">It looks like you haven't booked anything. Please make a booking to see it here.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              to="/admin/service-management"
              className="block bg-white rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg hover:border-blue-300 transition"
            >
              <p className="text-slate-900 font-medium">Add or edit services</p>
            </Link>
            <Link
              to="/admin/user-management"
              className="block bg-white rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg hover:border-blue-300 transition"
            >
              <p className="text-slate-900 font-medium">Review users</p>
            </Link>
            <Link
              to="/admin/customer-enquiries"
              className="block bg-white rounded-lg p-4 shadow-md border border-slate-200 hover:shadow-lg hover:border-blue-300 transition"
            >
              <p className="text-slate-900 font-medium">Open support enquiries</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;