"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import axiosInstance from "@/config/axios.config";
import { useAppSelector } from "@/provider/Store";
import { Icon } from "@iconify/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import DataTableColumnHeader from "./components/data-table-column-header";
import ProjectList from "../../admin/course/ProjectList";
import { getFilePath } from "../../../config/file.path";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const NEXT_PUBLIC_STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

const MyAttempts = () => {
  const router = useRouter();
  const user = useAppSelector((state) => state.user);
  const [assignments, setAssignments] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [emptyState, setEmptyState] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  // Fetch user attempts from API
  const fetchAllUserGivenAssignments = async (pageNo = 1) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get(
        `/api/attempt-contents?populate[0]=user&populate[1]=assignment.course&populate[2]=certificate&filters[user][id][$eq]=${user.id}&filters[attempt_content_status][$ne]=In Progress&sort=createdAt:desc&pagination[page]=${pageNo}&pagination[pageSize]=${meta.pageSize}`
      );

      console.log("User Attempts Data:", data.data);

      // ✅ Group attempts by assignment ID
      const groupedAssignments = {};
      data.data.forEach((attempt) => {
        const assignmentId = attempt.assignment?.id;
        if (!groupedAssignments[assignmentId]) {
          groupedAssignments[assignmentId] = {
            ...attempt,
            attempts: [attempt], // Store all attempts inside an array
          };
        } else {
          groupedAssignments[assignmentId].attempts.push(attempt);
        }
      });

      // ✅ Convert grouped object to array for table rendering
      const updatedAssignments = Object.values(groupedAssignments);

      setAssignments(updatedAssignments.reverse());
      setMeta({ ...data.meta.pagination, currentPage: pageNo });
      setEmptyState(updatedAssignments.length === 0);
    } catch (error) {
      console.error("Error fetching assignments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUserGivenAssignments();
  }, []);

  // Format date function (including time)
  const formatDateTime = (date) => {
    const d = new Date(date);
    return `${d.getDate()}-${
      d.getMonth() + 1
    }-${d.getFullYear()} ${d.getHours()}:${String(d.getMinutes()).padStart(
      2,
      "0"
    )}`;
  };

  const handlePreview = (file) => {
    setSelectedCertificate(file);
  };

  let attemptId;

  const columns = [
    {
      accessorKey: "assignment.id",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignment ID" />
      ),
      cell: ({ row }) => (
        <span className="font-medium">
          {row.original.assignment?.id || "N/A"}
        </span>
      ),
    },
    {
      accessorKey: "assignment",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assignment Name" />
      ),
      cell: ({ row }) => {
        const assignmentTitle = row.original.assignment?.title || "Unknown";
        const courseTitle =
          row.original.assignment?.course?.title || "Self Assessment";

        return (
          <div className="flex flex-col">
            <span className="font-medium text-default-900">
              {assignmentTitle}
            </span>
            <span className="text-sm text-gray-500">({courseTitle})</span>
          </div>
        );
      },
    },
    // {
    //   accessorKey: "attempts",
    //   header: ({ column }) => <DataTableColumnHeader column={column} title="Attempts" />,
    //   cell: ({ row }) => (
    //     <div className="flex flex-col gap-1">
    //       {row.original.attempts.map((attempt, index) => (
    //         attemptId = attempt.documentId,
    //         console.log("this is the attempt id", attemptId),
    //         <span key={index} className="font-medium mb-1 mt-1 text">
    //           {index + 1}
    //         </span>
    //       ))}
    //     </div>
    //   ),
    // },
    {
      accessorKey: "attempts",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attempts" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.attempts.map((attempt, index) => {
            const attemptId = attempt.documentId; // Assuming the attempt has a unique ID

            return (
              <div key={index} className="flex items-center">
                {/* Displaying Attempt Number */}
                <span className="font-medium mb-1 mt-1 text">{index + 1}</span>

                {/* Add Preview Link for Each Attempt */}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <a
                        href={`/admin/assignment/attempt-details/${attemptId}?mode=preview`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline ml-2"
                      >
                        (Preview)
                      </a>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Click to Preview Answers</span>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            );
          })}
        </div>
      ),
    },
    {
      accessorKey: "marks_obtained",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Marks Obtained" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.attempts.map(
            (attempt, index) => (
              console.log("attempt", attempt),
              (
                <span
                  key={index}
                  className="font-medium bg-info text-info-foreground rounded-full px-4 mb-1 mt-1 text-center "
                >
                  {/* {attempt.total_marks === null || attempt.total_marks === 0
                ? "Reviewing..."
                : attempt.total_marks
                } */}
                  {attempt.total_marks === null ||
                  attempt.attempt_content_status === "Complete"
                    ? "Reviewing..."
                    : attempt.total_marks}
                </span>
              )
            )
          )}
        </div>
      ),
    },
    {
      accessorKey: "attempt_date",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attempt Date" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.attempts.map((attempt, index) => {
            const attemptDate = new Date(attempt.createdAt);
            const formattedDate = `${attemptDate.getDate()}-${
              attemptDate.getMonth() + 1
            }-${attemptDate.getFullYear()} ${attemptDate.getHours()}:${String(
              attemptDate.getMinutes()
            ).padStart(2, "0")}`;
            return (
              <span key={index} className="text-gray-600 mb-1 mt-1 ">
                {formattedDate}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      accessorKey: "certificate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Certificate" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.attempts.map((attempt, index) => {
            const marks = attempt.total_marks;
            const certificate = attempt.certificate;

            return (
              <TooltipProvider key={index}>
                {marks === 0 || marks === null ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-warning mb-1 mt-1 ">
                        <Icon icon="mdi:file" className="w-6 h-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[250px] break-words text-sm">
                      <span>Certificate will be available after review.</span>
                    </TooltipContent>
                  </Tooltip>
                ) : certificate ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={() => handlePreview(certificate?.url)}
                        className="text-blue-500 hover:underline"
                      >
                        <Icon icon="mdi:file" className="w-6 h-6" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <span>Click to Preview Certificate</span>
                    </TooltipContent>
                  </Tooltip>
                ) : (
                  <span className="text-gray-500">Not Issued</span>
                )}
              </TooltipProvider>
            );
          })}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.attempts.map((attempt, index) => {
            const marks = attempt.total_marks;
            if (
              marks === null ||
              attempt.attempt_content_status === "Complete"
            ) {
              return (
                <Badge key={index} color="warning" className=" mb-1 mt-1 ">
                  Reviewing...
                </Badge>
              );
            }

            const minMarks = row.original.assignment?.min_score ?? 0;
            const finalStatus = marks >= minMarks ? "Pass" : "Fail";

            return (
              <Badge
                key={index}
                color={finalStatus === "Pass" ? "success" : "destructive"}
              >
                {finalStatus}
              </Badge>
            );
          })}
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: assignments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold mb-4">My Attempts</h1>

      {/* Assignment Table */}
      {assignments.length === 0 && emptyState ? (
        <div className="text-center py-10 text-gray-500">
          No attempts found.
        </div>
      ) : (
        <ProjectList
          table={table}
          columns={columns}
          meta={meta}
          func={fetchAllUserGivenAssignments}
        />
      )}

      {/* Certificate Preview Modal */}
      {selectedCertificate && (
        <Dialog defaultOpen onOpenChange={() => setSelectedCertificate(null)}>
          <DialogContent size="4xl" className="overflow-y-auto max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="text-base font-medium text-default-700">
                Certificate Preview
              </DialogTitle>
            </DialogHeader>
            <div className="w-full h-screen">
              <object
                data={getFilePath(selectedCertificate)}
                type="application/pdf"
                style={{ width: "100%", height: "100%" }}
                aria-label="Certificate PDF Document"
                tabIndex={0} // For accessibility: allow keyboard focus
              >
                <p>
                  Your browser does not support PDFs.
                  <a
                    href={getFilePath(selectedCertificate)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download the certificate
                  </a>
                  .
                </p>
              </object>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default MyAttempts;
