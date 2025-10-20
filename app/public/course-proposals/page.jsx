"use client";
import Blank from "@/components/blank";
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, useMemo, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, Lis } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/config/axios.config";
import {
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Dialog, DialogContent } from '@/components/ui/dialog';
import ProjectList from "./../course-proposals/components/ProjectList";
// import CreateQuestion from "./new/CreateQuestion";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "./components/data-table-column-header";
import { DataTableRowActions } from "./components/data-table-row-actions";
// import ProposeCourse from "./ProposeCourse";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from "react-redux";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ProposeCourse from "../propose-course/ProposeCourse";
import { useDispatch } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { getFilePath } from "../../../config/file.path";

function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}


const page = () => {
    const router = useRouter();
    const [pageView, setPageView] = React.useState("grid");
    // const [questions, setQuestions] = useState([
    //   { title: "Question 1", description: "This is the description for question 1" },
    //   { title: "Question 2", description: "This is the description for question 2" },
    //   { title: "Question 3", description: "This is the description for question 3" }
    // ]);
    const [rowSelection, setRowSelection] = React.useState({});
    const [proposals, setProposals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [columnVisibility, setColumnVisibility] = React.useState({});
    const [columnFilters, setColumnFilters] = React.useState([]);
    const [isCreateProposeCourseOpen, setIsCreateProposeCourseOpen] = useState();
    const [proCourseId, setProCourseId] = useState('');
    const [sorting, setSorting] = React.useState([]);
    const dispatch = useDispatch();
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data } = siteSetting || {};
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const [filterValue, setFilterValue] = useState("");
    const [emptyState, setEmptyState] = useState(false);
    const [filterState, setfilterStatus] = useState(false);
    const [order, setOrder] = useState('');
    const user = useSelector((state) => state.user);
    const buttonRef = useRef(null);
    const searchParams = useSearchParams();
    const isFab = searchParams.get("isFab");
    const pathname = usePathname();
    console.log('params', searchParams.get("isFab"));
    const deleteProposal = async (id) => {
        try {
            const { data } = await axiosInstance({
                url: `/api/course-proposals/${id}`,
                method: 'DELETE'
            })
            setProposals(old => old.filter(ele => ele.documentId !== id))
            console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    function minutesToHMS(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    // const handleSearch = (event) => {
    //     setSearchQuery(event.target.value);
    // };

    const filteredProposals = useMemo(() => {
        if (!searchQuery) return proposals;

        const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
        return proposals.filter((ele) => {
            return queryRegex.test(ele.name)
        }
        );
    }, [proposals, searchQuery]);
    const fetchProposals = async (pageNo = 1) => {
        try {
            setLoading(true);
            const query = new URLSearchParams();
            if (filterValue) {
                query.append("filters[name][$containsi]", filterValue);
                setfilterStatus(true);
            } else {
                setfilterStatus(false);
            }
            const pageSize = meta.pageSize || 5;
            const { data } = await axiosInstance.get(`/api/course-proposals?${query ? `${query}&` : ''}populate[upvotes][populate][profileImage][fields][0]=url&populate[author][populate][profileImage][fields][0]=url&populate[courses_categories]=true&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}${order ? `&sort=total_votes:${order}` : ''}`);
            if (!data.data.length) {
                setEmptyState(true);
            } else {
                setEmptyState(false);
            }
            setProposals(data.data);
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
        } catch (err) {
            setError('Failed to fetch Proposals');
            console.error('Error fetching Proposals:', err);
        } finally {
            setLoading(false);
        }
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
        debounce(fetchProposals, 400)()
    }, [filterValue])

    useEffect(() => {

        fetchProposals();
    }, [order]);
    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);
    console.log('proposals', proposals);
    const createProCourseCallback = async (callbackData) => {
        const { data } = await axiosInstance({
            url: `/api/course-proposals/${callbackData?.data?.documentId}?populate=*`,
            method: 'get'
        });

        setProposals((oldProposals) => {
            const existingIndex = oldProposals.findIndex(
                (ProposedCourse) => ProposedCourse.documentId === data.data.documentId
            );
            if (existingIndex !== -1) {
                const updatedProposedCourse = [...oldProposals];
                updatedProposedCourse[existingIndex] = data.data;
                return updatedProposedCourse;
            } else {
                return [...oldProposals, data.data];
            }
        });

        setIsCreateProposeCourseOpen(false);
        setProCourseId('');
        removeIsFab();
    };

    async function upvote(documentId) {
        try {
            const { data } = await axiosInstance({
                url: `/api/course-proposals/${documentId}?populate=*&status=published`,
                method: 'get',
            });
            console.log('data', data);
            const isAlreadyVoted = data.data?.upvotes?.some((ele) => {
                return ele.id === user.id;
            });
            console.log('isAlreadyVoted', isAlreadyVoted);
            console.log('length', data?.data?.upvotes.length)
            let upvotes = data?.data?.upvotes?.map(ele => ({ id: ele.id })) || [];
            console.log('upvotes', upvotes);
            console.log('user id', user.id);
            const finalUpvotes = isAlreadyVoted
                ? upvotes.filter((ele) => ele.id !== user.id)
                : [...upvotes, { id: user.id }];

            console.log('upvotes', upvotes);
            const { data: result } = await axiosInstance({
                url: `/api/course-proposals/${documentId}?populate=*`,
                method: 'put',
                data: {
                    data: {
                        upvotes: finalUpvotes,
                        total_votes: finalUpvotes?.length || 0
                    }
                }
            });
            setProposals((proposals) =>
                proposals.map((ele) =>
                    ele.documentId === result?.data?.documentId
                        ? { ...ele, upvotes: result?.data?.upvotes }
                        : ele
                )
            );
        } catch (error) {
            console.log(error);
        }
    }
    useEffect(() => {
        if (isFab) {
            buttonRef.current.click();
        }
    }, [])


    const removeIsFab = () => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("isFab");

        const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
        router.replace(newUrl);
    };
    const columns = [
        {
            accessorKey: "name",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="name" />
            ),
            cell: ({ row }) => {
                return (
                    <Link
                        href={{
                            pathname: `/public/course-proposals/${row.original.documentId}`,
                        }}
                        className="flex items-center gap-2">

                        <div className="max-w-[140px] truncate">
                            <span className="font-semibold text-default-900 capitalize hover:text-primary">
                                {" "}
                                {row.getValue("name")}
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
                        {description && description.length > 10 ? `${description?.slice(0, 15)}...` : description || "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "course_duration",
            header: "Duration",
            cell: ({ row }) => {
                const course_duration = row.original?.course_duration;
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">

                        {minutesToHMS(course_duration) || "N/A"}
                    </div>
                );
            },
        },
        {
            accessorKey: "upvotes",
            header: ({ column }) => {
                console.log("Sorting State:", column.getIsSorted());
                const order = column.getIsSorted();
                if (order === 'desc') {
                    setOrder('desc')
                } else if (order === 'asc') {
                    setOrder('asc')
                }
                return <DataTableColumnHeader column={column} title="total Upvote" />
            },
            cell: ({ row }) => {
                const isVoted = row.original.upvotes.some((ele) => {
                    return ele.id === user.id;
                })

                return (
                    // <div>

                    //     <Badge color={""} className="whitespace-nowrap">
                    //     <div className="text-sm font-medium text-default-900 whitespace-nowrap">
                    //         {row.original.upvotes?.length || 0}
                    //     </div>
                    //     </Badge>
                    // </div>
                    <div className="inline-block rounded-md border cursor-pointer" onClick={() => upvote(row?.original?.documentId)}>
                        <Badge className={`${isVoted
                            ? "bg-primary border-transparent text-info-foreground"
                            : "bg-white text-black border border-gray-300"
                            } flex items-center gap-1 px-2 py-1 rounded-md`}>
                            <div className="text-sm font-medium">{row.original.upvotes?.length || 0}</div>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                className={isVoted ? "fill-info-foreground" : "fill-black"}
                            >
                                <path d="M12.781 2.375c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625zM15 12h-1v8h-4v-8H6.081L12 4.601L17.919 12z" />
                            </svg>
                        </Badge>
                    </div>


                );


            },
            filterFn: (row, id, value) => {
                return value.includes(row.getValue(id));
            },
        },
        {
            accessorKey: "author",
            header: "author",
            cell: ({ row }) => {
                const author = row.original.author;
                return <div className="  font-medium  text-card-foreground/80">
                    <div className="flex space-x-3  rtl:space-x-reverse items-center">
                        <Avatar className=" rounded-full">
                       { author?.profileImage?.url && <AvatarImage src={getFilePath(author?.profileImage?.url) || ''} />}
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
            header: "Proposed Date ",
            cell: ({ row }) => {
                return (
                    <div className="text-sm font-medium text-default-600 whitespace-nowrap">
                        {formatDate(row.getValue("createdAt"))}
                    </div>
                );
            },
        },
        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => <DataTableRowActions row={row} setIsCreateProposeCourseOpen={setIsCreateProposeCourseOpen} setProCourseId={setProCourseId} deleteProposal={deleteProposal} />,
        },
    ];

    const table = useReactTable({
        data: proposals,
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

    // {questions.map((question, index) => (
    //   <div
    //     key={index}
    //     className="p-4 bg-gray-100 rounded-lg shadow-lg hover:bg-gray-200 transition transform hover:scale-105"
    //   >
    //     <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
    //     <p className="text-sm text-gray-600">{question.description}</p>
    //   </div>
    // ))}
    // console.log("questionId", questionId, 'isCreateQuestionOpen', isCreateQuestionOpen)
    return (
        <>
            {emptyState && !filterState ?
                (
                    <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
                        <div className="text-default-900 text-xl font-semibold">
                            No Proposed Course Yet
                        </div>
                        <div className="text-sm text-default-600">
                            Looks like no courses have been proposed yet. Have a great course idea? Click the button below to propose one and get started!
                        </div>

                        <div></div>
                        <Button onClick={() => { setIsCreateProposeCourseOpen(true); setProCourseId('new') }}>
                            <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                            Proposed A Course
                        </Button>
                    </Blank>
                )
                :
                (
                    <div className="space-y-5">

                        <div className="flex items-center flex-wrap justify-between gap-4">
                            <div className="text-2xl font-medium text-default-800 ">
                                Manage Proposed Courses
                            </div>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                                    <div className=" flex-1  flex flex-wrap gap-3">
                                        {/* {pageView === "grid" && <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                                            <Input
                                                placeholder="Search..."
                                                value={searchQuery}
                                                onChange={handleSearch}
                                                className="h-8 min-w-[200px] max-w-sm"
                                            />
                                        </div>
                                        }
                                        {pageView === "list" && <div className="flex lg:flex-row flex-col flex-wrap items-center gap-2 lg:mr-2">
                                            <Input
                                                placeholder="search..."
                                                value={table.getColumn("title").getFilterValue() ?? ""}
                                                onChange={(event) =>
                                                    table.getColumn("title")?.setFilterValue(event.target.value)
                                                }
                                                className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                                            />
                                        </div>} */}
                                        <div className="flex lg:flex-row flex-col flex-wrap items-center gap-2 lg:mr-2">
                                            <Input
                                                placeholder="search..."
                                                value={filterValue}
                                                onChange={(event) => setFilterValue(event.target.value)}
                                                className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex-none flex gap-3">
                                        {/* CreateQuestionBank */}
                                        <Button ref={buttonRef} onClick={() => setIsCreateProposeCourseOpen(true)} className="whitespace-nowrap">
                                            <Plus className="w-4 h-4  ltr:mr-2 rtl:ml-2 " />
                                            Propose Course
                                        </Button>
                                        {/* 
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
                                        </Button> */}
                                        {/* <Button
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
                                        </Button> */}
                                    </div>

                                </div>
                            </CardContent>
                        </Card>

                        {emptyState && filterState ? (
                            <Blank className="flex flex-col items-center justify-center h-full space-y-3">

                                <div className="text-default-900 text-xl font-normal">
                                    No Course Proposal found matching your criteria.
                                </div>

                            </Blank>
                        )
                            :
                            (
                                <>
                                    {/* {pageView === "grid" && (
                                        <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5">
                                            {(filteredQuestionBank.length > 0 ? filteredQuestionBank : questions)?.map((question, i) => (
                                                <QuestionBankGrid
                                                    question={question}
                                                    key={`project-grid-${i}`}
                                                    onDelete={deleteQuestionBank}
                                                    setIsCreateQuestionOpen={setIsCreateQuestionOpen}
                                                    setQuestionId={setQuestionId}
                                                />
                                            ))}
                                        </div>
                                    )} */}
                                    {/* {pageView === "list" && ( */}
                                    {/* <ProjectList data={proposals} table={table} columns={columns} setIsCreateProposeCourseOpen={setIsCreateProposeCourseOpen}
                                        setProCourseId={setProCourseId} /> */}
                                    <ProjectList data={proposals} table={table} columns={columns} meta={meta} fetchProposals={fetchProposals} />
                                    {/* )} */}
                                </>
                            )}
                    </div>
                )
            }
            {isCreateProposeCourseOpen && <div className="flex flex-wrap  gap-x-5 gap-y-4">
                <Dialog defaultOpen={true} onOpenChange={(value) => { setIsCreateProposeCourseOpen(value); setProCourseId('') }}>
                    <DialogContent size="4xl">

                        <div className="text-sm text-default-500 space-y-4 overflow-auto justify-center flex overflow-auto h-[600px] w-[100%] ">

                            <ProposeCourse proCourseId={proCourseId} onSave={createProCourseCallback} onClose={() => { setIsCreateProposeCourseOpen(false); setProCourseId('') }} />

                        </div>
                    </DialogContent>
                </Dialog>
            </div>}
        </>
    );
}
export default page;
