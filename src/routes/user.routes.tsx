import Bookings from "@/pages/(Backend)/(User)/Bookings";
import Profile from "@/pages/(Backend)/(User)/Profile";
import UpcomingBookings from "@/pages/(Backend)/(User)/UpcomingBookings";
import UserDashboard from "@/pages/(Backend)/(User)/UserDashboard";

export const userPaths =[
    {
        name:"Dashboard",
        path:'dashboard',
        element:<UserDashboard/>
    },
    {
        name:"Up Coming Booking",
        path:'up-coming-booking',
        element:<UpcomingBookings/>
    },
    {
        name:"Profile",
        path:'profile',
        element:<Profile/>
    },
    {
        name:"Booking",
        path:'booking',
        element:<Bookings/>
    },
  
]