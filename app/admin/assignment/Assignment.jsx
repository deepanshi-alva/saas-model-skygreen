"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Blank from "@/components/blank";
import { Card, CardContent } from "@/components/ui/card";
import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { SortHeader } from "./SortHeader";

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
import { Filter } from "./FacetedFilter";
import AssignmentGrid from "./AssignmentGrid";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axiosInstance from "@/config/axios.config";
import { Input } from "@/components/ui/input";
// import { DataTablePagination } from '../question-banks/[questionBankId]/components/data-table-pagination';
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import ProjectList from "../course/ProjectList";
import { useMemo } from "react";
import { useAppSelector } from "@/provider/Store";
import DefaultPagination from "../../dafault-pagi";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { CircularProgress } from "@/components/ui/progress";
function Assignment() {
  const user = useAppSelector((state) => state.user);
  console.log("useAppSelector", user);

  const router = useRouter();
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [clearFilter, setClearFilter] = useState(0);
  const [filterBy, setFilterBy] = useState([]);
  const [courseCategory, setCourseCategory] = useState([]);
  const [open, setOpen] = useState(false);
  const [assignmentId, setAssignmentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState(false);
  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data, loading, error } = siteSetting || {};
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: data?.pageSize || 10,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const [filterValue, setFilterValue] = useState("");
  const [emptyState, setEmptyState] = useState(false);
  const [filterState, setfilterStatus] = useState(false);
  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);
  const columns = [
    {
      accessorKey: "id",
      header: ({ column }) => <SortHeader column={column} title="ID" />,
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
      header: ({ column }) => <SortHeader column={column} title="Name" />,
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
      accessorKey: "difficulty_level",
      header: ({ column }) => <SortHeader column={column} title="Difficulty" />,
      cell: ({ row }) => {
        const difficulty_level = row.getValue("difficulty_level");
        return (
          <div className="flex items-center">
            <Badge
              color={
                (difficulty_level === "Advanced" && "destructive") ||
                (difficulty_level === "Intermediate" && "info") ||
                (difficulty_level === "Beginner" && "warning")
              }
            >
              {difficulty_level}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "courses_categories",
      header: ({ column }) => <SortHeader column={column} title="Category" />,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            {row?.original?.courses_categories && (
              <span className="max-w-[500px] truncate font-medium">
                {row?.original?.courses_categories.map(
                  (category) => category?.title
                ) || "-"}
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "score",
      header: ({ column }) => <SortHeader column={column} title="Max Score" />,
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.getValue("score") || "-"}</div>;
      },
    },
    {
      accessorKey: "currentAttempts",
      header: ({ column }) => (
        <SortHeader column={column} title="Current attempts" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">{row.getValue("currentAttempts")}</div>
        );
      },
    },
    {
      accessorKey: "valid_attempts",
      header: ({ column }) => (
        <SortHeader column={column} title="Valid attempts" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">{row.getValue("valid_attempts")}</div>
        );
      },
    },
    //
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end">
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
                {user?.role?.name === "EMPLOYEE" ? (
                  ""
                ) : (
                  <DropdownMenuItem
                    onSelect={() =>
                      router.push(
                        `/admin/assignment/${row.original.documentId}`
                      )
                    }
                  >
                    Edit
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    router.push(`/take-assessment/${row.original.documentId}`)
                  }
                >
                  Take Assesment
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {user?.role?.name === "EMPLOYEE" ? (
                  ""
                ) : (
                  <DropdownMenuItem
                    onClick={() =>
                      deleteHandlerAssignment(row.original.documentId)
                    }
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];
  const [pageView, setPageView] = React.useState("grid");

  const table = useReactTable({
    data: assignments,
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

  // const fetchAllAssignments = async () => {
  //     try {
  //         setIsLoading(true);
  //         const query = new URLSearchParams();

  //         filterBy.forEach(ele => {
  //             const filterKey =
  //                 ele.type === 'course_categories'
  //                     ? `filters[${ele.type}][id][$in]`
  //                     : `filters[${ele.type}][$in]`;

  //             ele.value.forEach(val => query.append(filterKey, val));
  //         });

  //         const { data } = await axiosInstance({
  //             url: "/api/assignments?populate=*&" + query.toString(),
  //             method: "GET",
  //         });

  //         const tempAssignments = data.data.map(ele => ({
  //             id: ele.id,
  //             documentId: ele.documentId,
  //             title: ele.title,
  //             difficulty_level: ele.difficulty_level,
  //             score: ele.max_score || "-",
  //             description: ele.description || "",
  //             questions: ele.questions.length || "-",
  //             courses_categories: ele?.courses_categories
  //         }));

  //         setAssignments(tempAssignments);
  //     } catch (error) {
  //         console.error(error);
  //     } finally {
  //         setIsLoading(false);
  //     }
  // };

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  useEffect(() => {
    debounce(fetchAllAssignments, 400)();
  }, [filterValue]);

  const fetchAllAssignments = async (pageNo = 1) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (filterValue) {
        query.append("filters[title][$containsi]", filterValue);
        setfilterStatus(true);
      } else {
        filterBy.forEach((ele) => {
          const filterKey =
            ele.type === "course_categories"
              ? `filters[${ele.type}][id][$in]`
              : `filters[${ele.type}][$in]`;

          ele.value.forEach((val) => query.append(filterKey, val));
        });
      }

      const pageSize = meta.pageSize || 5;
      let tempAssignments = [];

      // Handle Employee Role: Fetch Assignments via Course Enrollments
      if (user?.role?.name === "EMPLOYEE") {
        const { data } = await axiosInstance.get(
          `/api/course-enrollments?filters[user][id]=${
            user.id
          }&populate[course][populate][assignments][populate]=*&${query.toString()}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`
        );

        // Extract assignments from courses
        tempAssignments = await Promise.all(
          data.data.flatMap((enrollment) =>
            (enrollment.course?.assignments || []).map(async (assignment) => {
              let currentAttempts = 0;
              try {
                const response = await axiosInstance.get(
                  `/api/attempt-contents?filters[user][id][$eq]=${user.id}&filters[assignment][documentId][$eq]=${assignment.documentId}`
                );
                currentAttempts = response.data.data.length || 0;
              } catch (error) {
                console.error(
                  `Error fetching attempts for documentId: ${assignment.documentId}`,
                  error
                );
              }

              return {
                id: assignment.id, // Assignment ID
                documentId: assignment.documentId,
                title: assignment.title,
                difficulty_level: assignment.difficulty_level,
                score: assignment.max_score || "-",
                description: assignment.description || "",
                questions: assignment.questions?.length || "-",
                courses_categories: assignment?.courses_categories,
                currentAttempts, // Add currentAttempts to the assignment
                valid_attempts: assignment.valid_attempts,
              };
            })
          )
        );

        setAssignments(tempAssignments);
        setMeta({ ...data.meta.pagination, currentPage: pageNo });
        setIsLoading(false);
        return;
      }

      // Fetch All Assignments for Non-Employees (Admins, Instructors, etc.)
      const { data } = await axiosInstance.get(
        `/api/assignments?populate=*&${query.toString()}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`
      );
      console.log("/api/assignments:", data.data);

      // Fetch Attempts for Each Assignment
      tempAssignments = await Promise.all(
        data.data.map(async (ele) => {
          let currentAttempts = 0;
          try {
            const response = await axiosInstance.get(
              `/api/attempt-contents?filters[user][id][$eq]=${user.id}&filters[assignment][documentId][$eq]=${ele.documentId}`
            );
            currentAttempts = response.data.data.length || 0;
          } catch (error) {
            console.error(
              `Error fetching attempts for documentId: ${ele.documentId}`,
              error
            );
          }

          return {
            id: ele.id,
            documentId: ele.documentId,
            title: ele.title,
            difficulty_level: ele.difficulty_level,
            score: ele.max_score || "-",
            description: ele.description || "",
            questions: ele.questions?.length || "-",
            courses_categories: ele?.courses_categories,
            currentAttempts, // Add currentAttempts to the assignment
            valid_attempts: ele.valid_attempts,
          };
        })
      );

      if (!data.data.length) {
        setEmptyState(true);
      } else {
        setEmptyState(false);
      }

      setAssignments(tempAssignments);
      setMeta({ ...data.meta.pagination, currentPage: pageNo });
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAssignment = () => {
    router.push("/admin/assignment/new#1");
  };

  const deleteHandlerAssignment = (assignmentDocId) => {
    setAssignmentId(assignmentDocId);
    setOpen(true);
  };

  const confirmDelete = () => {
    if (assignmentId) {
      deleteAssignment(assignmentId);
      setOpen(false);
    }
  };

  const deleteAssignment = async (assignmentDocumentId) => {
    if (!assignmentDocumentId) return;
    try {
      await axiosInstance({
        url: `/api/assignments/${assignmentDocumentId}`,
        method: "DELETE",
      });
      await fetchAllAssignments();
    } catch (error) {
      console.log(error);
    }
  };

  const getAllCategory = async () => {
    try {
      const { data } = await axiosInstance({
        url: "/api/courses-categories",
        method: "get",
      });
      setCourseCategory(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllCategory();
  }, []);

  console.log("assignments123", assignments);

  useEffect(() => {
    fetchAllAssignments();
    setFilterStatus(filterBy.length > 0);
  }, [filterBy]);

  const handleFilter = (type, value) => {
    if (!value.length) {
      setFilterBy((old) => old.filter((ele) => ele.type !== type));
    } else {
      setFilterBy((old) =>
        old.length
          ? old.map((ele) => (ele.type === type ? { type, value } : ele))
          : [{ type, value }]
      );
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredAssignments = useMemo(() => {
    if (!searchQuery) return assignments;
    const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
    return assignments.filter((assignment) =>
      queryRegex.test(assignment.title)
    );
  }, [assignments, searchQuery]);

  return (
    <>
      {!assignments.length &&
      !filteredAssignments.length &&
      !filterBy.length ? (
        <>
          <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
            <div className=" text-default-900 text-xl font-semibold">
              No Assignments Here
            </div>
            <div className=" text-sm  text-default-600 ">
              No Assignments available. Click on below button to add
              Assignments.
            </div>

            {user?.role?.name === "EMPLOYEE" ? (
              ""
            ) : (
              <Button onClick={addAssignment}>
                <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                Add Assignment
              </Button>
            )}
          </Blank>
        </>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center flex-wrap justify-between gap-4">
            <div className="text-2xl font-medium text-default-800">
              Assignments
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="flex lg:flex-row flex-col flex-wrap justify-between gap-6">
                {pageView === "grid" && (
                  <div className="flex-1 flex flex-wrap gap-3 items-center ">
                    <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-6 lg:mr-2">
                      <div className="flex flex-1 flex-wrap gap-6">
                        <Input
                          placeholder="Filter Assignments..."
                          value={filterValue}
                          onChange={(event) =>
                            setFilterValue(event.target.value)
                          }
                          className="h-9 min-w-[200px] max-w-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {pageView === "list" && (
                  <div className="flex lg:flex-row flex-col flex-wrap gap-2 lg:mr-2">
                    <div className="flex flex-1 flex-wrap items-center gap-2 mb-4">
                      <Input
                        placeholder="Filter Assignments..."
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        className="h-8 min-w-[200px] max-w-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="flex-none flex gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Filter
                      title="Category"
                      options={courseCategory.map((ele) => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) =>
                        handleFilter("courses_categories", value)
                      }
                    />

                    <Filter
                      title="Difficulty"
                      options={[
                        { label: "Beginner", value: "Beginner" },
                        { label: "Intermediate", value: "Intermediate" },
                        { label: "Advanced", value: "Advanced" },
                      ]}
                      clearFilter={clearFilter}
                      onChange={(value) =>
                        handleFilter("difficulty_level", value)
                      }
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

                  {/* <Button onClick={addAssignment} className="whitespace-nowrap">
                                        <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                                        Add Assignments
                                    </Button> */}
                  {user?.role?.name === "EMPLOYEE" ? (
                    ""
                  ) : (
                    <Button onClick={addAssignment}>
                      <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                      Add Assignment
                    </Button>
                  )}

                  <Button
                    size="icon"
                    variant="outline"
                    className={cn("hover:bg-transparent", {
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
                    className={cn("hover:bg-transparent", {
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
          <DeleteConfirmationDialog
            deleteDescription="Are you sure to delete it?"
            headingMessage=" "
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={confirmDelete}
          />
        </div>
      )}

      {isLoading ? (
        <div className="w-full h-40 flex justify-center gap-5 items-center">
          <CircularProgress value="50" color="primary" loading size="xs" />
          Loading...
        </div>
      ) : filteredAssignments.length === 0 &&
        (searchQuery || filterBy.length > 0) ? (
        <Blank className="flex flex-col items-center justify-center h-full space-y-3">
          <div className="text-default-900 text-xl font-semibold">
            No Records Found
          </div>
          <div className="text-sm text-default-600">
            No results available. Adjust your filters or search terms.
          </div>
        </Blank>
      ) : (
        <>
          {pageView === "grid" && (
            <>
              <div className="grid xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5 mt-4">
                {filteredAssignments.map((assignment, i) => (
                  <AssignmentGrid
                    assignment={assignment}
                    key={`project-grid-${i}`}
                    onDelete={deleteAssignment}
                    user={user}
                  />
                ))}
              </div>
              <div className="col-span-12 flex justify-center mt-6">
                <DefaultPagination meta={meta} func={fetchAllAssignments} />
              </div>
            </>
          )}
          {pageView === "list" && (
            <ProjectList
              data={assignments}
              table={table}
              columns={columns}
              meta={meta}
              func={fetchAllAssignments}
            />
          )}
        </>
      )}
    </>
  );
}

export default Assignment;
