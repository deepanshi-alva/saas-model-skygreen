"use client";
import React, { useEffect } from "react";
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from "@/components/ui/card";


const AnnouncementGrid = ({ announcement}) => {
 
  // const { theme: mode } = useTheme();

  console.log("announcement", announcement)
  return (
    <>
     


      <Card className="hover:translate-y-1 transition-all relative courseGridBox mb-4">

        <CardHeader className="flex lg:flex-row flex-col flex-wrap justify-between gap-6 items-align">
          <div className="flex-1 flex flex-wrap gap-3">
            <h2 className="text-base font-semibold text-default-900 capitalize hover:text-primary">
              {announcement.title || ""}
            </h2>
          </div>

          {/* <div className="flex-none flex gap-3">
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
                <DropdownMenuItem className="cursor-pointer"
                  onClick={() => {
                    setIsAnnouncementOpen(true),
                      setAnnouncementId(announcement.documentId)
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onSelect={() => setOpen(true)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div> */}
        </ CardHeader>

        <CardContent className="p-4 pt-0">
          {announcement.cardImage && <div className="w-full max-h-[280px] bg-muted-foreground overflow-hidden rounded-md">
            <img
              className="w-full h-full object-cover"
              src={announcement?.cardImage}
              alt="card Image"
              width={500}
              height={500}
            />
          </div>}

          <div className="py-4">
            <p className="text-sm font-medium text-default-600 max-h-[180px]  overflow-hidden">
              {announcement?.description || ""}
            </p>
          </div>

          <div className="flex justify-between gap-2">
            <div>
              <div className="text-sm font-medium text-default-900 mb-3 text-left ">
                Departments:
              </div>

              {announcement?.department && (
                <div className="text-xs font-medium text-default-600">
                  {announcement?.department.slice(0, 2).map(dep => (
                    <Badge color="warning" className="mr-1" key={dep}>
                      {dep}
                    </Badge>
                  ))}
                  {announcement?.department?.length > 2 && (
                    <sup className="text-xs/[15px] font-bold">
                      +{announcement?.department?.length - 2}
                    </sup>
                  )}
                </div>
              )}

            </div>

            {/* <div>
              <div className="text-sm font-medium text-default-900 mb-3 text-left ">
                Courses:
              </div>

              {announcement?.course && (
                <div className="text-xs font-medium text-default-600">
                  {announcement?.course.slice(0, 2).map(cour => (
                    <Badge color="warning" className="mr-1" key={cour}>
                      {cour}
                    </Badge>
                  ))}
                  {announcement?.course?.length > 2 && (
                    <sup className="text-xs/[15px] font-bold">
                      +{announcement?.course?.length - 2}
                    </sup>
                  )}
                </div>
              )}

            </div> */}

            <div>
              <div className="text-sm font-medium text-default-900 mb-3 ">
                Location:
              </div>

              {announcement?.location && (
                <div className="text-xs font-medium text-default-600">
                  {announcement?.location.slice(0, 2).map(loc => (
                    <Badge color="warning" className="mr-1" key={loc}>
                      {loc}
                    </Badge>
                  ))}
                  {announcement?.location?.length > 2 && (
                    <sup className="text-xs/[15px] font-bold">
                      +{announcement?.location?.length - 2}
                    </sup>
                  )}
                </div>
              )}

            </div>

          </div>
        </CardContent>


        <CardFooter className="flex justify-between border-t  p-4">
          {/* <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Created Date
            </div>
            <span className="text-xs font-medium text-default-900">
              {announcement.createdAt.date}
              <br></br>{announcement.createdAt.time}
            </span>
          </div> */}
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">Published Date</div>
            <span className="text-xs font-medium text-default-900">
              {announcement.publishedAt.date}
              {/* <br></br>{announcement.publishedAt.time} */}
            </span>
          </div>
          <div>
            <div className="text-xs  text-default-600 mb-[2px]">
              Author
            </div>
            <div className="text-xs font-medium text-default-900">{announcement?.author?.name}</div>
            {/* <div className="w-10 h-10 rounded-full bg-background overflow-hidden relative z-20">
              
                <Image
                  src={announcement?.author?.profileImage}
                  className="w-full h-full object-cover rounded-full"
                  alt="user profile Image"
                  width={500}
                  height={500}
                />
              </div> */}
          </div>
        </CardFooter>

      </Card >


    </>
  );
};

export default AnnouncementGrid;
