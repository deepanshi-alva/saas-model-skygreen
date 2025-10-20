'use client'
import React, { useEffect, useState, useMemo } from 'react'
import toast from 'react-hot-toast';
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/config/axios.config";
import { cn } from "@/lib/utils";
import CategoriesGrid from "./CategoriesGrid";
import ProjectList from "../course/ProjectList";
import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useRouter } from 'next/navigation';
// import { columns } from './components/columns';
import Blank from '@/components/blank';

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from '../course/project-list/components/data-table-column-header';
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import Link from "next/link";

import { MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import AddCategory from './AddCategory';
import DefaultPagination from '../../dafault-pagi';
import { useSelector } from 'react-redux';
import { fetchSiteSetting } from '@/provider/slice/siteSettingSlice';
import { useDispatch } from 'react-redux';
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}
const page = () => {
    const router = useRouter();
    const [courseCategory, setCourseCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageView, setPageView] = React.useState("grid");
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [sorting, setSorting] = React.useState([]);
    const [open, setOpen] = useState(false);
    const [Id, setId] = useState(null);
    const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState();
    const [categoryId, setCategoryId] = useState();
    const [searchQuery, setSearchQuery] = useState("");
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data } = siteSetting || {};
    const dispatch = useDispatch();
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [filterValue, setFilterValue] = useState("");
    const [emptyState, setEmptyState] = useState(false);
    const [filterState, setfilterStatus] = useState(false);
    const columns = [
        {
            accessorKey: "title",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Title" />
            ),
            cell: ({ row }) => {
                return (
                    <Link
                        href={{
                            pathname: `/admin/course-categories/${row.original.documentId}`,
                        }}
                        className="flex items-center gap-2">
                        <Avatar className="rounded-sm  h-8 w-8">
                            {/* <AvatarImage src={row?.original?.thumbnail} /> */}
                            <AvatarFallback className="bg-success/30 text-success">
                                {row?.original?.title?.slice(0, 2)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="max-w-[140px] truncate  ">
                            <span className="font-semibold text-default-900 capitalize hover:text-primary">
                                {" "}
                                {row.getValue("title")}
                            </span>
                        </div>
                    </Link>
                );
            },
            // enableColumnFilter: true, 
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                const description = row.original?.description;
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {description || "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "category.courses",
            header: "Courses",
            cell: ({ row }) => {
                const courseCount = row.original.courses?.length || 0;
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {courseCount || "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "difficulty_level",
            header: "difficulty",
            cell: ({ row }) => {
                const difficulty_level = row.original?.difficulty_level;
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {difficulty_level || "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created Date",
            cell: ({ row }) => {
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {formatDate(row.getValue("createdAt"))}
                    </div>
                );
            },
        },
        {
            accessorKey: "author",
            header: "Created By",
            cell: ({ row }) => {
                const createdBy = row.original.author;
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {createdBy?.username || "N/A"}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                return <div className="flex justify-end gap-3 items-center">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                className="flex h-6 w-6 rounded-full bg-default-100 hover:bg-default-200   p-0 data-[state=open]:bg-muted"
                            >
                                <MoreHorizontal className="h-4 w-4 text-default-500" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {/* <DropdownMenuItem > <Link
                                href={{
                                    pathname: `/admin/course/${row.original.documentId}`,
                                }}
                                className="w-full"
                                target="_blank"
                            >
                                Preview
                            </Link></DropdownMenuItem> */}
                            {/* <DropdownMenuSeparator /> */}
                            <DropdownMenuItem onSelect={() => { setCategoryId(row.original.documentId), setIsCreateCategoryOpen(true) }}>Edit</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteHandler(row.original.documentId)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            }

        },
    ];
    const table = useReactTable({
        data: courseCategory,
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
    // const CreateCourseCategory = () => {
    //     router.push('/admin/course-categories/new');
    // };
    const deleteHandler = (Id) => {
        setId(Id)
        setOpen(true);
    }
    const confirmDelete = () => {
        if (Id) {
            deleteCategory(Id)
            setOpen(false);
        }
    }
    const deleteCategory = async (id) => {
        if (!id) return;
        try {
            const { data } = await axiosInstance({
                url: `/api/courses-Categories/${id}?populate=courses`,
                method: 'get'
            })
            const courses = data.data.courses;
            if (courses.length > 1) {
                toast.error("too many courses inside can't delete it")
                return;
            }
            const response = await axiosInstance({
                url: `/api/courses-Categories/${id}`,
                method: 'DELETE'
            })
            setCourseCategories(old => old.filter(ele => ele.documentId !== id))
            toast.success('delete successfully');
        } catch (error) {
            console.log(error)
        }
    }

    const handleSearch = (event) => {
        setSearchQuery(event.target.value);
    };

    const filteredCourseCategory = useMemo(() => {
        if (!searchQuery) return courseCategory;

        const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
        return courseCategory.filter((ele) => {
            return queryRegex.test(ele.title)
        }

        );
    }, [courseCategory, searchQuery]);

    const fetchCourseCategories = async (pageNo = 1) => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (filterValue) {
                query.append("filters[title][$containsi]", filterValue);
                setfilterStatus(true);
            } else {
                setfilterStatus(false);
            }
            const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance.get(`/api/courses-Categories?${query}&populate=*&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`);
            if (!data.data.length) {
                setEmptyState(true);
            } else {
                setEmptyState(false);
            }
            setCourseCategories(data.data);
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
        } catch (err) {
            console.error('Error fetching questions:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {

        fetchCourseCategories();

    }, []);

    const createCategoryCallback = async (callbackData) => {
        const { data } = await axiosInstance({
            url: `/api/courses-Categories/${callbackData?.data?.documentId}?populate=*`,
            method: 'get'
        });

        setCourseCategories((oldCategories) => {
            const existingIndex = oldCategories.findIndex(
                (category) => category.documentId === data.data.documentId
            );
            if (existingIndex !== -1) {
                const updatedCategories = [...oldCategories];
                updatedCategories[existingIndex] = data.data;
                return updatedCategories;
            } else {
                return [...oldCategories, data.data];
            }
        });

        setIsCreateCategoryOpen(false);
    };
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
        debounce(fetchCourseCategories, 400)()
    }, [filterValue])

  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);

    return (
        <>
            <DeleteConfirmationDialog
                deleteDescription={'Are you sure to delete it?'}
                headingMessage={' '}
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={confirmDelete}
                defaultToast={false}
            />
            {emptyState && !filterState ? (

                <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
                    <div className=" text-default-900 text-xl font-semibold">
                        No course Category Here
                    </div>
                    <div className=" text-sm  text-default-600 ">
                        There is no course Category. Create one by clicking the button below.
                    </div>
                    <div></div>
                    {/* <Button onClick={CreateCourseCategory}> */}
                    <Button onClick={() => { setIsCreateCategoryOpen(true); setCategoryId("new") }}>
                        <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                        Add Course Category
                    </Button>
                </Blank>


            ) : (
                <div className="space-y-5">

                    <div className="flex items-center flex-wrap justify-between gap-4">
                        <div className="text-2xl font-medium text-default-800 ">
                            Manage Course Category
                        </div>
                    </div>

                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                                <div className=" flex-1  flex flex-wrap gap-3">
                                    {pageView === "grid" && <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                                        <Input
                                            placeholder="search..."
                                            value={filterValue}
                                            onChange={(event) => setFilterValue(event.target.value)}
                                            className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                                        />
                                    </div>
                                    }
                                    {pageView === "list" && <div className="flex lg:flex-row flex-col flex-wrap items-center gap-2 lg:mr-2">
                                        <Input
                                            placeholder="search..."
                                            value={filterValue}
                                            onChange={(event) => setFilterValue(event.target.value)}
                                            className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                                        />
                                    </div>}
                                </div>

                                <div className="flex-none flex gap-3">
                                    {/* <Button onClick={CreateCourseCategory} className="whitespace-nowrap"> */}
                                    <Button onClick={() => setIsCreateCategoryOpen(true)} className="whitespace-nowrap">
                                        <Plus className="w-4 h-4  ltr:mr-2 rtl:ml-2 " />
                                        Add Course Category
                                    </Button>

                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className={cn("hover:bg-transparent  ", {
                                            "hover:border-primary hover:text-primary":
                                                pageView === "grid",
                                            "hover:border-muted-foreground hover:text-muted-foreground":
                                                pageView !== "grid",
                                        })}
                                        color={pageView === "grid" ? "primary" : "secondary"}
                                        onClick={() => setPageView("grid")}
                                    >
                                        <LayoutGrid className="h-5 w-5" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        className={cn("hover:bg-transparent  ", {
                                            "hover:border-primary hover:text-primary":
                                                pageView === "list",
                                            "hover:border-muted-foreground hover:text-muted-foreground":
                                                pageView !== "list",
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

                    {emptyState && filterState ? (
                        <Blank className="flex flex-col items-center justify-center h-full space-y-3">
                            <div className="text-default-900 text-xl font-semibold">
                                No Records Available
                            </div>
                            <div className="text-sm text-default-600">
                                Add course category to see records.
                            </div>
                        </Blank>
                    ) : (
                        <>
                            {pageView === "grid" && (
                                <>
                                    <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5">
                                        {(filteredCourseCategory.length > 0 ? filteredCourseCategory : courseCategory)?.map((category, i) => (
                                            <CategoriesGrid
                                                category={category}
                                                key={`project-grid-${i}`}
                                                onDelete={deleteCategory}
                                                setIsCreateCategoryOpen={setIsCreateCategoryOpen}
                                                setCategoryId={setCategoryId}
                                            />
                                        ))}
                                    </div>
                                    <DefaultPagination meta={meta} func={fetchCourseCategories} />
                                </>
                            )}
                            {pageView === "list" && (
                                <ProjectList data={courseCategory} table={table} columns={columns} meta={meta} func={fetchCourseCategories} />
                            )}
                        </>
                    )}
                </div>
            )
            }

            {isCreateCategoryOpen && <div className="flex flex-wrap  gap-x-5 gap-y-4">
                <Dialog defaultOpen={true} onOpenChange={(value) => { setIsCreateCategoryOpen(value) }}>
                    {/* <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            {`Add Question for ${questionBank?.title}`}
                        </DialogTitle>
                    </DialogHeader> */}
                    <DialogContent size="4xl">

                        <div className="text-sm text-default-500 space-y-4 overflow-auto justify-center flex overflow-auto h-[600px] w-[100%] ">
                            {/* <AddQuestion multiple={false} source={"ASSIGNMENTS"} questionId={questionId} onSave={createQuestionCallBack} /> */}
                            <AddCategory categoryId={categoryId} onSave={createCategoryCallback} onClose={() => setIsCreateCategoryOpen(false)} />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>}
        </>
    )
}

export default page