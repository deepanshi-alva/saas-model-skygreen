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
import React from "react";
import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import axiosInstance from "@/config/axios.config";

export function DataTableRowActions({ row ,setIsCreateQuestionOpen,setQuestionId}) {
  const [open, setOpen] = React.useState(false);

  const deleteQuestionBank = async (docId) => {
    try {
      await axiosInstance({
        url: `/api/question-banks/${docId}`,
        method: 'DELETE'
      })
      window.location.reload();
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <>
      <DeleteConfirmationDialog
        deleteDescription={'Are you sure to delete it?'}
        headingMessage={' '}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => deleteQuestionBank(row?.original?.documentId)}
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
                pathname: `/admin/question-banks/${row.original.documentId}`,
              }}
              className="w-full"
              target="_blank"
            >
              Preview
            </Link></DropdownMenuItem>
            <DropdownMenuItem> <div
              // href={{
              //   pathname: `/admin/question-banks/${row.original.documentId}/edit`,
              // }}
              onClick={() => {
                setQuestionId(row.original.documentId), setIsCreateQuestionOpen(true)
              }}
              className="w-full"
            // target="_blank"
            >
              Edit
            </div></DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setOpen(true)}>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>

  );
}
