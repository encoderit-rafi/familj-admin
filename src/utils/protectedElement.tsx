import ProtectedRoute from "../components/app/ProtectedRoute.tsx";
import type {JSX} from "react";


export function protectedElement(permission: string, element: JSX.Element, redirectTo = '/forbidden') {
    return (
        <ProtectedRoute permission={permission} redirectTo={redirectTo}>
            {element}
        </ProtectedRoute>
    );
}