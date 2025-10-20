"use client";
import Image from "next/image";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Rating } from "@/components/ui/rating";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import axiosInstance from "@/config/axios.config";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, CheckCircle } from "lucide-react";
import CertificateGenerator from "./CertificateGenerator";
import admin from "@/public/images/avatar/avatar-13.jpg";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { getFilePath } from '../../../config/file.path';

const CourseHeader = ({ course, Path }) => {
  const router = useRouter()
  const user = useSelector((state) => state.user);
  const [enrollmentStatus, setEnrollmentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [headerInfo, setHeaderInfo] = useState();
  const [topicId, setTopicId] = useState();
  const [courseStatus, setCourseStatus] = useState();
  const [showCertificate, setShowCertificate] = useState(false)
  const [showCertificateComplitionButton, setShowCertificateComplitionButtton] = useState(false)

  const gernateCertificate = () => {
    setShowCertificate(true)
  }
  // const [showCertificateButton , setShowCertificateButton] = useState(false)
  const params = new URLSearchParams();
  params.append('filters[user][id][$eq]', user?.id);
  params.append('filters[course][documentId][$eq]', course?.documentId);
  params.append('status', 'published');
  // const user = useSelector((state)=>state.user);
  // console.log(course, 'course details here', user);
  const getUserDetails = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/users/${user?.id}?populate[0]=department&populate[1]=role&populate[2]=location`,
        method: 'get'
      });

      return data;
    } catch (error) {
      console.log(error);
    }
  };
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
        setShowCertificateComplitionButtton(true);
        setMsg("You're already enrolled")
      } else {
        const userInfo = await getUserDetails();
        let mismatchedCriteria = [];
        let isDepartmentMatch;
        let isLocationMatch;
        let isRoleMatch;

        if (!course?.departments.length) {
          isDepartmentMatch = true;
        } else {
          isDepartmentMatch = course?.departments?.some(
            (department) => department.title === userInfo?.department?.title
          );
        }
        if (!isDepartmentMatch) mismatchedCriteria.push("Department");

        if (!course?.locations.length) {
          isLocationMatch = true;
        } else {
          isLocationMatch = course?.locations.some(
            (loc) => loc?.title === userInfo?.location?.title
          )
        }
        if (!isLocationMatch) mismatchedCriteria.push("Location");

        if (!course?.roles.length) {
          isRoleMatch = true;
        } else {
          isRoleMatch = course?.roles?.some(
            (role) => role?.name === userInfo?.role?.name
          )
        }
        if (!isRoleMatch) mismatchedCriteria.push("Role");

        if (user?.role?.name === 'ADMIN' || isDepartmentMatch && isRoleMatch && isLocationMatch) {
          //new enrollment with exisiting courses
          const { data } = await axiosInstance({
            url: `/api/course-enrollments`,
            method: "POST",
            data: {
              data: {
                user: user?.id,
                course: course?.id,
                startAt: new Date(),
              }
            },
          });

          setEnrollmentStatus(true);
          setShowCertificateComplitionButtton(true);
          setMsg('Enrolled')
          toast.success('Enrollment successful');
        } else {
          let errorMessage = `You do not meet the eligibility criteria for enrolling in this course. The following criteria do not match: ${mismatchedCriteria.join(', ')}.`;

          setMsg(errorMessage);
          toast.error(errorMessage);
        }
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
      setHeaderInfo(data.meta);
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
        setCourseStatus(data.data[0]);
        setShowCertificateComplitionButtton(true);
        console.log("---course status---", data.data[0].Course_Status);
        if (data.data[0].Course_Status === "Completed") {
          setMsg("You've completed the course");
        } else {
          setMsg("You're already enrolled");
        }
      }
    })();
    HeaderInfo();
  }, [])
  const isDataFetched = useMemo(() => course?.flatList && course?.flatList.length > 0, [course]);
  async function getMountVideo() {
    let topicId, url;
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: 'get'
      });
      //else get last watched video
      topicId = Number(data?.data[0]?.last_watched_lec);
      url = data?.data[0]?.last_watched_lec_vid;
      console.log(topicId, 'topic id', url, 'urlccc');
      if (!topicId && !url && isDataFetched) {
        //else get first video of course
        const list = course.flatList[0];
        console.log('log from the last watched', list)
        if (list.type === 'Topic') {
          topicId = list.id;
          url = list.videoUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${list.videoUrl}` : '';
        } else {
          const topic = list?.topics[0];
          topicId = topic.id;
          url = topic.videoUrl ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${topic.videoUrl}` : '';
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTopicId(topicId);
      localStorage.setItem('topicId', topicId);
      localStorage.setItem('videoUrl', url);
    };
  }
  useEffect(() => {
    if (isDataFetched)
      getMountVideo();
  }, [isDataFetched]);

  const gotoCourse = (documentId) => {
    sessionStorage.setItem('routeDetail', JSON.stringify(Path));
    window.location.hash = undefined;
    router.push(`/public/course/video-course/${documentId}/${topicId}`)
  };
  console.log(course, 'and ', user)

  const [ratingsData, setRatingsData] = useState(null);
  const fetchRatings = async () => {
    try {
      const { data } = await axiosInstance({
        //http://localhost:1337/api/ratings?filters[course][documentId][$eq]=zss3g6yaagqz4t3usk34kr76
        url: `/api/ratings?filters[course][documentId][$eq]=${course?.documentId}`,
        method: "GET",
      });
      const ratings = data.data || []; // Default to an empty array if no data
      setRatingsData(processRatings(ratings));
    } catch (error) {
      console.error("Error fetching ratings:", error);
      setRatingsData(processRatings([])); // Set default values on error
    }
  };

  console.log("ratingsData123", ratingsData);


  // Process ratings data
  const processRatings = (ratings) => {
    const ratingsCount = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;

    ratings.forEach((entry) => {
      const rate = entry.rate || 0; // Default rate to 0 if missing
      if (rate in ratingsCount) {
        ratingsCount[rate] += 1;
      }
      totalRating += rate;
    });

    const totalReviews = Object.values(ratingsCount).reduce((sum, count) => sum + count, 0);
    const averageRating = totalReviews > 0 ? totalRating / totalReviews : 0;

    return {
      ratingsCount,
      totalReviews,
      averageRating: averageRating.toFixed(1), // Default to "0.0"
      averageRatingPercentage: totalReviews > 0 ? ((averageRating / 5) * 100).toFixed(1) : "0.0", // Default to "0.0%"
    };
  };

  useEffect(() => {
    fetchRatings()
  }, [])
  console.log(Path, 'path')
  console.log(topicId, 'topicId')
  console.log("this is the image url",course.course_thumbnail);
  return (
    <>
      <CardHeader className="flex flex-col md:flex-row items-center">

        <CardTitle className="flex-none capitalize p-2 text-xl font-medium">{course.title}</CardTitle>

        <div className="mt-2 md:mt-0 md:ml-0"><span className="py-3 px-5 rounded-md text-sm bg-black/80 text-white">{course.course_mandatory ? 'Mandatory' : 'Elective'}</span></div>

        {/* <div className="flex-none flex items-center gap-3">

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
        </div> */}
      </CardHeader>
      <CardContent className="border-b border-default-200">
        <div className="flex gap-6  flex-col xl:flex-row">
          <div className="flex-none">
            <div className="xl:h-[400px] xl:w-[500px] w-full h-full rounded-md">
              {course.course_intro_video ? (
                <div className="video-container">
                  <video
                    controls
                    className="w-full rounded-md"
                    src={getFilePath(course.course_intro_video)}
                    alt="Course Introduction Video"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              ) : (
                // (course.thumbnail && <Image
                //   src={course.thumbnail || ''}
                //   alt={course.title || ''}
                //   className="w-full h-full object-cover rounded-md"
                //   width={148}
                //   height={148}
                //   unoptimized
                // />)
                course.course_thumbnail ? (
                  <Image
                    src={getFilePath(course.course_thumbnail)}
                    alt={course.title || "Course Thumbnail"}
                    className="w-full h-full object-cover rounded-md"
                    width={148}
                    height={148}
                    unoptimized
                  />
                ) : (
                  <Image
                    src={getFilePath(admin)} // ✅ Default admin image
                    alt="Admin Default"
                    className="w-full h-full object-cover rounded-md"
                    width={148}
                    height={148}
                    unoptimized
                  />
                )
              )}
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



              {course.course_duration && (
                <div className="border border-solid border-default-300 rounded-md py-6 px-6 lg:w-[280px] sm:w-[100%] xs:w-[100%]  relative">
                  <span className="bg-success/30 p-2 flex rounded-full w-fit absolute top-2 right-3 customRingIcon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#3d8a64" d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10m1-10V7h-2v7h6v-2z" />
                    </svg>
                  </span>
                  <div className="text-lg font-medium text-default-500 capitalize">
                    Duration
                  </div>
                  <div className="text-xl font-medium text-default-900">
                    {course.course_duration}
                  </div>
                </div>
              )}

              {course.course_completion_time && (
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
              )}

              {headerInfo?.pagination?.total !== 0 && (
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
                    {headerInfo?.pagination?.total}
                  </div>
                </div>
              )}
            </div>

            {ratingsData && ratingsData.totalReviews > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-6 mb-6 lg:gap-6">
                <div className=" space-y-1.5">
                  {/* <Rating
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
                    value={ratingsData ? ratingsData.averageRating : 0}
                    readOnly
                  /> */}
                  <Rating
                    style={{ maxWidth: 195 }}
                    itemStyles={{
                      boxBorderWidth: 0,
                      activeFillColor: ['#22c55e', '#22c55e', '#22c55e', '#22c55e', '#22c55e'],
                      inactiveFillColor: '#dddddd',
                    }}
                    className="space-x-1.5"
                    value={ratingsData ? ratingsData.averageRating : 0}
                    readOnly
                  />
                  <div className="text-lg font-normal text-default-500">{`Rated ${ratingsData ? ratingsData?.averageRating : 0} by ${ratingsData ? ratingsData.totalReviews : 0} learners`}</div>
                </div>
              </div>
            )}

            {course.courses_categories && (
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
            )}

            <div className="mt-3 flex flex-wrap items-center justify-between gap-6 lg:gap-6 mt-6">
              {course.instructors?.length > 0 && (
                <div className="text-lg font-medium text-default-700 capitalize">
                  Trainers
                  <AvatarGroup max={3} total={course.instructors.length > 3 && course.instructors.length - 3}>
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
              <div className="flex items-center ml-auto gap-4">
                <div className="flex flex-col items-left ml-auto">
                  {enrollmentStatus &&
                    <p className="text-md flex text-default-500 p-2 font-normal">
                      {msg} {courseStatus?.Course_Status === "Completed" && <CheckCircle className="w-5 h-5 text-green-500 ml-2" />}
                    </p>
                  }
                  <Button
                    type='button'
                    size="xl"
                    variant=""
                    color={`${courseStatus?.Course_Status !== "Completed" ? "primary" : "success"}`}
                    className="cursor-pointer"
                    onClick={() => {
                      if (enrollmentStatus) {
                        gotoCourse(course?.documentId)
                      } else {
                        makeEnrollment();
                      }
                    }}
                  // disabled={enrollmentStatus}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : enrollmentStatus ? "Go to course" : "Enroll Now"}
                  </Button>
                </div>
                {course && course?.assignments?.length > 0 && courseStatus?.Course_Status === 'Completed' &&
                  <Button
                    type='button'
                    size="xl"
                    variant=""
                    color="default"
                    className="cursor-pointer mt-auto"
                    onClick={() => {
                      router.push(`/take-assessment/${course?.assignments[0]?.documentId}`);
                    }}
                  // disabled={enrollmentStatus}
                  >
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Take Assignment"}
                  </Button>
                }
                
                {showCertificateComplitionButton && <Button
                  type='button'
                  size="xl"
                  variant=""
                  color="default"
                  className="cursor-pointer mt-3"
                  onClick={() => {
                    gernateCertificate()
                  }}
                // disabled={enrollmentStatus}
                >
                  course enrollment certificate
                </Button>}
              </div>

            </div>
            <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
              <DialogContent className="p-6" size="full">
                <CertificateGenerator course={course} enrollmentStatus={enrollmentStatus} user={user} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </>
  );
};

export default CourseHeader;
