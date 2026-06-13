import { useGetMyBookingsQuery } from '@/redux/features/bookings/BookingApi';

import Countdown from './components/CountdownTimer';
import { Link } from 'react-router-dom';
import Empty from '@/components/shared/Empty';
import Loading from '@/components/shared/Loading';

const UserDashboard = () => {
  const { data: usersBookings, isLoading } = useGetMyBookingsQuery(undefined);

  if (isLoading) {
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

  return (
    <div className="space-y-10">
      <div>
        <h4 className="text-3xl font-bold">Upcoming Bookings</h4>
        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 my-10 gap-6">
            {upcomingBookings.map((booked, i) => (
              <div
                className="space-y-3 justify-between bg-primary/5 hover:scale-105 hover:duration-1000 rounded-md hover:shadow-xl border p-6 shadow-md items-center"
                key={booked._id ?? i}
              >
                <div>
                  <Link to={`/services/${booked.service._id}`}>
                    <p className="text-lg font-semibold">{booked.service.name}</p>
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-primary/5 px-3 rounded-lg p-2">
                    <p className="text-sm">Slot Date</p>
                    <p className="text-red-600">{booked.slot.date}</p>
                  </div>

                  <div className="flex gap-4 text-center">
                    <div className="bg-primary/5 px-3 rounded-lg p-2">
                      <p className="text-sm">Start Time</p>
                      <p className="text-red-600">{booked.slot.startTime}</p>
                    </div>
                    <div className="bg-primary/5 px-3 rounded-lg p-2">
                      <p className="text-sm">End Time</p>
                      <p className="text-red-600">{booked.slot.endTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Countdown countdownTargetDate={new Date(`${booked.slot.date}T${booked.slot.startTime}`)} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No upcoming bookings found." />
        )}
      </div>

      <div>
        <h4 className="text-3xl font-bold">Past Bookings</h4>
        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 my-10 gap-6">
            {pastBookings.map((booked, i) => (
              <div
                className="space-y-3 justify-between bg-slate-50 rounded-md border p-6 shadow-sm"
                key={booked._id ?? i}
              >
                <div>
                  <Link to={`/services/${booked.service._id}`}>
                    <p className="text-lg font-semibold">{booked.service.name}</p>
                  </Link>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="bg-slate-100 px-3 rounded-lg p-2">
                    <p className="text-sm">Slot Date</p>
                    <p className="text-slate-700">{booked.slot.date}</p>
                  </div>

                  <div className="flex gap-4 text-center">
                    <div className="bg-slate-100 px-3 rounded-lg p-2">
                      <p className="text-sm">Start Time</p>
                      <p className="text-slate-700">{booked.slot.startTime}</p>
                    </div>
                    <div className="bg-slate-100 px-3 rounded-lg p-2">
                      <p className="text-sm">End Time</p>
                      <p className="text-slate-700">{booked.slot.endTime}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-slate-600">
                  <span>Status: {booked.status || booked.slot.isBooked || 'Unknown'}</span>
                  <span>Paid: {booked.paymentStatus ?? 'Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty text="No past bookings found." />
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
