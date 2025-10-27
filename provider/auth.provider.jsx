"use client";
import { useEffect, useState } from "react";
import LayoutLoader from "@/components/layout-loader";
import { useAppDispatch } from "./Store";
import { useRouter, usePathname } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { setUser } from "./slice/UserSlice";
import { useSession } from "next-auth/react";
const AuthProvider = ({ children }) => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(false);
  const { data } = useSession();

  const accessToken = data && data.accessToken;
  const provider = (data && data.provider) || "strapi";

  const publicRoutes = ["/auth/reset-password", "/auth/create-password", "/public/certificates",];

  const validateToken = async () => {
    try {
      // const publicRoutes = ["/auth/reset-password", "/auth/create-password", "/public/certificates",];
      // ✅ Reset roleRedirected when visiting login page
      if (publicRoutes.some((route) => pathname.startsWith(route))) {
        console.log(`🟢 Access allowed without login: ${pathname}`);
        setIsLoading(false);
        return;
      }

      if (pathname === "/auth/login" || pathname==="/") {
        console.log("🔄 Resetting roleRedirected as user is on /auth/login");
        localStorage.removeItem("roleRedirected");
      }

      if (publicRoutes.includes(pathname)) {
        setIsLoading(false);
        return;
      }

      const token = accessToken || localStorage.getItem("token");
      console.log('token', token);
      console.log('provider', provider);
      if (!token) throw new Error("No token found");

      const { data } = await axiosInstance.post("/api/validateToken", {
        token,
        provider,
      });
      if (!data?.user) throw new Error("User not found");
      if (accessToken) {
        localStorage.setItem('token', accessToken);
      }

      // ✅ Clear previous session data when a new login occurs
      // console.log("🔄 Clearing roleRedirected to allow fresh redirection.");
      // localStorage.removeItem("roleRedirected");
      // localStorage.removeItem("token");

      dispatch(setUser({ ...data.user }));
      console.log('user data', data)
      handleRoleBasedRedirection(data.user.role);
      // return;
    } catch (error) {
      console.error("Token validation failed:", error);
      if (!publicRoutes.some((route) => pathname.startsWith(route))) {
        redirectToLogin();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleBasedRedirection = (role) => {
    if (!role || !role?.name) {
      return;
    }
    const hasRedirected = localStorage.getItem("roleRedirected");
    if (typeof window !== "undefined") {
      console.log("roleRedirected from localStorage:", localStorage.getItem("roleRedirected"));
    }

    if (!hasRedirected) {
      localStorage.setItem("roleRedirected", "true");
      console.log("roleRedirected set to:", localStorage.getItem("roleRedirected"));
      if (role.name === "SUPER_ADMIN") {
        if (!pathname.startsWith("/admin")) {
          router.push("/admin/dashboard");
        }
      }
      // else if (role.name === "INSTRUCTOR") {
      //   if (!pathname.startsWith("/trainer")) {
      //     router.push("/trainer/trainer-dashboard");
      //   }
      // } else if (role.name === "EMPLOYEE") {
      //   if (!pathname.startsWith("/public")) {
      //     router.push("/public/user-dashboard");
      //   }
      //   // } else if (role.name === "Authenticated") {
      //   //   if (!pathname.startsWith("/public")) {
      //   //     router.push("/public/user-dashboard");
      //   //   }
      // }
      // else if (role.name === "MANAGER") {
      //   if (!pathname.startsWith("/manager")) {
      //     router.push("/manager/manager-dashboard");
      //   }
      // }
    }
  };

  const redirectToLogin = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("roleRedirected");
    dispatch(setUser(null));
    router.push("/auth/login");
  };

  useEffect(() => {
    setIsLoading(true);
    validateToken();
  }, []);


  return <>{isLoading ? <LayoutLoader /> : children}</>;
};

export default AuthProvider;
