import PageBanner from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
// use native inputs here (CRInput requires CRForm/react-hook-form)
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'sonner';
import { useUpdateBookingMutation } from '@/redux/features/bookings/BookingApi';

const Transaction = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, booking } = location.state || {};

  const [cardType, setCardType] = useState<'visa'|'master'>('visa');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [updateBooking] = useUpdateBookingMutation();

  const handleExpiryChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 4);

    if (digitsOnly.length <= 2) {
      setExpiry(digitsOnly);
      return;
    }

    setExpiry(`${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`);
  };

  const validate = () => {
    if (!/^[0-9]{16}$/.test(cardNumber)) {
      toast.error('Enter a valid 16-digit card number');
      return false;
    }
    if (!/^(0[1-9]|1[0-2])\/(\d{2})$/.test(expiry)) {
      toast.error('Enter expiry in MM/YY format');
      return false;
    }
    if (!/^[0-9]{3}$/.test(cvv)) {
      toast.error('Enter a 3-digit CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Simple deterministic success/fail: even last digit => success
    const lastDigit = parseInt(cardNumber[cardNumber.length - 1], 10);
    const success = lastDigit % 2 === 0;
    const paymentStatus = success ? 'paid' : 'failed';

    const resultState = {
      paymentData,
      booking,
      cardType,
      maskedCard: `**** **** **** ${cardNumber.slice(-4)}`,
    };

    try {
      if (booking?._id) {
        await updateBooking({
          id: booking._id,
          paymentStatus,
          transactionId: paymentData?.transactionId,
        }).unwrap();
      }

      if (success) {
        navigate('/payment-success', { state: resultState });
      } else {
        navigate('/payment-failed', { state: resultState });
      }
    } catch (error: any) {
      toast.error(error?.data?.message || 'Could not update booking payment status.');
      navigate('/payment-failed', { state: resultState });
    }
  };

  return (
    <div>
      <PageBanner pageName="Transaction" />
      <div className="container mx-auto p-6">
        <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Enter Card Details</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block mb-2">Card Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cardType"
                    checked={cardType === 'visa'}
                    onChange={() => setCardType('visa')}
                  />
                  Visa
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="cardType"
                    checked={cardType === 'master'}
                    onChange={() => setCardType('master')}
                  />
                  MasterCard
                </label>
              </div>
            </div>

            <div>
              <label className="block mb-2">Card Number</label>
              <input
                className="w-full border rounded px-3 py-2"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value.replace(/\s+/g, ''))}
                maxLength={16}
                placeholder="1234123412341234"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="block mb-2">Expiry (MM/YY)</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  maxLength={5}
                  placeholder="MM/YY"
                />
              </div>
              <div className="w-1/2">
                <label className="block mb-2">CVV</label>
                <input className="w-full border rounded px-3 py-2" value={cvv} onChange={(e) => setCvv(e.target.value)} maxLength={3} placeholder="123" />
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm">Amount: <strong>{paymentData?.totalPrice ?? booking?.service?.price}</strong></p>
              </div>
              <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">
                Pay
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Transaction;
