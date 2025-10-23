"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { SiteLogo } from "@/components/svg";
import { Icon } from "@iconify/react";
import { Checkbox } from "@/components/ui/checkbox";
import {useOtpCountdown} from '@/hooks/useCountdownTimmer'
import { useMediaQuery } from "@/hooks/use-media-query";
import { useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "@/config/axios.config";
// import { token } from "@/utils/firebase/firebase.config";
const schema = z.object({
  email: z.string().email({ message: "Your email is invalid." }),
  password: z.string().min(4),
});

const LogInForm = ({ setContactType, contactType }) => {
  const { countdown, startCountdown } = useOtpCountdown();
  const [isPending, startTransition] = React.useTransition();
  const [passwordType, setPasswordType] = React.useState("password");
  const isDesktop2xl = useMediaQuery("(max-width: 1530px)");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const togglePasswordType = () => {
    if (passwordType === "text") {
      setPasswordType("password");
    } else if (passwordType === "password") {
      setPasswordType("text");
    }
  };
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    mode: "all",
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const res = localStorage.getItem("rememberData");
    if (res) {
      const data = JSON.parse(res);
      reset(data);
    }
  }, []);

  const onSubmit = (formData) => {
    startTransition(async () => {
      try {
        const { data } = await axiosInstance({
          url: `/api/auth/local?populate=*`,
          method: "POST",
          data: {
            identifier: formData?.email,
            password: formData?.password,
          },
        });
        // generateToken(data?.user?.id);
        toast.success("Login Successful");
        localStorage.setItem("token", data.jwt);
        if (rememberMe) {
          localStorage.setItem("rememberData", JSON.stringify(formData));
          setRememberMe(rememberMe);
        } else {
          localStorage.removeItem("rememberData", JSON.stringify(formData));
          setRememberMe(!rememberMe);
        }
        router.push("/");
      } catch (error) {
        console.log(error);
        toast.error(
          error.response?.data.error.message ||
            "Login failed. Please try again."
        );
      }
    });
  };

  // useEffect(() => {
  //   if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  //     window.addEventListener("load", () => {
  //       navigator.serviceWorker
  //         .register("/firebase-messaging-sw.js")
  //         .then((registration) => {
  //           logger.info(
  //             "Service Worker registered with scope:",
  //             registration.scope
  //           );
  //         })
  //         .catch((error) => {
  //           logger.error("Service Worker registration failed:", error);
  //         });
  //     });
  //   }
  //   requestNotificationPermission();
  // }, []);

  // const generateToken = async (userID) => {
  //   try {
  //     const tokend = await token();
  //     saveFCMToken(userID, tokend);
  //   } catch (err) {
  //     window.location.href = window.location.origin;
  //     console.log("fcm generate token: ", err);
  //   }
  // };

  // const saveFCMToken = async (userId, token) => {
  //   try {
  //     const { data } = await axiosInstance({
  //       url: `/api/users/${userId}`,
  //       method: "PUT",
  //       data: {
  //         fcm_token: token,
  //       },
  //     });
  //     window.location.href = window.location.origin;
  //   } catch (err) {
  //     window.location.href = window.location.origin;
  //     console.log("FCM token save err ", err);
  //   }
  // };

  {
    /** Notification system integration*/
  }
  // const requestNotificationPermission = async () => {
  //   try {
  //     const permission = await Notification.requestPermission();
  //     if (permission === "granted") {
  //       console.log("Notification permission granted.");
  //       // You can save the token to your database or use it to send notifications later
  //     } else {
  //       console.error("Notification permission denied.");
  //     }
  //   } catch (error) {
  //     console.error("Error while requesting notification permission:", error);
  //   }
  // };

  {
    /*
     * handleSendOTP
     * Function to handle sending OTP
     * This function sends an OTP to the user's email and updates the UI accordingly.
     * It uses the axiosInstance to make a POST request to the backend API endpoint for sending OTP.
     * If the response status is 200, it sets the contactType to 'otp-verify' and shows a success message.
     * If there's an error, it logs the error and shows an error message.
     * Finally, it sets isLoading to false.
     */
  }


  function handleSendOtp() {
    if (!formData.email) {
      toast.error("Please enter your email.");
      return;
    }
    startTransition(async () => {
      try {
        setIsLoading(true);
        if (countdown > 0) return;
        
        let email = formData.email || localStorage.getItem("email");
        if(!email){
          toast.error("Please enter your email.");
          return;
        }
        const response = await axiosInstance.post("/api/auth/send-otp", {
          email: email,
        });
        localStorage.setItem("email" , formData.email);
        startCountdown()
        if (response.status === 200) {
          setContactType("otp-verify");
          setOtp(["", "", "", "", "", ""]);
          // Replace query without reload or routing
          const newUrl = `/auth/login?contactType=otp-verify`;
          window.history.replaceState(null, "", newUrl);
          toast.success("OTP sent successfully");
        }
      } catch (error) {
        console.error(
          "OTP Login Error:",
          error.response?.data || error.message
        );
        toast.error(
          error.response?.data?.error?.message ||
            "Login failed. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    });
  }

  const handleOTPChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  // Handle paste events
  const handleOTPPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");

    // Check if pasted data contains only digits and is 6 characters long
    if (/^\d{6}$/.test(pastedData)) {
      const newOTP = pastedData.split("");
      setOtp(newOTP);

      // Focus the last input field after pasting
      setTimeout(() => {
        document.getElementById("otp-5").focus();
      }, 0);
    } else if (/^\d+$/.test(pastedData) && pastedData.length <= 6) {
      // If it's digits but less than 6, fill from current position
      const currentIndex = parseInt(e.target.id.split("-")[1]);
      const newOTP = [...otp];
      const digits = pastedData.split("");

      for (let i = 0; i < digits.length && currentIndex + i < 6; i++) {
        newOTP[currentIndex + i] = digits[i];
      }

      setOtp(newOTP);

      // Focus the next empty field or last field
      const nextIndex = Math.min(currentIndex + digits.length, 5);
      setTimeout(() => {
        document.getElementById(`otp-${nextIndex}`).focus();
      }, 0);
    }
  };

  // Handle keydown events for OTP inputs
  const handleOTPKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace") {
      const newOTP = [...otp];

      if (newOTP[index]) {
        // If current field has value, clear it
        newOTP[index] = "";
        setOtp(newOTP);
      } else if (index > 0) {
        // If current field is empty, move to previous field and clear it
        newOTP[index - 1] = "";
        setOtp(newOTP);
        document.getElementById(`otp-${index - 1}`).focus();
      }

      e.preventDefault();
    }

    // Handle arrow keys for navigation
    if (e.key === "ArrowLeft" && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }

    if (e.key === "ArrowRight" && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  async function handleVerifyOTP(e) {
    e.preventDefault();
    const enteredOTP = otp.join("");
    try {
      const response = await axiosInstance.post("/api/auth/verify-otp", {
        otp: enteredOTP,
        email: localStorage.getItem("email"),
      });

      if (response.status === 200) {
        toast.success("OTP verified successfully");
        // setContactType("email-verify");
      }
      // generateToken(response.data?.data?.user.id);
      // toast.success("Login Successful");
      localStorage.setItem("token", response.data?.data.token);
      localStorage.removeItem("email");
      // 🔥 Redirect after small delay so toast shows
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      toast.error(
        error.response?.data?.error?.message ||
          "OTP verification failed. Please try again."
      );
      console.error(
        "OTP Verification Error:",
        error.response?.data || error.message
      );
    }
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResendOTP = () => {
    if (countdown > 0) return;
    // setCountdown(60);
    startCountdown()
    handleSendOtp();
    setOtp(["", "", "", "", "", ""]);
  };

  return (
    <div className="w-full py-10">
      <Link href="/dashboard" className="inline-block">
        <SiteLogo className="h-25 w-25 3xl:w-14 3xl:h-14 text-primary" />
      </Link>
      <div className="2xl:mt-8 mt-6 2xl:text-3xl text-2xl font-bold text-default-900">
        Hey, Hello 👋
      </div>
      <div className="2xl:text-lg text-base text-default-600 2xl:mt-2 leading-6">
        Enter your login details to access your account.
      </div>

      {/* Contact Type Toggle */}
      <div className="flex bg-gray-100 mt-5 rounded-lg p-1 text-[#f78934]">
        <button
          onClick={() => setContactType("otp")}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
            contactType === "otp"
              ? "bg-white text-[#f78934] shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <span className="w-4 h-4 mr-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className={`${
                contactType === "otp" ? "stroke-[#f78934]" : "stroke-gray-400"
              }`}
              fill="none"
              strokeWidth="1"
            >
              <path d="M2 4.5h1v7m0 0H2m1 0h1m1-7h4V8H5.5v3.5h4m1-7H14V8m0 0h-3m3 0v3.5h-3.5" />
            </svg>
          </span>
          Login with OTP
        </button>
        <button
          onClick={() => setContactType("email")}
          className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-all ${
            contactType === "email"
              ? "bg-white shadow-sm"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <Lock className="w-4 h-4 mr-2" />
          Login with password
        </button>
      </div>
      {contactType === "email" && (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-5 2xl:mt-7">
          <div>
            <Label
              htmlFor="email"
              className="mb-2 font-medium text-default-600"
            >
              Email{" "}
            </Label>
            <Input
              disabled={isPending}
              {...register("email")}
              type="email"
              id="email"
              className={cn("", {
                "border-destructive": errors.email,
              })}
              size={!isDesktop2xl ? "xl" : "lg"}
            />
          </div>
          {errors.email && (
            <div className=" text-destructive mt-2">{errors.email.message}</div>
          )}

          <div className="mt-3.5">
            <Label
              htmlFor="password"
              className="mb-2 font-medium text-default-600"
            >
              Password{" "}
            </Label>
            <div className="relative">
              <Input
                disabled={isPending}
                {...register("password")}
                type={passwordType}
                id="password"
                className="peer "
                size={!isDesktop2xl ? "xl" : "lg"}
                placeholder=" "
              />

              <div
                className="absolute top-1/2 -translate-y-1/2 ltr:right-4 rtl:left-4 cursor-pointer"
                onClick={togglePasswordType}
              >
                {passwordType === "password" ? (
                  <Icon
                    icon="heroicons:eye"
                    className="w-5 h-5 text-default-400"
                  />
                ) : (
                  <Icon
                    icon="heroicons:eye-slash"
                    className="w-5 h-5 text-default-400"
                  />
                )}
              </div>
            </div>
          </div>
          {errors.password && (
            <div className=" text-destructive mt-2">
              {errors.password.message}
            </div>
          )}

          {/* <div className="mt-5  mb-8 flex flex-wrap gap-2">
            <div className="flex-1 flex  items-center gap-1.5 ">
              <Checkbox
                {...register("remember-me")}
                size="sm"
                className="border-default-300 mt-[1px]"
                id="isRemebered"
                checked={rememberMe}
                onClick={() => setRememberMe(!rememberMe)}
              />
              <Label
                htmlFor="isRemebered"
                className="text-sm text-default-600 cursor-pointer whitespace-nowrap"
              >
                Remember me
              </Label>
            </div>
            <Link
              href="/auth/forgot"
              className="flex-none text-sm text-primary"
            >
              Forgot Password?
            </Link>
          </div> */}
          <Button
            className="w-full mt-6"
            disabled={isPending}
            size={!isDesktop2xl ? "lg" : "md"}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isPending ? "Loading..." : "Login"}
          </Button>
        </form>
      )}

      {contactType === "otp" && (
        <form className="mt-5 2xl:mt-7">
          <div>
            <label
              htmlFor="email"
              className="block mb-2 font-medium text-gray-600"
            >
              {contactType === "otp" && "Email"}
            </label>
            <Input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => {
                handleInputChange("email", e.target.value),
                  setFormData({ ...formData, email: e.target.value });
              }}
              disabled={isLoading}
              required
              className="w-full px-4 py-6 border border-gray-300 rounded-lg text-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="button"
            onClick={handleSendOtp}
            disabled={isLoading}
            className={`w-full bg-[#f78934] mt-8 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#1c1917]"
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </button>
        </form>
      )}

      {contactType === "otp-verify" && (
        <form onSubmit={handleVerifyOTP} className="space-y-6 mt-5 2xl:mt-7">
          {/* OTP Input */}
          <div className="flex justify-center space-x-3">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleOTPKeyDown(index, e)}
                onPaste={handleOTPPaste}
                maxLength={1}
                className="w-12 h-12 text-center text-lg font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            ))}
          </div>
          {/* Resend OTP */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleResendOTP}
              disabled={countdown > 0}
              className="text-blue-600 hover:text-blue-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full bg-[#f78934] text-white py-3 rounded-lg font-semibold hover:bg-[#1c1917] transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Verify OTP"
            )}
          </button>
        </form>
      )}

      {/* <Button
        className="w-full mt-6"
        color="dark"
        variant="outline"
        disabled={isLoading}
        size={!isDesktop2xl ? "lg" : "md"}
        onClick={() => router.push("/auth/forgot")} // Change to your actual link
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Loading..." : "Signup"}
      </Button> */}
    </div>
  );
};

export default LogInForm;