import PageBanner from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { paymentData, booking, cardType, maskedCard } = location.state || {};

  return (
    <div>
      <PageBanner pageName="Payment Failed" />
      <div className="container mx-auto p-6">
        <div className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow text-center">
          <h2 className="text-2xl font-bold mb-4">Payment Failed</h2>
          <p className="mb-2">Transaction ID: <strong>{paymentData?.transactionId}</strong></p>
          <p className="mb-2">Amount: <strong>{paymentData?.totalPrice ?? booking?.service?.price}</strong></p>
          <p className="mb-2">Card: <strong>{cardType} {maskedCard}</strong></p>
          <p className="text-red-500 mb-4">Your payment could not be processed. Please try again or use a different card.</p>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => navigate('/transaction', { state: { paymentData, booking } })} className="bg-blue-600 text-white hover:bg-blue-700">Try Again</Button>
            <Button onClick={() => navigate('/')} className="bg-blue-600 text-white hover:bg-blue-700">Go Home</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed;
