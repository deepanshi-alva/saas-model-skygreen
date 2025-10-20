"use client";
import Blank from "@/components/blank";
import { useRouter } from 'next/navigation';
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/config/axios.config";
import { cn } from "@/lib/utils";
import QuestionBankGrid from "./QuestionBankGrid";
// import { columns } from "./components/columns";
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
import ProjectList from "../course/ProjectList";
import CreateQuestion from "./new/CreateQuestion";
import { Checkbox } from "@/components/ui/checkbox";


import { DataTableColumnHeader } from "../course/project-list/components/data-table-column-header";
import { DataTableRowActions } from "./components/data-table-row-actions";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import Link from "next/link";
import DefaultPagination from '../../dafault-pagi';
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}
const QuestionPageView = () => {
  const router = useRouter();
  const [pageView, setPageView] = React.useState("grid");
  // const [questions, setQuestions] = useState([
  //   { title: "Question 1", description: "This is the description for question 1" },
  //   { title: "Question 2", description: "This is the description for question 2" },
  //   { title: "Question 3", description: "This is the description for question 3" }
  // ]);
  const [rowSelection, setRowSelection] = React.useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState();
  const [questionId, setQuestionId] = useState('');
  const [sorting, setSorting] = React.useState([]);
  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data } = siteSetting || {};
  const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
  const [filterValue, setFilterValue] = useState("");
  const [filterState, setfilterStatus] = useState(false)
  const [emptyState, setEmptyState] = useState(false);
  const deleteQuestionBank = async (id) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/question-banks/${id}`,
        method: 'DELETE'
      })
      setQuestions(old => old.filter(ele => ele.documentId !== id));
      fetchQuestions();
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }
  const CreateQuestionBank = () => {
    router.push('/admin/question-banks/new');
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredQuestionBank = useMemo(() => {
    if (!searchQuery) return questions;

    const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
    return questions.filter((ele) => {
      return queryRegex.test(ele.title)
    }
    );
  }, [questions, searchQuery]);

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
    debounce(fetchQuestions, 400)()
  }, [filterValue])

  const fetchQuestions = async (pageNo = 1) => {
    try {
      const query = new URLSearchParams();
      if (filterValue) {
        query.append('filters[title][$containsi]', filterValue);
        setfilterStatus(true);
      } else {
        setfilterStatus(false);
      }
      const pageSize = meta.pageSize || 5;
      const { data } = await axiosInstance.get('/api/question-banks?populate=*&' +
        query.toString() + `&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&sort=createdAt:desc`);
      if (!data.data.length) {
        setEmptyState(true);
      } else {
        setEmptyState(false);
      }
      setQuestions(data.data);
      setMeta({ ...data.meta.pagination, currentPage: pageNo });
    } catch (err) {
      setError('Failed to fetch questions');
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);
  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);
  const createQuestionCallback = async (callbackData) => {
    const { data } = await axiosInstance({
      url: `/api/question-banks/${callbackData?.data?.documentId}?populate=*`,
      method: 'get'
    });

    setQuestions((oldQuestionBank) => {
      const existingIndex = oldQuestionBank.findIndex(
        (questionBank) => questionBank.documentId === data.data.documentId
      );
      if (existingIndex !== -1) {
        const updatedQuestionBank = [...oldQuestionBank];
        updatedQuestionBank[existingIndex] = data.data;
        return updatedQuestionBank;
      } else {
        return [...oldQuestionBank, data.data];
      }
    });

    setIsCreateQuestionOpen(false);
    setEmptyState(false);
    setQuestionId('');
  };
  console.log('questions', questions);
  const columns = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <div className="min-w-[40px] flex justify-center ltr:-ml-3 rtl:-ml-2.5">
    //       <Checkbox
    //         checked={
    //           table.getIsAllPageRowsSelected() ||
    //           (table.getIsSomePageRowsSelected() && "indeterminate")
    //         }
    //         onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //         aria-label="Select all"
    //         className="translate-y-[2px]"
    //       />
    //     </div>
    //   ),
    //   cell: ({ row }) => (
    //     <div className="min-w-[40px] flex justify-center ltr:-ml-3 rtl:-ml-2.5">
    //       <Checkbox
    //         checked={row.getIsSelected()}
    //         onCheckedChange={(value) => row.toggleSelected(!!value)}
    //         aria-label="Select row"
    //         className="translate-y-[2px]"
    //       />
    //     </div>
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        return (
          <Link
            href={{
              pathname: `/admin/question-banks/${row.original.documentId}`,
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
            {description && description.length > 10 ? `${description?.slice(0, 15)}...` : description || "N/A"}
          </div>
        );
      },
    },
    {
      accessorKey: "question.questions",
      header: "Questions",
      cell: ({ row }) => {
        const quesCount = row.original.questions?.length || 0;
        return (
          <div className="text-sm font-medium text-default-600 whitespace-nowrap">
            {quesCount || "N/A"}
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
      cell: ({ row }) => <DataTableRowActions row={row} setIsCreateQuestionOpen={setIsCreateQuestionOpen} setQuestionId={setQuestionId} />,
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
  console.log("questionId", questionId, 'isCreateQuestionOpen', isCreateQuestionOpen)
  return (
    <>
      {emptyState && !filterState ?
        (
          <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
            <div className=" text-default-900 text-xl font-semibold">
              No Question Bank Here
            </div>
            <div className=" text-sm  text-default-600 ">
              There is no Question Bank. Create one by clicking the button below.
            </div>
            <div></div>
            <Button onClick={() => { setIsCreateQuestionOpen(true); setQuestionId('new') }}>
              <Plus className="w-4 h-4 text-primary-foreground mr-2" />
              Add Question bank
            </Button>
          </Blank>
        )
        :
        (
          <div className="space-y-5">

            <div className="flex items-center flex-wrap justify-between gap-4">
              <div className="text-2xl font-medium text-default-800 ">
                Manage Question Banks
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                  <div className=" flex-1  flex flex-wrap gap-3">
                    {pageView === "grid" && <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                      <Input
                        placeholder="Search..."
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        className="h-9 min-w-[200px] max-w-sm"
                      />
                    </div>
                    }
                    {pageView === "list" && <div className="flex lg:flex-row flex-col flex-wrap items-center gap-2 lg:mr-2">
                      <Input
                        placeholder="Search..."
                        value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)}
                        className="h-9 min-w-[200px] max-w-sm"
                      />
                    </div>}
                  </div>

                  <div className="flex-none flex gap-3">
                    {/* CreateQuestionBank */}
                    <Button onClick={() => setIsCreateQuestionOpen(true)} className="whitespace-nowrap">
                      <Plus className="w-4 h-4  ltr:mr-2 rtl:ml-2 " />
                      Add Question Bank
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
                  Add Question Bank to see records.
                </div>
              </Blank>
            )
              :
              (
                <>
                  {pageView === "grid" && (
                    <>
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
                      <DefaultPagination meta={meta} func={fetchQuestions} />
                    </>
                  )}
                  {pageView === "list" && (
                    <ProjectList data={questions} table={table} columns={columns} setIsCreateQuestionOpen={setIsCreateQuestionOpen}
                      setQuestionId={setQuestionId} meta={meta} func={fetchQuestions} />
                  )}
                </>
              )}
          </div>
        )
      }
      {isCreateQuestionOpen && <div className="flex flex-wrap  gap-x-5 gap-y-4">
        <Dialog defaultOpen={true} onOpenChange={(value) => { setIsCreateQuestionOpen(value); setQuestionId('') }}>
          {/* <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            {`Add Question for ${questionBank?.title}`}
                        </DialogTitle>
                    </DialogHeader> */}
          <DialogContent size="4xl">

            <div className="text-sm text-default-500 space-y-4 overflow-auto justify-center flex overflow-auto h-[600px] w-[100%] ">
              {/* <AddQuestion multiple={false} source={"ASSIGNMENTS"} questionId={questionId} onSave={createQuestionCallBack} /> */}
              <CreateQuestion questionId={questionId} onSave={createQuestionCallback} onClose={() => { setIsCreateQuestionOpen(false); setQuestionId('') }} />
              {/* <AddCategory categoryId={categoryId} onSave={createCategoryCallback} onClose={() => setIsCreateCategoryOpen(false) }/> */}
            </div>
          </DialogContent>
        </Dialog>
      </div>}
    </>
  );
}
export default QuestionPageView;
