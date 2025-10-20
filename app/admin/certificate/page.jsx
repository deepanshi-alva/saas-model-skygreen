"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import axiosInstance from '@/config/axios.config';
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
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
import { SortHeader } from '../assignment/SortHeader';
import ProjectList from '../course/ProjectList';
import { formatDateToIST } from './../../../lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Blank from '@/components/blank';
import { fetchSiteSetting } from '@/provider/slice/siteSettingSlice';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';

const Page = () => {
    const [certificates, setCertificates] = useState([])
    const [sorting, setSorting] = React.useState([]);
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [open, setOpen] = useState(false);
    const [certificateId, setCertificateId] = useState();
    // const [filterValue, setFilterValue] = useState("");

    const dispatch = useDispatch();
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data, loading, error } = siteSetting || {};
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [filterValue, setFilterValue] = useState("");
    const [emptyState, setEmptyState] = useState(false);
    const [filterState, setfilterStatus] = useState(false);
    useEffect(() => {
        getCertificateData()
    }, [])

    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);
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
        debounce(getCertificateData, 400)()
    }, [filterValue])

    const getCertificateData = async (pageNo = 1) => {
        try {
            const query = new URLSearchParams();
            if (filterValue) {
                query.append('filters[certificate_name][$containsi]', filterValue);
                setfilterStatus(true);
            } else {
                setfilterStatus(false);
            }
            const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance({
                url: `/api/certificates?populate=*&${query}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`,
                method: "GET",
            });
            if (!data.data.length) {
                setEmptyState(true);
            } else {
                setEmptyState(false);
            }
            console.log("getCertificateData", data.data);
            const tempAnnouncements = data?.data.map(ele => ({
                id: ele.id,
                documentId: ele.documentId,
                certificate_name: ele.certificate_name,
                course: ele.course?.title,
                certificate_type: ele.certificate_type,
                createdAt: formatDateToIST(ele.createdAt),
                publishedAt: formatDateToIST(ele.publishedAt),
                user: ele.user?.username
            }));
            console.log("tempAnnouncements", tempAnnouncements);

            setCertificates(tempAnnouncements);
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
        } catch (error) {
            console.error("Error fetching certificates:", error);
        }
    }

    console.log("certificates", certificates);
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
            accessorKey: "certificate_name",
            header: ({ column }) => (
                <SortHeader column={column} title="Certificate name" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("certificate_name")}
                        </span>
                    </div>
                );
            },
        },
        // {
        //     accessorKey: "course",
        //     header: ({ column }) => (
        //         <SortHeader column={column} title="Course" />
        //     ),
        //     cell: ({ row }) => {
        //         return (
        //             <div className="flex gap-2">
        //                 <span className="max-w-[500px] truncate font-medium">
        //                     {row.getValue("course")}
        //                 </span>
        //             </div>
        //         );
        //     },
        // },
        {
            accessorKey: "certificate_type",
            header: ({ column }) => (
                <SortHeader column={column} title="Certificate_type" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("certificate_type")}
                        </span>
                    </div>
                );
            },
        },
        {
            accessorKey: "user",
            header: ({ column }) => (
                <SortHeader column={column} title="user" />
            ),
            cell: ({ row }) => {
                return (
                    <div className="flex gap-2">
                        <span className="max-w-[500px] truncate font-medium">
                            {row.getValue("user")}
                        </span>
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
                            <Link href={`/admin/certificate/${row.original.documentId}`}><DropdownMenuItem>Edit</DropdownMenuItem></Link>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => deleteHandlerAnnouncement(row.original.documentId)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            },
        },
    ];

    const table = useReactTable({
        data: certificates,
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

    const deleteHandlerAnnouncement = (announcementDocId) => {
        setCertificateId(announcementDocId)
        setOpen(true);
    }

    const confirmDelete = () => {
        if (certificateId) {
            deleteAnnouncement(certificateId)
            setOpen(false);
        }
    }

    const deleteAnnouncement = async (certificateId) => {
        if (!certificateId) return;
        try {
            await axiosInstance({
                url: `/api/certificates/${certificateId}`,
                method: "delete"
            })
            await getCertificateData();
        } catch (error) {
            console.log(error);
        }
    }

    return (

        <div className="space-y-5">
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    Certificates
                </div>
            </div>
            <Card>
                <CardContent className="pt-6">
                    <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                        <div className=" flex-1 flex gap-3">
                            <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                                <Input placeholder="search..."
                                    value={filterValue}
                                    onChange={(event) => setFilterValue(event.target.value)} className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                                />
                            </div>
                        </div>
                        <div className="">
                            <Button><Link href="/admin/certificate/create-certificate">Create Certificate + </Link></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            {emptyState && filterState ? (
                <Blank className="flex flex-col items-center justify-center h-full space-y-3">

                    <div className="text-default-900 text-xl font-normal">
                        No Certificates found matching your criteria.
                    </div>

                </Blank>
            ) : (

                <div className="grid grid-cols-12 gap-6 mt-6">
                    <div className="col-span-12">

                        {/* Certificates Listing */}

                        {/* {certificates.length > 0 ? (
                            certificates.map((item) => ( */}
                        {/* // <div key={item.id}>
                                //     <Link href={`/admin/certificate/${item.documentId}`}>{item.certificate_name}</Link>
                                // </div> */}
                        <ProjectList table={table} columns={columns} meta={meta} func={getCertificateData} />
                        {/* ))
                        ) : (
                            <p>No certificates found</p>
                        )} */}


                        <DeleteConfirmationDialog
                            deleteDescription="Are you sure to delete it?"
                            headingMessage=" "
                            open={open}
                            onClose={() => setOpen(false)}
                            onConfirm={confirmDelete}
                        />
                    </div>
                </div>
            )}

        </div>
    )
}

export default Page;
