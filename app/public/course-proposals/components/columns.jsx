"use client";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { priorities, statuses } from "../data/data";

import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}
function minutesToHMS(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.floor(totalMinutes % 60);
  const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
export const columns = [
  // {
  // id: "select",
  // header: ({ table }) => (
  //   <div className="min-w-[40px] flex justify-center ltr:-ml-3 rtl:-ml-2.5">
  //     <Checkbox
  //       checked={
  //         table.getIsAllPageRowsSelected() ||
  //         (table.getIsSomePageRowsSelected() && "indeterminate")
  //       }
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   </div>
  // ),
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
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="name" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={{
            pathname: `/admin/course/${row.original.documentId}/1`,
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
  },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <DataTableColumnHeader column={column} title="Status" />
  //   ),
  //   cell: ({ row }) => {
  //     const status = row.original?.status
  //     return (
  //       <div className="flex  items-center">
  //         <Badge
  //           color={
  //             status === "review"
  //               ? "warning"
  //               : status === "completed"
  //                 ? "success"
  //                 : status === "draft"
  //                   ? "default"
  //                   : "info"
  //           }
  //           variant={"soft"}
  //           className=" capitalize"
  //         >
  //           {status}
  //         </Badge>
  //       </div>
  //     );
  //   },
  //   filterFn: (row, id, value) => {
  //     return value.includes(row.getValue(id));
  //   },
  // },
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
  // {
  //   accessorKey: "Upvote Users",
  //   header: "Upvote Users",
  //   cell: ({ row }) => {
  //     const team = row?.original?.instructors
  //     return (
  //       <>
  //         <AvatarGroup
  //           max={3}
  //           total={row?.original?.assign?.length}
  //           countClass="w-7 h-7"
  //         >
  //           {team?.map((user, index) => (
  //             <Avatar
  //               className="ring-1 ring-background ring-offset-[2px]  ring-offset-background h-7 w-7 "
  //               key={`assign-member-${index}`}
  //             >
  //               <AvatarImage src={user.profileImageUrl} />
  //               <AvatarFallback>
  //                 {user?.firstName?.charAt(0) || 'U'} {user.lastName?.charAt(0) || ''}
  //               </AvatarFallback>
  //             </Avatar>
  //           ))}
  //         </AvatarGroup>
  //       </>
  //     );
  //   },
  // },
  {
    accessorKey: "upvotes",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Upvote" />
    ),
    cell: ({ row }) => {
      const prioritiesColorMap = {
        high: "destructive",
        low: "info",
        medium: "warning",
      };

      // return (
      //   <Badge color={prioritiesColorMap[row.original.course_type]} className="whitespace-nowrap">
      //     {row.original.course_type}
      //   </Badge>
      // );
      return (
        <Badge
          color={prioritiesColorMap[row.original.course_type]}
          className="whitespace-nowrap bg-transparent text-current flex items-center gap-1"
        >
          <div className="text-sm font-medium text-default-600 whitespace-nowrap">
            {row.original.upvotes?.length || 0}
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M4 14h4v7a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-7h4a1.001 1.001 0 0 0 .781-1.625l-8-10c-.381-.475-1.181-.475-1.562 0l-8 10A1.001 1.001 0 0 0 4 14Z" />
          </svg>

        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
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
