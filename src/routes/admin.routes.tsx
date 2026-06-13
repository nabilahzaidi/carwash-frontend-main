import AdminDashboard from '@/pages/(Backend)/(Admin)/AdminDashboard';
import CustomerEnquiries from '@/pages/(Backend)/(Admin)/CustomerEnquiries';
import RecentBookings from '@/pages/(Backend)/(Admin)/RecentBookings';
import ServiceManagement from '@/pages/(Backend)/(Admin)/ServiceManagement';
import SlotManagement from '@/pages/(Backend)/(Admin)/SlotManagement';
import UserBookings from '@/pages/(Backend)/(Admin)/UserBookings';
import UserManagement from '@/pages/(Backend)/(Admin)/UserManagement';

export const adminPaths = [
  {
    name: 'Dashboard',
    path: 'dashboard',
    element: <AdminDashboard />,
  },
  {
    name: 'Booking',
    path: 'bookings',
    element: <RecentBookings />,
  },
  {
    name: 'Services Management ',
    path: 'service-management',
    element: <ServiceManagement />,
  },
  {
    name: 'Slot management',
    path: 'slot-management',
    element: <SlotManagement />,
  },
  {
    name: 'Customer enquiries',
    path: 'customer-enquiries',
    element: <CustomerEnquiries />,
  },
  {
    name: 'User management',
    children: [
      {
        name: 'View User booking',
        path: 'user-bookings',
        element: <UserBookings />,
      },
      {
        name: 'User management',
        path: 'user-management',
        element: <UserManagement />,
      },
    ],
  },
];
