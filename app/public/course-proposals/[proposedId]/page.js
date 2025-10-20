"use client"
import React, { useEffect, useState } from 'react'
import Loading from './loading';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from '@/config/axios.config';
import Link from 'next/link';
import { cn } from "@/lib/utils";
import { useRouter, useParams, usePathname } from 'next/navigation';
import CourseHeader from '../../course/[courseDocumentId]/CourseHeader';
import { Button } from '@/components/ui/button';
import ProjectList from "./ProjectList";
import { DataTableColumnHeader } from ".././components/data-table-column-header";
import { DataTableRowActions } from ".././components/data-table-row-actions";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { getFilePath } from '../../../../config/file.path';
import { ArrowUpDown, Badge } from 'lucide-react';
import { formatDate } from '@/app/admin/question-banks/QuestionBankGrid';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSelector } from 'react-redux';
function minutesToHMS(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}


function page() {
  const [course, setProposedCourse] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isNotFound, setIsNotFound] = useState(false)
  const locationName = usePathname();
  const router = useRouter()
  const params = useParams()
  const proposedId = params.proposedId;
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [isCreateProposeCourseOpen, setIsCreateProposeCourseOpen] = useState();
  const [proCourseId, setProCourseId] = useState('');
  const [sorting, setSorting] = React.useState([]);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 1,
  });
  const user = useSelector((state) => state.user);

  const canView = user.role.name === 'ADMIN';

  async function fetchProposedCourse() {
    setIsLoading(true);
    try {
      const { data } = await axiosInstance({
        url: `/api/course-proposals/${proposedId}?populate[author]=true&populate[courses_categories]=true&populate[upvotes][populate][profileImage][fields][0]=url&populate[upvotes][populate][role][fields][0]=type`,
        method: 'get'
      });
      setProposedCourse({ ...data?.data, courses_categories: data.data.courses_categories?.map((ele => ele.title)).join(', '), });
    } catch (error) {
      console.log(error);
    }
    setIsLoading(false);
  };
  async function createCourse(ProposedData) {
    try {
      await axiosInstance({
        url: `/api/courses?status=draft`,
        method: 'POST',
        data: {
          data: {
            title: ProposedData?.name,
            short_description: ProposedData?.description,
            course_duration: ProposedData?.course_duration,
            instructors: ProposedData?.author?.id,
            courses_categories: ProposedData?.courses_categories.map((ele) => { return { id: ele.id } })
          }
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  async function changeRole(UserId) {
    try {
      const { data: getPermission } = await axiosInstance({
        url: `/api/users-permissions/roles`,
        method: 'get'
      });
      const { id: trainerId } = getPermission?.roles.find((ele) => ele.name === "INSTRUCTOR");
      const { data } = await axiosInstance({
        url: `/api/users/${UserId}`,
        method: 'put',
        data: {
          role: trainerId
        }
      });
    } catch (error) {
      console.log(error);
    }
  };
  async function proposalAccepted() {
    if (user?.role?.name !== 'ADMIN') {
      toast.error("access denied");
      return;
    }
    try {
      // const { data: data } = await axiosInstance({
      //   url: `/api/course-proposals/${proposedId}?populate=*`,
      //   method: 'get',
      // });
      // console.log();
      // const proposalStatus = data.data?.proposal_accepted;
      const { data: updated } = await axiosInstance({
        url: `/api/course-proposals/${proposedId}?populate=*`,
        method: 'put',
        data: {
          data: {
            proposal_accepted: true
          }
        }
      });
      if (updated.data.proposal_accepted) {
        createCourse(updated?.data);
        changeRole(updated?.data?.author?.id);
      }
      console.log('updated proposal', updated.data);
      setProposedCourse((prev) => { return { ...prev, proposal_accepted: updated.data.proposal_accepted } });
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchProposedCourse()
  }, [params])
  console.log('course', course);
  const columns = [
    {
      accessorKey: "Sort",
      header: ({ column }) => {
        return <DataTableColumnHeader column={column} title="Sort" />
      },
      cell: ({ row }) => (
        <div className="  font-medium  text-card-foreground/80">
          <div className="flex space-x-3  rtl:space-x-reverse items-center">
            <span className="capitalize text-sm text-card-foreground whitespace-nowrap">
              {row?.index + 1}
            </span>
          </div>
        </div>
      ),
      sortingFn: (rowA, rowB) => rowA.index - rowB.index,
      sortDescFirst: true,
    },

    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="  font-medium  text-card-foreground/80">
          <div className="flex space-x-3  rtl:space-x-reverse items-center">
            <Avatar className=" rounded-full">
              <AvatarImage src={getFilePath(row?.original?.profileImage?.url) || ''} />
              <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                {row?.original?.username?.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <span className="capitalize text-sm text-card-foreground whitespace-nowrap">
              {(row?.original?.username || "")}
            </span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Email
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => <div className="lowercase whitespace-nowrap">{row.getValue("email")}</div>,
    },
    {
      accessorKey: "role",
      header: () => <div className="text-right">Role</div>,
      filterFn: "roleFilter",
      cell: ({ row }) => {
        return <div className="text-right font-medium">{row?.original?.role?.type || ""}</div>;
      },
    },
    // {
    //   id: "actions",
    //   header: "Action",
    //   cell: ({ row }) => <DataTableRowActions row={row} setIsCreateProposeCourseOpen={setIsCreateProposeCourseOpen} setProCourseId={setProCourseId} deleteProposal={deleteProposal} />,
    // },
  ];

  const table = useReactTable({
    data: course?.upvotes || [],
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  console.log('courses', course);
  return (
    <>
      {isLoading ? <Loading /> :
        <>
          <Card className="mb-6">
            <CardHeader className="flex-row items-center">
              <CardTitle className="flex-none capitalize p-2 text-xl font-medium capitalize"> {course.name}</CardTitle>




            </CardHeader>
            <CardContent className="border-b border-default-200">
              <div className="flex gap-6  flex-col xl:flex-row">
                <div className="flex-1">

                  <div className="mt-0 flex flex-wrap items-center gap-6">



                    {course.course_duration && (
                      <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%]  relative">
                        <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="#3d8a64" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m1-10V7h-2v7h6v-2z" />
                          </svg>
                        </span>
                        <div className="text-lg font-medium text-default-500 capitalize">
                          Duration
                        </div>
                        <div className="text-xl font-medium text-default-900">
                          {minutesToHMS(course.course_duration)}
                        </div>
                      </div>
                    )}
                    {course.author && <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%] relative">
                      <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                          <path fill="#005e2f" d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7" />
                        </svg>
                      </span>
                      <div className="text-lg font-medium text-default-500 capitalize">
                        Author Name
                      </div>
                      <div className="text-xl font-medium text-default-900">
                        {course?.author?.username}
                      </div>
                    </div>}
                    {course.description && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 lg:gap-6">
                        <div className="">
                          <div className="text-lg font-medium text-default-500 capitalize">
                            description
                          </div>
                          <div className="text-lg text-primary/90 font-medium ">
                            <p>{course.description || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    {course.courses_categories && (
                      <div className="mt-3 flex flex-wrap items-center gap-2 lg:gap-6">
                        <div className="">
                          <div className="text-lg font-medium text-default-500 capitalize">
                            Category
                          </div>
                          <div className="text-lg text-primary/90 font-medium capitalize">
                            <p>{course.courses_categories || '-'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-6 lg:gap-6 mt-6">
                    {canView && (
                      <Button
                        type="button"
                        size="xl"
                        variant="default"
                        className={`ml-auto cursor-pointer ${course?.proposal_accepted ? "bg-gray-400 opacity-70 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"} text-white`}
                        onClick={() => {
                          if (!course?.proposal_accepted) {
                            proposalAccepted(proposedId);
                          }
                        }}
                        disabled={course?.proposal_accepted} // Ensures it's disabled but visible
                      >
                        {course?.proposal_accepted ? "Already Accepted" : "Grant Proposal"}
                      </Button>
                    )}
                  </div>


                </div>
              </div>
            </CardContent>
            <div className="space-y-5">

              <CardHeader className="p-6">

                <CardTitle className="text-xl font-medium capitalize items-center flex justify-between">
                  <h3>Intersted Users</h3>
                  <div className="flex gap-3">
                  </div>
                </CardTitle>
              </CardHeader>

            </div>

            <CardContent className="border-b border-default-200">
              <ProjectList data={course?.upvotes} table={table} columns={columns} />
            </CardContent>

          </Card>

        </>
      }
    </>
  )
}

export default page