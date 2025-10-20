"use client";
import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Blank from '@/components/blank';
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import Select from "react-select";
import { Loader2 } from "lucide-react";
import { getFilePath } from '../../../config/file.path';
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
// import AnnouncementGrid from "./AnnouncementGrid";
import ProjectList from '../course/ProjectList';
import { SortHeader } from '../assignment/SortHeader';
import { useForm, Controller } from "react-hook-form"
import { useSelector } from 'react-redux';
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea';
import FileInput from "../course/[courseDocumentId]/[steps]/FileSelectInput";
import { Filter } from '../announcement/FacetedFilter'
import toast from 'react-hot-toast';
import { formatDateToIST } from './../../../lib/utils';
import DefaultPagination from '../../dafault-pagi';
import { useDispatch } from 'react-redux';
import { fetchSiteSetting } from '@/provider/slice/siteSettingSlice';

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

function Announcement() {
    const [announcements, setAnnouncement] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [sorting, setSorting] = React.useState([]);
    const [open, setOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [announcementId, setAnnouncementId] = useState(null);
    const [isAnnouncementOpen, setIsAnnouncementOpen] = useState();
    const [departments, setDepartments] = useState([]);
    const [locations, setLocations] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isPending, startTransition] = React.useTransition();
    const user = useSelector((state) => state.user);
    const [imageFiles, setImageFiles] = useState([]);
    const isEdit = announcementId && announcementId !== 'new';
    const [isFormModified, setIsFormModified] = useState(false);
    const [isImageChanged, setIsImageChanged] = useState(false);
    const [courseCategory, setCourseCategory] = useState([])
    const [filterBy, setFilterBy] = useState([])
    const [clearFilter, setClearFilter] = useState(0)
    const [filterStatus, setFilterStatus] = useState(false);
    const dispatch = useDispatch();
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data, loading, error } = siteSetting || {};
    // const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [meta, setMeta] = useState({ page: 1, pageSize: data?.pageSize || 10, pageCount: 0, total: 0, currentPage: 1 });
    const [metaInside, setMetaInside] = useState({ "page": 1, "pageSize": 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [filterValue, setFilterValue] = useState("");
    let pageCount;
    let start;
    let total;

    const [skillList, setSkillList] = useState([]);


    const {
        register,
        handleSubmit,
        formState: { errors },
        control,
        setValue,
        reset
    } = useForm({
        mode: 'onChange',
    })

    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);

    const columns = [
        {
            accessorKey: "id",
            header: ({ column }) => (
                <SortHeader column={column} title="ID" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("id")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <SortHeader column={column} title="Employee Name" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[300px] truncate font-medium">
                            {row.getValue("name")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "department",
            header: ({ column }) => (
                <SortHeader column={column} title="Department" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.getValue("department") || null}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "location",
            header: ({ column }) => (
                <SortHeader column={column} title="Location" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[100px] truncate font-medium">
                            {row.getValue("location") || null}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "skill",
            header: ({ column }) => (
                <SortHeader column={column} title="Skills (Rating out of 5)" />
            ),
            cell: ({ row }) => {
                const skills = row.original?.skill || [];
                if (!skills.length) return "-";

                return (
                    <ul className="list-disc list-inside space-y-1">
                        {skills.map((skill, idx) => (
                            <li key={idx} className="text-sm text-muted-foreground">
                                {skill}
                            </li>
                        )) || null}
                    </ul>
                );
            },
        },
        {
            accessorKey: "coursesEnrolled",
            header: ({ column }) => (
                <SortHeader column={column} title="Courses Enrolled" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("coursesEnrolled") || 0}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "coursesCompleted",
            header: ({ column }) => (
                <SortHeader column={column} title="Courses Completed" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("coursesCompleted") || 0}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "timeSpend",
            header: ({ column }) => (
                <SortHeader column={column} title="Time Spend (in hrs)" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("timeSpend") || 0}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "pointsEarned",
            header: ({ column }) => (
                <SortHeader column={column} title="Points Earned" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("pointsEarned") || 0}
                        </span>
                    </div>
                );
            },
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
                            <DropdownMenuItem onClick={() => { setAnnouncementId(row.original.documentId), setIsAnnouncementOpen(true) }}>Assign Assignment</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteHandlerAnnouncement(row.original.documentId)}>Assign Role</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            },
        },
    ];

    const table = useReactTable({
        data: announcements,
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

    const isEmptyOrSpaces = (str) => {
        return !str.trim().length;
    }

    const FromError = ({ error, name }) => {
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

    const handleFilter = (type, value) => {
        if (!value.length) {
            setFilterBy((old) => old.filter(ele => ele.type !== type))
        } else {
            setFilterBy(old => old.length ? old.map(ele => ele.type === type ? { type, value } : ele) : [{ type, value }])
        }
    }

    const getAllLocations = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/locations?status=published',
                method: 'GET'
            })

            return data.data
        } catch (error) {
            console.log(error)
        }
    }

    const getAllDepartments = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/departments?status=published',
                method: 'GET'
            })
            return data.data
        } catch (error) {
            console.log(error)
        }
    }

    const getAllCourses = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/courses?status=published',
                method: 'GET'
            })
            return data.data
        } catch (error) {
            console.log(error)
        }
    }

    const getAllSkills = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/skills?status=published',
                method: 'GET'
            });
            return data.data || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    };

    // const getAllCategory = async () => {
    //     try {
    //         const { data } = await axiosInstance({
    //             url: '/api/courses-categories',
    //             method: 'get',
    //         })
    //         setCourseCategory(data.data)
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    // useEffect(() => {
    //     getAllCategory()
    // }, [])

    const debounce = (func, delay) => {
        let debounceTimer
        return function () {
            const context = this
            const args = arguments
            clearTimeout(debounceTimer)
            debounceTimer
                = setTimeout(() => func.apply(context, args), delay)
        }
    }

    useEffect(() => {
        debounce(fetchAllAnnouncement, 400)()
    }, [filterValue])

    const fetchAllAnnouncement = async (pageNo = 1, pageSize = 10) => {
        try {
            setIsLoading(true);
            const query = new URLSearchParams();
            const { data: userCount } = await axiosInstance.get(`/api/users/count`);
            const total = userCount || 0;
            const pageCount = Math.ceil(total / pageSize);
            const start = (pageNo - 1) * pageSize;

            if (filterValue.trim()) {
                query.append('filters[firstName][$containsi]', filterValue.trim());
                // setfilterStatus(true);
            } else {
                filterBy.forEach(ele => {
                    let filterKey;

                    switch (ele.type) {
                        case 'departments':
                            filterKey = `filters[department][id][$in]`;
                            break;
                        case 'locations':
                            filterKey = `filters[location][id][$in]`;
                            break;
                        case 'skill':
                            filterKey = `filters[skill_level_of_user][skill][id][$in]`;
                            break;
                        case 'skill_level':
                            filterKey = `filters[skill_level_of_user][level_of_skill][$in]`;
                            break;
                        default:
                            console.warn(`Unknown filter type: ${ele.type}`);
                            return;
                    }

                    ele.value.forEach(val => query.append(filterKey, val));
                });
            }
            // const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance({
                url: "/api/users?" +
                    "populate[0]=skill_level_of_user.skill&" +
                    "populate[1]=user_activity_summary&" +
                    "populate[2]=department&" +
                    "populate[3]=location&" +
                    query.toString() + "&sort=updatedAt:desc" + `&start=${start}&limit=${pageSize}`,
                method: "GET",
            });

            console.log("this is the users data", data);


            const tempAnnouncements = data?.map(ele => ({
                id: ele.id,
                documentId: ele.documentId,
                name: ele.firstName,
                createdAt: formatDateToIST(ele.createdAt),
                publishedAt: formatDateToIST(ele.publishedAt),
                department: ele?.department?.title,
                location: ele?.location?.title,
                skill: ele?.skill_level_of_user?.map(entry => {
                    const skillName = entry?.skill?.name || "Unknown";
                    const level = entry?.level_of_skill || "-";
                    return `${skillName} (${level})`;
                }) || [],
                coursesEnrolled: ele?.user_activity_summary?.number_of_courses_enrolled,
                coursesCompleted: ele?.user_activity_summary?.number_of_courses_completed,
                timeSpend: ele?.user_activity_summary?.total_time_spend,
                pointsEarned: ele?.user_activity_summary?.points_earned
                // ele?.departments?.map((item) => item.title),
            }));

            setAnnouncement(tempAnnouncements);
            setMeta({
                page: pageNo,
                pageSize,
                pageCount,
                total,
                currentPage: pageNo,
            });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    console.log("---------announcement in the edit mode----", announcements)

    useEffect(() => {
        fetchAllAnnouncement();
        setFilterStatus(filterBy.length > 0)
    }, [filterBy])

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredAnnouncements = useMemo(() => {
        if (!searchQuery) return announcements;

        const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
        return announcements.filter((announcement) =>
            queryRegex.test(announcement.title)
        );
    }, [announcements, searchQuery]);

    const getInitialData = async () => {
        try {
            const location = await getAllLocations();
            const departments = await getAllDepartments();
            const courses = await getAllCourses();
            const skills = await getAllSkills();

            setLocations(location || []);
            setDepartments(departments || []);
            setCourses(courses || []);
            setSkillList(skills || []);

            if (announcements) {
                const selectedDepartments = announcements?.departments?.length
                    ? announcements?.departments.map(ele => ({ label: ele.title, value: ele.id }))
                    : [];
                const selectedLocations = announcements?.locations?.length
                    ? announcements?.locations.map(ele => ({ label: ele.title, value: ele.id }))
                    : [];
                const selectedCourses = announcements?.courses?.length
                    ? announcements?.courses.map(ele => ({ label: ele.title, value: ele.id }))
                    : [];
                const selectedSkills = announcements?.skills?.length
                    ? announcements?.skills.map(ele => ({ label: ele.title, value: ele.id }))
                    : [];

                reset({
                    department: selectedDepartments,
                    location: selectedLocations,
                    course: selectedCourses,
                    skill: selectedSkills,
                });
            }
        } catch (error) {
            console.log(error);
        }
    };


    useEffect(() => {
        getInitialData()
    }, [])

    return (
        <>
            {
                (!announcements?.length && !filteredAnnouncements?.length && !filterBy?.length) ?
                    (<>
                        <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
                            <div className=" text-default-900 text-xl font-semibold">
                                No User Information Here
                            </div>
                        </Blank>
                    </>)

                    :

                    <div className="space-y-4">
                        <div className="flex items-center flex-wrap justify-between gap-4">
                            <div className="text-2xl font-medium text-default-800">
                                Employee Performance Analysis
                            </div>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex lg:flex-row flex-col flex-wrap justify-between gap-6">

                                    <div className="flex lg:flex-row flex-col flex-wrap gap-2 lg:mr-2">
                                        <div className="flex flex-1 flex-wrap items-center gap-2">
                                            <Input
                                                placeholder="Filter users..."
                                                value={filterValue}
                                                onChange={(event) => setFilterValue(event.target.value)}
                                                className="h-8 min-w-[200px] max-w-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-none flex gap-3">
                                        <Filter
                                            title="Department"
                                            options={departments.map(ele => ({
                                                label: ele.title,
                                                value: ele.id,
                                            }))}
                                            clearFilter={clearFilter}
                                            onChange={(value) => handleFilter('departments', value)}
                                        />
                                        <Filter
                                            title="Location"
                                            options={locations.map(ele => ({
                                                label: ele.title,
                                                value: ele.id,
                                            }))}
                                            clearFilter={clearFilter}
                                            onChange={(value) => handleFilter('locations', value)}
                                        />
                                        <Filter
                                            title="Skill"
                                            options={skillList.map(ele => ({
                                                label: ele.name,
                                                value: ele.id,
                                            }))}
                                            clearFilter={clearFilter}
                                            onChange={(value) => handleFilter('skill', value)}
                                        />
                                        {/* <Filter
                                            title="Skill Level"
                                            options={[1, 2, 3, 4, 5].map(lvl => ({
                                                label: `Level ${lvl}`,
                                                value: `${lvl}`
                                            }))}
                                            clearFilter={clearFilter}
                                            onChange={(value) => handleFilter('skill_level', value)}
                                        /> */}


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
                                </div>
                            </CardContent>
                        </Card>

                        {!announcements.length || filteredAnnouncements.length === 0 && (searchQuery) ? (
                            <Blank className="flex flex-col items-center justify-center h-full space-y-3">
                                <div className="text-default-900 text-xl font-semibold">
                                    No Records Available
                                </div>
                                <div className="text-sm text-default-600">
                                    Add announcement to see records.
                                </div>
                            </Blank>
                        ) : (
                            <ProjectList table={table} columns={columns} meta={meta} func={fetchAllAnnouncement} />
                        )}
                    </div>
            }
        </>
    )
}

export default Announcement;    