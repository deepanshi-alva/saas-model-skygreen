import { create } from "zustand";
import { siteConfig } from "@/config/site";
import { persist, createJSONStorage } from "zustand/middleware";

// Theme Store
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: siteConfig.theme,
      setTheme: (theme) => set({ theme }),

      radius: siteConfig.radius,
      setRadius: (value) => set({ radius: value }),

      layout: siteConfig.layout,
      setLayout: (value) => {
        set({ layout: value });

        set((state) => ({
          navbarType: value === "horizontal" ? "sticky" : state.navbarType,
        }));

        // Avoid direct setState call, update sidebar type safely
        useSidebar.getState().setSidebarType(value === "semibox" ? "popover" : "classic");
      },

      navbarType: siteConfig.navbarType,
      setNavbarType: (value) => set({ navbarType: value }),

      footerType: siteConfig.footerType,
      setFooterType: (value) => set({ footerType: value }),

      isRtl: false,
      setRtl: (value) => set({ isRtl: value }),
    }),
    {
      name: "theme-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Sidebar Store
export const useSidebar = create(
  persist(
    (set, get) => ({
      collapsed: false,
      setCollapsed: (value) => set({ collapsed: value }),

      sidebarType:
        siteConfig.layout === "semibox" ? "popover" : siteConfig.sidebarType,
      setSidebarType: (value) => set({ sidebarType: value }),

      subMenu: false,
      setSubmenu: (value) => set({ subMenu: value }),

      // Sidebar Background
      sidebarBg: siteConfig.sidebarBg,
      setSidebarBg: (value) => set({ sidebarBg: value }),

      mobileMenu: false,
      setMobileMenu: (value) => set({ mobileMenu: value }),

      // User Role Management for Sidebar Type (Optional)
      userRole: null, // Set default as null
      setUserRole: (role) => {
        // ✅ Debug log
        set({
          userRole: role,
          sidebarType: role === "admin" ? "admin-sidebar" : "user-sidebar",
        });

        console.log("✅ Zustand userRole Updated:", get().userRole);
      },

      // Clear Sidebar State on Logout
      resetSidebar: () => {
        useSidebar.persist.clearStorage(); // ✅ Clear persisted state
        set({
          collapsed: false,
          sidebarType: siteConfig.sidebarType, // ✅ Reset to default
          mobileMenu: false,
          subMenu: false,
          sidebarBg: siteConfig.sidebarBg,
          userRole: null, // ✅ Reset user role
        });
      },
    }),
    {
      name: "sidebar-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
