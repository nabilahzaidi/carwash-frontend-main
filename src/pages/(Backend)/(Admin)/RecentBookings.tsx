import { useState } from 'react';
import { jsPDF } from 'jspdf';
import { toast } from 'sonner';
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

type TPaymentDraft = {
  paymentStatus: string;
};

const RecentBookings = () => {
  const initialFilterValues: TUserFilterValue = {
    searchTerm: '',
  };
  const [filters, setFilters] = useState<TUserFilterValue>(initialFilterValues);
  const { data: bookingDatas, isLoading } = useGetBookingsQuery(filters);
  const [updateBooking] = useUpdateBookingMutation();
  const [paymentDrafts, setPaymentDrafts] = useState<Record<string, TPaymentDraft>>({});

  if (isLoading) {
    return <><Loading/></>;
  }

  const formatPdfValue = (value: any) => {
    if (value === null || value === undefined || value === '') return 'N/A';
    return String(value);
  };

  const handleDownloadReport = (booking: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text(`Booking Report - ${formatPdfValue(booking._id)}`, 14, 20);

    doc.setFontSize(11);
    const rows = [
      ['Booking ID', formatPdfValue(booking._id)],
      ['Customer Name', formatPdfValue(booking.customer?.name)],
      ['Customer Email', formatPdfValue(booking.customer?.email)],
      ['Customer Phone', formatPdfValue(booking.customer?.phone)],
      ['Service', formatPdfValue(booking.service?.name)],
      ['Slot Date', formatPdfValue(booking.slot?.date)],
      ['Slot Time', formatPdfValue(`${booking.slot?.startTime || ''} - ${booking.slot?.endTime || ''}`)],
      ['Status', formatPdfValue(booking.status || 'Pending')],
      ['Payment Status', formatPdfValue(booking.paymentStatus ?? booking.payment?.status ?? '')],
      ['Transaction ID', formatPdfValue(booking.transactionId)],
    ];

    let y = 40;
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, y);
      y += 8;
    });

    doc.save(`booking-report-${booking._id}.pdf`);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSearterm = (data: any) => {
    const value = data.value;
    setFilters((prevValues) => ({
      ...prevValues,
      searchTerm: value,
    }));
  };

  const handlePaymentDraftChange = (bookingId: string, value: string) => {
    setPaymentDrafts((prev) => ({
      ...prev,
      [bookingId]: {
        paymentStatus: value,
      },
    }));
  };

  const handleSavePayment = async (booking: any) => {
    const draft = paymentDrafts[booking._id] ?? {
      paymentStatus: booking.paymentStatus ?? booking.payment?.status ?? 'Pending',
    };

    try {
      await updateBooking({
        id: booking._id,
        paymentStatus: draft.paymentStatus,
        transactionId: booking.transactionId ?? '',
      }).unwrap();
      toast.success('Payment details updated successfully.');
    } catch {
      toast.error('Failed to update payment details.');
    }
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
                  <div className="space-y-2">
                    <select
                      value={paymentDrafts[booked._id]?.paymentStatus ?? booked.paymentStatus ?? booked.payment?.status ?? 'Pending'}
                      onChange={(e) => handlePaymentDraftChange(booked._id, e.target.value)}
                      className="w-full rounded border px-2 py-1 text-sm"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Paid">Paid</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <div className="rounded border bg-slate-50 px-2 py-1 text-sm text-slate-600">
                      {booked.transactionId || 'No transaction ID'}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSavePayment(booked)}
                      className="px-3 py-1 bg-green-600 text-white rounded"
                    >
                      Save
                    </button>
                  </div>
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
