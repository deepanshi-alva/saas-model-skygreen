"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReportsSnapshot from "./components/reports-snapshot";
import WelcomeBlock from "./components/welcome-block";
import TopCustomers from "./components/top-customers";
import GradiantRadialBar from "./components/gradiant-radial-bar";
import BlueRadialBar from "./components/blue-radial-bar";
import Image from "next/image";
import admin from "@/public/images/avatar/avatar-13.jpg"
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button'
import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import { useAppSelector } from "@/provider/Store";
import axiosInstance from "@/config/axios.config";
import { Rating } from "@/components/ui/rating";
import Link from 'next/link';
import { Check, Play } from "lucide-react";
import { getFilePath } from "../../../config/file.path";

const DashboardPageView = ({ trans }) => {

  const user = useAppSelector((state) => state.user);

  const [courseDetails, setCourseDetails] = useState([])
  const [toptrainers, setTopTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  console.log("toptrainers", toptrainers);

  const getTopInstructors = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance({
        // url: '/api/ratings?populate=trainer&filters[trainer][$ne]',  
        // url: '/api/ratings?populate[trainer][populate][profileImage][fields][0]=url&populate[trainer][populate][courses][fields][0]=title&filters[trainer][$ne]',
        url: '/api/ratings?populate[trainer][populate][profileImage][fields][0]=url&populate[trainer][populate][courses][populate][courses_categories][fields][0]=title&filters[trainer][$ne]',
        method: 'get',
      });
      console.log("getTopInstructors ", data.data);

      const trainerRatings = {};
      data.data.forEach((rating) => {
        const trainer = rating?.trainer;
        const trainerId = rating?.trainer?.id;
        const ratingValue = rating?.rate;

        if (!trainerRatings[trainerId]) {
          trainerRatings[trainerId] = {
            trainer,
            count: 0,
            totalRating: 0,
            courses: trainer.courses || [],
          };
        }
        trainerRatings[trainerId].totalRating += ratingValue;
        trainerRatings[trainerId].count += 1;
      });
      console.log(trainerRatings)
      const topTrainers = Object.values(trainerRatings).map((trainerData) => {
        return {
          trainer: trainerData.trainer,
          averageRating: (trainerData.totalRating / trainerData.count),
          coursesCategories: [...new Set(trainerData.courses?.flatMap((course) => course.courses_categories?.flatMap((cat) => cat.title) || []))],
          courseCount: trainerData.courses.length
        };
      });
      topTrainers.sort((a, b) => b.courseCount - a.courseCount);
      topTrainers.sort((a, b) => b.averageRating - a.averageRating);
      const sliceTrainers = topTrainers.length > 6 ? topTrainers.slice(0, 6) : topTrainers;
      setTopTrainers(sliceTrainers);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  };

  const getCourses = async () => {
    try {
      const { data } = await axiosInstance({
        url: `api/users/${user.id}?populate[course_enrollments][populate][course][populate][instructors]=true&populate[course_enrollments][populate][course][populate][course_thumbnail][fields][0]=url&populate[course_enrollments][populate][course][populate][modules]=true&status=published`,
        method: "GET",
      });
      console.log("getCourses", data);
      const filteredEnrollments = data.course_enrollments.filter(enrollment => enrollment.course !== null);
      setCourseDetails(filteredEnrollments);
      console.log('filter', filteredEnrollments)
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([getCourses(), getTopInstructors()]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  return (
    <div className="space-y-6">
      {/* <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          Analytics {trans?.dashboard}
        </div>
        <DatePickerWithRange />
      </div> */}
      {/* reports area */}



      <div className="grid grid-cols-12  gap-6 ">
        <div className="col-span-12 2xl:col-span-8">

          {courseDetails.length > 0 && (<>
            <div className="grid grid-cols-12 gap-6 pt-0 py-3 items-center">
              <div className="col-span-12 lg:col-span-6 courseHeading"><h2>Continue Learning...</h2></div>
              {Array.isArray(courseDetails) && courseDetails.length > 0 ? <div className="col-span-12 lg:col-span-6 text-end"><Button variant="ghost"  >Explore all
                <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5" /></svg>
              </Button></div> : ""}

            </div>
            {Array.isArray(courseDetails) && courseDetails.length > 0 ?
              (<div className="grid grid-cols-12 gap-6 instructorBlock">
                {courseDetails
                  .filter(courseDetail => courseDetail.status !== "completed")
                  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0, 3)
                  .map((courseDetail) =>
                  (
                    <div className="col-span-12 lg:col-span-4">
                      <Card key={courseDetail.id} className="mb-4">
                        <CardContent className="p-3 grid grid-cols-12 gap-0">
                          <div className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md">
                            <div className="w-full h-[114px] overflow-hidden">
                              {/* src={`${process.env.}${trainerData?.trainer?.profileImage?.url}`} */}
                              {courseDetail?.course?.course_thumbnail?.url ? <img src={getFilePath(courseDetail?.course?.course_thumbnail?.url)} alt="user" className="rounded-md  mx-auto" />
                                : <Image src={admin} alt="user" className="rounded-md" />}</div>
                            <div className="p-4">

                              {/* <Badge className="courseBadge" color="info" variant="soft">
                            {courseDetail.course.modules ? `${courseDetail.course.modules.length}` : "0"} Modules
                          </Badge> */}
                              {courseDetail.course?.modules?.filter((ele) => ele.type === 'Module').length ? (
                                <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                  {`${courseDetail.course.modules.filter((ele) => ele.type === 'Module').length} Modules`}
                                </Badge>
                              ) : null}

                              {courseDetail.course?.modules?.filter((ele) => ele.type === 'Topic').length ? (
                                <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                  {`${courseDetail.course.modules.filter((ele) => ele.type === 'Topic').length} Topics`}
                                </Badge>
                              ) : null}
                              {/*  <Link
                                    key={item.value}
                                    href={`/public/course/${course.documentId}#${item.value}`}
                                    className={cn(
                                        "text-lg font-semibold text-default-500 capitalize pb-3 border-Linkb border-transparent cursor-pointer",
                                        {
                                            "border-primary": locationName === `/public/course/${course.documentId}#${item.value}`,
                                        }
                                    )}
                                >
                                    {item.value}
                                </Link> */}
                              <br />
                              {/* /public/course/zss3g6yaagqz4t3usk34kr76#overview */}
                              <Link className="dark:text-default-100 hover:text-primary" href={`/public/course/${courseDetail?.course?.documentId}/#overview`}>{courseDetail?.course?.title}</Link>

                              <p className="py-1">
                                {courseDetail.course?.instructors?.map(
                                  (instructor, index) =>
                                    `${instructor?.firstName || instructor?.username}${index < courseDetail.course.instructors.length - 1 ? ", " : ""}`
                                )}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-12 lg:col-span-12">
                            <p className="p-4 flex flex-row justify-between">

                              <span className="w-[75%]">
                                <Progress value={courseDetail.progress} size="sm" color={courseDetail.progress === 100 ? "success" : "warning"} />
                                {courseDetail.progress === null ? '0%' : <small>{courseDetail.progress === 100 ? "completed" : `${courseDetail.progress}%`}</small>}
                              </span>

                              <span>
                                <button className="" onClick={() => gotoCourse(courseDetail?.course?.documentId, courseDetail?.topicId, courseDetail?.url)}>{courseDetail.progress === 100 ?
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 15 15">
                                    <path fill="#38d8c2" fill-rule="evenodd" d="M0 7.5a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0m7.072 3.21l4.318-5.398l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z" clip-rule="evenodd" />
                                  </svg> :
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 48 48">
                                    <defs>
                                      <mask id="ipSPlay0">
                                        <g fill="none" stroke-linejoin="round" stroke-width="4">
                                          <path fill="#fff" stroke="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" />
                                          <path fill="#000" stroke="#000" d="M20 24v-6.928l6 3.464L32 24l-6 3.464l-6 3.464z" />
                                        </g>
                                      </mask>
                                    </defs>
                                    <path fill="#f97316" d="M0 0h48v48H0z" mask="url(#ipSPlay0)" />
                                  </svg>
                                }
                                </button>
                                {/* //http://localhost:3000/public/course/video-course/l7vmki1q31gps2ty0mi74jz3 */}
                              </span>

                            </p>
                          </div>
                        </CardContent >
                      </Card >
                    </div >
                  ))}


                {/* <div className="col-span-12 lg:col-span-4">
              <Card>
                <CardContent className="p-3 grid grid-cols-12 gap-0">
                  <div className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md">
                    <div className="w-full h-[114px] overflow-hidden"><Image src={admin} alt="user" className="rounded-md" /></div>
                    <div className="p-4">
                      <Badge className="courseBadge" color="info" variant="soft">12 Courses</Badge>
                      <h3>Advanced Diploma in Design Engineering</h3>
                      <p className="py-1">Rashi Khanna</p>
                    </div>
                  </div>
                  <div className="col-span-12 lg:col-span-12">
                    <p className="p-4">
                      <Progress value={60} size="sm" />
                      <small>60%</small>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div> */}

              </div >) : <h2 className="text-md text-slate-500 font-semibold courseHeading">No Courses...</h2>
            }




          </>)}




          <div className="grid grid-cols-12 gap-6 pt-0 py-3 items-center">
            <div className="col-span-12 lg:col-span-6 courseHeading"><h2>Course Browse</h2></div>
            {Array.isArray(courseDetails) && courseDetails.length > 0 ? <div className="col-span-12 lg:col-span-6 text-end"><Button variant="ghost" onClick={() => router.push("/public/course-browser")} >Explore all
              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5" /></svg>
            </Button></div> : ""}

          </div>

          <div className="grid grid-cols-12 gap-6 instructorBlock">
            {courses.length > 0 &&
              courses
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 3)
                .map((courseDetail) => (
                  <div key={courseDetail.id} className="col-span-12 lg:col-span-4">
                    <Card className="mb-4">
                      <CardContent className="p-3 grid grid-cols-12 gap-0">
                        <Link href={`/public/course/${courseDetail.documentId}/#overview`} className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md">
                          <div className="w-full h-[114px] overflow-hidden">
                            {courseDetail?.course_thumbnail?.url ? (
                              <img
                                src={getFilePath(courseDetail?.course_thumbnail?.url)}
                                alt="user"
                                className="rounded-md mx-auto"
                              />
                            ) : (
                              <Image src={admin} alt="user" className="rounded-md" />
                            )}
                          </div>
                          <div className="flex justify-between">
                            <div className="p-4">
                              {courseDetail.modules?.filter((ele) => ele.type === 'Module').length > 0 && (
                                <Badge className="courseBadge mr-2" color="info" variant="soft">
                                  {`${courseDetail.modules.filter((ele) => ele.type === 'Module').length} Modules`}
                                </Badge>
                              )}
                              {courseDetail.modules?.filter((ele) => ele.type === 'Topic').length > 0 && (
                                <Badge className="courseBadge mr-2" color="info" variant="soft">
                                  {`${courseDetail.modules.filter((ele) => ele.type === 'Topic').length} Topics`}
                                </Badge>
                              )}
                              <div>
                                <Link className="dark:text-default-100 hover:text-primary" href={`/public/course/${courseDetail.documentId}/#overview`}>
                                  {courseDetail.title}
                                </Link>
                                <p className="py-1">
                                  {courseDetail.instructors?.map(
                                    (instructor, index) =>
                                      `${instructor?.firstName || instructor?.username}${index < courseDetail.instructors.length - 1 ? ", " : ""}`
                                  )}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </CardContent>
                    </Card>
                  </div>
                ))
            }
          </div>

          <div>

            {/* Heading */}
            {certificateData.length > 0 && (
              <>
                <div className="grid grid-cols-12 gap-6 pt-7 py-3 items-center">
                  <div className="col-span-12 lg:col-span-6 certificateeHeading">
                    <h2>Certificates</h2>
                  </div>
                  <div className="col-span-12 lg:col-span-6 text-end">
                    {visibleCount < certificateData.length && (
                      <Button variant="ghost" onClick={() => router.push("/public/my-certificate")}>
                        Explore all
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="2em"
                          height="2em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="currentColor"
                            d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5"
                          />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>

                {/* Certificates Grid */}
                <div className="grid grid-cols-12 gap-6 instructorBlock overflow-hidden">
                  <AnimatePresence>
                    {certificateData.slice(0, visibleCount).map((item, i) => (
                      <motion.div
                        key={i}
                        className="col-span-12 lg:col-span-4"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                      >
                        <Card>
                          <CardContent className="p-3 grid grid-cols-12 gap-4">
                            <div className="col-span-12 lg:col-span-4">
                              {item?.certificateLogo ? (
                                <img
                                  src={item.certificateLogo}
                                  alt="Certificate Logo"
                                  style={{
                                    width: "100%",
                                    border: "none",
                                  }}
                                />
                              ) : (
                                <Image src={admin} alt="user" className="rounded-md" />
                              )}
                            </div>
                            <div className="col-span-12 lg:col-span-8">
                              <h3 className="mb-3">
                                {item.assignmentTitle} ({item.type})
                              </h3>
                              <a
                                href={item.certificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="soft">View Certificate</Button>
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            )}

          </div>




          {/* <div className="grid grid-cols-12 gap-6 pt-5 py-3 items-center">
            <div className="col-span-12 lg:col-span-6 instructorHeading"><h2>Top Instructor</h2></div>
            <div className="col-span-12 lg:col-span-6 text-end"><Button variant="ghost">Explore all
              <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5" /></svg>
            </Button></div>
          </div> */}


          {

            <>
              <div className="grid grid-cols-12 gap-6 pt-5 py-3 items-center">
                <div className="col-span-6 lg:col-span-6 instructorHeading"><h2>Top Instructor</h2></div>
                {/* {toptrainers.length > 0 ? (
                  <div className="col-span-12 lg:col-span-6 text-end"><Button variant="ghost">Explore all
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5" /></svg>
                  </Button></div>
                ) : ""} */}
              </div>

              {toptrainers.length > 0 ?
                <div className="grid grid-cols-12 gap-6 instructorBlock">

                  {toptrainers.map((trainerData) => (

                    <div className="col-span-12 lg:col-span-4">
                      <Card>
                        <CardContent className="p-3 grid grid-cols-12 gap-4">
                          <div className=" col-span-12 lg:col-span-4">
                            <Avatar className="rounded-none h-full w-full col-span-12 lg:col-span-4">
                              <AvatarImage src={getFilePath(trainerData?.trainer?.profileImage?.url)} alt="" className="rounded-md" />
                              <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                                {trainerData?.trainer?.username.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            {/* http://localhost:1337/uploads/img1_cf7eb5064a.jpg
                            {/* <img src={`${process.env.NEXT_PUBLIC_STRAPI_URL}/${courseDetail.course.course_thumbnail.url}`} alt="user" className="rounded-md" width={100} height={100} /> */}
                            {/* {trainerData?.trainer?.profileImage.url ? <img src={`${process.env.NEXT_PUBLIC_STRAPI_URL}/${trainerData?.trainer?.profileImage?.url}`} alt="user" className="rounded-md" width={100}
                              height={100} /> : <Image src={admin} alt="user" className="rounded-md" />} */}
                          </div>
                          <div className="col-span-12 lg:col-span-8">
                            <h3>{trainerData?.trainer?.username}</h3>
                            <p className="py-1 capitalize">{trainerData?.coursesCategories.length > 3 ? trainerData?.courses?.title : trainerData?.coursesCategories.join(', ') || '--'}</p>
                            <Badge color="info" variant="soft">{trainerData?.courseCount || 0} Courses</Badge>
                            <Rating style={{ maxWidth: 125 }} className="space-x-1.5" readOnly value={trainerData?.averageRating} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  ))}
                </div> : <h2 className="text-md text-slate-500 font-semibold courseHeading">No Top Trainers Available...iuguydgwdshcgdsuj</h2>
              }
            </>
          }
        </div >


        <div className="col-span-12 2xl:col-span-4">

          <TopCustomers />

        </div>

      </div >

    </div>
  );
};

export default DashboardPageView;
