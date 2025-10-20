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
import { useSelector } from "react-redux";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { useState } from "react";

export default function DataTableRowActions({ row, setIsCreateProposeCourseOpen, setProCourseId, deleteProposal }) {

  const user = useSelector((state) => state.user);
  const [open, setOpen] = useState(false);

  const canView = row.original?.author?.id === user?.id || user.role.name === 'ADMIN';


  return (
    <>
      <DeleteConfirmationDialog
        deleteDescription={'Are you sure to delete it?'}
        headingMessage={' '}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteProposal(row?.original?.documentId)}
      />
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
                pathname: `/public/course-proposals/${row.original.documentId}`,
              }}
              className="w-full"
              target="_self"
            >
              Preview
            </Link></DropdownMenuItem>

            {canView && <>
            <DropdownMenuItem > 
              <div className="w-full" onClick={() => {
              setProCourseId(row.original.documentId);
              setIsCreateProposeCourseOpen(true);
            }}>
              Edit 
              </div>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => { setOpen(true) }}>
                Delete
              </DropdownMenuItem>
            </>}

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
