"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Blank from "@/components/blank";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Select from "react-select";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, X } from "lucide-react";
import { Plus } from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axiosInstance from "@/config/axios.config";
import { useMemo } from "react";
import { SortHeader } from "../assignment-recommend/SortHeader";
import { useSelector } from "react-redux";
import {
  getAllCourses,
  getSingleCourseRecommendation,
  getCourseRecProgress,
} from "../assignment-recommend/course-recommend-operation";
import Link from 'next/link';
import ProjectList from "@/app/admin/course/ProjectList";
import { useDispatch } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
const styles = {
  multiValue: (base, state) => {
    return state.data.isFixed ? { ...base, opacity: "0.5" } : base;
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, color: "#626262", paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: "none" } : base;
  },
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
  }),
};

function CourseRecommend() {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [courseRecommendId, setCourseRecommendId] = useState(null);
  const [courses, setCourses] = useState([]);
  const user = useSelector((state) => state.user);
  const [courseRecommendation, setCourseRecommendation] = useState({});
  const [courseRecProgress, setCourseRecProgress] = useState({});
  const [users, setUsers] = useState([]);
  const [singleCourseRecommendationId, setSingleCourseRecommendationId] =
    useState();
  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data, loading, error } = siteSetting || {};
  const [meta, setMeta] = useState({ "page": 1, "pageSize": 4, "pageCount": 0, "total": 0, "currentPage": 1 });

  function formatDateString(dateString) {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const [year, month, day] = dateString.split("-");
    return `${day} ${months[parseInt(month, 10) - 1]} ${year}`;
  }

  const columns = [
    {
      accessorKey: "months",
      header: ({ column }) => (
        <SortHeader column={column} title="Assigned Date" />
      ),
      // cell: ({ row }) => (
      //   <div className="flex gap-2 flex-col">
      //     <span className="max-w-[500px] truncate font-medium">
      //       {formatDateString(formatDueDate(row?.original?.publishedAt)) ||
      //         "N/A"}
      //     </span>

      //     <div className="max-w-[500px] truncate font-medium ">
      //       By {row?.original?.recommendedBy?.firstName + " " || ""}
      //       ({row?.original?.recommendedBy?.role?.name})
      //     </div>
      //   </div>
      // ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-4">
          {/* {JSON.stringify(row?.original)} */}
          {[!Array.isArray(row.original) ? row.original :
            row.original].map((entry, index) => (
              <div key={index} className="flex gap-2 flex-col">
                {/* {JSON.stringify(entry)} */}
                <span className="max-w-[500px] truncate font-medium">
                  {formatDateString(formatDueDate(entry?.publishedAt)) || "N/A"}
                </span>
                <div className="max-w-[500px] truncate font-medium">
                  By {entry?.recommendedBy?.firstName || ""} (
                  {entry?.recommendedBy?.role?.name || "Unknown"})
                </div>
              </div>
            ))}
        </div>
      )
      ,
      enableFiltering: true,
    },
    {
      accessorKey: "courses",
      header: ({ column }) => (
        <SortHeader column={column} title="Recommended Courses" />
      ),
      // cell: ({ row }) => {
      //   return (
      //     <div className="space-y-2">
      //       {row?.original ? (
      //         row.original.courses.map((course) => {
      //           if (!course) return;
      //           const entity = row?.original;
      //           const userId = user?.id;
      //           const courseData = courseRecProgress[userId]?.find(
      //             (ele) => ele.courseId === course.documentId
      //           );

      //           const progressValue = parseInt(courseData?.progress) || 0;
      //           const status = courseData?.Course_Status || "Not Enrolled";
      //           return (
      //             <div key={course.id} className="p-2 ">
      //               <div className="font-medium text-sm mb-1 cursor-pointer"
      //               >
      //                 <Link href={`/public/course/${course?.documentId}`} target="_blank" className="font-medium text-sm mb-1 cursor-pointer">
      //                   {course.title || "Untitled Course"}
      //                 </Link>
      //               </div>

      //               <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
      //                 <div>
      //                   <strong>Assigned:</strong>{" "}
      //                   {formatDueDate(entity.publishedAt || "N/A")}
      //                 </div>
      //                 <div>
      //                   <strong>Due Date:</strong> {entity.due || "N/A"}
      //                 </div>
      //                 <div>
      //                   <strong>Progress:</strong> {progressValue || 0}%
      //                 </div>
      //                 <div>
      //                   <strong>Status:</strong>{" "}
      //                   <Badge
      //                     color={
      //                       status && status === "Not Enrolled"
      //                         ? "destructive"
      //                         : "warning"
      //                     }
      //                     className={status === "Completed" && "bg-green-700"}
      //                   >
      //                     {status || "N/A"}
      //                   </Badge>
      //                 </div>
      //               </div>

      //               <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
      //                 <div
      //                   className="h-full rounded-full"
      //                   style={{
      //                     width: `${progressValue}%`,
      //                     backgroundColor:
      //                       progressValue === 100
      //                         ? "green"
      //                         : progressValue > 50
      //                           ? "orange"
      //                           : progressValue > 0
      //                             ? "red"
      //                             : "",
      //                   }}
      //                 ></div>
      //               </div>
      //             </div>
      //           );
      //         })
      //       ) : (
      //         <span className="text-gray-400 text-sm">No courses assigned</span>
      //       )}
      //     </div>
      //   );
      // },
      cell: ({ row }) => {
        return (
          <div className="space-y-4">
            {[!Array.isArray(row.original) ? row.original :
              row.original].map((entity, i) =>
                entity.courses?.map((course) => {
                  if (!course) return null;
                  const userId = user?.id;
                  const courseData = courseRecProgress[userId]?.find(
                    (ele) => ele.courseId === course.documentId
                  );
                  const progressValue = parseInt(courseData?.progress) || 0;
                  const status = courseData?.Course_Status || "Not Enrolled";

                  return (
                    <div key={`${course.id}-${i}`} className="p-2">
                      <div className="font-medium text-sm mb-1">
                        <Link
                          href={`/public/course/${course?.documentId}`}
                          target="_blank"
                          className="cursor-pointer"
                        >
                          {course.title || "Untitled Course"}
                        </Link>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
                        <div>
                          <strong>Assigned:</strong>{" "}
                          {formatDueDate(entity.publishedAt || "N/A")}
                        </div>
                        <div>
                          <strong>Due Date:</strong> {entity.due || "N/A"}
                        </div>
                        <div>
                          <strong>Progress:</strong> {progressValue || 0}%
                        </div>
                        <div>
                          <strong>Status:</strong>{" "}
                          <Badge
                            color={
                              status === "Not Enrolled"
                                ? "destructive"
                                : status === "Completed"
                                  ? "success"
                                  : "warning"
                            }
                            className={status === "Completed" ? "bg-green-700" : ""}
                          >
                            {status}
                          </Badge>
                        </div>
                      </div>

                      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${progressValue}%`,
                            backgroundColor:
                              progressValue === 100
                                ? "green"
                                : progressValue > 50
                                  ? "orange"
                                  : progressValue > 0
                                    ? "red"
                                    : "",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              )}
          </div>
        );
      },

      filterFn: (row, columnId, value) => {
        return row.original?.courses?.some((course) => {
          const courseName = course?.title?.toLowerCase() || "";
          return courseName.includes(value.toLowerCase());
        });
      },
      enableFiltering: true,
    },

    {
      accessorKey: "overallprogress",
      header: ({ column }) => (
        <SortHeader column={column} title="Overall Progress" />
      ),
      cell: ({ row }) => {
        const getUsersOverallProgress = (courseRecProgress, user) => {
          if (!courseRecProgress) return;

          const userId = user?.id;
          const userCourses = courseRecProgress[userId] || [];

          if (userCourses.length === 0) {
            return { userId, overallProgress: "0%", status: "Not Enrolled" };
          }

          const validCourses = userCourses.filter(
            (course) =>
              course.Course_Status === "In Progress" ||
              course.Course_Status === "Completed"
          );
          if (validCourses.length === 0) {
            return { userId, overallProgress: "0%", status: "Not Enrolled" };
          }

          const totalProgress = validCourses.reduce(
            (acc, course) => acc + course.progress,
            0
          );
          const overallProgress = totalProgress / validCourses.length;
          const status = validCourses.some(
            (course) => course.Course_Status === "In Progress"
          )
            ? "In Progress"
            : "Completed";
          return { userId, overallProgress: `${overallProgress}%`, status };
        };

        const userProgressStatus =
          row?.original?.user[0] &&
          getUsersOverallProgress(courseRecProgress, row?.original?.user[0]);
        const result = userProgressStatus;
        const overallProgressValue = parseInt(result?.overallProgress) || 0;

        return (
          <div className="space-y-2">
            <div className="p-2 ">
              <div className="text-xs text-gray-600 text-center mb-2">
                {result?.overallProgress || "0%"}
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${overallProgressValue}%`,
                      backgroundColor:
                        overallProgressValue === 100
                          ? "green"
                          : overallProgressValue > 50
                            ? "orange"
                            : overallProgressValue > 0
                              ? "red"
                              : "",
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: courseRecommendation,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  const fetchUserAndCourseRecommendation = async (pageNo = 1, userId) => {
    try {
      const pageSize = meta.pageSize;
      // const userResponse = await axiosInstance({
      //   url: `/api/users/${userId}?populate=course_recommend&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
      //   method: "get",
      // });


      // console.log("UserResponse: ",userResponse.data);
      // const courseRecDocIds = userResponse.data?.course_recommend?.map(element => element.documentId);
      // console.log("CourserecIds", courseRecDocIds);
      // if (courseRecDocIds) {
      //   const courseRecommendation = await Promise.all(
      //     courseRecDocIds.map((item) => getAllCourseRecommendation(item))
      //   );
      //   const courseRecommendationArray = courseRecommendation;
      // }

      {/**
        We are getting data from course recommend table with filtered 
        */}
        if(!userId){
          userId = localStorage.getItem("alpha-id")
        }

      const userResponse = await axiosInstance({
        url: `/api/course-recommends?filters[user][id][$eq]=${userId}&populate=user&populate=courses&populate=recommendedBy.role&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
        method: 'GET'
      })
     
      const metaData = userResponse.data.meta.pagination;
      
      setMeta({
        page: metaData.page,
        pageSize: metaData.pageSize,
        pageCount: metaData.pageCount,
        total: metaData.total,
        currentPage: pageNo,
      });
      
      setCourseRecommendation(userResponse.data.data);
    } catch (error) {
      console.log("Error fetching user or course recommendation:", error);
    }
  };
  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem("alpha-id",user?.id)
      fetchUserAndCourseRecommendation(1, user?.id);
    }
  }, []);

  const getAllCourseRecommendation = async (courseRecDocId) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-recommends/${courseRecDocId}?populate[user][populate][course_enrollments]=true&populate[courses][populate][courses_categories]=true&status=published&populate[recommendedBy][populate][role]=true`,
        method: "GET",
      });

      return data.data;
    } catch (error) {
      console.error("Failed to fetch course recommendations:", error);
    }
  };

  const handleGetAllCourses = async () => {
    const res = await getAllCourses();
    setCourses(res);
  };

  useEffect(() => {
    handleGetAllCourses();
  }, []);

  const handleCourseRecProgress = async (userId, courseDocId) => {
    try {
      const res = await getCourseRecProgress(userId, courseDocId);
      let format;
      if (res) {
        format = {
          progress: res.progress,
          Course_Status: res.Course_Status,
          courseId: courseDocId,
          isEnrolled: true,
        };
      } else {
        format = {
          progress: null,
          courseId: courseDocId,
          isEnrolled: false,
        };
      }
      setCourseRecProgress((prev) => ({
        ...prev,
        [userId]: [...(prev[userId] || []), format],
      }));
    } catch (error) {
      console.error("Error fetching course recommendation progress:", error);
    }
  };

  const memoisedCourseRec = useMemo(() => {
    return (
      Array.isArray(courseRecommendation) && courseRecommendation.length > 0
    );
  }, [courseRecommendation]);

  useEffect(() => {
    if (memoisedCourseRec) {
      courseRecommendation.forEach((ele) => {
        const user = ele.user[0]?.id;
        ele.courses.forEach((ele) => {
          return handleCourseRecProgress(user, ele.documentId);
        });
      });
    }
  }, [memoisedCourseRec]);

  function formatDueDate(date) {
    if (date instanceof Date) {
      return date.toLocaleDateString("en-CA");
    }
    if (typeof date === "string" && !isNaN(Date.parse(date))) {
      return new Date(date).toLocaleDateString("en-CA");
    }
    return date;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center flex-wrap justify-between gap-4">
          <div className="text-2xl font-medium text-default-800">
            Course Recommendation
          </div>
        </div>

        {!courseRecommendation ? (
          <Blank className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="text-default-900 text-xl font-semibold">
              No Course Recommendation Available
            </div>
          </Blank>
        ) : (
          <ProjectList data={courseRecommendation} table={table} columns={columns} meta={meta} func={fetchUserAndCourseRecommendation} />
        )}
      </div>
    </>
  );
}

export default CourseRecommend;
