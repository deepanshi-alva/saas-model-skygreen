"use client";
import React, { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import thumbnail from "@/public/images/all-img/thumbnail.png";
import axiosInstance from "@/config/axios.config";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { useAppSelector } from "@/provider/Store";
import { getFilePath } from "@/config/file.path";

const AddBlock = ({
  className,
  image = thumbnail,
  title = "Storage capacity",
  desc = "Out of your total storage on Premium Plan, you have used up 40%.",
}) => {
  const user = useAppSelector(state => state.user);
  const [announcementsData, setAnnouncementsData] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // State to track hover

  // ✅ Fetch User's Department
  const getUserDepartment = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/users/${user.id}?populate[0]=department&populate[1]=courses&populate[2]=location`,
        method: "GET",
      });
      // const departmentID = data.department?.id;
      const departmentID = data.department?.map(department => department.id) || [];
      const courseIDs = data.courses?.map((course) => course.id) || [];
      const locationIDs = data.location?.id;
      console.log("User's Department ID:", departmentID);

      getAnnouncement(departmentID, courseIDs, locationIDs);
    } catch (error) {
      console.error("Error fetching user department:", error);
    }
  };

  const getAnnouncement = async (departmentID, courseIDs, locationIDs) => {

    try {
      const { data } = await axiosInstance({
        url: `/api/announcements?populate[0]=card_image&populate[1]=courses&populate[2]=departments&populate[3]=locations&sort=updatedAt:desc&pagination[limit]=4`,
        method: "GET",
      });
      // Filter Announcements Based on User
      const filteredAnnouncements = data.data.filter((announcement) => {
        const hasDepartment = announcement.departments?.length > 0;
        // const hasCourse = announcement.courses?.length > 0;
        const hasLocation = announcement.locations?.length > 0;

        // const isGlobal = !hasDepartment && !hasCourse && !hasLocation;
        const isGlobal = !hasDepartment && !hasLocation;

        const isUserMatched =
          (hasDepartment &&
            announcement.departments.some((dep) => dep.id === departmentID)) ||
          // (hasCourse &&
          //   announcement.courses.some((course) => courseIDs.includes(course.id))) ||
          (hasLocation &&
            announcement.locations.some(loc => loc.id === locationIDs));

        return isGlobal || isUserMatched;
      });

      setAnnouncementsData(filteredAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
    }
  };

  // ✅ Fetch All Announcements for ADMIN
  const fetchAllAnnouncements = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/announcements?populate=card_image&sort=updatedAt:desc&pagination[limit]=4`,
        method: "GET",
      });
      setAnnouncementsData(data.data || []);
    } catch (error) {
      console.error("Error fetching all announcements:", error);
    }
  };

  useEffect(() => {
    if (user?.role?.name === "ADMIN") {
    fetchAllAnnouncements(); // If ADMIN, fetch all
    } else {
      getUserDepartment(); // Otherwise, fetch department-based
    }
  }, []);

  // Handle autoplay for the carousel
  const handleAutoplay = useCallback(() => {
    if (!isPaused && announcementsData.length > 1) {
      setActiveIndex((prevIndex) =>
        prevIndex === announcementsData.length - 1 ? 0 : prevIndex + 1
      );
    }
  }, [isPaused, announcementsData.length]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleAutoplay();
    }, 5000);

    return () => clearInterval(interval);
  }, [handleAutoplay]);

  const handleDotClick = (index) => {
    setActiveIndex(index);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: "numeric", month: "short", day: "2-digit" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleMouseEnter = () => {
    setIsPaused(true); // Pause autoplay
  };

  const handleMouseLeave = () => {
    setIsPaused(false); // Resume autoplay
  };

  return (
    <>
      {announcementsData.length > 0 && (
        <div
          className={cn(
            "bg-primary dark:bg-default-200 text-primary-foreground px-3 py-3 rounded m-3 hidden xl:block",
            className
          )}
          onMouseEnter={handleMouseEnter} // Pause on hover
          onMouseLeave={handleMouseLeave} // Resume on mouse leave
        >

          <Carousel
            className="w-full max-w-3xl mx-auto cursor-pointer"
            opts={{
              align: "start",
            }}
          >
            <CarouselContent>
              {announcementsData.map((announcement, index) => {
                const { id, title, description, card_image, publishedAt } =
                  announcement;
                const imageUrl = card_image?.formats?.thumbnail?.url;
                const formattedDate = formatDate(publishedAt);
                return (
                  <CarouselItem
                    key={id || index}
                    className={`w-full ${activeIndex === index ? "block" : "hidden"
                      }`}
                  >
                    <div>
                      {imageUrl ? (
                        <div className="mb-2 relative">
                          <img
                            className="w-full h-full object-cover rounded"
                            src={getFilePath(imageUrl)}
                            alt={title || "Announcement Image"}
                            width={225}
                            height={225}
                          />
                        </div>
                      ) : null}

                      <div className="mt-0 text-sm text-primary-foreground">
                        <p className="text-md text-bold">{formattedDate}</p>
                        <strong>{title}</strong>
                        <p>
                          {description[0]?.children[0]?.text ||
                            "No description available"}
                        </p>
                      </div>
                    </div>
                  </CarouselItem>
                );
              })}
            </CarouselContent>
          </Carousel>

          <div className="flex justify-between">
            {/* "See More" Button */}
            <Link
              href={`${process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')}/public/announcement`}
              className="text-white hover:text-blue-600 mt-3 transition"
            >
              See More
            </Link>

            {/* Navigation Dots */}
            {announcementsData.length > 1 &&
              <div className="flex justify-end mt-4">
                {announcementsData.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleDotClick(index)}
                    className={`w-4 h-4 mx-1 rounded-full ${activeIndex === index ? "bg-white" : "bg-gray-400"
                      }`}
                  ></button>
                ))}
              </div>
            }
          </div>
        </div>
      )}
    </>
  );
};

export default AddBlock;
