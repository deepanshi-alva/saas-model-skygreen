import { SiteLogo, SiteLogo2 } from "@/components/svg";
import { useSidebar } from "@/store";
import React from "react";
import { useSelector } from 'react-redux';

const SidebarLogo = ({ hovered }) => {
  const { sidebarType, setCollapsed, collapsed } = useSidebar();
  const user = useSelector((state) => state.user);
  const roleName = user?.role?.name || "";
  console.log("this is the user data ---------", user);
  // Generate display label for dashboard
  const dashboardLabel =
    roleName === "SUPER_ADMIN"
      ? "Super Admin Dashboard"
      : roleName === "ADMIN"
        ? "Admin Dashboard"
        : roleName
          ? `${roleName} Dashboard`
          : "";

  return (
    <div className="px-4 py-4 ">
      <div className="">
        <div className=" flex flex-col items-center justify-between">
          {collapsed ? (
            <SiteLogo2 className="text-primary h-auto w-auto" /> // Smaller Logo
          ) : (
            <SiteLogo className="text-primary h-auto w-auto" />
          )}
          {/* ✅ Show Dashboard Role Label */}
          {!collapsed && (
            <div className="mt-2 text-sm font-semibold text-primary text-center">
              {dashboardLabel}
            </div>
          )}
        </div>
        {sidebarType === "classic" && (!collapsed || hovered) && (
          <div className="flex-none lg:block hidden">
            <div
              onClick={() => setCollapsed(!collapsed)}
              className={`h-4 w-4 border-[1.5px] border-default-900 dark:border-default-200 rounded-full transition-all duration-150
          ${collapsed
                  ? ""
                  : "ring-2 ring-inset ring-offset-4 ring-default-900  bg-default-900  dark:ring-offset-default-300"
                }
          `}
            ></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarLogo;
