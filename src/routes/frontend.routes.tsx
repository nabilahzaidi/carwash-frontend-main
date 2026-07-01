

import Booking from '@/pages/(Frontend)/(booking)/Booking';
import Compare from '@/pages/(Frontend)/(compare)/Compare';
import CustomerSupport from '@/pages/(Frontend)/(support)/CustomerSupport';
import HomePage from '@/pages/(Frontend)/(home)/HomePage';
import Reviews from '@/pages/(Frontend)/(reviews)/Reviews';
import ServiceDetails from '@/pages/(Frontend)/(services)/ServiceDetails';
import Services from '@/pages/(Frontend)/(services)/Services';
import Transaction from '@/pages/(Frontend)/(payment)/Transaction';
import PaymentSuccess from '@/pages/(Frontend)/(payment)/PaymentSuccess';
import PaymentFailed from '@/pages/(Frontend)/(payment)/PaymentFailed';

export const frontendPageRoutes = [
  {
    path: '/',
    element: <HomePage />,
  

    children: [
      {
        path:"reviews",
        element:<Reviews/>
      },
      {
        path:"services",
        element:<Services/>
      },
      {
        path:"services/:id",
        element:<ServiceDetails/>
      },
      {
        path:"booking",
        element:<Booking/>
      },
      {
        path: 'transaction',
        element: <Transaction />,
      },
      {
        path: 'payment-success',
        element: <PaymentSuccess />,
      },
      {
        path: 'payment-failed',
        element: <PaymentFailed />,
      },
      {
        path:"compare",
        element:<Compare/>
      },
      {
        path:"support",
        element:<CustomerSupport/>
      },
    ],
  },
];
