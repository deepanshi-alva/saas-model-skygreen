"use client";
import React, { useState } from "react";

import { cn, isLocationMatch, getDynamicPath } from "@/lib/utils";
import SidebarLogo from "../common/logo";
import { generateNavBar } from "@/config/menus";
import MenuLabel from "../common/menu-label";
import SingleMenuItem from "./single-menu-item";
import SubMenuHandler from "./sub-menu-handler";
import NestedSubMenu from "../common/nested-menus";
import { useSidebar, useThemeStore } from "@/store";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { usePathname } from "next/navigation";
import AddBlock from "../common/add-block";
import { useAppSelector } from "@/provider/Store";
import axiosInstance from "@/config/axios.config";
import { DashBoard } from "@/components/svg";

const PopoverSidebar = ({ trans }) => {
  const { collapsed, sidebarBg } = useSidebar();
  const { layout, isRtl } = useThemeStore();
  const [menus, setMenus] = useState([])
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [activeMultiMenu, setMultiMenu] = useState(null);
  const [announcementsData, setAnnouncementsData] = useState([]);

  const toggleSubmenu = (i) => {
    if (activeSubmenu === i) {
      setActiveSubmenu(null);
    } else {
      setActiveSubmenu(i);
    }
  };

  const toggleMultiMenu = (subIndex) => {
    if (activeMultiMenu === subIndex) {
      setMultiMenu(null);
    } else {
      setMultiMenu(subIndex);
    }
  };

  const pathname = usePathname();
  const locationName = getDynamicPath(pathname);

  React.useEffect(() => {
    let subMenuIndex = null;
    let multiMenuIndex = null;
    menus?.map((item, i) => {
      if (item?.child) {
        item.child.map((childItem, j) => {
          if (isLocationMatch(childItem.href, locationName)) {
            subMenuIndex = i;
          }
          if (childItem?.multi_menu) {
            childItem.multi_menu.map((multiItem, k) => {
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
  }, [locationName, menus]);


  const user = useAppSelector(state => state.user)
  async function proposalCourses(id) {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-proposals?filters[author][id]=${id}&filters[proposal_accepted]=true`,
        method: "get",
      });
      console.log('data',data);
      return data?.data?.length > 0;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // React.useEffect(() => {
  //   async function fetchData() {
  //     if (user) {
  //       const nav = generateNavBar(user?.role?.name);
  //       if (nav?.length < 10) {
  //         if (user?.role?.name === "Public" || user?.role?.name === "EMPLOYEE") {
  //           const hasProposal = await proposalCourses(user?.id);
  //           console.log('hasProposal',hasProposal);
  //           if (hasProposal) {
  //             nav.splice(5, 0, { isHeader: true, title: "Manage Courses" });
  //             nav.splice(6, 0, {
  //               title: "Courses",
  //               href: "/admin/course",
  //               isOpen: false,
  //               isHide: false,
  //               icon: DashBoard
  //             });
  //           }
  //         }
  //       }

  //       setMenus(nav);
  //     }
  //     getAnnouncement();
  //   }

  //   fetchData();
  // }, [user]);
  React.useEffect(() => {
    if (user) {
      const nav = generateNavBar(user?.role?.name)
      setMenus(nav)
    }
    getAnnouncement()
  }, [user])

  const getAnnouncement = async () => {
    const { data } = await axiosInstance({
      url: `/api/announcements?populate=card_image&sort=updatedAt:desc`,
      method: "GET",
    });
    setAnnouncementsData(data.data);
  };

  return (
    <div
      className={cn("fixed  top-0  border-r  ", {
        "w-[272px]": !collapsed,
        "w-[72px]": collapsed,
        "m-0 bottom-0   bg-card rounded-none": layout === "semibox",
        "h-full   bg-card ": layout !== "semibox",
      })}
    >
      {sidebarBg !== "none" && (
        <div
          className=" absolute left-0 top-0   z-[-1] w-full h-full bg-cover bg-center opacity-[0.07]"
          style={{ backgroundImage: `url(${sidebarBg})` }}
        ></div>
      )}
      <SidebarLogo collapsed={collapsed} />
      <Separator />
      <ScrollArea
        className={cn("sidebar-menu h-[calc(100%-180px)]", {
          "px-4": !collapsed,
        })}
      >
        <ul
          dir={isRtl ? "rtl" : "ltr"}
          className={cn(" space-y-1", {
            " space-y-2 text-center": collapsed,
          })}
        >
          {Array.isArray(menus) && menus.map((item, i) => (
            <li key={`menu_key_${i}`}>
              {/* single menu  */}

              {!item.child && !item.isHeader && (
                <SingleMenuItem
                  item={item}
                  collapsed={collapsed}
                  trans={trans}
                />
              )}

              {/* menu label */}
              {item.isHeader && !item.child && !collapsed && (
                <MenuLabel item={item} trans={trans} />
              )}

              {/* sub menu */}
              {item.child && (
                <>
                  <SubMenuHandler
                    item={item}
                    toggleSubmenu={toggleSubmenu}
                    index={i}
                    activeSubmenu={activeSubmenu}
                    collapsed={collapsed}
                    menuTitle={item.title}
                    trans={trans}
                  />
                  {!collapsed && (
                    <NestedSubMenu
                      toggleMultiMenu={toggleMultiMenu}
                      activeMultiMenu={activeMultiMenu}
                      activeSubmenu={activeSubmenu}
                      item={item}
                      index={i}
                      collapsed={collapsed}
                      trans={trans}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
        {(!collapsed && announcementsData.length > 0) && (
          <div className="-mx-2 mb-4">
            <AddBlock />
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default PopoverSidebar;
