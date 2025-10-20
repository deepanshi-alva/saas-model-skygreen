"use client";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

const prioritiesColorMap = {
  high: "destructive",
  low: "info",
  medium: "warning",
};
import { useTheme } from "next-themes";
const CourseGrid = ({ project, onDelete }) => {
  const [open, setOpen] = React.useState(false);
  const { theme: mode } = useTheme();


  function formatDate(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
  }

  console.log(project, 'project')



  return (
    <>
      <DeleteConfirmationDialog
        deleteDescription={'Are You Sure For Delete ?'}
        headingMessage={' '}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDelete(project?.documentId)}
      />
      <Card className=" hover:translate-y-1 transition-all relative courseGridBox">
        <CardHeader className="flex-row items-center gap-3 border-none mb-0">
          <div className="flex-1">
            <Badge
              color={
                project?.status === "review"
                  ? "warning"
                  : project?.status === "completed"
                    ? "success"
                    : project?.status === "draft"
                      ? "default"
                      : "info"
              }
              variant={mode === "dark" ? "soft" : "soft"}
              className=" capitalize"
            >
              {project?.status}
            </Badge>

            <Badge
              color=""
              //variant={mode === "dark" ? "soft" : "soft"}
              className=" capitalize ml-2 bg-black/80"
            >
              {project?.mandatory ? 'Mandatory' : 'Elective'}
            </Badge>

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
              <DropdownMenuItem className="cursor-pointer">
                <Link
                  href={{
                    pathname: `/admin/course/${project.documentId}`,
                  }}
                  className="w-full"
                  target="_blank"
                >
                  Preview
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Link
                  href={{
                    pathname: `/admin/course/${project.documentId}/1`,
                  }}
                  className="w-full"
                  target="_blank"
                >
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onSelect={() => setOpen(true)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="p-4 pt-0 pb-5">
          {/* logo, title,desc */}
          <Link
            href={{
              pathname: `/admin/course/${project.documentId}/1`,
            }}
          >
            <div className="flex gap-2">
              <div>
                <Avatar className="rounded h-12 w-12">
                  <AvatarImage src={project?.thumbnail} alt="" />
                  <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                    {project?.title?.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div>
                <div className="text-base font-semibold text-default-900 capitalize mb-1 hover:text-primary">
                  {project?.title}
                </div>
                {project?.short_description && (
                  <div className="text-xs font-medium text-default-600 min-h-[34px]  overflow-hidden">
                    {project?.short_description}
                  </div>
                )}
              </div>
            </div>
          </Link>
          <div className="flex  mt-6 gap-10">
            {project?.instructors?.length > 0 && <div className="flex-1">
              <div className="text-sm font-medium text-default-900 mb-3">
                Trainer:
              </div>

              <div>
                <AvatarGroup
                  max={3}
                  total={project.instructors.length}
                  countClass="h-7 w-7"
                >
                  {project.instructors?.map((user, index) => (
                    <Avatar
                      className="ring-1 ring-background ring-offset-[2px]  ring-offset-background h-7 w-7 "
                      key={`assign-member-${index}`}
                    >
                      <AvatarImage src={user.profileImageUrl} />
                      <AvatarFallback>DC</AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
              </div>

            </div>}

            <div className="flex flex-col items-start">
              <div className="text-sm font-medium text-default-900 mb-3 text-right ">
                Type:
              </div>
              {project.course_type && (
                <Badge
                  color={prioritiesColorMap[project.course_type]}
                  variant={mode === "dark" ? "solid" : "solid"}
                  className=" capitalize"
                >
                  {project?.course_type}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-5">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-medium text-default-900 capitalize">
                Project Progress:
              </span>
              <span className="text-xs font-medium text-default-600">
                {project?.completed_progress ? project?.completed_progress : 0}%
              </span>
            </div>
            <Progress value={project?.completed_progress ? project?.completed_progress : 0} />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t  p-4">
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Created Date:
            </div>
            <span className="text-xs font-medium text-default-900">
              {formatDate(project?.createdAt)}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Publish Date:</div>
            <span className="text-xs font-medium text-default-900">
              {project?.publishedAt ? formatDate(project?.publishedAt) : '-'}
            </span>
          </div>
          
          <Link
                  href={{
                    pathname: `/admin/course/${project.documentId}/1`,
                  }}
                  className="absolute w-full course-grid-hover justify-center items-center text-center left-0 py-6 text-base"
                  target="_blank"
                >
            Edit
            </Link>
           
        </CardFooter>
      </Card>
    </>
  );
};

export default CourseGrid;
