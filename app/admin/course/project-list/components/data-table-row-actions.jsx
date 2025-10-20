"use client";

import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";

export function DataTableRowActions({ row }) {





  return (
    <div className="flex justify-end gap-3 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            className="flex h-6 w-6 rounded-full bg-default-100 hover:bg-default-200   p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal className="h-4 w-4 text-default-500" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem > <Link
            href={{
              pathname: `/admin/course/${row.original.documentId}`,
            }}
            className="w-full"
            target="_blank"
          >
            Preview
          </Link></DropdownMenuItem>
          <DropdownMenuItem > <Link
            href={{
              pathname: `/admin/course/${row.original.documentId}/1`,
            }}
            className="w-full"
            target="_blank"
          >
            Edit
          </Link></DropdownMenuItem>
          <DropdownMenuItem onSelect={() => { }}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
