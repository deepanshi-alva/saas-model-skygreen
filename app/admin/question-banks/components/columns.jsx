"use client";


import { Checkbox } from "@/components/ui/checkbox";


import { DataTableColumnHeader } from "../../course/project-list/components/data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import {
    Avatar,
    AvatarFallback,
} from "@/components/ui/avatar";
import Link from "next/link";
function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

export const columns = [
    {
        id: "select",
        header: ({ table }) => (
            <div className="min-w-[40px] flex justify-center ltr:-ml-3 rtl:-ml-2.5">
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        cell: ({ row }) => (
            <div className="min-w-[40px] flex justify-center ltr:-ml-3 rtl:-ml-2.5">
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                    className="translate-y-[2px]"
                />
            </div>
        ),
        enableSorting: false,
        enableHiding: false,
    },
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
                    {description || "N/A"}
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
        cell: ({ row }) => <DataTableRowActions row={row}/>
    }
];
