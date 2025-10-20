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

const AssignmentGrid = ({ assignment, onDelete, user }) => {
  const [open, setOpen] = React.useState(false);
  const { theme: mode } = useTheme();

  return (
    <>
      <DeleteConfirmationDialog
        deleteDescription={'Are you sure to delete it?'}
        headingMessage={' '}
        open={open}
        onClose={() => setOpen(false)}
        onConfirm={() => onDelete(assignment?.documentId)}
      />
      <Card className="hover:translate-y-1 transition-all relative courseGridBox">
        <CardHeader className="flex-row items-top gap-3 border-none mb-0">
          <div className="flex-1">
            {
            user?.role?.name === "EMPLOYEE" ?
              <div
              >
                <div className="flex gap-2 items-center">
                  <div>
                    <Avatar className="rounded h-12 w-12">
                      {/* <AvatarImage src={project?.thumbnail} alt="" /> */}
                      <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                        {assignment?.title?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-default-900 capitalize mb-1 hover:text-primary">
                      {assignment?.title}

                      {assignment?.description && (
                        <div className="text-xs font-medium text-default-600 min-h-[34px] truncate-multiline overflow-hidden">
                          <p>{assignment?.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
              :
              <Link
                href={{
                  pathname: `/admin/assignment/review-assignments/${assignment.documentId}`,
                }}
              >
                <div className="flex gap-2 items-center">
                  <div>
                    <Avatar className="rounded h-12 w-12">
                      {/* <AvatarImage src={project?.thumbnail} alt="" /> */}
                      <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                        {assignment?.title?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-default-900 capitalize mb-1 hover:text-primary">
                      {assignment?.title}

                      {assignment?.description && (
                        <div className="text-xs font-medium text-default-600 min-h-[34px] truncate-multiline overflow-hidden">
                          <p>{assignment?.description}</p>
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </Link>
            }
          </div>
          {user?.role?.name === "EMPLOYEE" ? "" : <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="flex-none h-6 w-6 bg-default-200 rounded-full hover:bg-default-300"
              >
                <MoreHorizontal className="h-4 w-4 text-default-700" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[196px]" align="end">
              {user?.role?.name === "EMPLOYEE" ? "" :
                <DropdownMenuItem className="cursor-pointer">
                  <Link
                    href={{
                      pathname: `/admin/assignment/${assignment.documentId}`,
                    }}
                    className="w-full"
                  >
                    Edit
                  </Link>
                </DropdownMenuItem>
              }

              {/* <DropdownMenuItem className="cursor-pointer">
                <Link
                  href={{
                    pathname: `/take-assessment/${assignment.documentId}`,
                  }}
                  className="w-full"

                >
                  Take Assignment
                </Link>
              </DropdownMenuItem> */}

              <DropdownMenuItem
                className={`cursor-pointer ${assignment?.currentAttempts === assignment?.valid_attempts ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={assignment?.currentAttempts === assignment?.valid_attempts}
              >
                <Link
                  href={{
                    pathname: `/take-assessment/${assignment.documentId}`,
                  }}
                  className={`w-full ${assignment?.currentAttempts === assignment?.valid_attempts ? 'pointer-events-none text-red-500 font-bold' : ''}`}
                >
                  {assignment?.currentAttempts === assignment?.valid_attempts ? (
                    <p className="flex justify-between">
                      Attempts completed
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 15 15">
                        <path fill="#38d8c2" fillRule="evenodd" d="M0 7.5a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0m7.072 3.21l4.318-5.398l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z" clipRule="evenodd" />
                      </svg>
                    </p>
                  ) : (
                    'Take Assignment'
                  )}
                </Link>
              </DropdownMenuItem>
              {user?.role?.name === "EMPLOYEE" ? "" :
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setOpen(true)}
                >
                  Delete
                </DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>}

        </CardHeader>
        <CardContent className="p-4 pt-5 pb-5">
          {user?.role?.name === "EMPLOYEE" ?
            <div>
              <div className="flex gap-2">
                <div className="flex-1 flex-col items-start text-left">
                  <div className="text-sm font-medium text-default-900 mb-3 text-left ">
                    Category:
                  </div>                                          
                  {assignment?.courses_categories && (
                    <div className="text-xs font-medium text-default-600 ">
                      {assignment?.courses_categories.slice(0, 2).map(category => <>
                        <Badge color="warning" className="mr-1">{category.title}</Badge>
                      </>)}
                      {assignment?.courses_categories?.length > 2 && <sup className="text-xs/[15px] font-bold">+{assignment?.courses_categories?.length - 2}</sup>}
                    </div>
                  )}

                </div>
              </div>
            </div>

            : <Link
              href={{
                pathname: `/admin/assignment/${assignment.documentId}`,
              }}
            >
              <div className="flex gap-2">
                <div className="flex-1 flex-col items-start text-left">
                  <div className="text-sm font-medium text-default-900 mb-3 text-left ">
                    Category:
                  </div>

                  {assignment?.courses_categories && (
                    <div className="text-xs font-medium text-default-600 ">
                      {assignment?.courses_categories.slice(0, 2).map(category => <>
                        <Badge color="warning" className="mr-1">{category.title}</Badge>
                      </>)}
                      {assignment?.courses_categories?.length > 2 && <sup className="text-xs/[15px] font-bold">+{assignment?.courses_categories?.length - 2}</sup>}
                    </div>
                  )}

                </div>
              </div>
            </Link>}

        </CardContent>
        <CardFooter className="flex justify-between border-t  p-4">
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Max Score
            </div>
            <span className="text-xs font-medium text-default-900">
              {assignment?.score}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Attempts
            </div>
            <span className="text-xs font-medium text-default-900">
              {`${assignment?.currentAttempts} / ${assignment?.valid_attempts}`}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Questions:</div>
            <span className="text-xs font-medium text-default-900">
              {assignment?.questions}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Difficulty Level</div>
            <span className="text-xs font-medium text-default-900">
              {assignment?.difficulty_level}
            </span>
          </div>

          {user?.role?.name === "EMPLOYEE" ?
            <Link
              href={{
                pathname: `/take-assessment/${assignment.documentId}`,
              }}
              className="absolute w-full course-grid-hover justify-center items-center text-center left-0 py-6 text-base"

            >
              Take Assignment
            </Link>
            :
            <Link
              href={{
                pathname: `/admin/assignment/${assignment.documentId}`,
              }}
              className="absolute w-full course-grid-hover justify-center items-center text-center left-0 py-6 text-base"

            >
              Edit
            </Link>
          }
        </CardFooter>
      </Card >
    </>
  );
};

export default AssignmentGrid;
