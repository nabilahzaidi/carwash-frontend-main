import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { Image } from 'antd';
import Search from '@/components/ui/Search';

import { useGetBookingsQuery, useUpdateBookingMutation } from '@/redux/features/bookings/BookingApi';
import { Link } from 'react-router-dom';
import Loading from '@/components/shared/Loading';

type TUserFilterValue = {
  searchTerm: String;
};
const RecentBookings = () => {
  const initialFilterValues: TUserFilterValue = {
    searchTerm: '',
  };
  const [filters, setFilters] = useState<TUserFilterValue>(initialFilterValues);
  const { data: bookingDatas, isLoading } = useGetBookingsQuery(filters);
  const [updateBooking] = useUpdateBookingMutation();

  if (isLoading) {
    return <><Loading/></>;
  }

  const formatCsvValue = (value: any) => {
    if (value === null || value === undefined) return '';
    return String(value).replace(/"/g, '""');
  };

  const handleDownloadReport = (booking: any) => {
    const csvRows = [
      ['Booking ID', 'Customer Name', 'Customer Email', 'Customer Phone', 'Service', 'Slot Date', 'Slot Time', 'Status', 'Payment Status', 'Transaction ID'],
      [
        formatCsvValue(booking._id),
        formatCsvValue(booking.customer?.name),
        formatCsvValue(booking.customer?.email),
        formatCsvValue(booking.customer?.phone),
        formatCsvValue(booking.service?.name),
        formatCsvValue(booking.slot?.date),
        formatCsvValue(`${booking.slot?.startTime || ''} - ${booking.slot?.endTime || ''}`),
        formatCsvValue(booking.status || 'Pending'),
        formatCsvValue(booking.paymentStatus),
        formatCsvValue(booking.transactionId),
      ],
    ];

    const csvContent = csvRows.map((row) => row.map((field) => `"${field}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `booking-report-${booking._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearterm = (data: any) => {
    const value = data.value;
    setFilters((prevValues) => ({
      ...prevValues,
      searchTerm: value,
    }));
  };
  return (
    <div>
      <div className="flex justify-between">
        <h3 className="text-2xl font-bold">Booking</h3>
        <div className="border w-60 my-5 rounded-lg">
          <form onChange={(e) => handleSearterm(e.target)} action="">
            <Search />
          </form>
        </div>
      </div>

      {/* //User table */}
      <div>
        <Table>
          <TableCaption>Booking report showing whether each booking is completed.</TableCaption>
          <TableHeader>
            {
              <TableRow>
                <TableHead className="w-[100px]">#</TableHead>
                <TableHead>Customer info</TableHead>
                <TableHead>Service Details</TableHead>
                <TableHead className="">Slots Details</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Done</TableHead>
                <TableHead>Report</TableHead>
                <TableHead className="w-[150px]">Payment Details</TableHead>
              </TableRow>
            }
          </TableHeader>
          <TableBody>
            {bookingDatas?.data?.map((booked: any, i: number) => (
              <TableRow key={booked._id}>
                <TableCell className="font-medium">{i + 1}</TableCell>
                <TableCell className="">
                  <p className="text-sm">{booked.customer.name}</p>
                  <p className="text-sm">{booked.customer.email}</p>
                  <p className="text-sm">0{booked.customer.phone}</p>
                </TableCell>
                <TableCell>
                  <div>
                    <Link to={`/services/${booked.service._id}`}>
                      <p className="">{booked.service.name}</p>
                    </Link>
                    <Image
                      className="max-w-20 rounded-xl"
                      src={booked.service.images}
                      alt=""
                    />
                  </div>
                </TableCell>
                <TableCell className="">
                  <p>{booked.slot.date}</p>
                  <p>
                    {booked.slot.startTime} - {booked.slot.endTime}
                  </p>
                </TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded ${booked.status === 'Completed' ? 'bg-green-100 text-green-800' : booked.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {booked.status || 'Pending'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-2">
                    <span>{booked.status === 'Completed' ? 'Yes' : 'No'}</span>
                    {(booked.status === 'Pending' || booked.status === 'Approved') && (
                      <button
                        type="button"
                        onClick={() => updateBooking({ id: booked._id, status: 'Completed' })}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleDownloadReport(booked)}
                    className="px-3 py-1 bg-slate-600 text-white rounded"
                  >
                    Download
                  </button>
                </TableCell>
                <TableCell className="">
                  <p className="p-2 bg-button-gradient w-fit text-right  rounded-lg text-white">
                    {booked.paymentStatus}
                  </p>
                  <p>{booked.transactionId}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RecentBookings;
