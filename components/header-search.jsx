import React, { use, useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Icon } from "@iconify/react";
import axiosInstance from "@/config/axios.config";
import { Card, CardContent } from "@/components/ui/card";
import Image from 'next/image';
import admin from "@/public/images/avatar/avatar-13.jpg";
import { Input } from "@/components/ui/input";
import { getFilePath } from "@/config/file.path";

const HeaderSearch = ({ open, setOpen }) => {
  const [courses, setCourses] = useState([]);
  const [filterValue, setFilterValue] = useState("");
  console.log("filterValue", filterValue);
  const getCourse = async () => {
    try {
      const query = new URLSearchParams();
      if (filterValue) {
        query.append('filters[title][$containsi]', filterValue);
        // setfilterStatus(true);
      }

      query.append('sort[0]' , 'createdAt:desc')
      query.append('pagination[limit]' , '5')
      const { data } = await axiosInstance({
        url: `/api/courses?populate[modules][populate][topics]=true&populate[course_thumbnail][fields][0]=url&populate[instructors][fields][0]=username&${query}`,
        method: 'get',
      });
      console.log("Top Header-from-- search", data?.data)
      setCourses(data?.data);
    } catch (error) {
      console.log(error);
    }
  }

  const debounce = (func, delay) => {
    let debounceTimer
    return function () {
      const context = this
      const args = arguments
      clearTimeout(debounceTimer)
      debounceTimer
        = setTimeout(() => func.apply(context, args), delay)
    }
  }

  useEffect(() => {
    getCourse()
  }, [])

  useEffect(() => {
    debounce(getCourse, 400)()
  }, [filterValue])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent size="4xl" className="p-0 " hiddenCloseIcon>
        <Command>
          
          <div className="flex items-center bg-secondary border-b border-default-200 py-2">
          
            <Input
              placeholder="Type course name"
              className="h-14 m-3 text-base"
              inputWrapper="px-3.5 flex-1 border-none"
              value={filterValue}
              onChange={(event) => setFilterValue(event.target.value)}
            />
            <div className="flex-none flex items-center justify-center gap-1 pr-4">
              {/* <span className="text-sm text-default-500 font-normal select-none">
                  [esc]
                </span> */}
              <Button
                variant="ghost"
                size="sm"
                className="hover:bg-transparent text-xs hover:text-default-800 px-1"
                onClick={() => setOpen(false)}
              >
                {" "}
                <X className=" ms-5 w-5 h-5 text-default-500" />
              </Button>
            </div>
          </div>
          <CommandList className="py-5 max-h-[300px]">
            {/* <CommandEmpty>No results found.</CommandEmpty> */}
            {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-2"> */}

            <div className="grid grid-cols-12">
  {courses.length > 0 ? (
    courses .slice(0 , 5).map((courseDetail, i) => (
      <div key={courseDetail.id} className={`col-span-12 border-b mb-4 ${i < 2 ? '' : ''}`}>
        <Card className="shadow-none rounded-none">
          <CardContent>
            <Link href={`/public/course/${courseDetail.documentId}/#overview`} className="flex items-center gap-6">
              <div className="">
                {courseDetail?.course_thumbnail?.url ? (
                  <img 
                    src={getFilePath(courseDetail?.course_thumbnail?.url)}
                    alt="user" 
                    className="rounded-md mx-auto" 
                    style={{ width: "100px" }} 
                  />
                ) : (
                  <Image src={admin} alt="user" className="rounded-md" style={{ width: "100px"  }} />
                )}
              </div>
              
              <div>
                <h3 className="text-base dark:text-default-100 hover:text-primary">
                  {courseDetail.title}
                </h3>
              </div>

            </Link>
          </CardContent>
        </Card>
      </div>
    ))
  ) : (
    <CommandEmpty>No results found.</CommandEmpty>
  )}
     </div>



            {/* </div> */}
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  );
};

export default HeaderSearch;
