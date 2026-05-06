"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserRole, useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles: ('admin' | 'mechanic')[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const router = useRouter();
    const { role, isLoading } = useUserRole();
    const { user } = useAuth();

    useEffect(() => {
        if (!isLoading) {
            if (!user) {
                // Not logged in
                router.push("/login");
            } else if (role && !allowedRoles.includes(role)) {
                // Role not allowed here
                router.push("/dashboard");
            }
        }
    }, [user, role, isLoading, router, allowedRoles]);

    if (isLoading || !role || !allowedRoles.includes(role)) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-gray-50">
                <div className="text-gray-500 animate-pulse">Verifying access...</div>
            </div>
        );
    }

    return <>{children}</>;
}
