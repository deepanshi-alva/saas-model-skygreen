"use client";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";

import DeleteConfirmationDialog from "@/components/delete-confirmation-dialog";
import { getFilePath } from "../../../config/file.path";

const prioritiesColorMap = {
  high: "destructive",
  low: "info",
  medium: "warning",
};
import { useTheme } from "next-themes";
export function formatDate(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}
const CategoriesGrid = ({ category, onDelete, setCategoryId, setIsCreateCategoryOpen }) => {
  const [open, setOpen] = React.useState(false);
  const { theme: mode } = useTheme();

  return (
    <>
      <DeleteConfirmationDialog
        deleteDescription={'Are You Sure For Delete ?'}
        headingMessage={' '}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDelete(category?.documentId)}
        defaultToast={false}
      />
      <Card className="hover:translate-y-1 transition-all relative courseGridBox">
        <CardHeader className="flex-row items-center gap-3 border-none mb-0">
          <div className="flex-1">
            {/* <Link
              href={{
                pathname: `/admin/course-categories/${category.documentId}`,
              }}
            > */}
              <div className="flex gap-2 items-center">

                <div>
                  <Avatar className="rounded h-12 w-12">
                    <AvatarImage src={getFilePath(category?.thumbnail?.url)} alt={category?.title || ""} />
                    <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                      {category?.title?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <div className="text-base font-semibold text-default-900 capitalize mb-1  hover:text-primary">
                    {category?.title}
                  </div>
                </div>

              </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="flex-none h-6 w-6 bg-default-200 rounded-full hover:bg-default-300"
              >
                <MoreHorizontal className="h-4 w-4 text-default-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[196px]" align="end">
              {/* <DropdownMenuItem className="cursor-pointer">
                <Link
                  href={{
                    pathname: `/admin/course-categories/${category.documentId}`,
                  }}
                  className="w-full"
                  target="_blank"
                >
                  Edit
                </Link>
              </DropdownMenuItem> */}
              <DropdownMenuItem onSelect={() => { setCategoryId(category.documentId), setIsCreateCategoryOpen(true) }}>Edit</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-5 pb-5">
          {/* logo, title,desc */}
          <Link
            href={{
              pathname: `/admin/course-categories/${category.documentId}`,
            }}
          >
            <div className="flex gap-2">
              <div className="min-h-[34px] overflow-hidden">

                {category?.description && (
                  <div className="text-xs font-medium text-default-600 ">
                    {category?.description}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </CardContent>
        <CardFooter className="flex justify-between border-t  p-4">
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Created Date:
            </div>
            <span className="text-xs font-medium text-default-900">
              {formatDate(category?.createdAt)}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Courses:</div>
            <span className="text-xs font-medium text-default-900">
              {category?.courses?.length || 0}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Author:</div>
            <span className="text-xs font-medium text-default-900">
              {category?.author?.username || category?.modifiedBy?.username}
            </span>
          </div>
          <div
            onClick={() => {
              setCategoryId(category.documentId);
              setIsCreateCategoryOpen(true);
            }}
            className="absolute w-full course-grid-hover justify-center items-center text-center left-0 py-6 text-base cursor-pointer"
            // target="_blank"
          >
            Edit
          </div>
        </CardFooter>
      </Card>
    </>
  );
};

export default CategoriesGrid;
