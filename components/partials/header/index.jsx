"use client";
import React from "react";
import { cn } from "@/lib/utils";
import ThemeButton from "./theme-button";
import { useSidebar, useThemeStore } from "@/store";
import ProfileInfo from "./profile-info";
import VerticalHeader from "./vertical-header";
import NotificationMessage from "./notification-message";
import { useMediaQuery } from "@/hooks/use-media-query";
import MobileMenuHandler from "./mobile-menu-handler";
import FullScreen from "./full-screen";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportsSnapshot from "@/app/public/user-dashboard/components/reports-snapshot";
import WelcomeBlock from "@/app/public/user-dashboard/components/welcome-block";
import GradiantRadialBar from "@/app/public/user-dashboard/components/gradiant-radial-bar";
import BlueRadialBar from "@/app/public/user-dashboard/components/blue-radial-bar";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import { CircularProgress } from "@/components/ui/progress";
import { useAppSelector } from "@/provider/Store";

const NavTools = ({ isDesktop, sidebarType }) => {
  return (
    <div className="nav-tools flex items-center  gap-2">
      {/* {isDesktop && <Language />} */}
      {isDesktop && <FullScreen />}

      <ThemeButton />
      <NotificationMessage />
      <div className="ltr:pl-2 rtl:pr-2">
        <ProfileInfo />
      </div>
      {!isDesktop && sidebarType !== "module" && <MobileMenuHandler />}
    </div>
  );
};
const Header = ({ handleOpenSearch, roleType }) => {
  const location = usePathname();
  const { collapsed, sidebarType } = useSidebar();
  const { navbarType } = useThemeStore();
  const isDesktop = useMediaQuery("(min-width: 1280px)");
  const isMobile = useMediaQuery("(min-width: 768px)");
  console.log("path", useParams());
  return (
    <header
      className={cn("z-50 has-sticky-header rounded-md   ", {
        "ltr:xl:ml-[72px] rtl:xl:mr-[72px] ": collapsed,
        "ltr:xl:ml-[248px] rtl:xl:mr-[248px] ": !collapsed,

        "sticky top-6": navbarType === "relative",
      })}
    >
      <div className="xl:mx-20 mx-4 ">
        <div className="w-full backdrop-blur-lg md:px-6 px-[15px] p-4 rounded-md mt-6 my-0 shadow-md border-b blueBackground">
          <div className="flex justify-between items-center h-full bluebgHeader">
            <VerticalHeader
              sidebarType={sidebarType}
              handleOpenSearch={handleOpenSearch}
            />
            <NavTools
              isDesktop={isDesktop}
              isMobile={isMobile}
              sidebarType={sidebarType}
            />
          </div>
          {/* {location.endsWith("/dashboard") && <AdminPage />} */}
          {/* {location.endsWith("/user-dashboard") && <UserPage />}
          {location.endsWith("/manager-dashboard") && <ManagerPage />}
          {location.endsWith("/trainer-dashboard") && <ManagerPage />} */}
        </div>
      </div>
    </header>
  );
};

export default Header;

// const UserPage = () => {
//   const user = useAppSelector((state) => state.user);
//   const [loading, setLoading] = useState(false);
//   const [course_details, setCourseDetails] = useState({
//     electiveCompletionPercentage: 0,
//     completedElectiveCount: 0,
//     electiveCount: 0,
//     completedMandatoryCount: 0,
//     completedMandatoryCount: 0,
//     mandatoryCompletionPercentage: 0,
//     mandatoryCount: 0,
//   });
// // In your page component, add this effect:
// useEffect(() => {
//   // Force window resize event to trigger chart redraw
//   const timer = setTimeout(() => {
//     window.dispatchEvent(new Event('resize'));
//   }, 100);
  
//   return () => clearTimeout(timer);
// }, [course_details]);

//   const getUserDashBoard = async () => {
//     setLoading(true);
//     try {
//       const { data } = await axiosInstance({
//         url: `/api/user-dashboard/user-data?userId=${user?.id}`,
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });
//       setCourseDetails(data);
//       setLoading(false);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     getUserDashBoard();
//   }, [user?.id]);

//   return (
//     <div className="grid grid-cols-12  gap-6 pt-6 rounded-lg blueBackground">
//       <div className="col-span-12 lg:col-span-4 welcomeBlock">
//         <WelcomeBlock />
//       </div>
//       <div className="col-span-12 lg:col-span-4">
//         <Card className="lightblue-bg">
//           <CardHeader className="mb-0">
//             <h2>Learning Progress</h2>
//           </CardHeader>

//           <CardContent className="grid grid-cols-12 gap-0 pb-2 p-0">
//             <div className="flex flex-wrap col-span-12 lg:col-span-6">
//               <div className="flex-1 flex items-center flex-wrap 2xl:flex-nowrap md:pr-4 2xl:pr-0 text-center 2xl:text-left md:pb-4 md:pl-4 2xl:py-0 mandotryChartHome">
//                 <div className="w-32 h-32">
//                   <GradiantRadialBar
//                     course_details={
//                       course_details?.mandatoryCompletionPercentage
//                     }
//                   />
//                 </div>
//                 <div className="font-semibold text-sm">
//                   Mandatory Courses {course_details?.completedMandatoryCount}/
//                   {course_details.mandatoryCount}
//                 </div>
//               </div>
//             </div>

