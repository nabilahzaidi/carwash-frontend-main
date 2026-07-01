import { useGetMyBookingsQuery } from '@/redux/features/bookings/BookingApi';
import { useGetServicesQuery } from '@/redux/features/services/servicesApi';
import { Link } from 'react-router-dom';
import Empty from '@/components/shared/Empty';
import Loading from '@/components/shared/Loading';

const UserDashboard = () => {
  const { data: usersBookings, isLoading } = useGetMyBookingsQuery(undefined);
  const { data: servicesData, isLoading: servicesLoading } = useGetServicesQuery({});

  if (isLoading || servicesLoading) {
    return (
      <>
        <Loading />
      </>
    );
  }

  const parseDateTime = (date: string, time: string) => new Date(`${date}T${time}`);
  const now = new Date();

  const sortedBookings = [...usersBookings?.data || []].sort((a, b) => {
    const dateTimeA = parseDateTime(a.slot.date, a.slot.startTime);
    const dateTimeB = parseDateTime(b.slot.date, b.slot.startTime);
    return dateTimeA.getTime() - dateTimeB.getTime();
  });

  const upcomingBookings = sortedBookings.filter((booking) => {
    const bookingDateTime = parseDateTime(booking.slot.date, booking.slot.startTime);
    return bookingDateTime.getTime() >= now.getTime();
  });

  const pastBookings = sortedBookings.filter((booking) => {
    const bookingDateTime = parseDateTime(booking.slot.date, booking.slot.startTime);
    return bookingDateTime.getTime() < now.getTime();
  });

  const completedBookings = pastBookings.filter((b: any) => b.status === 'completed').length;
  const services = servicesData?.data || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600 text-lg">Book our premium car wash services and keep your vehicle in perfect condition.</p>
          <div className="flex gap-4 mt-6">
            <Link
              to="/services"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition"
            >
              Browse Services
            </Link>
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="w-80 h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
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
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm">Sparkling Clean</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Bookings */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Total Bookings</h3>
          <p className="text-4xl font-bold text-slate-900 mb-2">{sortedBookings.length}</p>
          <p className="text-slate-500 text-sm">{completedBookings} completed</p>
        </div>

        {/* Upcoming Bookings */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Upcoming Bookings</h3>
          <p className="text-4xl font-bold text-blue-600 mb-2">{upcomingBookings.length}</p>
          <p className="text-slate-500 text-sm">Services scheduled</p>
        </div>

        {/* Available Services */}
        <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
          <h3 className="text-slate-600 text-sm font-medium mb-2">Available Services</h3>
          <p className="text-4xl font-bold text-slate-900 mb-2">{services.filter((s: any) => s.isActive !== false).length}</p>
          <p className="text-slate-500 text-sm">Ready to book</p>
        </div>
      </div>

      <div className="space-y-10">
        <div>
          <h4 className="text-3xl font-bold text-slate-900 mb-6">Upcoming Bookings</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <h3 className="text-slate-600 text-sm font-medium mb-2">Upcoming Bookings</h3>
              <p className="text-4xl font-bold text-blue-600 mb-2">{upcomingBookings.length}</p>
              <p className="text-slate-500 text-sm">Scheduled services</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200">
              <h3 className="text-slate-600 text-sm font-medium mb-2">Next Booking</h3>
              {upcomingBookings[0] ? (
                <>
                  <p className="text-lg font-semibold text-slate-900">{upcomingBookings[0].service.name}</p>
                  <p className="text-sm text-slate-500">{upcomingBookings[0].slot.date}</p>
                  <p className="text-sm text-slate-500">{upcomingBookings[0].slot.startTime} - {upcomingBookings[0].slot.endTime}</p>
                </>
              ) : (
                <p className="text-sm text-slate-500">No upcoming bookings yet.</p>
              )}
            </div>
            <div className="bg-white rounded-lg p-6 shadow-md border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-slate-600 text-sm mb-2">Manage bookings</p>
                <Link
                  to="/user/up-coming-booking"
                  className="inline-flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  View Upcoming Bookings
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div>
          <h4 className="text-3xl font-bold text-slate-900 mb-6">Bookings</h4>
          {pastBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastBookings.map((booked, i) => (
                <div
                  className="space-y-3 justify-between bg-slate-50 rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition"
                  key={booked._id ?? i}
                >
                  <div>
                    <Link to={`/services/${booked.service._id}`}>
                      <p className="text-lg font-semibold text-slate-900">{booked.service.name}</p>
                    </Link>
                  </div>

                  <div className="flex flex-col gap-3">
                    <div className="bg-white px-3 rounded-lg p-2 border border-slate-200">
                      <p className="text-sm text-slate-600">Slot Date</p>
                      <p className="text-slate-700 font-semibold">{booked.slot.date}</p>
                    </div>

                    <div className="flex gap-4 text-center">
                      <div className="bg-white px-3 rounded-lg p-2 border border-slate-200 flex-1">
                        <p className="text-sm text-slate-600">Start Time</p>
                        <p className="text-slate-700 font-semibold">{booked.slot.startTime}</p>
                      </div>
                      <div className="bg-white px-3 rounded-lg p-2 border border-slate-200 flex-1">
                        <p className="text-sm text-slate-600">End Time</p>
                        <p className="text-slate-700 font-semibold">{booked.slot.endTime}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                    <span className="text-slate-600">
                      Status: <span className="font-medium text-slate-900">{booked.status || 'Unknown'}</span>
                    </span>
                    <span className="text-slate-600">
                      Payment: <span className={`font-medium ${booked.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                        {booked.paymentStatus ?? 'Pending'}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Empty text="No bookings found." />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
