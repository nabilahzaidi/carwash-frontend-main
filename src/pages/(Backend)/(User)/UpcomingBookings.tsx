import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetMyBookingsQuery } from '@/redux/features/bookings/BookingApi';
import Empty from '@/components/shared/Empty';
import Loading from '@/components/shared/Loading';

const UpcomingBookings = () => {
  const { data: usersBookings, isLoading } = useGetMyBookingsQuery(undefined);

  if (isLoading) {
    return <Loading />;
  }

  const now = new Date();
  const upcomingBookings = (usersBookings?.data || []).filter((booking: any) => {
    const bookingDateTime = new Date(`${booking.slot.date}T${booking.slot.startTime}`);
    return bookingDateTime.getTime() >= now.getTime();
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Upcoming Bookings</h1>
          <p className="text-slate-600 mt-2">See your upcoming booking schedule with approval and payment status.</p>
        </div>
        <Link
          to="/user/dashboard"
          className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>

      {upcomingBookings.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
          <Table>
            <TableCaption>Your upcoming bookings with time, approval, and payment details.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">#</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Slot Date</TableHead>
                <TableHead>Slot Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingBookings.map((booking: any, index: number) => (
                <TableRow key={booking._id ?? index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>
                    <Link to={`/services/${booking.service._id}`} className="font-semibold text-slate-900 hover:text-blue-600">
                      {booking.service.name}
                    </Link>
                    <p className="text-sm text-slate-500">{booking.service.serviceLevel ?? booking.service.name}</p>
                  </TableCell>
                  <TableCell>{booking.slot.date}</TableCell>
                  <TableCell>
                    {booking.slot.startTime} - {booking.slot.endTime}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      booking.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status || 'Pending'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                      booking.paymentStatus === 'paid'
                        ? 'bg-green-100 text-green-800'
                        : booking.paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.paymentStatus ?? booking.payment?.status ?? 'Pending'}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <Empty text="No upcoming bookings found. Book a service to see it here." />
      )}
    </div>
  );
};

export default UpcomingBookings;