//             <div className="flex flex-wrap col-span-12 lg:col-span-6">
//               <div className="flex-1 flex items-center flex-wrap 2xl:flex-nowrap md:pr-4 2xl:pr-0 md:text-center 2xl:text-left md:pb-4 2xl:py-0 electiveChartHome">
//                 <div className="w-32 h-32">
//                   {" "}
//                   <BlueRadialBar
//                     course_details={
//                       course_details?.electiveCompletionPercentage
//                     }
//                   />
//                 </div>
//                 <div className="font-semibold text-sm">
//                   Elective Courses {course_details.completedElectiveCount}/
//                   {course_details.electiveCount}
//                 </div>
//               </div>
//             </div>

//             {/* <div className="col-span-12 lg:col-span-6">
//             <BlueRadialBar course_details={course_details}/>
//           </div> */}
//           </CardContent>
//         </Card>
//       </div>
//       <div className="col-span-12 lg:col-span-4">
//         <ReportsSnapshot />
//       </div>
//     </div>
//   );
// };
const AdminPage = () => {
  const [counts, setCounts] = useState({
    userCount: 0,
    assessmentCount: 0,
    trainerCount: 0,
    enrolledCount: 0,
    publishedCourseCount: 0,
    inactiveUser: 0,
    electiveParticipationCount: 0,
    mandatoryParticipationCount: 0,
    overallParticipationPerc: 0,
    mandatoryPercentage: 0,
    electivePercentage: 0,
    avgWatchTimePerMonth: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cardMappings = [
    {
      key: "userCount",
      title: "Registered Users",
      color: "info",
      icon: "mdiusers",
    },
    {
      key: "enrolledCount",
      title: "Enrolled in Courses",
      color: "info",
      icon: "mdiusers",
    },
    {
      key: "trainerCount",
      title: "Registered Trainers",
      color: "primary",
      icon: "usertie",
    },
    {
      key: "inactiveUser",
      title: "Inactive Users",
      color: "destructive",
      icon: "inactiveusers",
    },
    {
      key: "publishedCourseCount",
      title: "Published Courses",
      color: "info",
      icon: "publishcourses",
    },
    {
      key: "assessmentCount",
      title: "Published Assessments",
      color: "info",
      icon: "assessments",
    },
    {
      key: "avgWatchTimePerMonth",
      title: "Average Time Spent (Hrs/Month)",
      color: "info",
      icon: "timespent",
    },
    {
      key: "enrolledCount",
      title: "Overall Participation",
      color: "success",
      cardColor: "bg-green-100",
      icon: "Session",
      hasPerc: true,
      percentageKey: "overallParticipationPerc",
    },
    {
      key: "mandatoryParticipationCount",
      title: "Mandatory Course Participation",
      color: "primary",
      cardColor: "bg-orange-100",
      icon: "Session",
      hasPerc: true,
      percentageKey: "mandatoryPercentage",
    },

    {
      key: "electiveParticipationCount",
      title: "Elective Course Participation",
      color: "info",
      cardColor: "bg-cyan-100",
      icon: "Increase",
      hasPerc: true,
      percentageKey: "electivePercentage",
    },
  ];
  useEffect(() => {
    const fetchDashboardCounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(
          `/api/dashboard/counts?type=admin`
        );
        setCounts(response?.data?.counts);
      } catch (err) {
        setError(err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardCounts();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-5">
      {cardMappings.map((card, index) => (
        <Card
          key={`dynamic-card-${index}`}
          className={cn(
            "w-full h-[140px] rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between",
            card?.cardColor ? card.cardColor : "bg-white"
          )}
        >
          <CardContent className="flex-1 p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 p-2">
              {/* Value Section */}
              <div className="text-3xl font-bold">
                {counts
                  ? Number.isInteger(counts?.[card.key])
                    ? counts?.[card.key]
                    : parseFloat(counts?.[card.key] || 0).toFixed(1)
                  : "0.00"}
              </div>

              {/* Icon or Progress Section */}
              {card?.hasPerc === true ? (
                <div className="flex justify-center items-center h-12 w-12">
                  <CircularProgress
                    value={
                      counts?.[card.percentageKey]
                        ? Math.round(counts[card.percentageKey])
                        : 0
                    }
                    color={card.color}
                    showValue
                  />
                </div>
              ) : (
                <span
                  className={cn(
                    "flex h-10 w-10 justify-center items-center bg-default-100 rounded-full p-1",
                    {
                      "bg-primary bg-opacity-10 text-primary":
                        card.color === "primary",
                      "bg-info bg-opacity-10 text-info": card.color === "info",
                      "bg-warning bg-opacity-10 text-warning":
                        card.color === "warning",
                      "bg-destructive bg-opacity-10 text-destructive":
                        card.color === "destructive",
                    }
                  )}
                >
                  {React.createElement(require("@/components/svg")[card.icon], {
                    className: "h-6 w-6",
                  })}
                </span>
              )}
            </div>

            {/* Title Section */}
            <div className="text-sm font-medium mt-1 text-ellipsis overflow-hidden max-w-[130px]">
              {card.title}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
// const ManagerPage = () => {
//   const [counts, setCounts] = useState({
//     userCount: 0,
//     assessmentCount: 0,
//     trainerCount: 0,
//     enrolledCount: 0,
//     publishedCourseCount: 0,
//     inactiveUser: 0,
//     electiveParticipationCount: 0,
//     mandatoryParticipationCount: 0,
//     overallParticipationPerc: 0,
//     mandatoryPercentage: 0,
//     electivePercentage: 0,
//     avgWatchTimePerMonth: 0,
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const cardMappings = [
//     {
//       key: "userCount",
//       title: "Registered Users",
//       color: "info",
//       icon: "mdiusers",
//     },
//     {
//       key: "enrolledCount",
//       title: "Enrolled in Courses",
//       color: "info",
//       icon: "mdiusers",
//     },
//     {
//       key: "trainerCount",
//       title: "Registered Trainers",
//       color: "primary",
//       icon: "usertie",
//     },
//     {
//       key: "inactiveUser",
//       title: "Inactive Users",
//       color: "destructive",
//       icon: "inactiveusers",
//     },
//     {
//       key: "publishedCourseCount",
//       title: "Published Courses",
//       color: "info",
//       icon: "publishcourses",
//     },
//     {
//       key: "assessmentCount",
//       title: "Published Assessments",
//       color: "info",
//       icon: "assessments",
//     },
//     {
//       key: "avgWatchTimePerMonth",
//       title: "Average Time Spent (Hrs/Month)",
//       color: "info",
//       icon: "timespent",
//     },
//     {
//       key: "enrolledCount",
//       title: "Overall Participation",
//       color: "success",
//       cardColor: "bg-green-100",
//       icon: "Session",
//       hasPerc: true,
//       percentageKey: "overallParticipationPerc",
//     },
//     {
//       key: "mandatoryParticipationCount",
//       title: "Mandatory Course Participation",
//       color: "primary",
//       cardColor: "bg-orange-100",
//       icon: "Session",
//       hasPerc: true,
//       percentageKey: "mandatoryPercentage",
//     },

//     {
//       key: "electiveParticipationCount",
//       title: "Elective Course Participation",
//       color: "info",
//       cardColor: "bg-cyan-100",
//       icon: "Increase",
//       hasPerc: true,
//       percentageKey: "electivePercentage",
//     },
//   ];
//   useEffect(() => {
//     const fetchDashboardCounts = async () => {
//       setLoading(true);
//       setError(null);

//       try {
//         const response = await axiosInstance.get(
//           `/api/dashboard/counts?type=manager`
//         );
//         setCounts(response?.data?.counts);
//       } catch (err) {
//         setError(err.response?.data || err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardCounts();
//   }, []);
//   console.log("cards", counts);

//   return (
//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pt-5">
//       {cardMappings.map((card, index) => (
//         <Card
//           key={`dynamic-card-${index}`}
//           className={cn(
//             "w-full h-[140px] rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between",
//             card?.cardColor ? card.cardColor : "bg-white"
//           )}
//         >
//           <CardContent className="flex-1 p-3 flex flex-col">
//             <div className="flex items-center justify-between mb-2 p-2">
//               {/* Value Section */}
//               {/* <div className="text-3xl font-bold">
//                 {counts ? counts?.[card.key] : 0}
//               </div> */}
//               <div className="text-3xl font-bold">
//                 {counts
//                   ? Number.isInteger(counts?.[card.key])
//                     ? counts?.[card.key]
//                     : parseFloat(counts?.[card.key] || 0).toFixed(1)
//                   : "0.00"}
//               </div>

//               {/* Icon or Progress Section */}
//               {card?.hasPerc === true ? (
//                 <div className="flex justify-center items-center h-12 w-12">
//                   <CircularProgress
//                     value={
//                       counts?.[card.percentageKey]
//                         ? Math.round(counts[card.percentageKey])
//                         : 0
//                     }
//                     color={card.color}
//                     showValue
//                   />
//                 </div>
//               ) : (
//                 <span
//                   className={cn(
//                     "flex h-10 w-10 justify-center items-center bg-default-100 rounded-full p-1",
//                     {
//                       "bg-primary bg-opacity-10 text-primary":
//                         card.color === "primary",
//                       "bg-info bg-opacity-10 text-info": card.color === "info",
//                       "bg-warning bg-opacity-10 text-warning":
//                         card.color === "warning",
//                       "bg-destructive bg-opacity-10 text-destructive":
//                         card.color === "destructive",
//                     }
//                   )}
//                 >
//                   {React.createElement(require("@/components/svg")[card.icon], {
//                     className: "h-6 w-6",
//                   })}
//                 </span>
//               )}
//             </div>

//             {/* Title Section */}
//             <div className="text-sm font-medium mt-1 text-ellipsis overflow-hidden max-w-[130px]">
//               {card.title}
//             </div>
//           </CardContent>
//         </Card>
//       ))}
//     </div>
//   );
// };
