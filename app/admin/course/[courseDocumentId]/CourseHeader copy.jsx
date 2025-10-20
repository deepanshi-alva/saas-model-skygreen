"use client";
import Image from "next/image";
import projectImage from "@/public/images/projects/project-1.png";
import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { Rating } from "@/components/ui/rating";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axios.config";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";


const CourseHeader = ({ course }) => {
  const router = useRouter()
  const user = useSelector((state) => state.user);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [headerInfo, setHeaderInfo] = useState();
  // console.log(course, 'course details here', user);
  const makeEnrollment = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?filters[user][id][$eq]=${user?.id}&filters[course][documentId][$eq]=${course?.documentId}`,
        method: 'get'
      });
      console.log(data.data)
      if (data.data.length > 0) {
        //already enrolled
        setEnrollmentStatus(true);
        setMsg("You're already enrolled")
      } else {
        //new enrollment with new courses
        const { data } = await axiosInstance({
          url: `/api/course-enrollments`,
          method: "POST",
          data: {
            course: course?.id,
            user: user?.id,
            startAt: new Date(),
          },
        });

        console.log(data);
        setEnrollmentStatus(true);
        setMsg('Enrolled')
        toast.success('enrollment successful');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const HeaderInfo = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?filters[course][documentId][$eq]=${course?.documentId}`
      });
      setHeaderInfo(data.data);
    } catch (error) {
      console.log(error)
    }
  };
  useEffect(() => {
    (async () => {
      const { data } = await axiosInstance({
        url: `api/course-enrollments?filters[user][id][$eq]=${user?.id}&filters[course][documentId][$eq]=${course?.documentId}`
      });
      console.log(user.id, "user id, ", course?.id, "course id", data.data)
      if (data.data.length > 0) {
        setEnrollmentStatus(true);
        setMsg("You're already enrolled")
      }
    })();
    HeaderInfo();
  }, [])
  const gotoCourse = (documentId) => {
    router.push(`/public/course/video-course/${documentId}`)
  };
  console.log(course, 'and ', user)
  return (
    <>
      <CardHeader className="flex-row items-center">


        <CardTitle className="flex-none capitalize p-2 text-xl font-medium capitalize"> {course.title}</CardTitle>

        <div className="flex-1"> <span className="py-3 px-5 rounded-md mr-4 text-sm  bg-black/80 text-white">{course.course_mandatory ? 'Mandatory' : 'Elective'}</span></div>

        <div className="flex-none flex items-center gap-3">

          {/* elipsis */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="icon" color="secondary">
                <Icon
                  icon="heroicons:ellipsis-horizontal-20-solid"
                  className="w-5 h-5 text-default-500"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[196px]" align="end">
              <DropdownMenuItem onSelect={() => { router.push(`/admin/course/${course.documentId}/1`) }}>Edit</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="border-b border-default-200">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-none">
            <div className="lg:h-[400px] lg:w-[500px] rounded-md">
              <Image
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover rounded-md"
                width={148}
                height={148}
                unoptimized
              />
            </div>
          </div>
          <div className="flex-1">
            {/* <div className="flex flex-wrap justify-between gap-4">
              <div className="space-x-3 rtl:space-x-reverse ">
                <Badge color="warning" variant="soft">
                  {" "}
                  High{" "}
                </Badge>
                <Badge color="info" variant="soft">
                  {" "}
                  In Progress{" "}
                </Badge>
              </div>
            </div> */}
            {/* <div className="text-sm text-default-600 w-full  mt-1">
              {course.short_description}
            </div> */}
            <div className="mt-0 flex flex-wrap items-center gap-6">


              <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%] relative">
                <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#3d8a64" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m1-10V7h-2v7h6v-2z" />
                  </svg>
                </span>
                <div className="text-lg font-medium text-default-500 capitalize">
                  Duration
                </div>
                <div className="text-xl font-medium text-default-900">
                  {course.course_duration || '-'}
                  {/* {course.createdAt} */}
                </div>
              </div>
              <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%] relative">
                <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <g fill="none">
                      <path fill="#3d8a64" d="M2 9c0-1.886 0-2.828.586-3.414S4.114 5 6 5h12c1.886 0 2.828 0 3.414.586S22 7.114 22 9c0 .471 0 .707-.146.854C21.707 10 21.47 10 21 10H3c-.471 0-.707 0-.854-.146C2 9.707 2 9.47 2 9m0 9c0 1.886 0 2.828.586 3.414S4.114 22 6 22h12c1.886 0 2.828 0 3.414-.586S22 19.886 22 18v-5c0-.471 0-.707-.146-.854C21.707 12 21.47 12 21 12H3c-.471 0-.707 0-.854.146C2 12.293 2 12.53 2 13z" />
                      <path stroke="#3d8a64" stroke-linecap="round" stroke-width="2" d="M7 3v3m10-3v3" />
                    </g>
                  </svg>
                </span>
                <div className="text-lg font-medium text-default-500 capitalize">
                  Deadline
                </div>
                <div className="text-xl font-medium text-default-900">
                  {course.course_completion_time || '-'}
                </div>
              </div>
              <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%] relative">
                <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#005e2f" d="M16 17v2H2v-2s0-4 7-4s7 4 7 4m-3.5-9.5A3.5 3.5 0 1 0 9 11a3.5 3.5 0 0 0 3.5-3.5m3.44 5.5A5.32 5.32 0 0 1 18 17v2h4v-2s0-3.63-6.06-4M15 4a3.4 3.4 0 0 0-1.93.59a5 5 0 0 1 0 5.82A3.4 3.4 0 0 0 15 11a3.5 3.5 0 0 0 0-7" />
                  </svg>
                </span>
                <div className="text-lg font-medium text-default-500 capitalize">
                  Enrollments
                </div>
                <div className="text-xl font-medium text-default-900">
                  {headerInfo?.length || 0}
                </div>
              </div>

            </div>

            <div className="flex flex-wrap items-center gap-2 mt-6 mb-6 lg:gap-6">
              <div className=" space-y-1.5">
                <Rating
                  style={{ maxWidth: 185 }}
                  itemStyles={{
                    boxBorderWidth: 0,
                    activeFillColor: ['#fff', '#fff', '#fff', '#fff', '#fff'],
                    activeBoxColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                    //activeBoxBorderColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                    inactiveBoxColor: '#dddddd',
                    inactiveFillColor: '#ffffff',
                  }}
                  className="space-x-1.5"
                  value={3}
                  readOnly
                />
                <div className="text-lg font-normal text-default-500">Rated 3.0 by 150 learners</div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 lg:gap-6">
              <div className="">
                <div className="text-lg font-medium text-default-500 capitalize">
                  Category
                </div>
                <div className="text-lg text-primary/90 font-medium capitalize">
                  <p>{course.courses_categories || '-'}</p>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-6 lg:gap-6 mt-6">
              {course.instructors?.length > 0 && (
                <div className="text-lg font-medium text-default-700 capitalize">
                  Trainers
                  <AvatarGroup max={3} total={course.instructors?.length}>
                    {course.instructors?.map((user, index) => (
                      <Avatar
                        key={index}
                        className="w-14 h-14 ring-1 ring-background ring-offset-[2px]  ring-offset-background"
                      >
                        <AvatarImage src={user.profileImageUrl} />
                        <AvatarFallback>
                          {user?.firstName?.charAt(0) || 'U'} {user.lastName?.charAt(0) || user?.firstName?.charAt(1) || 'N'}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </AvatarGroup>
                </div>
              )}
              <div className="flex flex-col items-center ml-auto">
                {enrollmentStatus &&
                  <p className="text-md text-default-500 p-2 font-normal">
                    {msg}
                  </p>
                }
                <Button
                  type='button'
                  size="xl"
                  variant=""
                  color="default"
                  className="cursor-pointer"
                  onClick={makeEnrollment}
                  disabled={enrollmentStatus}
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : enrollmentStatus ? "Go to course" : "Enroll Now"}
                </Button>
              </div>
            </div>


          </div>
        </div>
      </CardContent>
    </>
  );
};

export default CourseHeader;
