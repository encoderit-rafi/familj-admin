import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useCan from "../../utils/can.ts";

type ProtectedRouteProps = {
    permission: string;
    children: React.ReactNode;
    redirectTo?: string; // default is 404
};

const ProtectedRoute = ({ permission, children, redirectTo = '/forbidden' }: ProtectedRouteProps) => {
    const can = useCan();
    const location = useLocation();

    if (!can(permission)) {
        return <Navigate to={redirectTo} state={{ from: location }} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;