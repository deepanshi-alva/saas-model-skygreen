'use client'
import React, { useEffect, useState } from 'react';
import toast from "react-hot-toast";
import { useRouter } from 'next/navigation';
import axiosInstance from '@/config/axios.config';

export default function VerifyTokenPage() {
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const token = queryParams.get("token");

        if (!token) {
            toast.error("Token is missing");
            setLoading(false);
            return;
        }

        verifyToken(token);
    }, []);

    const verifyToken = async (token) => {
        try {
            const response = await axiosInstance({
                                url: "/api/verify-token",
                                method: "POST",
                                data: {token}
                            })

            if (response?.data?.success) {
                toast.success("Verification successful! Redirecting...");
                router.push("/auth/login?verified=true");
            } else {
                toast.error(response?.data?.message || "Verification failed.");
                setError("Verification failed.");
            }
        } catch (err) {
            console.error("Error verifying token:", err);
            toast.error("An error occurred during verification.");
            setError("An error occurred during token verification.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <></>
    );
};
