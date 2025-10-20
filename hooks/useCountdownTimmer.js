"use client";
import { useEffect, useState } from "react";

const RESEND_TIMEOUT = 60; // seconds

export function useOtpCountdown() {
  const [countdown, setCountdown] = useState(0);

  // On mount: check if OTP was recently sent
  useEffect(() => {
    const lastSent = localStorage.getItem("otpLastSent");
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - Number(lastSent)) / 1000);
      const remaining = RESEND_TIMEOUT - elapsed;
      if (remaining > 0) {
        setCountdown(remaining);
      }
    }
  }, []);

  // Countdown logic
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Call this when OTP is sent
  const startCountdown = () => {
    localStorage.setItem("otpLastSent", Date.now().toString());
    setCountdown(RESEND_TIMEOUT);
  };

  return { countdown, startCountdown };
}
