import { Bell } from "@/components/svg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { notifications } from "./notification-data";
import shortImage from "@/public/images/all-img/short-image-2.png";
import { useAppSelector } from "@/provider/Store";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import { getFilePath } from "@/config/file.path";

const NotificationMessage = () => {
  const user = useAppSelector((state) => state.user);
  const [announcementsData, setAnnouncementsData] = useState([]);

  const getUserDepartment = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/users/${user.id}?populate[0]=department&populate[1]=courses&populate[2]=location&status=publish`,
        method: "GET",
      });
      const departmentID =
        data.department?.map((department) => department.id) || [];
      const courseIDs = data.courses?.map((course) => course.id) || [];
      const locationIDs = data.location?.id || null;
      console.log("User's Department ID:", departmentID);
      getAnnouncement(departmentID, courseIDs, locationIDs);
      if (departmentID) {
        getAnnouncement(departmentID);
      }
    } catch (error) {
      console.log(error);
    }
  };
  const getAnnouncement = async (departmentID, courseIDs, locationIDs) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/announcements?populate[0]=card_image&populate[1]=courses&populate[2]=departments&populate[3]=locations&populate[4]=author.profileImage&sort=updatedAt:desc`,
        method: "GET",
      });

      console.log("All ANnouncement", data.data);

      // Filter Announcements Based on User
      const filteredAnnouncements = data.data.filter((announcement) => {
        const hasDepartment = announcement.departments?.length > 0;
        const hasCourse = announcement.courses?.length > 0;
        const hasLocation = announcement.locations?.length > 0;

        // const isGlobal = !hasDepartment && !hasCourse && !hasLocation;
        const isGlobal = !hasDepartment && !hasLocation;

        const isUserMatched =
          (hasDepartment &&
            announcement.departments.some((dep) => dep.id === departmentID)) ||
          // (hasCourse &&yyyyurse) => courseIDs.includes(course.id))) ||
          (hasLocation &&
            announcement.locations.some((loc) => loc.id === locationIDs));

        return isGlobal || isUserMatched;
      });

      console.log("notification filtered data", filteredAnnouncements);

      // Extract necessary fields
      const formattedAnnouncements = filteredAnnouncements.map((item) => ({
        title: item.title,
        description: item.description[0]?.children[0]?.text || "No description",
        publishedAt: new Date(item.publishedAt).toLocaleDateString(), // Formatting date
        cardImage: item.card_image?.url
          ? getFilePath(item.card_image.url)
          : "/default-card.png", // Fallback image
        fullName: item.author?.username || "Unknown Author",
      }));

      setAnnouncementsData(formattedAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  const fetchAllAnnouncement = async () => {
    try {
      const { data } = await axiosInstance({
        url:
          "/api/announcements?" +
          "populate[0]=author.profileImage&" +
          "populate[1]=courses&" +
          "populate[2]=departments&" +
          "populate[3]=card_image&" +
          "populate[4]=locations&",
        method: "GET",
      });

      // Extract necessary fields
      const tempAnnouncements = data.data.map((item) => ({
        title: item.title,
        description: item.description[0]?.children[0]?.text || "No description",
        publishedAt: new Date(item.publishedAt).toLocaleDateString(), // Formatting date
        cardImage: item.card_image?.url
          ? getFilePath(item.card_image.url)
          : "/default-card.png", // Fallback image
        fullName: item.author?.username || "Unknown Author",
      }));

      setAnnouncementsData(tempAnnouncements);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (user?.role?.name === "ADMIN") {
      fetchAllAnnouncement();
    } else {
      getUserDepartment();
    }
    // getAnnouncement();
  }, []);

  console.log("announcementsData", announcementsData);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative md:h-9 md:w-9 h-8 w-8 hover:bg-default-100 dark:hover:bg-default-200 
          data-[state=open]:bg-default-100  dark:data-[state=open]:bg-default-200 
           hover:text-primary text-default-500 dark:text-default-800  rounded-full  "
        >
          <Bell className="h-5 w-5 " />
          <Badge className=" w-4 h-4 p-0 text-xs  font-medium  items-center justify-center absolute left-[calc(100%-18px)] bottom-[calc(100%-16px)] ring-2 ring-primary-foreground">
            {announcementsData.length}
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className=" z-[999] mx-4 lg:w-[412px] p-0"
      >
        <DropdownMenuLabel
          style={{ backgroundImage: `url(${shortImage.src})` }}
          className="w-full h-full bg-cover bg-no-repeat p-4 flex items-center"
        >
          <span className="text-base font-semibold text-white flex-1">
            Announcement
          </span>
          <span className="text-xs font-medium text-white flex-0 cursor-pointer hover:underline hover:decoration-default-100 dark:decoration-default-900">
            {/* Mark all as read{" "} */}
          </span>
        </DropdownMenuLabel>
        <div className="h-[300px] xl:h-[350px]">
          <ScrollArea className="h-full">
            {announcementsData.length > 0 ? (
              announcementsData.map((item, index) => (
                <DropdownMenuItem
                  key={`announcement-${index}`}
                  className="flex gap-9 py-2 px-4 cursor-pointer dark:hover:bg-background"
                >
                  <div className="flex-1 flex items-center gap-2">
                    <Avatar className="h-10 w-10 rounded">
                      <AvatarImage src={item.cardImage} />
                      <AvatarFallback>SN</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-default-900 mb-[2px] whitespace-nowrap">
                        {item.title}
                      </div>
                      <div className="text-xs text-default-900 truncate max-w-[100px] lg:max-w-[185px] mb-[2px]">
                        {item.description}
                      </div>
                      <div className="text-xs text-default-900 whitespace-nowrap">
                        {item.publishedAt}
                      </div>
                    </div>
                  </div>

                  {/* <div className="w-2 h-2 rounded-full mr-2 bg-primary"></div> */}
                </DropdownMenuItem>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-default-500 text-sm">
                No announcements available.
              </div>
            )}
          </ScrollArea>
        </div>
        <DropdownMenuSeparator />
        <div className="m-4 mt-5">
          <Button asChild type="text" className="w-full">
            <Link href="/public/announcement">View All</Link>
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationMessage;
