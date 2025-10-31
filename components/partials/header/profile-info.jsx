"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import avatar1 from "@/public/images/avatar/avatar-dummy.png";
import { Icon } from "@iconify/react";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector } from "@/provider/Store";
import AddUser from "../../../app/admin/user/add-user";
import { useState } from "react";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import { signOut } from "next-auth/react";
import { getFilePath } from "@/config/file.path";
import axiosInstance from "@/config/axios.config";

const ProfileInfo = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const handleUpdateUser = async (user) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUser(null);
  };
  const user = useAppSelector((state) => state.user);
  const profileImage = user?.profileImage ? getFilePath(user.profileImage) : "";
  const token = localStorage.getItem("token");

  // const logout = async () => {
  //   if (!token) {
  //     toast.loading("Logging out...");
  //     signOut({ callbackUrl: "/" });
  //     Cookies.remove("next-auth.callback-url");
  //     Cookies.remove("next-auth.csrf-token");
  //     Cookies.remove("next-auth.session-token");
  //     localStorage.clear();
  //   } else {
  //     localStorage.clear()
  //     window.location.href = window.location.origin;
  //   }
  // }

  const logout = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("we are getting logout", token);

      if (token) {
        console.log("entered into the logout if condition");

        // ✅ No full URL — axiosInstance already has baseURL
        const res = await axiosInstance.post("/api/logout");

        console.log("what a dragggggggggggg", res.data);
      }

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout tracking failed:", error?.response?.data || error);
    } finally {
      localStorage.clear();
      signOut({ callbackUrl: "/" });
      window.location.href = window.location.origin;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className=" cursor-pointer">
        <div className=" flex items-center  ">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={user?.firstName ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <Image
              src={avatar1.src}
              alt={"Profile"}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 p-0" align="end">
        <DropdownMenuLabel className="flex gap-2 items-center mb-1 p-3">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={user?.firstName ?? ""}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <Image
              src={avatar1.src}
              alt={"Profile"}
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <div>
            <div className="text-sm font-medium text-default-800 capitalize ">
              {user?.firstName ?? user?.email}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuItem
          onClick={(e) => {
            e.preventDefault();
            handleUpdateUser(user);
          }}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons-outline:pencil" className="w-4 h-4" />
          Edit Profile
        </DropdownMenuItem>

        {isFormOpen && (
          <AddUser
            open={isFormOpen}
            onClose={handleCloseForm}
            user={selectedUser}
          />
        )}

        <DropdownMenuItem
          onSelect={() => logout()}
          className="flex items-center gap-2 text-sm font-medium text-default-600 capitalize my-1 px-3 dark:hover:bg-background cursor-pointer"
        >
          <Icon icon="heroicons:power" className="w-4 h-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
export default ProfileInfo;
