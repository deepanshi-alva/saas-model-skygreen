"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Blank from "@/components/blank";

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
import { ChevronsRight, MoreHorizontal, X } from "lucide-react";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { ChevronsLeft, ChevronRight, ChevronLeft } from "lucide-react";
import AddQuestion from "@/components/common/add-question/AddQuestion";
import toast from "react-hot-toast";
// import debounce from "lodash.debounce";
function QuestionsTable({ source, saveChooseQuestions }) {
  const router = useRouter();
  const [questions, setQuestions] = useState([]);
  const [questionBanks, setQuestionsBanks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({
    select: !!source,
  });
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [clearFilter, setClearFilter] = useState(0);
  const [filterBy, setFilterBy] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 5,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const [filterValue, setFilterValue] = useState("");
  const [emptyState, setEmptyState] = useState(false);
  const [filterState, setfilterStatus] = useState(false);
  const [courseCategory, setCourseCategory] = useState([]);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState();
  const { questionBankId } = useParams();
  const [questionBank, setQBank] = useState({});
  const [questionId, setQuestionId] = useState(null);
  const [open, setOpen] = useState(false);
  // const [questionId,setEditQuesId] = useState();
  const deleteHandlerQuestion = (questionDocId) => {
    setQuestionId(questionDocId);
    setOpen(true);
  };
  const confirmDelete = () => {
    if (questionId) {
      deleteQuestion(questionId);
      setOpen(false);
    }
  };
  const deleteQuestion = async (questionDocumentId) => {
    if (!questionDocumentId) return;
    try {
      await axiosInstance({
        url: `/api/questions/${questionDocumentId}`,
        method: "DELETE",
      });
      await fetchQuestions();
    } catch (error) {
      console.log(error);
    }
  };
  const columns = [
    {
      id: "select",
      header: ({ table }) => (
        <div className="flex gap-2">
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-0.5"
          />
        </div>
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
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
      accessorKey: "question",
      header: ({ column }) => <SortHeader column={column} title="Question" />,
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("question")}
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
      accessorKey: "question_type",
      header: ({ column }) => (
        <SortHeader column={column} title="Question Type" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex gap-2">
            {row.getValue("question_type") || "-"}
          </div>
        );
      },
    },
    {
      accessorKey: "score",
      header: ({ column }) => <SortHeader column={column} title="Score" />,
      cell: ({ row }) => {
        return <div className="flex gap-2">{row.getValue("score") || "-"}</div>;
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
                <Button
                  variant="ghost"
                  className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="">
                <DropdownMenuItem
                  onSelect={() => {
                    setQuestionId(row.original.documentId),
                      setIsCreateQuestionOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => deleteHandlerQuestion(row.original.documentId)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: questions,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
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

  const fetchQuestions = async (pageNo = 1) => {
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      if (questionBankId)
        query.append("filters[question_bank][documentId][$eq]", questionBankId);
      if (filterValue || filterBy.length > 0) {
        if (filterValue)
          query.append("filters[question][$containsi]", filterValue);

        filterBy.forEach((ele) => {
          const types = ele.type;
          let filterKey;
          switch (types) {
            case "courses_categories":
              filterKey = `filters[assignments][courses_categories][title][$in]`;
              break;
            case "question_bank":
              filterKey = `filters[question_bank][title][$in]`;
              break;
            default:
              filterKey = `filters[${ele.type}][$in]`;
              break;
          }
          // const filterKey =
          //     ele.type === 'courses_categories'
          //         // ? `filters[${ele.type}][id][$in]`
          //         ? `filters[assignments][courses_categories][title][$in]`
          //         : `filters[${ele.type}][$in]`;

          // const filterKey = `filters[${ele.type}][$in]`;
          ele.value.forEach((val) => query.append(filterKey, val));
        });
        setfilterStatus(true);
      } else {
        setfilterStatus(false);
      }
      console.log(query.toString());

      const pageSize = meta.pageSize || 10;
      const { data } = await axiosInstance({
        method: "get",
        url: `api/questions?${query.toString()}&populate[assignments]=1&populate[question_bank]=1&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=updatedAt:desc`,
      });
      if (!data.data.length) {
        setEmptyState(true);
      } else {
        setEmptyState(false);
      }
      setQuestions(data.data);
      setMeta({ ...data.meta.pagination, currentPage: pageNo });
    } catch (error) {
      console.error("Error fetching filtered data:", error);
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
  const fetchQuestionBankInfo = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/question-banks/${questionBankId}`,
        method: "get",
      });
      setQBank(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllCategory();
    fetchQuestionBankInfo();
    getQuestionBanks();
  }, []);
  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  const getQuestionBanks = async () => {
    try {
      const { data } = await axiosInstance.get(
        "/api/question-banks?populate=*"
      );
      setQuestionsBanks(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    debounce(fetchQuestions, 400)();
  }, [filterBy, filterValue]);

  useEffect(() => {
    const indexes = Object.keys(rowSelection);
    if (indexes.length) {
      const selectedQuestion = questions.filter((_, idx) =>
        indexes.includes(String(idx))
      );
      saveChooseQuestions(selectedQuestion);
    }
  }, [rowSelection]);

  const handleFilter = (type, value) => {
    // if (!value.length) {
    //     setFilterBy((old) => old.filter(ele => ele.type !== type))
    // } else {
    //     console.log(type,value);
    //     // setFilterBy(old => old.length ? old.map(ele => ele.type === type ? { type, value } : ele) : [{ type, value }])
    //     setFilterBy((old) => old.map(ele => ele[type] = value));
    // }
    setFilterBy((old) => {
      if (!value.length) {
        return old.filter((ele) => ele.type !== type);
      }
      const existingIndex = old.findIndex((ele) => ele.type === type);

      if (existingIndex !== -1) {
        return old.map((ele) => (ele.type === type ? { ...ele, value } : ele));
      } else {
        return [...old, { type, value }];
      }
    });
  };
  const saveQuestionInQuestionBank = async (questionIds) => {
    try {
      const { data: currentData } = await axiosInstance({
        url: `/api/question-banks/${questionBankId}?populate=questions`,
        method: "get",
      });

      const existingIds = currentData.data?.questions?.map((q) => q?.id);
      const updatedIds = Array.from(new Set([...existingIds, ...questionIds]));
      const { data } = await axiosInstance({
        url: `/api/question-banks/${questionBankId}`,
        method: "put",
        data: {
          data: {
            questions: updatedIds,
          },
        },
      });
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };
  const createQuestionCallBack = async (callBackData) => {
    let questionIds = callBackData.map((ele) => ele.documentId);
    const { data } = await axiosInstance({
      url: `/api/questions?filters[documentId][$in]=${questionIds.join(
        ","
      )}&populate=*`,
      method: "GET",
    });
    await saveQuestionInQuestionBank([...questionIds]);
    console.log("data", data);
    //update local state
    const newQuestions = data.data.map((ele) => ({
      id: ele.id,
      documentId: ele.documentId,
      question: ele.question,
      question_type: ele.question_type,
      difficulty_level: ele.difficulty_level,
      score: ele.score,
      options: ele?.options,
    }));
    setQuestions((old) => [...old, ...newQuestions]);
    setEmptyState(false);
    setIsCreateQuestionOpen(false);
    setQuestionId("");
  };
  console.log("questions ", questions);
  return (
    <>
      {emptyState && !filterState ? (
        <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
          <div className=" text-default-900 text-xl font-semibold">
            No Question
          </div>
          <div className=" text-sm  text-default-600 ">
            There is no Question. create If you want to create a new Question
            then click this button & create new Question.
          </div>
          <div></div>
          <Button onClick={() => setIsCreateQuestionOpen(true)}>
            <Plus className="w-4 h-4 text-primary-foreground mr-2" />
            Add Questions
          </Button>
        </Blank>
      ) : (
        <>
          <DeleteConfirmationDialog
            deleteDescription={"Are you sure to delete it?"}
            headingMessage={" "}
            open={open}
            onClose={() => setOpen(false)}
            onConfirm={confirmDelete}
          />
          <div className="space-y-4">
            <div className=" space-y-5 bg-card p- rounded-md">
              {!source && (
                <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center justify-between	">
                  <h3 className="text-xl font-medium capitalize">
                    {`Questions Bank: ${questionBank?.title}`}
                  </h3>
                  <Button onClick={() => setIsCreateQuestionOpen(true)}>
                    <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                    Add Questions
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-12 gap-7 p-6">
                <div className="col-span-12 lg:col-span-12">
                  <div className="flex flex-1 flex-wrap items-center gap-2 mb-4">
                    <Input
                      placeholder="Filter Questions..."
                      value={filterValue}
                      onChange={(event) => setFilterValue(event.target.value)}
                      className="h-8 min-w-[200px] max-w-sm"
                    />
                    {source && (
                      <>
                        <Filter
                          title="Question Bank"
                          options={questionBanks.map((ele) => ({
                            label: ele.title,
                            value: ele.title,
                          }))}
                          clearFilter={clearFilter}
                          onChange={(value) =>
                            handleFilter("question_bank", value)
                          }
                        />
                        <Filter
                          title="Category"
                          options={courseCategory.map((ele) => ({
                            label: ele.title,
                            value: ele.title,
                          }))}
                          clearFilter={clearFilter}
                          onChange={(value) =>
                            handleFilter("courses_categories", value)
                          }
                        />
                      </>
                    )}
                    <Filter
                      title="Question Type"
                      options={[
                        {
                          label: "Subjective",
                          value: "Subjective",
                        },
                        {
                          label: "MCQ",
                          value: "MCQ",
                        },
                      ]}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter("question_type", value)}
                    />
                    <Filter
                      title="Difficulty"
                      options={[
                        {
                          label: "Beginner",
                          value: "Beginner",
                        },
                        {
                          label: "Intermediate",
                          value: "Intermediate",
                        },
                        {
                          label: "Advanced",
                          value: "Advanced",
                        },
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
                  <>
                    {emptyState && filterState ? (
                      "No questions found matching your criteria."
                    ) : (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader className="bg-default-100">
                            {table.getHeaderGroups().map((headerGroup) => (
                              <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                  return (
                                    <TableHead
                                      key={header.id}
                                      colSpan={header.colSpan}
                                    >
                                      {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                          )}
                                    </TableHead>
                                  );
                                })}
                              </TableRow>
                            ))}
                          </TableHeader>
                          <TableBody>
                            {table.getRowModel().rows?.length ? (
                              table.getRowModel().rows.map((row) => (
                                <TableRow
                                  className="hover:bg-default-100"
                                  key={row.id}
                                  data-state={row.getIsSelected() && "selected"}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                      {flexRender(
                                        cell.column.columnDef.cell,
                                        cell.getContext()
                                      )}
                                    </TableCell>
                                  ))}
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell
                                  colSpan={columns.length}
                                  className="h-24 last:text-center"
                                >
                                  No results found.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </>
                </div>
              </div>
              <div className="flex items-center flex-wrap gap-2 justify-between px-6 pb-6">
                {
                  <div className="flex-1 text-sm text-muted-foreground whitespace-nowrap">
                    {table.getFilteredSelectedRowModel().rows.length > 0 && (
                      <>
                        {table.getFilteredSelectedRowModel().rows.length} of{" "}
                        {table.getFilteredRowModel().rows.length} row(s)
                        selected.
                      </>
                    )}
                  </div>
                }
                <div className="flex flex-wrap items-center gap-6 lg:gap-8">
                  <div className="flex w-[100px] items-center justify-center text-sm font-medium text-muted-foreground">
                    {meta.pageCount > 0
                      ? `Page ${meta.currentPage} of 
                                    ${meta.pageCount}`
                      : "No page found"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() => fetchQuestions(1, filterValue)}
                      disabled={meta.currentPage <= 1}
                    >
                      <span className="sr-only">Go to first page</span>
                      <ChevronsLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      // onClick={() => table.previousPage()}
                      onClick={() => {
                        fetchQuestions(meta.currentPage - 1, filterValue);
                      }}
                      disabled={meta.currentPage <= 1}
                    >
                      <span className="sr-only">Go to previous page</span>
                      <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        fetchQuestions(meta.currentPage + 1, filterValue);
                      }}
                      disabled={meta.currentPage >= meta.pageCount}
                    >
                      <span className="sr-only">Go to next page</span>
                      <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                    <Button
                      variant="outline"
                      className="hidden h-8 w-8 p-0 lg:flex"
                      onClick={() =>
                        fetchQuestions(meta.pageCount, filterValue)
                      }
                      disabled={meta.currentPage >= meta.pageCount}
                    >
                      <span className="sr-only">Go to last page</span>
                      <ChevronsRight className="h-4 w-4 rtl:rotate-180" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {isCreateQuestionOpen && (
        <div className="flex flex-wrap  gap-x-5 gap-y-4">
          <Dialog
            defaultOpen={true}
            onOpenChange={(value) => {
              setIsCreateQuestionOpen(value);
              setQuestionId("");
            }}
          >
            {/* <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            {`Add Question for ${questionBank?.title}`}
                        </DialogTitle>
                    </DialogHeader> */}
            <DialogContent size="4xl" className="overflow-y-auto max-h-[90vh]">
              {/* <div className="text-sm text-default-500 space-y-4 overflow-auto justify-center flex max-h-[90vh] min-w-[1024px] "> */}
              <AddQuestion
                multiple={false}
                source={"ASSIGNMENTS"}
                questionId={questionId}
                onSave={createQuestionCallBack}
              />
              {/* </div> */}
            </DialogContent>
          </Dialog>
        </div>
      )}
    </>
  );
}

export default QuestionsTable;