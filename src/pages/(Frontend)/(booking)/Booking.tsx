import CRForm from '@/components/form/CRForm';
import CRInput from '@/components/form/CRInput';
import Empty from '@/components/shared/Empty';
import Loading from '@/components/shared/Loading';
import PageBanner from '@/components/shared/PageBanner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useGetUserinfoQuery } from '@/redux/features/auths/authApi';
import { useCurrentToken } from '@/redux/features/auths/authSlice';
import { useAddBookingMutation } from '@/redux/features/bookings/BookingApi';
import { useAppSelector } from '@/redux/hook';
import { verifyToken } from '@/utils/verifyToken';
import { Image } from 'antd';
import { Trash } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useState } from 'react';

const Booking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialBookingData = location.state?.data ?? null;
  const [selectedBooking, setSelectedBooking] = useState(initialBookingData);
  const bookedService = selectedBooking?.service;
  const bookedSlot = selectedBooking?.slot;
  const [addBooking] = useAddBookingMutation();

  const token = useAppSelector(useCurrentToken);
  let user;
  if (token) {
    user = verifyToken(token);
  }

  const userEmail = user?.userEmail || user?.email;
  const { data: userData, isLoading } = useGetUserinfoQuery(userEmail, {
    skip: !userEmail,
  });

  if (isLoading) {
    return <><Loading/></>;
  }
  const userInfo = userData?.data;

  const handleBookingSubmit = async (data: any) => {
    if (!bookedService || !bookedSlot) {
      toast.error('No service or slot selected. Please choose a booking slot first.');
      return;
    }

    const bookings = {
      serviceId: bookedService._id,
      slotId: bookedSlot._id,
      vehicleType: data.vehicleType || 'car',
      vehicleBrand: data.vehicleBrand || 'Tata',
      vehicleModel: data.vehicleModel || 'Camry',
      manufacturingYear: data.manufacturingYear || 2024,
      registrationPlate: data.registrationPlate || 'ABC123',
      customerName: data.name || userInfo?.name,
      customerEmail: data.email || userInfo?.email,
      customerPhone: data.phone || userInfo?.phone,
    };

    try {
      const res = await addBooking(bookings).unwrap();
      if (res.success) {
        toast.success(res.message);
        if (res.data?.payment_url) {
          window.location.href = res.data.payment_url;
        } else {
          toast.error('Payment URL not returned from the server.');
        }
      } else {
        toast.error(res.message || 'Payment initialization failed.');
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Booking failed.');
    }
  };

  if (!selectedBooking) {
    return (
      <div>
        <PageBanner pageName={'Booking Page'} />
        <div className="2xl:p-20 p-4">
          <div className="container rounded-2xl mx-auto shadow-2xl bg-primary/5 p-8 text-center">
            <Empty text="No booking selected. Please choose a service slot first." />
            <div className="mt-6">
              <Button onClick={() => navigate('/services')}>
                Choose a Service
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageBanner pageName={'Booking Page'} />
      <div className="2xl:p-20 p-4">
        <div className="container  rounded-2xl md:flex mx-auto  shadow-2xl  bg-primary/5">
          <div className="w-full space-y-6 p-4 md:p-8  2xl:p-20">
            <div className="">
              <h4 className="text-3xl font-bold">Booked Services</h4>

              <div className="py-10">
                <Table>
                  <TableCaption>
                    List of your recent booked service.
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Action</TableHead>
                      <TableHead className="w-[100px]">#</TableHead>
                      <TableHead>Service Details</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">
                        <button
                          type="button"
                          className="rounded-full p-2 hover:bg-slate-100"
                          onClick={() => {
                            setSelectedBooking(null);
                            toast.success('Booking selection removed.');
                          }}
                          aria-label="Remove booked service"
                        >
                          <Trash />
                        </button>
                      </TableCell>
                      <TableCell className="font-medium">INV001</TableCell>
                      <TableCell className="flex gap-2">
                        <Image
                          className="max-w-32 rounded-xl"
                          src={bookedService?.images}
                          alt={bookedService?.name || 'Service image'}
                        />
                        <div>
                          <Link to={`/services/${bookedService?._id}`}>
                            <p className="text-xl">{bookedService?.name}</p>
                          </Link>
                          <p className="text-sm">
                            {bookedService?.serviceLevel}
                          </p>
                          <p className="text-sm">
                            Duration: {bookedService?.duration}min
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p>Date: {bookedSlot?.date}</p>
                        <p>
                          Time: {bookedSlot?.startTime} - {bookedSlot?.endTime}
                        </p>
                      </TableCell>
                      <TableCell className="text-right">
                        {bookedService?.price}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <div className=" py-10 bg-primary/5 px-4 md:w-[60%]">
            <div className="md:px-10">
              <h3 className="text-2xl font-bold">User Information</h3>
              <div className="py-10">
                <CRForm onSubmit={handleBookingSubmit}>
                  <CRInput
                    type="text"
                    label="Full Name"
                    name="name"
                    defaultValue={userInfo?.name}
                  />

                  <div className="flex gap-4">
                    <CRInput
                      type="email"
                      className="w-full"
                      label="email"
                      name="email"
                      defaultValue={userInfo?.email}
                    />
                    <CRInput
                      type="phone"
                      className="w-full"
                      label="Mobile"
                      name="phone"
                      defaultValue={userInfo?.phone}
                    />
                  </div>
                  <p className="p-2 bg-slate-50 rounded-sm mb-6">
                    Selected Time Slot: 09:00-10:00
                  </p>
                  <Button className="text-white" type="submit">
                    Pay Now
                  </Button>
                </CRForm>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
