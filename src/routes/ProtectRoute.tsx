
import { getStoredToken, logout, useCurrentToken } from '@/redux/features/auths/authSlice';
import { useAppDispatch, useAppSelector } from '@/redux/hook';
import { verifyToken } from '@/utils/verifyToken';
import  { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type TProtectedRoute ={
    children: ReactNode;
    role: string | undefined;
}


const ProtectRoute = ({children,role}:TProtectedRoute) => {
const dispatch = useAppDispatch()
    const token = useAppSelector(useCurrentToken);
    const activeToken = token || getStoredToken();
    const user = verifyToken(activeToken);

    if (!activeToken || !user) {
        dispatch(logout());
        return <Navigate to='/login' replace={true}/>
    }

    if(role !== undefined && role !== user.role){
        dispatch(logout());
        return <Navigate to='/login' replace={true}/>
    }

    return children;
};

export default ProtectRoute;