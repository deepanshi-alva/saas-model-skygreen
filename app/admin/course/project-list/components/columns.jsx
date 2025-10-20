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
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      return (
        <Link
          href={{
            pathname: `/admin/course/${row.original.documentId}/1`,
          }}
          className="flex items-center gap-2">
          <Avatar className="rounded-sm  h-8 w-8">
            <AvatarImage src={row?.original?.thumbnail} />
            <AvatarFallback className="bg-success/30 text-success">
              {row?.original?.title?.slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          <div className="max-w-[140px] truncate  ">
            <span className="font-semibold text-default-900 capitalize">
              {" "}
              {row.getValue("title")}
            </span>
          </div>
        </Link>
      );
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      console.log("row.original", row.original)
      const status = row.original?.isPublished
      return (
        <div className="flex  items-center">
          <Badge
            color={

              status
                ? "success"
                : "default"

            }
            variant={"soft"}
            className=" capitalize"
          >
             {status ? "Published" : "Draft"}
          </Badge>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "instructors",
    header: "Trainers",
    cell: ({ row }) => {
      const team = row?.original?.instructors
      return (
        <>
          <AvatarGroup
            max={3}
            total={row?.original?.assign?.length}
            countClass="w-7 h-7"
          >
            {team?.map((user, index) => (
              <Avatar
                className="ring-1 ring-background ring-offset-[2px]  ring-offset-background h-7 w-7 "
                key={`assign-member-${index}`}
              >
                <AvatarImage src={user.profileImageUrl} />
                <AvatarFallback>
                  {user?.firstName?.charAt(0) || 'U'} {user.lastName?.charAt(0) || ''}
                </AvatarFallback>
              </Avatar>
            ))}
          </AvatarGroup>
        </>
      );
    },
  },
  {
    accessorKey: "completed_progress",
    header: "Progress",
    cell: ({ row }) => {
      const percentage = row.original.completed_progress || 0
      return (
        <div className="min-w-[190px]">
          <div className="flex justify-end mb-2">
            <Label className="text-end">{percentage}%</Label>
          </div>
          <Progress value={percentage} size="sm" />
        </div>
      );
    },
  },

  {
    accessorKey: "course_type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const prioritiesColorMap = {
        high: "destructive",
        low: "info",
        medium: "warning",
      };

      return (
        <Badge color={prioritiesColorMap[row.original.course_type]} className="whitespace-nowrap">
          {row.original.course_type}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
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
    id: "actions",
    header: "Action",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
