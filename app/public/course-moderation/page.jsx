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
import { getFilePath } from "../../../config/file.path";
import Link from 'next/link';
import ProjectList from "@/app/admin/course/ProjectList";
import { useDispatch } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { DataTableColumnHeader } from "@/app/admin/course/project-list/components/data-table-column-header";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { DataTableRowActions } from "@/app/admin/course/project-list/components/data-table-row-actions";
import { original } from "@reduxjs/toolkit";
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
    const [meta, setMeta] = useState({ "page": 1, "pageSize": 1, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [userCourses, setUserCourses] = useState([]);
    console.log("usercourseses--", userCourses)
    function formatDateString(dateString) {
        if (!dateString || typeof dateString !== "string") return "N/A";
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

    //   const columns = [
    //     {
    //       accessorKey: "months",
    //       header: ({ column }) => (
    //         <SortHeader column={column} title="Created Date" />
    //       ),
    //       cell: ({ row }) => (
    //         <div className="flex gap-2 flex-col">
    //           <span className="max-w-[500px] truncate font-medium">
    //             {formatDateString(formatDueDate(row?.original?.publishedAt)) ||
    //               "N/A"}
    //           </span>

    //           <div className="max-w-[500px] truncate font-medium ">
    //             By {row?.original?.recommendedBy?.firstName + " " || ""}
    //             ({row?.original?.recommendedBy?.role?.name})
    //           </div>
    //         </div>
    //       ),
    //       enableFiltering: true,
    //     },
    //     // {
    //     //   accessorKey: "courses",
    //     //   header: ({ column }) => (
    //     //     <SortHeader column={column} title="Moderation Courses" />
    //     //   ),
    //     //   cell: ({ row }) => {
    //     //     return (
    //     //      cell: ({ row }) => {
    //     //     return (
    //     //       <div className="space-y-2">
    //     //         {row?.original ? (
    //     //           row.original.courses.map((course) => {
    //     //             if (!course) return;
    //     //             const entity = row?.original;
    //     //             const userId = user?.id;
    //     //             const courseData = courseRecProgress[userId]?.find(
    //     //               (ele) => ele.courseId === course.documentId
    //     //             );

    //     //             const progressValue = parseInt(courseData?.progress) || 0;
    //     //             const status = courseData?.Course_Status || "Not Enrolled";
    //     //             return (
    //     //               <div key={course.id} className="p-2 ">
    //     //                 <div className="font-medium text-sm mb-1 cursor-pointer"
    //     //                 >
    //     //                   <Link href={`/public/course/${course?.documentId}`} target="_blank" className="font-medium text-sm mb-1 cursor-pointer">
    //     //                     {course.title || "Untitled Course"}
    //     //                   </Link>
    //     //                 </div>

    //     //                 <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
    //     //                   <div>
    //     //                     <strong>Assigned:</strong>{" "}
    //     //                     {formatDueDate(entity.publishedAt || "N/A")}
    //     //                   </div>
    //     //                   <div>
    //     //                     <strong>Due Date:</strong> {entity.due || "N/A"}
    //     //                   </div>
    //     //                   <div>
    //     //                     <strong>Progress:</strong> {progressValue || 0}%
    //     //                   </div>
    //     //                   <div>
    //     //                     <strong>Status:</strong>{" "}
    //     //                     <Badge
    //     //                       color={
    //     //                         status && status === "Not Enrolled"
    //     //                           ? "destructive"
    //     //                           : "warning"
    //     //                       }
    //     //                       className={status === "Completed" && "bg-green-700"}
    //     //                     >
    //     //                       {status || "N/A"}
    //     //                     </Badge>
    //     //                   </div>
    //     //                 </div>

    //     //                 <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    //     //                   <div
    //     //                     className="h-full rounded-full"
    //     //                     style={{
    //     //                       width: `${progressValue}%`,
    //     //                       backgroundColor:
    //     //                         progressValue === 100
    //     //                           ? "green"
    //     //                           : progressValue > 50
    //     //                             ? "orange"
    //     //                             : progressValue > 0
    //     //                               ? "red"
    //     //                               : "",
    //     //                     }}
    //     //                   ></div>
    //     //                 </div>
    //     //               </div>
    //     //             );
    //     //           })
    //     //         ) : (
    //     //           <span className="text-gray-400 text-sm">No courses assigned</span>
    //     //         )}
    //     //       </div>
    //     //     );
    //     //   },
    //     //   filterFn: (row, columnId, value) => {
    //     //     return row.original?.courses?.some((course) => {
    //     //       const courseName = course?.title?.toLowerCase() || "";
    //     //       return courseName.includes(value.toLowerCase());
    //     //     });
    //     //   },
    //     //   enableFiltering: true,
    //     // },
    //     {
    //         accessorKey: "course",
    //         header: ({ column }) => (
    //           <SortHeader column={column} title="Course Details" />
    //         ),
    //         cell: ({ row }) => {
    //           const course = row.original;
    //           const progress = courseRecProgress?.[user?.id]?.find(
    //             (c) => c.courseId === course.documentId
    //           );
    //           const progressValue = parseInt(progress?.progress) || 0;
    //           const status = progress?.Course_Status || "Not Enrolled";

    //           return (
    //             <div key={course.id} className="p-2 space-y-1">
    //               <div className="font-medium text-sm">
    //                 <Link
    //                   href={`/public/course/${course.documentId}`}
    //                   target="_blank"
    //                   className="hover:underline text-blue-600"
    //                 >
    //                   {course.title || "Untitled Course"}
    //                 </Link>
    //               </div>

    //               <div className="grid grid-cols-4 gap-2 text-xs text-gray-600">
    //                 <div>
    //                   <strong>Created:</strong> {formatDateString(formatDueDate(course.createdAt))}
    //                 </div>
    //                 <div>
    //                   <strong>Duration:</strong> {course.course_duration || "N/A"} mins
    //                 </div>
    //                 <div>
    //                   <strong>Progress:</strong> {progressValue}%
    //                 </div>
    //                 <div>
    //                   <strong>Status:</strong>{" "}
    //                   <Badge
    //                     color={
    //                       status === "Not Enrolled" ? "destructive" : "warning"
    //                     }
    //                     className={status === "Completed" ? "bg-green-700" : ""}
    //                   >
    //                     {status}
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
    //                         ? "orange"
    //                         : progressValue > 0
    //                         ? "red"
    //                         : "",
    //                   }}
    //                 ></div>
    //               </div>
    //             </div>
    //           );
    //         },
    //       },

    //     {
    //       accessorKey: "overallprogress",
    //       header: ({ column }) => (
    //         <SortHeader column={column} title=" course status" />
    //       ),
    //       cell: ({ row }) => {
    //         const getUsersOverallProgress = (courseRecProgress, user) => {
    //           if (!courseRecProgress) return;

    //           const userId = user?.id;
    //           const userCourses = courseRecProgress[userId] || [];

    //           if (userCourses.length === 0) {
    //             return { userId, overallProgress: "0%", status: "Not Enrolled" };
    //           }

    //           const validCourses = userCourses.filter(
    //             (course) =>
    //               course.Course_Status === "In Progress" ||
    //               course.Course_Status === "Completed"
    //           );

    //           if (validCourses.length === 0) {
    //             return { userId, overallProgress: "0%", status: "Not Enrolled" };
    //           }

    //           const totalProgress = validCourses.reduce(
    //             (acc, course) => acc + course.progress,
    //             0
    //           );
    //           const overallProgress = totalProgress / validCourses.length;
    //           const status = validCourses.some(
    //             (course) => course.Course_Status === "In Progress"
    //           )
    //             ? "In Progress"
    //             : "Completed";

    //           return { userId, overallProgress: `${overallProgress}%`, status };
    //         };

    //         const userProgressStatus =
    //           row?.original?.user &&
    //           getUsersOverallProgress(courseRecProgress, row?.original?.user);
    //         const result = userProgressStatus;
    //         const overallProgressValue = parseInt(result?.overallProgress) || 0;

    //         return (
    //           <div className="space-y-2">
    //             <div className="p-2 ">
    //               <div className="text-xs text-gray-600 text-center mb-2">
    //                 {result?.overallProgress || "0%"}
    //                 <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
    //                   <div
    //                     className="h-full rounded-full"
    //                     style={{
    //                       width: `${overallProgressValue}%`,
    //                       backgroundColor:
    //                         overallProgressValue === 100
    //                           ? "green"
    //                           : overallProgressValue > 50
    //                             ? "orange"
    //                             : overallProgressValue > 0
    //                               ? "red"
    //                               : "",
    //                     }}
    //                   ></div>
    //                 </div>
    //               </div>
    //             </div>
    //           </div>
    //         );
    //       },
    //     },
    //   ];


    // const userCourseColumns = [
    //     {
    //         accessorKey: "title",
    //         header: "Course Title",
    //         cell: ({ row }) => (
    //             <Link
    //                 href={`/public/course/${row.original?.documentId}`}
    //                 target="_blank"
    //                 className="text-blue-600 hover:underline"
    //             >
    //                 {row.original?.title}
    //             </Link>
    //         ),
    //     },
    //     {
    //         accessorKey: "createdAt",
    //         header: "Created",
    //         cell: ({ row }) => formatDateString(formatDueDate(row.original.createdAt)),
    //     },
    //     {
    //         accessorKey: "isPublished",
    //         header: "Status",
    //         cell: ({ row }) => (
    //             <Badge className={row.original.isPublished ? "bg-green-600" : "bg-yellow-400"}>
    //                 {row.original.isPublished ? "Published" : "Draft"}
    //             </Badge>
    //         ),
    //     },
    //     {
    //         accessorKey: "short_description",
    //         header: "Description",
    //         cell: ({ row }) => row.original.short_description || "N/A",
    //     },
    // ];
    const columns = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortHeader column={column} title="Course Title" />
                // <DataTableColumnHeader column={column} title="name" />
            ),
            // cell: ({ row }) => {
            //     return (
            //         <Link
            //             href={{
            //                 pathname: `/public/course-proposals/${row.original.documentId}`,
            //             }}
            //             className="flex items-center gap-2">

            //             <div className="max-w-[140px] truncate">
            //                 <span className="font-semibold text-default-900 capitalize hover:text-primary">
            //                     {" "}
            //                     {row.getValue("name")}
            //                 </span>
            //             </div>
            //         </Link>
            //     );
            // },
            // enableColumnFilter: true, 
            cell: ({ row }) => (
                <Link
                    href={`/public/course/${row.original?.documentId}`}
                    target="_blank"
                    className="text-blue-600 font-semibold hover:underline"
                >
                    {row.original?.title || "Untitled Course"}
                </Link>
            ),
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const desc = row.original?.short_description || "N/A";
                return (
                    <div className="text-sm text-gray-600">
                        {desc.length > 50 ? `${desc.slice(0, 50)}...` : desc}
                    </div>
                );
            },
        },
        {
            accessorKey: "moderationMessage",
            header: "Message from Creator",
            cell: ({ row }) => {
                const msg = row.original?.moderationMessage || "No message";
                return (
                    <div className="text-sm text-gray-700">
                        {msg.length > 60 ? `${msg.slice(0, 60)}...` : msg}
                    </div>
                );
            },
        },
        // {
        //     accessorKey: "moderationStatus",
        //     header: "Status",
        //     cell: ({ row }) => {
        //         return (
        //             <Badge variant="outline" className="capitalize">
        //                 {row.original?.moderationStatus || "Pending"}
        //             </Badge>
        //         );
        //     },
        // },
        {
            accessorKey: "moderationStatus",
            header: "Status",
            cell: ({ row }) => {
                const isModeration = row.original?.moderationStatus === true;
        
                return (
                    <Badge
                        variant="outline"
                        className={cn(
                            "capitalize",
                            isModeration ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
                        )}
                    >
                        {isModeration ? "Under Moderation" : "Published"}
                    </Badge>
                );
            },
        },
        
        {
            accessorKey: "smesAssigned",
            header: "Assigned SMEs",
            cell: ({ row }) => {
                const smes = row.original?.smesAssigned || [];

                if (!smes.length) return <span className="text-sm text-gray-500">None</span>;

                return (
                    <div className="flex flex-wrap gap-1">
                        {smes.map((sme) => (
                            <Badge
                                key={sme.id}
                                variant="outline"
                                className="text-xs px-2 py-1 bg-muted text-muted-foreground"
                            >
                                {sme.username}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },


        {
            accessorKey: "course_duration",
            header: "Duration",

            cell: ({ row }) => {
                const duration = row.original?.course_duration;
                return (
                    <div className="text-sm text-gray-700">
                        {duration ? `${duration} mins` : "N/A"}
                    </div>
                );
            },
            // cell: ({ row }) => {
            //     const course_duration = row.original?.course_duration;
            //     return (
            //         <div className="text-sm font-medium text-default-600 whitespace-nowrap">

            //             {minutesToHMS(course_duration) || "N/A"}
            //         </div>
            //     );
            // },
        },
        // {
        //     accessorKey: "upvotes",
        //     header: ({ column }) => {
        //         console.log("Sorting State:", column.getIsSorted());
        //         const order = column.getIsSorted();
        //         if (order === 'desc') {
        //             setOrder('desc')
        //         } else if (order === 'asc') {
        //             setOrder('asc')
        //         }
        //         return <DataTableColumnHeader column={column} title="total Upvote" />
        //     },
        //     cell: ({ row }) => {
        //         const isVoted = row.original.upvotes.some((ele) => {
        //             return ele.id === user.id;
        //         })

        //         return (
        //             // <div>

        //             //     <Badge color={""} className="whitespace-nowrap">
        //             //     <div className="text-sm font-medium text-default-900 whitespace-nowrap">
        //             //         {row.original.upvotes?.length || 0}
        //             //     </div>
        //             //     </Badge>
        //             // </div>
        //             <div className="inline-block rounded-md border cursor-pointer" onClick={() => upvote(row?.original?.documentId)}>
        //                 <Badge className={`${isVoted
        //                     ? "bg-primary border-transparent text-info-foreground"
        //                     : "bg-white text-black border border-gray-300"
        //                     } flex items-center gap-1 px-2 py-1 rounded-md`}>
        //                     <div className="text-sm font-medium">{row.original.upvotes?.length || 0}</div>
        //                     <svg
        //                         xmlns="http://www.w3.org/2000/svg"
        //                         width="16"
        //                         height="16"
        //                         viewBox="0 0 24 24"
        //                         className={isVoted ? "fill-info-foreground" : "fill-black"}
        //                     >
        //                         <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625zM15 12h-1v8h-4v-8H6.081L12 4.601L17.919 12z" />
        //                     </svg>
        //                 </Badge>
        //             </div>


        //         );


        //     },
        //     filterFn: (row, id, value) => {
        //         return value.includes(row.getValue(id));
        //     },
        // },
        {
            accessorKey: "author",
            header: "created By",
            cell: ({ row }) => {
                const author = row.original.author;
                return <div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        <Avatar className=" rounded-full">
                            {author?.profileImage?.url && <AvatarImage src={getFilePath(author?.profileImage?.url) || ''} />}
                            <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                                {author?.username?.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="capitalize text-sm text-card-foreground whitespace-nowrap">
                            {(author?.username || "")}
                        </span>
                    </div>
                </div>

            }
        },
        {
            accessorKey: "createdAt",
            header: " Created Date ",
            // cell: ({ row }) => {
            //     return (
            //         <div className="text-sm font-medium text-default-600 whitespace-nowrap">
            //             {formatDate(row.getValue("createdAt"))}
            //         </div>
            //     );
            // },
            cell: ({ row }) => {
                const date = row.original?.createdAt;
                return (
                    <div className="text-sm text-gray-500">
                        {formatDateString(formatDueDate(date))}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex h-8 w-8 p-0 data-[state=open]:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="">
                                <DropdownMenuItem
                                // onClick={() => {
                                //     if (certificateUrl) {
                                //         window.open(certificateUrl, "_blank");
                                //     } else {
                                //         alert("Certificate not available!");
                                //     }
                                // }}
                                >
                                    {/* <Link
                                        href={{
                                            pathname: `/admin/course/${row.original?.documentId}/1`,
                                        }}
                                        className="w-full"
                                    > */}
                                    <Link
                                        href={{
                                            pathname: `/admin/course/${row.original?.documentId}/1`,
                                            query: { mode: "moderation" },
                                        }}
                                        className="w-full"
                                    >
                                        Review
                                    </Link>

                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                // onClick={() => {
                                //     if (certificateUrl) {
                                //         downloadFromUrl(certificateUrl, `certificate_${row.original.id}.pdf`);
                                //     } else {
                                //         alert("Certificate not available for download!");
                                //     }
                                // }}
                                >
                                    Approve
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ];

    const table = useReactTable({
        // data: courseRecommendation,
        // columns,
        data: userCourses,
        columns,
        // columns: userCourseColumns,
        getCoreRowModel: getCoreRowModel(),
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

    //   const fetchUserAndCourseRecommendation = async (pageNo = 1, userId) => {
    //     try {
    //       const pageSize = meta.pageSize;
    //       const userResponse = await axiosInstance({
    //         url: `/api/users/${userId}?populate[courses_categories][populate][courses]=true&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
    //         method: "get",
    //       });
    //         console.log("userresponse--from moderation ", userResponse )
    //       const courseRecDocId = userResponse.data?.course_recommend?.documentId;

    //       if (courseRecDocId) {
    //         const courseRecommendation = await getAllCourseRecommendation(
    //           courseRecDocId
    //         );

    //         const courseRecommendationArray = [courseRecommendation];
    //         setCourseRecommendation(courseRecommendationArray);
    //       }
    //     } catch (error) {
    //       console.log("Error fetching user or course recommendation:", error);
    //     }
    //   };
    // const fetchUserAndCourseRecommendation = async (pageNo = 1, userId) => {
    //     try {
    //         const pageSize = meta.pageSize;
    //         const userResponse = await axiosInstance({
    //             url : `/api/course-moderations?populate[course][populate][courses_categories]=true&populate[smes_assigned]=true&populate[sme_who_approved]=true`,
    //             // url: `/api/users/${userId}?populate[courses_categories][populate][courses]=true&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
    //             method: "get",
    //         });
    //       console.log("from moderation",userResponse)
    //         // const categories = userResponse.data?.courses_categories || [];
    //         const flatCourses = course.flatMap((cat) => cat.courses || []);
    //         setUserCourses(flatCourses);
    //     } catch (error) {
    //         console.log("Error fetching user or course recommendation:", error);
    //     }
    // };


    const fetchUserAndCourseRecommendation = async (pageNo = 1) => {
        try {
            const res = await axiosInstance.get(
                `/api/course-moderations?populate[course][populate][courses_categories]=true&populate[smes_assigned]=true&populate[sme_who_approved]=true&status=draft`
            );

            const allModerations = res.data.data;
 console.log("allModerations---",allModerations)

            const relevantModerations = allModerations.filter((mod) =>
                mod.smes_assigned?.some((sme) => sme.id === user.id)
            );


            const coursesToShow = relevantModerations
                .filter((mod) => mod.course !== null)
                .map((mod) => ({
                    ...mod.course,
                    moderationId: mod.id,
                    moderationMessage: mod.message_left_by_course_creator,
                    moderationStatus: mod.course?.isModeration,
                    smesAssigned: mod.smes_assigned,
                    documentId: mod.course?.documentId,
                }));
              console.log("coursesToShow----",coursesToShow)
            setUserCourses(coursesToShow);
        } catch (error) {
            console.error("Error fetching moderation records:", error);
        }
    };


    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);
    useEffect(() => {
        if (user?.id) {
            fetchUserAndCourseRecommendation(1, user?.id);
        }
    }, []);

    // const getAllCourseRecommendation = async (courseRecDocId) => {
    //     try {
    //         const { data } = await axiosInstance({
    //             url: `/api/course-recommends/${courseRecDocId}?populate[user][populate][course_enrollments]=true&populate[courses][populate][courses_categories]=true&status=published&populate[recommendedBy][populate][role]=true`,
    //             method: "GET",
    //         });

    //         return data.data;
    //     } catch (error) {
    //         console.error("Failed to fetch course recommendations:", error);
    //     }
    // };

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
                const user = ele.user?.id;
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
                        Course Moderation
                    </div>
                </div>

                {/* {!courseRecommendation ? (
          <Blank className="flex flex-col items-center justify-center h-full space-y-3">
            <div className="text-default-900 text-xl font-semibold">
              No Course Moderation Available
            </div>
          </Blank>
        ) : (
          <ProjectList data={courseRecommendation} table={table} columns={columns} meta={meta} func={fetchUserAndCourseRecommendation} />
        )} */}
                {/* {!userCourses.length || !table ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="animate-spin text-gray-500 w-6 h-6" />
                        <span className="ml-2 text-gray-500">Loading courses...</span>
                    </div>
                ) : (
                    <ProjectList
                        data={userCourses}
                        table={table}
                        columns={columns}
                        // columns={userCourseColumns}
                        meta={meta}
                        func={fetchUserAndCourseRecommendation}
                    />
                )} */}
                {userCourses.length === 0 ? (
                    <Blank className="text-center py-12">
                        <div className="text-lg font-semibold text-gray-700">No courses for moderation</div>
                        <p className="text-sm text-gray-500">You are not assigned as SME to any course.</p>
                    </Blank>
                ) : (
                    <ProjectList
                        data={userCourses}
                        table={table}
                        columns={columns}
                        meta={meta}
                        func={fetchUserAndCourseRecommendation}
                    />
                )}

            </div>
        </>
    );
}

export default CourseRecommend;
