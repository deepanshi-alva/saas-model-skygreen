"use client";
import React, { useEffect, useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Blank from '@/components/blank';
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
import { Plus } from 'lucide-react';
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
import axiosInstance from '@/config/axios.config';
import { Input } from '@/components/ui/input';
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useMemo } from 'react';
import ProjectList from './../course/ProjectList';
import { SortHeader } from '../assignment/SortHeader';
import { useForm, Controller } from "react-hook-form"
import { useSelector } from 'react-redux';
import { Label } from '@/components/ui/label'
import { Filter } from '../course-recommend/FacetedFilter'
import toast from 'react-hot-toast';
import DatePicker from '../course-recommend/DatePicker';
import { getAllCourses, getSingleCourseRecommendation, deleteCourseRecommendation, getCourseRecProgress } from "./assignment-recommend-operation";
import DatePickerWithRange from '../course-recommend/DatePicker';
import { fetchSiteSetting } from '@/provider/slice/siteSettingSlice';
import { useDispatch } from 'react-redux';
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
    const [open, setOpen] = useState(false);
    const [courseRecommendId, setCourseRecommendId] = useState(null);
    const [isCourseRecOpen, setIsCourseRecOpen] = useState();
    const [courses, setCourses] = useState([]);
    const [isPending, startTransition] = React.useTransition();
    const user = useSelector((state) => state.user);
    let isEdit = courseRecommendId && courseRecommendId !== 'new';
    const [allUsersData, setAllUsersData] = useState([]);
    console.log("allUsersData--- from recommendshf", allUsersData)
    const [courseRecommendation, setCourseRecommendation] = useState([]);
    const [newCurrentDate, setNewCurrentDate] = useState(new Date());
    const [singleCourseRecData, setSingleCourseRecData] = useState({})
    const [courseRecProgress, setCourseRecProgress] = useState({});
    const [filterBy, setFilterBy] = useState([]);
    // const [courseCategory, setCourseCategory] = useState([]);
    const [clearFilter, setClearFilter] = useState(0);
    const [users, setUsers] = useState([]);
    console.log("users from----part 2 ---", users)
    const [recommendUsers, setRecommendUsers] = useState([]);
    const [IsEdit, setIsEdit] = useState(false);
    const dispatch = useDispatch();
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data, loading, error } = siteSetting || {};
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [metaInside, setMetaInside] = useState({ "page": 1, "pageSize": 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const assignedBy = user && user.id;
    const [roles, setRoles] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [allSelectedUsers, setAllSelectedUsers] = useState({})
    console.log("allSelectedUsers---", allSelectedUsers)
    const [selectedRole, setSelectedRole] = useState([]);
    console.log("selectedRole---", selectedRole)
    const [selectedDepartment, setSelectedDepartment] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); // For employee search
    console.log("searchTerm---", searchTerm)
    const [isRoleFiltered, setIsRoleFiltered] = useState(false);

    const {
        handleSubmit,
        formState: { errors },
        control,
        reset,
    } = useForm({
        mode: 'onChange',
    })

    const fetchAllUsers = async (pageNo = 1, pageSize = 10) => {
        console.log("inside the fetchAllusers");
        try {
            // Fetch all users with reporting_to populated
            const isAdmin = user?.role?.name === "ADMIN";
            const loggedInUserId = user?.id;
            let pageCount;
            let start;
            let response;
            let total;
            console.log('pageSize', pageSize);
            if (isAdmin) {
                const { data } = await axiosInstance.get(`/api/users/count`);
                total = data;
                pageCount = Math.ceil(total / pageSize);
                start = (pageNo - 1) * pageSize;
                response = await axiosInstance.get(`/api/users?populate=*&start=${start}&limit=${pageSize}`);
            } else {
                const { data } = await axiosInstance({
                    url: `/api/users?filters[reporting_to][id]=${loggedInUserId}`,
                    method: 'get'
                });
                total = data.length;
                pageCount = Math.ceil(total / pageSize);
                start = (pageNo - 1) * pageSize;
                response = await axiosInstance.get(`/api/users?filters[reporting_to][id]=${loggedInUserId}&start=${start}&limit=${pageSize}`);
            }

            // Validate response
            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error("❌ API response is invalid:", response);
                toast.error("Failed to fetch users");
                return [];
            }
            const meta = {
                page: pageNo,
                pageSize,
                pageCount,
                total,
                currentPage: pageNo,
            };
            setMetaInside(meta);

            console.log('meta', meta);
            console.log('response', response);
            const users = response.data; // Extract users array

            // Debugging output
            console.log("✅ Raw API Users Response:", users);

            return users; // Ensure we return the users array

        } catch (error) {
            console.error("❌ Error fetching users:", error);
            toast.error("Failed to fetch users");
            return []; // Return empty array on failure
        }
    };

    const fetchFilteredUsers = async ({ role, department, location, search, pageNo = 1, pageSize = 10 }) => {
        console.log("Fetching filtered users - Page:", pageNo, "Size:", pageSize);
        try {
            const query = new URLSearchParams();

            if (role?.length) role.forEach(r => query.append('filters[role][name][$in]', r));
            if (department?.length) department.forEach(dep => query.append('filters[department][title][$eq]', dep));
            if (location?.length) location.forEach(loc => query.append('filters[location][title][$eq]', loc));
           
            if(search.trim().length>0){
                    const searchParts   = search.trim().split(" ")

                    if(searchParts.length === 1){
                         query.append('filters[firstName][$containsi]' , searchParts[0])
                    }
                    else if(searchParts.length === 2){
                        query.append('filters[firstName][$containsi]' , searchParts[0]),
                        query.append('filters[lastName][$containsi]',searchParts[1])

                    }
            }


            let total = 0;
            let pageCount = 1;
            const countResponse = await axiosInstance.get(`/api/users?${query.toString()}`)
            if (countResponse.data) {
                total = countResponse.data.length,
                    pageCount = Math.ceil(total / pageSize)
            }


            const start = (pageNo - 1) * pageSize;

            const dataUrl = `/api/users?populate=*&${query.toString()}&start=${start}&limit=${pageSize}`;
            console.log("Fetching paginated data:", dataUrl);
            const response = await axiosInstance.get(dataUrl);

            if (!response || !response.data || !Array.isArray(response.data)) {
                console.error("❌ Invalid API response:", response);
                toast.error("Failed to fetch filtered users");
                return;
            }

            console.log("✅ Filtered Users Data:", response.data);


            setUsers(response.data);
            setAllUsersData(response.data);


            setMetaInside({
                page: pageNo,
                pageSize,
                pageCount,
                total,
                currentPage: pageNo,
            });

        } catch (error) {
            console.error("❌ Error fetching filtered users:", error);
            toast.error("Failed to fetch filtered users");
        }
    };

    useEffect(() => {
        if (searchTerm.trim().length > 0) {
            fetchFilteredUsers({
                role: selectedRole,
                department: selectedDepartment,
                location: selectedLocation,
                search: searchTerm,
                pageNo: 1,
                pageSize: metaInside.pageSize,
            });
        } else if (isRoleFiltered) {
            fetchFilteredUsers({
                role: selectedRole,
                department: selectedDepartment,
                location: selectedLocation,
                search: "",
                pageNo: metaInside.currentPage,
                pageSize: metaInside.pageSize,
            });
        } else {
            handleFetchAllUsers();
        }
    }, [selectedRole, selectedDepartment, selectedLocation, searchTerm]);

    const filteredData = useMemo(() => {
        if (!Array.isArray(courseRecommendation)) return [];

        return courseRecommendation.filter((item) => {
            const dueDate = new Date(item.due);
            return (
                dueDate.getFullYear() === newCurrentDate.getFullYear() &&
                dueDate.getMonth() === newCurrentDate.getMonth()
            );
        });
    }, [courseRecommendation, newCurrentDate]);


    const columns = [
        {
            accessorKey: "users",
            header: ({ column }) => (
                <SortHeader column={column} title="Employee Name" />
            ),
            cell: ({ row }) => {
                console.log('log from columns', row)
                return (
                    <div className="flex gap-2">
                        {row?.original?.user ? (
                            <span className="max-w-[500px] truncate font-medium">
                                {(`${row?.original?.user?.firstName || ''} ${row?.original?.user?.lastName || ''}`.trim())}
                            </span>
                        ) : (
                            <span className="text-gray-400 text-sm">No User</span>
                        )}
                    </div>)
            },
            filterFn: (row, columnId, value) => {
                const firstName = row.original?.user?.firstName?.toLowerCase() || "";
                const lastName = row.original?.user?.lastName?.toLowerCase() || "";
                return (
                    firstName.includes(value.toLowerCase()) ||
                    lastName.includes(value.toLowerCase())
                );
            },
            enableFiltering: true,
        },
        {
            accessorKey: "courses",
            header: ({ column }) => (
                <SortHeader column={column} title="Recommended Assignments" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="space-y-2">
                        {row?.original ? (
                            row.original.assignments.map((course) => {
                                if (!course) return;
                                const entity = row?.original;
                                const userId = entity && entity?.user?.id;
                                const courseData = courseRecProgress[userId]?.find(
                                    (ele) => ele.courseId === course.documentId
                                );

                                console.log("this is the coursedata duhhh", courseData);

                                const progressValue = parseInt(courseData?.progress) || 0;
                                const status = courseData?.Course_Status || "Not taken";
                                return (<div key={course.id} className="p-2 ">
                                    <div className="font-medium text-sm mb-1">
                                        {course.title || "Untitled Course"}
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 text-xs text-gray-600 mb-2">
                                        <div>
                                            <strong>Assigned:</strong>{" "}
                                            {formatDueDate(entity.publishedAt || "N/A")}
                                        </div>
                                        <div>
                                            <strong>Due Date:</strong>{" "}
                                            {entity.due || "N/A"}
                                        </div>
                                        <div>
                                            <strong>Marks Obtained:</strong>{" "}
                                            {progressValue || 0}
                                        </div>
                                        <div>
                                            <strong>Status:</strong>{" "}
                                            <Badge
                                                color={status && status === "Not taken" ? "destructive" : "warning"}
                                                className={status === "Complete" && "bg-green-700"}
                                            >
                                                {status || "N/A"}</Badge>
                                        </div>
                                    </div>
                                </div>)
                            }
                            ))
                            : (
                                <span className="text-gray-400 text-sm">No courses assigned</span>
                            )}
                    </div>
                );
            },
            filterFn: (row, columnId, value) => {
                return row.original?.courses?.some((course) => {
                    const courseName = course?.title?.toLowerCase() || "";
                    return (
                        courseName.includes(value.toLowerCase())
                    );
                });
            },
            enableFiltering: true,
        },

        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                return <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="">
                            <DropdownMenuItem onClick={() => { setIsEdit(true), setCourseRecommendId(row.original.documentId), setIsCourseRecOpen(true) }}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteHandlerCourseRecommend(row.original.documentId)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            },
        },
    ];

    const table = useReactTable({
        data: filteredData, // courseRecommendation
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

    const formColumn = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    className="flex"
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "employee code",
            header: ({ column }) => (
                <SortHeader column={column} title="Employee Code" />
            ),
            cell: ({ row }) => {
                console.log('row', row.original)
                return (<div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        {(`${row?.original?.employeeCode || ''}`.trim())}
                    </div>
                </div>)
            },
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortHeader column={column} title="Employee Name" />
            ),
            cell: ({ row }) => {
                console.log('row', row.original)
                return (<div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        {(`${row?.original?.firstName || ''} ${row?.original?.lastName || ''}`.trim())}
                    </div>
                </div>)
            },
        },
        {
            accessorKey: "designation",
            header: ({ column }) => (
                <SortHeader column={column} title="Designation" />
            ),
            cell: ({ row }) => {
                console.log('row', row.original)
                return (<div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        {(`${row?.original?.Designation || ''}`.trim())}
                    </div>
                </div>)
            },
        },
        {
            accessorKey: "department",
            header: ({ column }) => (
                <SortHeader column={column} title="Department" />
            ),
            cell: ({ row }) => {
                console.log('row', row.original)
                return (<div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        {(`${row?.original?.department?.title || ''}`.trim())}
                    </div>
                </div>)
            },
        },
        {
            accessorKey: "location",
            header: ({ column }) => (
                <SortHeader column={column} title="Location" />
            ),
            cell: ({ row }) => {
                console.log('row', row.original)
                return (<div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        {(`${row?.original?.location?.title || ''}`.trim())}
                    </div>
                </div>)
            },
        },
    ]

    // const filteredDataUser = useMemo(() => {
    //     // if (isEdit) {
    //     //     return allUsersData.filter(user => singleCourseRecData?.user?.id === user.id)
    //     // }
    //     if (isEdit && singleCourseRecData?.user) {
    //         // Manually override pagination meta
    //         setMetaInside({
    //             pageNo: 1,
    //             pageSize: 10,
    //             pageCount: 1,
    //             total: 1,
    //             currentPage: 1,
    //         });

    //         return [singleCourseRecData.user];
    //     }

    //     return allUsersData.filter((user) => {
    //         const matchesRole = selectedRole.length
    //             ? selectedRole.includes(user.role?.name)
    //             : true;

    //         const matchesDepartment = selectedDepartment.length
    //             ? selectedDepartment.includes(user.department?.title)
    //             : true;

    //         const matchesLocation = selectedLocation.length
    //             ? selectedLocation.includes(user.location?.title)
    //             : true;

    //         const matchesSearch = searchTerm
    //             ? user.firstName.toLowerCase().includes(searchTerm.toLowerCase())
    //             : true;

    //         return matchesRole && matchesDepartment && matchesLocation && matchesSearch;
    //     });
    //     // return allUsersData;
    // }, [isEdit, allUsersData, singleCourseRecData, selectedRole, selectedDepartment, selectedLocation, searchTerm]);

    const filteredDataUser = useMemo(() => {
        if (isEdit && singleCourseRecData?.user) {
            setMetaInside({
                pageNo: 1,
                pageSize: 10,
                pageCount: 1,
                total: 1,
                currentPage: 1,
            });
            return [singleCourseRecData.user]; 
        }
    
    
        const searchParts = searchTerm.trim().toLowerCase().split(" ");
    
        return allUsersData.filter((user) => {
            const firstName = user.firstName?.toLowerCase() || "";
            const lastName = user.lastName?.toLowerCase() || "";
          
            const matchesSearch = searchParts.some(part => {
                return firstName.includes(part) || lastName.includes(part);
            });

            const matchesRole = selectedRole.length
                ? selectedRole.includes(user.role?.name)
                : true;
    
            const matchesDepartment = selectedDepartment.length
                ? selectedDepartment.includes(user.department?.title)
                : true;
    
            const matchesLocation = selectedLocation.length
                ? selectedLocation.includes(user.location?.title)
                : true;
    
            return matchesRole && matchesDepartment && matchesLocation && matchesSearch;
        });
    }, [isEdit, allUsersData, singleCourseRecData, selectedRole, selectedDepartment, selectedLocation, searchTerm]);
    
    const tableForCourseRecForm = useReactTable({
        data: filteredDataUser,
        columns: formColumn,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            allSelectedUsers,
            columnFilters,
        },
        enableRowSelection: true,
        getRowId: (row) => row?.id,
        // onRowSelectionChange: setRowSelection,
        onRowSelectionChange: (updater) => {
            const newRowSelection = typeof updater === 'function'
                ? updater(rowSelection)
                : updater;

            const updatedSelections = { ...allSelectedUsers };

            // Add selected users from current visible rows
            filteredDataUser.forEach(user => {
                const userId = user.id;
                if (newRowSelection[userId]) {
                    updatedSelections[userId] = user;
                } else {
                    delete updatedSelections[userId];
                }
            });

            setAllSelectedUsers(updatedSelections);
            setRowSelection(newRowSelection);
        },

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

    const FormError = ({ error, name }) => {
        return (
            <>
                {error[name]?.message ? (
                    <p className={cn("text-xs text-destructive leading-none px-1.5 py-2 rounded-0.5")}>
                        {error[name]?.message}
                    </p>
                ) : <></>}
            </>
        )
    }

    const hasPreviousMonth = useMemo(() => {
        if (!Array.isArray(courseRecommendation)) return [];
        return courseRecommendation.some((item) => {
            const dueDate = new Date(item.due);
            const previousDate = new Date(newCurrentDate);
            previousDate.setMonth(previousDate.getMonth() - 1);
            return (
                dueDate.getFullYear() === previousDate.getFullYear() &&
                dueDate.getMonth() === previousDate.getMonth()
            );
        });
    }, [courseRecommendation, newCurrentDate]);

    const hasNextMonth = useMemo(() => {
        if (!Array.isArray(courseRecommendation)) return [];
        return courseRecommendation.some((item) => {
            const dueDate = new Date(item.due);
            const nextDate = new Date(newCurrentDate);
            nextDate.setMonth(nextDate.getMonth() + 1);
            return (
                dueDate.getFullYear() === nextDate.getFullYear() &&
                dueDate.getMonth() === nextDate.getMonth()
            );
        });
    }, [courseRecommendation, newCurrentDate]);

    const handlePrevious = () => {
        if (hasPreviousMonth) {
            setNewCurrentDate((prev) => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() - 1);
                return newDate;
            });
        }
    };

    const handleNext = () => {
        if (hasNextMonth) {
            setNewCurrentDate((prev) => {
                const newDate = new Date(prev);
                newDate.setMonth(newDate.getMonth() + 1);
                return newDate;
            });
        }
    };

    const getAllCourseRecommendation = async (pageNo = 1) => {
        try {
            const query = new URLSearchParams();

            filterBy.forEach(ele => {
                let filterKey = '';

                // if (ele.type === 'courses_categories') {
                //     filterKey = `filters[courses][courses_categories][id][$in]`;

                // } else
                if (ele.type === 'users') {
                    filterKey = `filters[user][id][$in]`;

                } else {
                    filterKey = `filters[${ele.type}][$in]`;
                }

                if (filterKey && ele.value) {
                    ele.value.forEach(val => query.append(filterKey, val));
                }
            });
            const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance({
                url: '/api/assigment-recommends?populate[user][populate][assigment_recommend]=true&populate[assignments][populate][course]=true&' + query.toString() + `&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
                method: 'GET'
            });
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
            return data.data;
        } catch (error) {
            console.error('Failed to fetch course recommendations:', error);
        }
    };

    const getAllRoles = async () => {
        try {
            const { data } = await axiosInstance.get('/api/users-permissions/roles');
            console.log("rola", data);
            setRoles(data.roles); // Store roles in state
        } catch (error) {
            console.error("Failed to fetch roles:", error);
        }
    };

    const getAllDepartments = async () => {
        try {
            const { data } = await axiosInstance.get('/api/departments');
            setDepartments(data.data); // Store departments in state
        } catch (error) {
            console.error("Failed to fetch departments:", error);
        }
    };

    const getAllLocations = async () => {
        try {
            const { data } = await axiosInstance.get('/api/locations');
            setLocations(data.data); // Store locations in state
        } catch (error) {
            console.error("Failed to fetch locations:", error);
        }
    };


    const getAllUsers = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/users?populate[assigment_recommend][populate][assignments]=true',
                method: 'get',
            })
            setRecommendUsers(data);
            setUsers(data);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        // getAllCategory();
        getAllRoles();
        getAllDepartments();
        getAllLocations();
        getAllUsers();
    }, [])

    const handleFetchAllCourseRecommend = async (pageNo) => {
        const res = await getAllCourseRecommendation(pageNo);
        setCourseRecommendation(res);
    }

    console.log('course recommedation', courseRecommendation);

    useEffect(() => {
        handleFetchAllCourseRecommend();
    }, [filterBy]);

    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);

    const handleEmployeeFilter = (type, value) => {
        const updatedFilters = {
            role: type === "role" ? value : selectedRole,
            department: type === "department" ? value : selectedDepartment,
            location: type === "location" ? value : selectedLocation,
            search: type === "search" ? value : searchTerm,
        };

        setSelectedRole(updatedFilters.role);
        setSelectedDepartment(updatedFilters.department);
        setSelectedLocation(updatedFilters.location);
        setSearchTerm(updatedFilters.search);

        if (type === "search") {
            fetchFilteredUsers({
                role: updatedFilters.role,
                department: updatedFilters.department,
                location: updatedFilters.location,
                search: value, // Use the latest search value
                pageNo: metaInside.currentPage,
                pageSize: metaInside.pageSize,
            });
        } else {
            const isFiltering = updatedFilters.role.length > 0 || updatedFilters.department.length > 0 || updatedFilters.location.length > 0;
            if (isFiltering) {
                setIsRoleFiltered(true);
                fetchFilteredUsers(updatedFilters);
            } else {
                setIsRoleFiltered(false);
                handleFetchAllUsers();
            }
        }
    };

    const handleFilter = (type, value) => {
        if (!value.length) {
            setFilterBy((old) => old.filter(ele => ele.type !== type));
        } else {
            setFilterBy(old => {
                const updated = old.filter(ele => ele.type !== type);
                return [...updated, { type, value: Array.isArray(value) ? value : [value] }];
            });
        }
    };


    const handleFetchAllUsers = async (pageNo = 1, pageSize = 10) => {
        try {
            console.log('enter in to handleFetchAllUsers')
            const res = await fetchAllUsers(pageNo, metaInside?.pageSize); // Fetch users
            if (!Array.isArray(res)) {
                console.error("❌ Expected an array but got:", res);
                return;
            }

            console.log("✅ Processed API Response:", res);

            // const loggedInUserId = user?.id;

            // console.log("Logged in User ID:", loggedInUserId);
            // console.log("Is Admin:", isAdmin);

            let filteredUsers;
            // if (isAdmin) {
            filteredUsers = res; // Admin gets all users
            // } else {
            //     filteredUsers = res.filter(u => {
            //         if (!u.reporting_to) {
            //             console.log(`⚠️ No Reporting Leader for: ${u.firstName} (ID: ${u.id})`);
            //             return false;
            //         }
            //         return u.reporting_to.id === loggedInUserId;
            //     });
            // }

            console.log("✅ Filtered Users:", filteredUsers);
            setAllUsersData(filteredUsers);
            setUsers(filteredUsers);
        } catch (error) {
            console.error("❌ Error processing users:", error);
        }
    };

    const handleGetAllCourses = async () => {
        const res = await getAllCourses();
        setCourses(res)
    }

    useEffect(() => {
        handleFetchAllUsers();
        handleGetAllCourses();

    }, []);

    const handleCourseRecProgress = async (userId, courseDocId) => {
        try {
            const res = await getCourseRecProgress(userId, courseDocId);
            console.log("this is the res of the course details", res);
            let format;
            if (res) {
                format = {
                    progress: res.total_marks,
                    Course_Status: res.attempt_content_status,
                    courseId: courseDocId,
                    isEnrolled: true
                }
            } else {
                format = {
                    progress: null,
                    courseId: courseDocId,
                    isEnrolled: false
                }

            }

            console.log("this is the format after getting the data", format);

            setCourseRecProgress((prev) => ({
                ...prev,
                [userId]: [...(prev[userId] || []), format],
            }));

            console.log("this is duuhhhhhhh", courseRecProgress);

        } catch (error) {
            console.error('Error fetching course recommendation progress:', error);
        }
    };

    const memoisedCourseRec = useMemo(() => {
        return Array.isArray(courseRecommendation) && courseRecommendation.length > 0;
    }, [courseRecommendation])

    useEffect(() => {
        if (memoisedCourseRec) {
            courseRecommendation.forEach((ele) => {
                const user = ele.user?.id;
                ele.assignments.forEach((ele) => {
                    return handleCourseRecProgress(user, ele.documentId);
                })
            })
        }
    }, [memoisedCourseRec])

    function formatDueDate(date) {
        if (date instanceof Date) {
            return date.toLocaleDateString('en-CA');
        }
        if (typeof date === 'string' && !isNaN(Date.parse(date))) {
            return new Date(date).toLocaleDateString('en-CA');
        }
        return date;
    }

    const onSubmit = (data) => {
        const selectedUsers = Object.values(allSelectedUsers);

        //    const selectedUsers = tableForCourseRecForm.getSelectedRowModel().rows.map(row => row.original);

        // const selectedUsers = tableForCourseRecForm.getFilteredSelectedRowModel().rows.map(row => row.original);

        if (!selectedUsers.length) {
            toast.error('At least one user must be selected');
            return;
        }

        const formattedDueDate = formatDueDate(data.due);
        const assignedDate = new Date();
        const dueDate = new Date(data.due);

        if (dueDate < assignedDate) {
            toast.error('Due date cannot be earlier than the assigned date.');
            return;
        }

        console.log("ye hai course recommendation ka data", courseRecommendation);

        const newUser = Array.isArray(courseRecommendation)
            ? selectedUsers.filter(user => !courseRecommendation.some(e => e?.user?.id === user.id))
            : [];

        // const oldUser = Array.isArray(courseRecommendation)
        //     ? selectedUsers.filter(user => courseRecommendation.some(e => e?.user?.id === user.id))
        //     : [];

        const oldUser = selectedUsers.map((user) => {
            const match = courseRecommendation.find(e => e?.user?.id === user.id);
            if (match) {
                return {
                    ...user,
                    assigment_recommend: {
                        id: match.id,
                        documentId: match.documentId,
                        due: match.due,
                        assignments: match.assignments,
                        publishedAt: match.publishedAt,
                    }
                };
            }
            return null;
        }).filter(Boolean);

        console.log("ye hai old user", oldUser);

        startTransition(async () => {
            try {
                await Promise.all(
                    newUser.map(async (user) => {
                        const { data: postData } = await axiosInstance({
                            url: `/api/assigment-recommends`,
                            method: 'POST',
                            data: {
                                data: {
                                    due: formattedDueDate,
                                    assignments: data.courses.map(course => ({ id: course.value })),
                                    user: [{ id: user.id }],
                                    recommendedBy: { id: assignedBy },
                                }
                            }
                        });
                        if (postData) toast.success(`New Course Recommendation created successfully`);
                        await handleFetchAllCourseRecommend();
                    })
                );

                await Promise.all(
                    oldUser.map(async (user) => {
                        console.log("useeeeeeeeeeerrrrrrrrrrrr", user);
                        const documentId = user?.assigment_recommend?.documentId;
                        console.log("duhhhhhhhhhhhhhhhhhhhh", documentId);
                        if (documentId) {
                            const { data: res } = await axiosInstance({
                                url: `/api/assigment-recommends/${documentId}?populate=*`,
                                method: 'get'
                            });

                            const ids = res?.data?.assignments?.map((ele) => {
                                return {
                                    id: ele.id
                                }
                            })

                            console.log("ids", ids);

                            const newIds = data.courses?.map(course => ({ id: course.value }));
                            console.log("new ids", newIds);

                            let assignments
                            if (!IsEdit) {
                                assignments = [...ids, ...newIds];

                            } else {
                                assignments = [...newIds];
                            }

                            console.log("assignments ka console lga dia", assignments);

                            const { data: putData } = await axiosInstance({
                                url: `/api/assigment-recommends/${documentId}`,
                                method: 'PUT',
                                data: {
                                    data: {
                                        due: formattedDueDate,
                                        assignments,
                                        user: [{ id: user.id }],
                                        recommendedBy: { id: assignedBy },
                                    }
                                }
                            });
                            if (putData) toast.success(`Course Recommendation updated successfully`);
                            await handleFetchAllCourseRecommend();
                        }
                    })
                );

                await handleFetchAllCourseRecommend();
                handleCancel();

            } catch (error) {
                console.error(error);
                toast.error("Failed to process course recommendations");
            }
        });
    };

    const deleteHandlerCourseRecommend = (courseRecDocId) => {
        setCourseRecommendId(courseRecDocId)
        setOpen(true);
    }

    const confirmDelete = async () => {
        if (courseRecommendId) {
            try {
                await deleteCourseRecommendation(courseRecommendId);
                setOpen(false);
                setCourseRecommendId(null);
                reset({
                    courses: [],
                    due: '',
                    user: []
                });

                handleFetchAllCourseRecommend();
            } catch (error) {
                console.error("Failed to delete course recommendation:", error);
                toast.error("Failed to delete course recommendation");
            }
        }
    };

    useEffect(() => {
        const populateFormForEdit = async () => {
            if (isEdit && courseRecommendId) {
                console.log("cridfnd nfertyrki---", courseRecommendId)
                try {
                    const courseRecommend = await getSingleCourseRecommendation(courseRecommendId);
                    setSingleCourseRecData(courseRecommend);
                    console.log("this is the single course data", courseRecommend);

                    if (courseRecommend) {
                        const selectedCourses = courseRecommend?.assignments && Array.isArray(courseRecommend.assignments)
                            ? courseRecommend.assignments.map(course => ({
                                label: course.title || '',
                                value: course.id || null
                            }))
                            : [];

                        const selectedUsers = courseRecommend?.user ? {
                            label: `${courseRecommend?.user.firstName} ${courseRecommend?.user?.lastName || ''}`,
                            value: courseRecommend?.user.id
                        }
                            : {};

                        console.log("selected user", selectedUsers);

                        const toISOStringWithTimeZone = (dateString) => {
                            const date = new Date(`${dateString}T00:00:00.000Z`);
                            return date.toISOString();
                        };
                        const originalDueDate = toISOStringWithTimeZone(courseRecommend.due);
                        const assignedDate = courseRecommend.publishedAt;
                        const dueDate = new Date(courseRecommend.due);

                        if (dueDate < assignedDate) {
                            toast.error('Due date cannot be earlier than the assigned date.');
                            return;
                        }

                        if (isCourseRecOpen) {
                            reset({
                                courses: selectedCourses,
                                due: originalDueDate,
                                user: selectedUsers
                            });
                        }
                    }
                } catch (error) {
                    console.error("Error populating form for edit in course recommendation:", error);
                }
            }
            else {
                reset({
                    courses: [],
                    due: '',
                    user: []
                });
            }
        };

        populateFormForEdit();

    }, [isEdit, courseRecommendId, reset, isCourseRecOpen]);

    const handleCancel = () => {
        reset();
        setAllSelectedUsers({});
        setRowSelection({});
        setIsCourseRecOpen(false);
        setCourseRecommendId(null);
    };

    return (
        <>

            <div className="space-y-4">
                <div className="flex items-center flex-wrap justify-between gap-4">
                    <div className="text-2xl font-medium text-default-800">
                        Manage Assignment Recommendation
                    </div>
                    <Button onClick={() => { setIsCourseRecOpen(true), setIsEdit(false), setCourseRecommendId(null) }} className="whitespace-nowrap">
                        <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                        Add Recommendation
                    </Button>
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex lg:flex-row flex-col flex-wrap justify-between gap-4 lg:mr-2">
                            <div className="flex flex-wrap gap-2">

                                <Filter
                                    title="User"
                                    options={users.map(ele => ({
                                        label: `${ele.firstName} ${ele.lastName || ''}`.trim(),
                                        value: ele.id,
                                    }))}
                                    clearFilter={clearFilter}
                                    onChange={(value) => handleFilter('users', value)}
                                />

                                {filterBy.length > 0 && (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setClearFilter((old) => old + 1);
                                            table.setColumnFilters([]);
                                        }}
                                        className="h-8 px-2 lg:px-3"
                                    >
                                        Reset
                                        <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                                    </Button>
                                )}
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    type="button"
                                    size="sm"
                                    variant=""
                                    color="default"
                                    className="cursor-pointer"
                                    disabled={!hasPreviousMonth}
                                    onClick={handlePrevious}
                                >
                                    Previous
                                </Button>

                                <span className="text-lg font-semibold">
                                    {newCurrentDate && newCurrentDate.toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                    })}
                                </span>

                                <Button
                                    size="sm"
                                    variant=""
                                    color="default"
                                    className="cursor-pointer"
                                    disabled={!hasNextMonth}
                                    onClick={handleNext}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {(courseRecommendation && !courseRecommendation.length) ? (
                    <Blank className="flex flex-col items-center justify-center h-full space-y-3">
                        <div className="text-default-900 text-xl font-semibold">
                            No Records Available
                        </div>
                        <div className="text-sm text-default-600">
                            Add Assignment Recommendation to see records.
                        </div>
                    </Blank>
                ) : (
                    <ProjectList data={filteredData} table={table} columns={columns} meta={meta} func={handleFetchAllCourseRecommend} />
                )}

                {isCourseRecOpen && <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
                    <Dialog defaultOpen={true} onOpenChange={(value) => { setIsCourseRecOpen(value) }}>
                        <DialogContent size="4xl">

                            <div className="text-sm text-default-500 justify-center space-y-4  overflow-auto h-[600px] w-[100%]">
                                <div className="space-y-6 w-full">
                                    <div className="flex items-center flex-wrap justify-between gap-4">
                                        <div className="text-2xl font-medium text-default-800 ">
                                            {isEdit ? "Update Assignment Recommendation" : "Create Assignment Recommendation"}
                                        </div>
                                    </div>

                                    <div className="col-span-12 xl:col-span-9 mr-5 p-1">

                                        <form onSubmit={handleSubmit(onSubmit)}>
                                            <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                                                <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                                                    <h3 className="text-xl font-medium capitalize text-default-700">
                                                        Basic Assignment Recommendation Info
                                                    </h3>
                                                </div>

                                                <div className="grid grid-cols-12 gap-7 p-6">
                                                    <div className="col-span-12 lg:col-span-12">
                                                        <div className="space-y-2">
                                                            <Label className="text-base text-default-700">Select Assignments</Label>
                                                            <Controller
                                                                name="courses"
                                                                control={control}
                                                                rules={{ required: 'Please select at least one course' }}
                                                                render={({ field }) =>
                                                                    <Select
                                                                        defaultValue={field.value}
                                                                        value={field.value}
                                                                        onChange={(value) => field.onChange(value)}
                                                                        isClearable={false}
                                                                        isMulti
                                                                        styles={styles}
                                                                        name='courses'
                                                                        options={courses
                                                                            .filter(loc => !field.value?.some(selected => selected.value === loc.id))
                                                                            .map(ele => ({ label: ele.title, value: ele.id }))}
                                                                        className="react-select"
                                                                        classNamePrefix="select"
                                                                    />
                                                                }
                                                            />
                                                            <FormError error={errors} name="courses" />
                                                        </div>
                                                    </div>

                                                    <div className="col-span-12 lg:col-span-12">
                                                        <div className="space-y-2">
                                                            <Label className="text-base text-default-700 mb-2">Select Employees</Label>
                                                            <CardContent className="pt-6">

                                                                <div className='flex flex-wrap gap-2'>
                                                                    <Filter
                                                                        title="Role"
                                                                        options={roles.map(role => ({ label: role.name, value: role.name }))}
                                                                        clearFilter={clearFilter}
                                                                        onChange={(value) => handleEmployeeFilter("role", value)}
                                                                    />
                                                                    <Filter
                                                                        title="Department"
                                                                        options={departments.map(department => ({ label: department.title, value: department.title }))}
                                                                        clearFilter={clearFilter}
                                                                        onChange={(value) => handleEmployeeFilter("department", value)}
                                                                    />


                                                                    <Filter
                                                                        title="Location"
                                                                        options={locations.map(location => ({ label: location.title, value: location.title }))}
                                                                        clearFilter={clearFilter}
                                                                        onChange={(value) => handleEmployeeFilter("location", value)}
                                                                    />

                                                                    <Input
                                                                        placeholder="Search Employee..."
                                                                        value={searchTerm}
                                                                        onChange={(e) => handleEmployeeFilter("search", e.target.value)}
                                                                    />
                                                                    {selectedRole.length > 0 || selectedDepartment.length > 0 || selectedLocation.length > 0 || searchTerm ? (
                                                                        <Button
                                                                            variant="outline"
                                                                            onClick={() => {
                                                                                setSelectedRole([]);
                                                                                setSelectedDepartment([]);
                                                                                setSelectedLocation([]);
                                                                                setSearchTerm("");
                                                                                setClearFilter((old) => old + 1);
                                                                                table.setColumnFilters([]);
                                                                            }}
                                                                            className="h-8 px-2 lg:px-3"
                                                                        >
                                                                            Reset
                                                                            <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                                                                        </Button>
                                                                    ) : null}

                                                                </div>
                                                            </CardContent>
                                                            <ProjectList
                                                                data={filteredDataUser}  // Pass the correct user data
                                                                table={tableForCourseRecForm}
                                                                columns={formColumn}
                                                                meta={metaInside}
                                                                // func={handleFetchAllUsers}  // Function to fetch paginated users
                                                                func={(pageNo) => {
                                                                    if (isEdit) {
                                                                        return
                                                                    }
                                                                    if (isRoleFiltered || searchTerm.trim().length > 0) {
                                                                        fetchFilteredUsers({
                                                                            role: selectedRole,
                                                                            department: selectedDepartment,
                                                                            location: selectedLocation,
                                                                            search: searchTerm,
                                                                            pageNo,
                                                                            pageSize: metaInside.pageSize,
                                                                        });
                                                                    } else {
                                                                        handleFetchAllUsers(pageNo, metaInside.pageSize)
                                                                    }
                                                                }}
                                                            />

                                                            {/* <ProjectList table={tableForCourseRecForm} columns={formColumn} /> */}
                                                        </div>
                                                    </div>

                                                    <div className="col-span-12 lg:col-span-12">
                                                        <div className="space-y-2">
                                                            <Label className="text-base text-default-700">Select Due Date</Label>
                                                            <Controller
                                                                name="due"
                                                                control={control}
                                                                rules={{ required: 'Please select due date' }}
                                                                render={({ field }) => (
                                                                    <DatePickerWithRange
                                                                        value={field.value}
                                                                        onDateChange={(value) => field.onChange(value)}
                                                                    />
                                                                )}
                                                            />

                                                            <FormError error={errors} name="due" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 relative">
                                                <Button
                                                    type={'button'}
                                                    size="xl"
                                                    variant="outline"
                                                    color="destructive"
                                                    className="cursor-pointerl"
                                                    onClick={handleCancel}
                                                >
                                                    Cancel
                                                </Button>

                                                <Button
                                                    size="xl"
                                                    variant=""
                                                    color="default"
                                                    className="cursor-pointer"
                                                >
                                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                    Submit
                                                </Button>

                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </DialogContent >
                    </Dialog >
                </div >}

                <DeleteConfirmationDialog
                    deleteDescription="Are you sure to delete it?"
                    headingMessage=" "
                    open={open}
                    onClose={() => setOpen(false)}
                    onConfirm={confirmDelete}
                />
            </div >


        </>
    )
}

export default CourseRecommend;
