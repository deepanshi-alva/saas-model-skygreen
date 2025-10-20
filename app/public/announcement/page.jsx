'use client';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import axiosInstance from '@/config/axios.config';
import React, { useEffect, useState } from 'react';
import Image from 'next/image'; // Assuming you're using Next.js
import { Badge } from '@/components/ui/badge'; // Replace with your Badge component path
import { useAppSelector } from '@/provider/Store';
import { getFilePath } from '../../../config/file.path';

const Page = () => {
    const user = useAppSelector(state => state.user);
    const [announcementsData, setAnnouncementsData] = useState([]);

    const getUserDepartment = async () => {
        try {
            const { data } = await axiosInstance({
                url: `/api/users/${user.id}?populate[0]=department&populate[1]=courses&populate[2]=location&status=publish`,
                method: 'GET',
            });
            const departmentID = data.department?.map(department => department.id) || [];
            // ?.id;
            const courseIDs = data.courses?.map(course => course.id) || [];
            const locationIDs = data.location?.id;
            getAnnouncement(departmentID, courseIDs, locationIDs);

        } catch (error) {
            console.log(error);

        }
    }
    const getAnnouncement = async (departmentID, courseIDs, locationIDs) => {
        try {
            const { data } = await axiosInstance({
                url: "/api/announcements?populate[0]=author.profileImage&populate[1]=courses&populate[2]=departments&populate[3]=card_image&populate[4]=locations",
                method: 'GET',
            });
            console.log("all anouncement", data.data);

            const filteredAnnouncements = data.data.filter(announcement => {
                const hasDepartment = announcement.departments?.length > 0;
                // const hasCourse = announcement.courses?.length > 0;
                const hasLocation = announcement.locations?.length > 0;

                // const isGlobal = !hasDepartment && !hasCourse && !hasLocation;
                const isGlobal = !hasDepartment && !hasLocation;

                const isUserMatched =
                    (hasDepartment && announcement.departments.some(dep => dep.id === departmentID)) ||
                    // (hasCourse && announcement.courses.some(course => courseIDs.includes(course.id))) ||
                    (hasLocation &&
                        announcement.locations.some(loc => loc.id === locationIDs));

                return isGlobal || isUserMatched;
            });

            console.log("Filtered Announcements:", filteredAnnouncements);
            setAnnouncementsData(filteredAnnouncements);

            // setAnnouncementsData(data.data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    };

    const fetchAllAnnouncement = async () => {
        try {
            const { data } = await axiosInstance({
                url: "/api/announcements?" +
                    "populate[0]=author.profileImage&" +
                    "populate[1]=courses&" +
                    "populate[2]=departments&" +
                    "populate[3]=card_image&" +
                    "populate[4]=locations&",
                method: "GET",
            });

            setAnnouncementsData(data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (user?.role?.name === "ADMIN") {
            fetchAllAnnouncement()
        } else {
            getUserDepartment()
        }
    }, []);


    return (
        <div className="space-y-5">

            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    All Announcement
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                {announcementsData.length > 0 ? (
                    announcementsData.map((announcement) => (

                        <Card
                            key={announcement.id}
                            className="relative mb-0 col-span-12 2xl:col-span-4 dark:bg-default-200"
                        >
                            <CardHeader className="flex lg:flex-row flex-col flex-wrap justify-between items-align  dark:border-default-300">
                                <h2 className="text-base font-semibold text-default-900 capitalize hover:text-primary">
                                    {announcement.title || 'No Title'}
                                </h2>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                {announcement.card_image?.url && (
                                    <div className="w-full bg-muted-foreground overflow-hidden rounded-md">
                                        <img
                                            className="w-full h-[190px] object-cover object-center"
                                            // {`${process.env.}/${courseDetail?.course?.course_thumbnail?.url}`}
                                            src={getFilePath(announcement?.card_image?.url)}
                                            alt="Card Image"
                                            width={500}
                                            height={500}
                                        />
                                    </div>
                                )}

                                <div className="py-4">
                                    <p className="text-sm font-medium text-default-600 dark:text-white">
                                        {announcement.description?.[0]?.children?.[0]?.text || 'No Description'}
                                    </p>
                                </div>

                                {/* Departments */}
                                <div className="flex justify-between gap-2">

                                    {announcement.courses?.length > 0 ? (
                                        <div>
                                            <div className="text-sm font-medium text-default-900 mb-3">
                                                Courses
                                            </div>
                                            {announcement.courses?.length > 0 ? (
                                                <Badge color="warning" className="mr-1">
                                                    {announcement?.courses[0].title}
                                                </Badge>
                                            ) : (
                                                'No courses'
                                            )}
                                        </div>
                                    ) : ""}

                                    {announcement.departments?.length > 0 ? (
                                        <div>
                                            <div className="text-sm font-medium text-default-900 mb-3">
                                                Departments
                                            </div>
                                            {announcement.departments?.length > 0 ? (
                                                <div className="text-xs font-medium text-default-600 gap-2 flex flex-col">
                                                    {announcement.departments.slice(0, 2).map((dep) => (
                                                        <Badge color="warning" className="mr-1 w-fit" key={dep.id}>
                                                            {dep.title}
                                                        </Badge>
                                                    ))}
                                                    {announcement.departments.length > 2 && (
                                                        <sup className="text-xs/[15px] font-bold ring-1 ring-primary w-fit p-1 rounded-full">
                                                            +{announcement.departments.length - 2}
                                                        </sup>
                                                    )}
                                                </div>
                                            ) : (
                                                'No Departments'
                                            )}
                                        </div>
                                    ) : ""}

                                    {/* Locations */}
                                    {announcement.locations?.length > 0 ? (
                                        <div className="">
                                            <div className="text-sm font-medium text-default-900 mb-3">
                                                Location
                                            </div>
                                            {announcement.locations?.length > 0 ? (
                                                <div className="text-xs font-medium text-default-600 gap-2 flex flex-col">
                                                    {announcement.locations.slice(0, 2).map((loc) => (
                                                        <Badge color="warning" className="mr-1 w-fit" key={loc.id}>
                                                            {loc.title}
                                                        </Badge>
                                                    ))}
                                                    {announcement.locations.length > 2 && (
                                                        <sup className="text-xs/[15px] font-bold ring-1 ring-primary w-fit p-1 rounded-full">
                                                            +{announcement.locations.length - 2}
                                                        </sup>
                                                    )}
                                                </div>
                                            ) : (
                                                'No Locations'
                                            )}
                                        </div>
                                    ) : ""}
                                </div>
                            </CardContent>
                            <CardFooter className="flex justify-between border-t p-4  dark:border-default-300">
                                {announcement.publishedAt ? (
                                    <div>
                                        <div className="text-xs text-default-600 mb-[2px]">Published Date</div>
                                        <span className="text-xs font-medium text-default-900">
                                            {new Date(announcement.publishedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ) : ""}

                                {announcement?.author ? (
                                    <div>
                                        <div className="text-xs text-default-600 mb-[2px]">Author</div>

                                        <div className="text-xs font-medium text-default-900">
                                            {announcement.author?.firstName || 'Unknown'}
                                        </div>
                                    </div>
                                ) : ""}
                            </CardFooter>
                        </Card>
                    ))
                ) : (
                    // Fallback Message
                    <div className="flex flex-wrap col-span-12 bg-card justify-center text-center py-12 shadow-sm rounded-sm">
                        <h2 className="text-lg font-semibold text-gray-700 w-full">
                            No Announcements Available
                        </h2>
                        <p className="text-sm text-gray-500">
                            Please check back later for any updates.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Page;
