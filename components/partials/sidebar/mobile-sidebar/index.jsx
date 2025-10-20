"use client";
import React, { useState, useEffect } from "react";
import { cn, isLocationMatch } from "@/lib/utils";
import { useSidebar } from "@/store";
import SidebarLogo from "../common/logo";
import { generateNavBar, NavBar } from "@/config/menus";
import MenuLabel from "../common/menu-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import SingleMenuItem from "./single-menu-item";
import SubMenuHandler from "./sub-menu-handler";
import NestedSubMenu from "../common/nested-menus";
import { useAppSelector } from "@/provider/Store";

const MobileSidebar = ({ collapsed, className }) => {
  const { sidebarBg, mobileMenu, setMobileMenu } = useSidebar();
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeMultiMenu, setMultiMenu] = useState(null);
  const user = useAppSelector((state) => state.user); // ✅ Get user from state
  const locationName = usePathname();
  const [menus, setMenus] = useState([])
  console.log('user role un mobile sidebar', user);

  // ✅ Dynamically assign menu based on role

  useEffect(() => {
    let subMenuIndex = null;
    let multiMenuIndex = null;

    menus?.forEach((item, i) => {
      if (item?.child) {
        item.child.forEach((childItem, j) => {
          if (isLocationMatch(childItem.href, locationName)) {
            subMenuIndex = i;
          }
          if (childItem?.multi_menu) {
            childItem.multi_menu.forEach((multiItem, k) => {
              if (isLocationMatch(multiItem.href, locationName)) {
                subMenuIndex = i;
                multiMenuIndex = j;
              }
            });
          }
        });
      }
    });

    setActiveSubmenu(subMenuIndex);
    setMultiMenu(multiMenuIndex);
    if (mobileMenu) {
      setMobileMenu(false);
    }
  }, [locationName, menus]);
  React.useEffect(() => {
    if (user) {
      const nav = generateNavBar(user?.role?.name)
      setMenus(nav)
    }
  }, [user])
  return (
    <>
      <div
        className={cn(
          "fixed top-0 bg-card h-full w-[248px] z-[9999]",
          className,
          {
            "-left-[300px] invisible opacity-0": !mobileMenu,
            "left-0 visible opacity-100": mobileMenu,
          }
        )}
      >
        {sidebarBg !== "none" && (
          <div
            className="absolute left-0 top-0 z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
            style={{ backgroundImage: `url(${sidebarBg})` }}
          ></div>
        )}
        <SidebarLogo collapsed={collapsed} />
        <ScrollArea className={cn("sidebar-menu h-[calc(100%-180px)]", { "px-4": !collapsed })}>
          <ul className={cn("", { " space-y-2 text-center": collapsed })}>
            {menus.map((item, i) => (
              <li key={`menu_key_${i}`}>
                {/* Single Menu Item */}
                {!item.child && !item.isHeader && <SingleMenuItem item={item} collapsed={collapsed} />}

                {/* Menu Label */}
                {item.isHeader && !item.child && !collapsed && <MenuLabel item={item} />}

                {/* Submenu */}
                {item.child && (
                  <>
                    <SubMenuHandler
                      item={item}
                      toggleSubmenu={(i) => setActiveSubmenu(activeSubmenu === i ? null : i)}
                      index={i}
                      activeSubmenu={activeSubmenu}
                      collapsed={collapsed}
                    />
                    {!collapsed && (
                      <NestedSubMenu
                        toggleMultiMenu={(subIndex) => setMultiMenu(activeMultiMenu === subIndex ? null : subIndex)}
                        activeMultiMenu={activeMultiMenu}
                        activeSubmenu={activeSubmenu}
                        item={item}
                        index={i}
                        collapsed={collapsed}
                      />
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        </ScrollArea>
      </div>
      {mobileMenu && (
        <div
          onClick={() => setMobileMenu(false)}
          className="overlay bg-black/60 backdrop-filter backdrop-blur-sm opacity-100 fixed inset-0 z-[999]"
        ></div>
      )}
    </>
  );
};

export default MobileSidebar;
