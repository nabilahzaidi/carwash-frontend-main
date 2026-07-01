import PageBanner from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUpdateBookingMutation } from '@/redux/features/bookings/BookingApi';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, booking, cardType, maskedCard } = location.state || {};
  const [updateBooking] = useUpdateBookingMutation();
  const [creating, setCreating] = useState(false);

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    const invoiceNumber = paymentData?.transactionId || booking?._id || 'INV-001';
    const amount = paymentData?.totalPrice ?? booking?.service?.price ?? '0';
    const customerName = paymentData?.customerName || booking?.customer?.name || 'Customer';
    const serviceName = booking?.service?.name || 'Service';

    doc.setFontSize(18);
    doc.text('Car Wash Payment Invoice', 14, 20);

    doc.setFontSize(11);
    const rows = [
      ['Invoice No', invoiceNumber],
      ['Customer', customerName],
      ['Service', serviceName],
      ['Amount', `${amount}`],
      ['Payment Status', 'Paid'],
      ['Card', `${cardType || 'Visa'} ${maskedCard || ''}`],
    ];

    let y = 40;
    rows.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${label}:`, 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(String(value), 60, y);
      y += 8;
    });

    doc.save(`invoice-${invoiceNumber}.pdf`);
  };

  useEffect(() => {
    const markPaid = async () => {
      if (!booking?._id) return;
      setCreating(true);
      try {
        await updateBooking({
          id: booking._id,
          paymentStatus: 'Paid',
          transactionId: paymentData?.transactionId,
        }).unwrap();
        toast.success('Payment recorded and booking marked as paid.');
      } catch (err: any) {
        toast.error('Payment recorded but failed to update booking status. Please contact support.');
      } finally {
        setCreating(false);
      }
    };

    markPaid();
  }, [booking, updateBooking]);

  return (
    <div>
      <PageBanner pageName="Payment Successful" />
      <div className="container mx-auto p-6">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Payment Successful</h2>
          <p className="mb-2">Transaction ID: <strong>{paymentData?.transactionId}</strong></p>
          <p className="mb-2">Amount: <strong>{paymentData?.totalPrice ?? booking?.service?.price}</strong></p>
          <p className="mb-2">Paid with: <strong>{cardType} {maskedCard}</strong></p>
          <div className="mt-6 flex justify-center gap-4 flex-wrap">
            <Button onClick={handleDownloadInvoice} className="bg-blue-600 text-white hover:bg-blue-700">Download Invoice PDF</Button>
            <Button onClick={() => navigate('/')} className="bg-blue-600 text-white hover:bg-blue-700">Go Home</Button>
            <Button onClick={() => navigate('/user/up-coming-booking')} className="bg-blue-600 text-white hover:bg-blue-700">My Bookings</Button>
          </div>
          {creating && <p className="mt-4 text-sm">Recording booking...</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
