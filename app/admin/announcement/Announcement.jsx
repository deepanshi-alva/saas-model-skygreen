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
import AnnouncementGrid from "./AnnouncementGrid";
import ProjectList from '../course/ProjectList';
import { SortHeader } from '../assignment/SortHeader';
import { useForm, Controller } from "react-hook-form"
import { useSelector } from 'react-redux';
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea';
import FileInput from "../course/[courseDocumentId]/[steps]/FileSelectInput";
import { Filter } from './FacetedFilter'
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
    const [pageView, setPageView] = React.useState("grid");
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
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [filterValue, setFilterValue] = useState("");

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
    const uploadFile = async (files) => {
        let formData = new FormData();
        formData.append("files", files);
        const { data } = await axiosInstance({
            url: '/api/upload/',
            method: 'post',
            data: formData
        })
        const fileId = data[0].id
        return fileId
    }

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
            accessorKey: "title",
            header: ({ column }) => (
                <SortHeader column={column} title="Title" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("title")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "description",
            header: ({ column }) => (
                <SortHeader column={column} title="Description" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row?.original && (
                            <span className="max-w-[500px] truncate font-medium">
                                {row?.original?.description || "-"}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "author",
            header: ({ column }) => (
                <SortHeader column={column} title="Author" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex items-center">
                        <span className="max-w-[500px] truncate font-medium">
                            {row?.original?.author?.name || "-"}
                        </span>
                    </div>
                );
            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "department",
            header: ({ column }) => (
                <SortHeader column={column} title="Departments" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row.original?.department && (
                            <>
                                {row.original.department.slice(0, 2).join(", ")}
                                {row.original.department.length > 2 && (
                                    <sup className="text-xs font-bold">
                                        +{row.original.department.length - 2}
                                    </sup>
                                )}
                            </>
                        )}
                    </div>

                );
            },
        },
        {
            accessorKey: "course",
            header: ({ column }) => (
                <SortHeader column={column} title="Courses" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row.original?.course && (
                            <>
                                {row.original.course.slice(0, 2).join(", ")}
                                {row.original.course.length > 2 && (
                                    <sup className="text-xs font-bold">
                                        +{row.original.course.length - 2}
                                    </sup>
                                )}
                            </>
                        )}
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
                        {row.original?.location && (
                            <>
                                {row.original.location.slice(0, 2).join(", ")}
                                {row.original.location.length > 2 && (
                                    <sup className="text-xs font-bold">
                                        +{row.original.location.length - 2}
                                    </sup>
                                )}
                            </>
                        )}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <SortHeader column={column} title="Created" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row?.original?.createdAt.date} {row?.original?.createdAt.time}
                    </div>
                );
            },
        },
        {
            accessorKey: "publishedAt",
            header: ({ column }) => (
                <SortHeader column={column} title="Published" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        {row?.original?.publishedAt.date} {row?.original?.publishedAt.time}
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
                            <DropdownMenuItem onClick={() => { setAnnouncementId(row.original.documentId), setIsAnnouncementOpen(true) }}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteHandlerAnnouncement(row.original.documentId)}>Delete</DropdownMenuItem>
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

    const getAllCategory = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/courses-categories',
                method: 'get',
            })
            setCourseCategory(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAllCategory()
    }, [])

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

    const fetchAllAnnouncement = async (pageNo = 1) => {
        try {
            setIsLoading(true);
            const query = new URLSearchParams();
            if (filterValue) {
                query.append('filters[title][$containsi]', filterValue);
                // setfilterStatus(true);
            } else {
                filterBy.forEach(ele => {
                    let filterKey;

                    switch (ele.type) {
                        case 'courses_categories':
                            filterKey = `filters[courses][${ele.type}][id][$in]`;
                            break;
                        case 'departments':
                            filterKey = `filters[departments][${ele.type}][id][$in]`
                        case 'locations':
                            filterKey = `filters[${ele.type}][$in]`;
                            break;
                        default:
                            console.warn(`Unknown filter type: ${ele.type}`);
                            return;
                    }

                    ele.value.forEach(val => query.append(filterKey, val));
                });
            }
            const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance({
                url: "/api/announcements?" +
                    "populate[0]=author.profileImage&" +
                    "populate[1]=courses&" +
                    "populate[2]=departments&" +
                    "populate[3]=card_image&" +
                    "populate[4]=locations&" +
                    query.toString() + `&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`,
                method: "GET",
            });


            const tempAnnouncements = data?.data.map(ele => ({
                id: ele.id,
                documentId: ele.documentId,
                title: ele.title,
                description: ele?.description[0]?.children?.map((item) => item.text || ""),
                cardImage: ele?.card_image?.url ? getFilePath(ele?.card_image?.url) : '',
                createdAt: formatDateToIST(ele.createdAt),
                publishedAt: formatDateToIST(ele.publishedAt),
                author: { profileImage: ele.author?.profileImage?.url ? getFilePath(ele.author?.profileImage?.url) : '', name: ele.author?.firstName },
                department: ele?.departments?.map((item) => item.title),
                course: ele?.courses?.map((item) => item.title),
                location: ele?.locations?.map((item) => item.title)
            }));

            setAnnouncement(tempAnnouncements);
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };


    console.log("---------announcement in the edit mode----", announcements)


    const onSubmit = (form) => {
        startTransition(async () => {
            try {
                const announcementData = {
                    data: {
                        title: form.title || '',
                        description: [
                            {
                                type: "paragraph",
                                children: [
                                    {
                                        text: form?.description || '',
                                        type: "text"
                                    }
                                ]
                            }
                        ],
                        author: { id: user.id },
                        courses: form?.course?.map((ele) => ({ id: Number(ele.value) })) || [],
                        departments: form?.department?.map((ele) => ({ id: Number(ele.value) })) || [],
                        locations: form?.location?.map((ele) => ({ id: Number(ele.value) })) || [],
                    }
                };

                if (imageFiles?.length) {
                    if (imageFiles[0]?.name) {
                        const fileId = await uploadFile(imageFiles[0])
                        announcementData.data['card_image'] = { id: fileId }
                    }
                } else {
                    announcementData.data['card_image'] = null
                }

                const { data } = await axiosInstance({
                    url: `/api/announcements/${isEdit ? announcementId : ''}`,
                    method: `${isEdit ? 'PUT' : 'POST'}`,
                    data: announcementData
                });

                setIsFormModified(false);
                setIsImageChanged(false);
                toast.success("Announcement created successfully");
                window.location.reload();
                setIsAnnouncementOpen(false);

                return data.data;
            } catch (error) {
                if (error) toast.error(error.message || isEdit ? "Failed to update announcement" : "Failed to created Announcement");
                console.log("form submission error occured", error)
            }
        });
    };

    const fetchSingleAnnouncement = async (announcementDocumentId) => {
        try {
            const response = await axiosInstance({
                url: `/api/announcements/${announcementDocumentId}?populate=*`,
                method: "GET"
            })
            return response.data?.data;
        } catch (error) {
            console.log("error occured while fetching single announcement", error);
        }
    }

    const deleteHandlerAnnouncement = (announcementDocId) => {
        setAnnouncementId(announcementDocId)
        setOpen(true);
    }

    const confirmDelete = () => {
        if (announcementId) {
            deleteAnnouncement(announcementId)
            setOpen(false);
        }
    }

    const deleteAnnouncement = async (announcementDocId) => {
        if (!announcementDocId) return;
        try {
            await axiosInstance({
                url: `/api/announcements/${announcementDocId}`,
                method: "DELETE"
            })
            await fetchAllAnnouncement();
        } catch (error) {
            console.log(error);
        }
    }

    const handleFieldChange = () => {
        setIsFormModified(true);
    };

    const handleImageChange = (file) => {
        setImageFiles(file);
        setIsImageChanged(true)
    };

    useEffect(() => {
        fetchAllAnnouncement();
        setFilterStatus(filterBy.length > 0)
    }, [filterBy])

    useEffect(() => {
        const populateFormForEdit = async () => {
            if (isEdit && announcementId) {
                try {
                    const announcement = await fetchSingleAnnouncement(announcementId);

                    if (announcement) {
                        const selectedDepartments = announcement?.departments && Array.isArray(announcement.departments)
                            ? announcement.departments.map(dep => ({
                                label: dep.title || '',
                                value: dep.id || null
                            }))
                            : [];

                        const selectedLocations = announcement?.locations && Array.isArray(announcement.locations)
                            ? announcement.locations.map(loc => ({
                                label: loc.title || '',
                                value: loc.id || null
                            }))
                            : [];

                        const selectedCourses = announcement?.courses && Array.isArray(announcement.courses)
                            ? announcement.courses.map(course => ({
                                label: course.title || '',
                                value: course.id || null
                            }))
                            : [];

                        const cardImage = [announcement?.card_image?.url];

                        reset({
                            title: announcement?.title || '',
                            description: announcement?.description?.[0]?.children?.[0]?.text || '',
                            department: selectedDepartments,
                            location: selectedLocations,
                            course: selectedCourses,
                        });

                        if (announcement.card_image) {
                            setImageFiles(cardImage)
                        }
                    }
                } catch (error) {
                    console.error("Error populating form for edit:", error);
                }
            }
        };

        populateFormForEdit();
    }, [isEdit, announcementId, reset]);


    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCancel = () => {
        setIsAnnouncementOpen(false);
        reset();
        window.location.reload();
    }

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

            setLocations(location || []);
            setDepartments(departments || []);
            setCourses(courses || []);

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

                reset({
                    department: selectedDepartments,
                    location: selectedLocations,
                    course: selectedCourses,
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
                (!announcements.length && !filteredAnnouncements.length && !filterBy.length) ?
                    (<>
                        <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
                            <div className=" text-default-900 text-xl font-semibold">
                                No Announcements Here
                            </div>
                            <div className=" text-sm  text-default-600 ">
                                No Announcements available. Click on below button to add Announcements.
                            </div>


                            <Button onClick={() => setIsAnnouncementOpen(true)} className="whitespace-nowrap">
                                <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                                Add Announcement
                            </Button>
                        </Blank>
                    </>)

                    :

                    <div className="space-y-4">
                        <div className="flex items-center flex-wrap justify-between gap-4">
                            <div className="text-2xl font-medium text-default-800">
                                Manage Announcements
                            </div>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex lg:flex-row flex-col flex-wrap justify-between gap-6">
                                    {pageView === "grid" && (
                                        <div className="flex-1 flex flex-wrap gap-3">
                                            <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                                                <div className="flex flex-1 flex-wrap items-center gap-2">
                                                    <Input
                                                        placeholder="Filter Announcement..."
                                                        value={filterValue}
                                                        onChange={(event) => setFilterValue(event.target.value)}
                                                        className="h-9 min-w-[200px] max-w-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {pageView === "list" && (
                                        <div className="flex lg:flex-row flex-col flex-wrap gap-2 lg:mr-2">
                                            <div className="flex flex-1 flex-wrap items-center gap-2">
                                                <Input
                                                    placeholder="Filter Announcement..."
                                                    value={filterValue}
                                                    onChange={(event) => setFilterValue(event.target.value)}
                                                    className="h-8 min-w-[200px] max-w-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="flex-none flex gap-3">
                                        <Filter
                                            title="Category"
                                            options={courseCategory.map(ele => ({
                                                label: ele.title,
                                                value: ele.id,
                                            }))}
                                            clearFilter={clearFilter}
                                            onChange={(value) => handleFilter('courses_categories', value)}

                                        />

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
                                        <Button onClick={() => setIsAnnouncementOpen(true)} className="whitespace-nowrap">
                                            <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                                            Add Announcement
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className={cn("hover:bg-transparent", {
                                                "hover:border-primary hover:text-primary": pageView === "grid",
                                                "hover:border-muted-foreground hover:text-muted-foreground": pageView !== "grid",
                                            })}
                                            color={pageView === "grid" ? "primary" : "secondary"}
                                            onClick={() => setPageView("grid")}
                                        >
                                            <LayoutGrid className="h-5 w-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className={cn("hover:bg-transparent", {
                                                "hover:border-primary hover:text-primary": pageView === "list",
                                                "hover:border-muted-foreground hover:text-muted-foreground": pageView !== "list",
                                            })}
                                            color={pageView === "list" ? "primary" : "secondary"}
                                            onClick={() => setPageView("list")}
                                        >
                                            <List className="h-5 w-5" />
                                        </Button>
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
                            <>
                                {pageView === "grid" && (
                                    <>
                                        <div className="grid xl:grid-cols-3 lg:grid-cols-3 grid-cols-12 gap-4">
                                            {announcements.map((announcement, i) => (
                                                <AnnouncementGrid
                                                    announcement={announcement}
                                                    key={`project-grid-${i}`}
                                                    onDelete={deleteAnnouncement}
                                                    setIsAnnouncementOpen={() => setIsAnnouncementOpen(true)}
                                                    setAnnouncementId={() => setAnnouncementId(announcement.documentId)}
                                                />
                                            ))}
                                        </div>
                                        <DefaultPagination meta={meta} func={fetchAllAnnouncement} />
                                    </>
                                )}
                                {pageView === "list" && (
                                    <ProjectList table={table} columns={columns} meta={meta} func={fetchAllAnnouncement} />
                                )}
                            </>
                        )}


                        <DeleteConfirmationDialog
                            deleteDescription="Are you sure to delete it?"
                            headingMessage=" "
                            open={open}
                            onClose={() => setOpen(false)}
                            onConfirm={confirmDelete}
                        />
                    </div>
            }
            {isAnnouncementOpen && <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
                <Dialog defaultOpen={true} onOpenChange={(value) => { setIsAnnouncementOpen(value) }}>
                    <DialogContent size="4xl">

                        <div className="text-sm text-default-500 justify-center space-y-4  overflow-auto h-[600px] w-[100%]">
                            <div className="space-y-6 w-full">
                                <div className="flex items-center flex-wrap justify-between gap-4">
                                    <div className="text-2xl font-medium text-default-800 ">
                                        {isEdit ? "Update Announcement" : "Create Announcement"}
                                    </div>
                                </div>

                                <div className="col-span-12 xl:col-span-9 mr-5 p-1">

                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                                            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                                                <h3 className="text-xl font-medium capitalize text-default-700">
                                                    Basic Announcement Info
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-12 gap-7 p-6">
                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Title <span class="text-red-500">*</span></Label>
                                                        <Input
                                                            type="text"
                                                            placeholder="Announcement Title"
                                                            className="rounded-sm h-14 text-base text-default-700"
                                                            {...register("title", {
                                                                required: "Announcement Title is required",
                                                                validate: (value) => !isEmptyOrSpaces(value) || "Can not be only empty spaces"
                                                            })}
                                                            onChange={(e) => {
                                                                handleFieldChange();
                                                                setValue("title", e.target.value);
                                                            }}
                                                        />
                                                        <FromError error={errors} name={'title'} />
                                                    </div>
                                                </div>

                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Description</Label>
                                                        <Textarea className="rounded-sm text-base text-default-700" placeholder="Announcement Description" id="rows-5" rows="2" {...register("description")}
                                                            onChange={(e) => {
                                                                handleFieldChange();
                                                                setValue("description", e.target.value);
                                                            }} />
                                                    </div>
                                                </div>

                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Department</Label>
                                                        <Controller
                                                            name="department"
                                                            control={control}
                                                            rules={{}}
                                                            render={({ field }) =>
                                                                <Select
                                                                    defaultValue={field.value}
                                                                    value={field.value}
                                                                    onChange={(value) => {
                                                                        handleFieldChange();
                                                                        field.onChange(value)
                                                                    }}
                                                                    isClearable={false}
                                                                    styles={styles}
                                                                    isMulti
                                                                    name='department'
                                                                    options={departments
                                                                        .filter(dept => !field.value?.some(selected => selected.value === dept.id))
                                                                        .map(ele => ({ label: ele.title, value: ele.id }))}
                                                                    className="react-select"
                                                                    classNamePrefix="select"
                                                                />
                                                            }
                                                        />

                                                    </div>
                                                </div>

                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Course</Label>
                                                        <Controller
                                                            name="course"
                                                            control={control}
                                                            rules={{}}
                                                            render={({ field }) =>
                                                                <Select
                                                                    defaultValue={field.value}
                                                                    value={field.value}
                                                                    onChange={(value) => { handleFieldChange(); field.onChange(value) }}
                                                                    isClearable={false}
                                                                    styles={styles}
                                                                    isMulti
                                                                    name='course'
                                                                    options={courses
                                                                        .filter(loc => !field.value?.some(selected => selected.value === loc.id))
                                                                        .map(ele => ({ label: ele.title, value: ele.id }))}
                                                                    className="react-select"
                                                                    classNamePrefix="select"
                                                                />
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Locations</Label>
                                                        <Controller
                                                            name="location"
                                                            control={control}
                                                            rules={{}}
                                                            render={({ field }) =>
                                                                <Select
                                                                    defaultValue={field.value}
                                                                    value={field.value}
                                                                    onChange={(value) => { handleFieldChange(); field.onChange(value) }}
                                                                    isClearable={false}
                                                                    styles={styles}
                                                                    isMulti
                                                                    name='location'
                                                                    options={locations
                                                                        .filter(loc => !field.value?.some(selected => selected.value === loc.id))
                                                                        .map(ele => ({ label: ele.title, value: ele.id }))}
                                                                    className="react-select"
                                                                    classNamePrefix="select"
                                                                />
                                                            }
                                                        />
                                                    </div>
                                                </div>

                                            </div>

                                        </div>

                                        <div className="p-0 bg-card rounded-md shadow-sm">
                                            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                                                <h3 className="text-xl font-medium capitalize text-default-700">
                                                    Media & Visuals
                                                </h3>
                                            </div>
                                            <div className="grid grid-cols-12 gap-7 p-6">
                                                <div className="col-span-12 lg:col-span-12">
                                                    <div className="space-y-2">
                                                        <Label className="text-base text-default-700">Announcement Image</Label>
                                                        <FileInput className="rounded-sm"
                                                            onChange={(file) => handleImageChange(file)}
                                                            initialFile={imageFiles} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex my-6 gap-4 justify-end">
                                            <Button
                                                type={'button'}
                                                size="xl"
                                                variant="outline"
                                                color="default"
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
                    </DialogContent>
                </Dialog>
            </div>}

        </>
    )
}

export default Announcement;
