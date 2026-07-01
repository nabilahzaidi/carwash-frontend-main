import PageBanner from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUpdateBookingMutation } from '@/redux/features/bookings/BookingApi';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, booking, cardType, maskedCard } = location.state || {};
  const [updateBooking] = useUpdateBookingMutation();
  const [creating, setCreating] = useState(false);

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
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => navigate('/')}>Go Home</Button>
            <Button onClick={() => navigate('/user/up-coming-booking')}>My Bookings</Button>
          </div>
          {creating && <p className="mt-4 text-sm">Recording booking...</p>}
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
