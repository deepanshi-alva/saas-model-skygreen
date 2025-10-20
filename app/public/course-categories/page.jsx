"use client";
import axiosInstance from "@/config/axios.config";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { useTheme } from "next-themes";
import DefaultPagination from "./../../dafault-pagi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import admin from "@/public/images/avatar/avatar-13.jpg";
import { getFilePath } from "../../../config/file.path";

const Page = () => {
  const [categories, setCategories] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [othersCourses, setOthersCourses] = useState([]);
  // console.log("otherCourses--", othersCourses);
  const [showAllOthers, setShowAllOthers] = useState(false); // To handle "Show More"
  const [othersCoursesToShow, setOthersCoursesToShow] = useState(4);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 5,
    total: 0,
    pageCount: 0,
  });

  const dispatch = useDispatch();
  const { theme: mode } = useTheme();

  const prioritiesColorMap = {
    high: "destructive",
    low: "info",
    medium: "warning",
  };

  useEffect(() => {
    fetchCategories(meta.page);
    fetchUncategorizedCourses();
    dispatch(fetchSiteSetting());
  }, [meta.page, difficultyFilter]);

  // ✅ Debounce Search Filter
  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchCategories(1);
    }, 500); // 500ms delay to optimize API calls

    return () => clearTimeout(timeout);
  }, [filterValue]);

  const fetchUncategorizedCourses = async () => {
    try {
      const { data } = await axiosInstance.get(
        `/api/courses?populate=*&status=published`
      );
      // console.log("data-- fromdata", data?.data);

      if (data?.data) {
        const uncategorized = data.data.filter((course) => {
          // console.log("categories", course);
          const categories = course?.courses_categories || [];
          // console.log("ye hai course category ka data jo dekhna merko", course?.attributes?.courses_categories?.data);
          // console.log("course unrecognised categories", categories);
          const isUncategorized = categories.length === 0;

          // if (isUncategorized) {
          //     console.log("Uncategorized course:", course?.attributes?.title || course.id);
          // }

          return isUncategorized;
        });
        // console.log("uncategoriseddata---", uncategorized)
        setOthersCourses(uncategorized);
      }
    } catch (error) {
      console.log(
        "Error fetching uncategorized courses:",
        error.response?.data || error.message
      );
    }
  };

  // ✅ Fetch Course Categories with Filters
  // const fetchCategories = async (pageNo) => {
  //     try {
  //         let query = new URLSearchParams({
  //             "pagination[page]": pageNo,
  //             "pagination[pageSize]": meta.pageSize,
  //             "populate[thumbnail]":"true",
  //             "populate[courses][populate][course_thumbnail]": "true",
  //             "populate[courses][populate][instructors]": "true",
  //             "populate[courses][populate][departments]": "true",
  //             "populate[courses][populate][locations]": "true",
  //         });

  //         // ✅ Apply Difficulty Level Filter
  //         if (difficultyFilter) {
  //             query.append("filters[courses][difficulty_level][$eq]", difficultyFilter);
  //         }

  //         // ✅ Apply Search Filter
  //         if (filterValue.trim() !== "") {
  //             query.append("filters[title][$containsi]", filterValue);
  //         }

  //         const { data } = await axiosInstance({
  //             url: `/api/courses-categories?${query.toString()}`,
  //             method: 'get',
  //         });

  //         if (data.data) {
  //             // ✅ Separate categories into priority and non-priority groups
  //             const priorityCategories = data.data
  //                 .filter(cat => cat.is_priority && cat.courses && cat.courses.length > 0)
  //                 .sort((a, b) => a.sort_order - b.sort_order); // Sort by sort_order ascending

  //             const nonPriorityCategories = data.data
  //                 .filter(cat => !cat.is_priority)
  //                 .sort((a, b) => a.title.localeCompare(b.title)); // Sort alphabetically

  //             // setCategories([...priorityCategories, ...nonPriorityCategories]);
  //             const allCategories = [...priorityCategories, ...nonPriorityCategories];

  //             // ✅ Set categories for the current page
  //             setCategories(allCategories);
  //         }

  //         setMeta((prev) => ({
  //             ...prev,
  //             total: data.meta.pagination.total,
  //             pageCount: data.meta.pagination.pageCount,
  //         }));
  //         console.log("this is the categories", categories);
  //     } catch (error) {
  //         console.log("Error fetching categories:", error.response?.data || error.message);
  //     }
  // };
  const fetchCategories = async (pageNo) => {
    try {
      const query = new URLSearchParams({
        "pagination[page]": 1,
        "pagination[pageSize]": 100, // large enough to cover all categories
        "populate[thumbnail]": "true",
        "populate[courses][populate][course_thumbnail]": "true",
        "populate[courses][populate][instructors]": "true",
        "populate[courses][populate][departments]": "true",
        "populate[courses][populate][locations]": "true",
      });

      if (difficultyFilter) {
        query.append(
          "filters[courses][difficulty_level][$eq]",
          difficultyFilter
        );
      }
      if (filterValue.trim() !== "") {
        query.append("filters[title][$containsi]", filterValue);
      }

      const { data } = await axiosInstance.get(
        `/api/courses-categories?${query.toString()}`
      );

      if (data?.data) {
        const allCategories = data.data.filter(
          (cat) => cat.courses?.length > 0
        );

        const priorityCategories = allCategories
          .filter((cat) => cat.is_priority)
          .sort((a, b) => a.sort_order - b.sort_order);

        const nonPriorityCategories = allCategories
          .filter((cat) => !cat.is_priority)
          .sort((a, b) => a.title.localeCompare(b.title));

        const priorityCount = priorityCategories.length;
        const categoriesPerPage = meta.pageSize;

        let currentCategories = [];

        if (pageNo === 1) {
          const remainingSlots = Math.max(0, categoriesPerPage - priorityCount);
          const nonPrioritySlice = nonPriorityCategories.slice(
            0,
            remainingSlots
          );
          currentCategories = [...priorityCategories, ...nonPrioritySlice];
        } else {
          const start =
            (pageNo - 2) * categoriesPerPage +
            (categoriesPerPage - priorityCount);
          const end = start + categoriesPerPage;
          currentCategories = nonPriorityCategories.slice(start, end);
        }

        setCategories(currentCategories);

        // update pageCount based on only non-priority categories
        const pageCount =
          Math.ceil(
            (nonPriorityCategories.length -
              (categoriesPerPage - priorityCount)) /
              categoriesPerPage
          ) + 1;

        setMeta((prev) => ({
          ...prev,
          total: nonPriorityCategories.length,
          pageCount,
        }));
      }
    } catch (error) {
      console.log(
        "Error fetching categories:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800">
          Browse Courses by Category
        </div>
      </div>

      {/* ✅ Search & Filter Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex lg:flex-row flex-col flex-wrap gap-6">
            {/* ✅ Search Bar */}
            <div className="flex-1 flex gap-3">
              <Input
                placeholder="Search course categories..."
                value={filterValue}
                onChange={(event) => setFilterValue(event.target.value)}
                className="h-8 w-full lg:w-[250px]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ Category Cards Section */}
      {categories.length > 0 ? (
        categories
          .filter((category) => category.courses?.length > 0) // ✅ Filter out categories with no courses
          .map((category) => (
            <div
              key={category.id}
              className="bg-card p-4 py-6 rounded-md shadow-md hover:translate-y-1 transition-all"
              // style={{
              //     backgroundImage: category?.thumbnail?.url
              //         ? `url(${getFilePath(category?.thumbnail.url)})`
              //         : "none",
              //     backgroundSize: "cover",
              //     backgroundPosition: "center",
              // }}
            >
              {/* ✅ Category Title Row */}
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-medium text-primary">
                  {category.title}
                </h3>

                {/* ✅ Only show Explore More if category has 3 or more courses */}
                {category.courses.length >= 4 && (
                  <Link
                    href={{
                      pathname: "/public/course-browser",
                      query: {
                        category: category.id,
                        categoryName: category.title,
                      },
                    }}
                  >
                    <Button className="text-md" variant="outline">
                      Explore More
                    </Button>
                  </Link>
                )}
              </div>

              {/* ✅ Display Top 3 Related Courses */}
              <div className="grid grid-cols-12 gap-4 mt-3">
                {category.courses.slice(0, 4).map((courseDetail) => (
                  <div
                    key={courseDetail.id}
                    className="col-span-12 md:col-span-4 lg:col-span-3  hover:translate-y-1 transition-all"
                  >
                    <Card className="hover:shadow-md">
                      <Link
                        href={`/public/course/${courseDetail.documentId}/#overview`}
                        className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md"
                      >
                        <div className="w-full h-[140px] overflow-hidden bg-card">
                          {courseDetail?.course_thumbnail?.url ? (
                            <img
                              src={getFilePath(
                                courseDetail?.course_thumbnail?.url
                              )}
                              alt="user"
                              className="rounded-md  mx-auto"
                            />
                          ) : (
                            <Image
                              src={admin}
                              alt="user"
                              className="rounded-md"
                            />
                          )}
                        </div>
                        <div className="flex courseLightBlueBg">
                          <div className="p-4 w-full">
                            {courseDetail.modules?.filter(
                              (ele) => ele.type === "Module"
                            ).length ? (
                              <Badge
                                className="courseBadge mr-2 "
                                color="info"
                                variant="soft"
                              >
                                {`${
                                  courseDetail.modules.filter(
                                    (ele) => ele.type === "Module"
                                  ).length
                                } Modules`}
                              </Badge>
                            ) : null}

                            {courseDetail.modules?.filter(
                              (ele) => ele.type === "Topic"
                            ).length ? (
                              <Badge
                                className="courseBadge mr-2 "
                                color="info"
                                variant="soft"
                              >
                                {`${
                                  courseDetail.modules.filter(
                                    (ele) => ele.type === "Topic"
                                  ).length
                                } Topics`}
                              </Badge>
                            ) : null}

                            <Badge
                              color="info"
                              className="capitalize ml-0 bg-black/80 w-full max-w-max courseBadge"
                            >
                              {courseDetail?.course_mandatory
                                ? "Mandatory"
                                : "Elective"}
                            </Badge>

                            <h3 className="hover:text-primary text-base dark:text-default-100">
                              {courseDetail.title}
                            </h3>

                            <div className="flex  mt-3 gap-10">
                              {courseDetail?.instructors?.length > 0 && (
                                <div className="flex-1">
                                  <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3">
                                    Trainer:
                                  </div>
                                  <div className="flex gap-1 items-center">
                                    {courseDetail.instructors
                                      .slice(0, 2)
                                      .map((user, index) => (
                                        <Avatar
                                          key={`trainer-${index}`}
                                          className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-7 w-7"
                                        >
                                          <AvatarImage
                                            src={user.profileImageUrl}
                                          />
                                          <AvatarFallback>
                                            {user.username
                                              ? user.username
                                                  .substring(0, 2)
                                                  .toUpperCase()
                                              : "NA"}
                                          </AvatarFallback>
                                        </Avatar>
                                      ))}
                                    {courseDetail.instructors.length > 2 && (
                                      <Badge color="default" variant="outline">
                                        +{courseDetail.instructors.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                              {courseDetail?.departments?.length > 0 && (
                                <div className="flex flex-col items-end">
                                  <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3 text-right">
                                    Department:
                                  </div>
                                  <div className="flex gap-1">
                                    {courseDetail.departments
                                      .slice(0, 2)
                                      .map((department, index) => (
                                        <Badge
                                          key={department.id}
                                          color={
                                            prioritiesColorMap[department.title]
                                          }
                                          variant={
                                            mode === "dark" ? "solid" : "solid"
                                          }
                                          className="capitalize"
                                        >
                                          {department.title}
                                        </Badge>
                                      ))}
                                    {courseDetail.departments.length > 2 && (
                                      <Badge
                                        color="default"
                                        variant="outline"
                                        className="capitalize"
                                      >
                                        +{courseDetail.departments.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                      <div className="col-span-12 lg:col-span-12">
                        {courseDetail?.locations?.length > 0 && (
                          <div className="p-4">
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-default-900 mb-3 text-right">
                                Location:
                              </div>
                              <div className="flex gap-1">
                                {courseDetail.locations
                                  .slice(0, 2)
                                  .map((location, index) => (
                                    <Badge
                                      key={`location-${index}`}
                                      color="info"
                                      variant="soft"
                                    >
                                      {location.title}
                                    </Badge>
                                  ))}
                                {courseDetail.locations.length > 2 && (
                                  <Badge color="default" variant="outline">
                                    +{courseDetail.locations.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))
      ) : (
        <div className="col-span-12 text-center">
          <p className="text-default-500 text-lg">No categories found.</p>
        </div>
      )}

      {/* ✅ OTHERS Section: Courses Without a Category */}
      {meta.page === meta.pageCount && othersCourses.length > 0 && (
        <div className="bg-card p-4 py-6 rounded-md shadow hover:translate-y-1 transition-all">
          <div className="flex justify-between items-center">
            <h3 className="text-xl text-primary font-medium">Others</h3>
          </div>

          <div className="grid grid-cols-12 gap-4 mt-3">
            {othersCourses.slice(0, 3).map((courseDetail) => (
              <div
                key={courseDetail.id}
                className="col-span-12 md:col-span-4 lg:col-span-3 hover:translate-y-1 transition-all"
              >
                <Card className="hover:shadow-md">
                  <Link
                    href={`/public/course/${courseDetail.documentId}/#overview`}
                    className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md"
                  >
                    <div className="w-full h-[140px] overflow-hidden bg-card">
                      {courseDetail?.course_thumbnail?.url ? (
                        <img
                          src={getFilePath(courseDetail?.course_thumbnail?.url)}
                          alt="user"
                          className="rounded-md  mx-auto"
                        />
                      ) : (
                        <Image src={admin} alt="user" className="rounded-md" />
                      )}
                    </div>
                    <div className="flex courseLightBlueBg">
                      <div className="p-4 w-full">
                        {courseDetail.modules?.filter(
                          (ele) => ele.type === "Module"
                        ).length ? (
                          <Badge
                            className="courseBadge mr-2 "
                            color="info"
                            variant="soft"
                          >
                            {`${
                              courseDetail.modules.filter(
                                (ele) => ele.type === "Module"
                              ).length
                            } Modules`}
                          </Badge>
                        ) : null}

                        {courseDetail.modules?.filter(
                          (ele) => ele.type === "Topic"
                        ).length ? (
                          <Badge
                            className="courseBadge mr-2 "
                            color="info"
                            variant="soft"
                          >
                            {`${
                              courseDetail.modules.filter(
                                (ele) => ele.type === "Topic"
                              ).length
                            } Topics`}
                          </Badge>
                        ) : null}

                        <Badge
                          color="info"
                          className="capitalize ml-0 bg-black/80 w-full max-w-max courseBadge"
                        >
                          {courseDetail?.course_mandatory
                            ? "Mandatory"
                            : "Elective"}
                        </Badge>

                        <h3 className="hover:text-primary text-base  dark:text-default-100">
                          {courseDetail.title}
                        </h3>

                        <div className="flex  mt-3 gap-10">
                          {courseDetail?.instructors?.length > 0 && (
                            <div className="flex-1">
                              <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3">
                                Trainer:
                              </div>
                              <div className="flex gap-1 items-center">
                                {courseDetail.instructors
                                  .slice(0, 2)
                                  .map((user, index) => (
                                    <Avatar
                                      key={`trainer-${index}`}
                                      className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-7 w-7"
                                    >
                                      <AvatarImage src={user.profileImageUrl} />
                                      <AvatarFallback>
                                        {user.username
                                          ? user.username
                                              .substring(0, 2)
                                              .toUpperCase()
                                          : "NA"}
                                      </AvatarFallback>
                                    </Avatar>
                                  ))}
                                {courseDetail.instructors.length > 2 && (
                                  <Badge color="default" variant="outline">
                                    +{courseDetail.instructors.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                          {courseDetail?.departments?.length > 0 && (
                            <div className="flex flex-col items-end">
                              <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3 text-right">
                                Department:
                              </div>
                              <div className="flex gap-1">
                                {courseDetail.departments
                                  .slice(0, 2)
                                  .map((department, index) => (
                                    <Badge
                                      key={department.id}
                                      color={
                                        prioritiesColorMap[department.title]
                                      }
                                      variant={
                                        mode === "dark" ? "solid" : "solid"
                                      }
                                      className="capitalize"
                                    >
                                      {department.title}
                                    </Badge>
                                  ))}
                                {courseDetail.departments.length > 2 && (
                                  <Badge
                                    color="default"
                                    variant="outline"
                                    className="capitalize"
                                  >
                                    +{courseDetail.departments.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                  <div className="col-span-12 lg:col-span-12 ">
                    {courseDetail?.locations?.length > 0 && (
                      <div className="p-4">
                        <div className="flex flex-col items-end">
                          <div className="text-sm font-medium text-default-900 mb-3 text-right">
                            Location:
                          </div>
                          <div className="flex gap-1">
                            {courseDetail.locations
                              .slice(0, 2)
                              .map((location, index) => (
                                <Badge
                                  key={`location-${index}`}
                                  color="info"
                                  variant="soft"
                                >
                                  {location.title}
                                </Badge>
                              ))}
                            {courseDetail.locations.length > 2 && (
                              <Badge color="default" variant="outline">
                                +{courseDetail.locations.length - 2}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      <DefaultPagination
        meta={meta}
        func={(newPage) => setMeta((prev) => ({ ...prev, page: newPage }))}
      />
    </div>
  );
};

export default Page;
