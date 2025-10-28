"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TopCustomers from "../../public/user-dashboard/components/top-customers/index";
import Image from "next/image";
import admin from "@/public/images/avatar/avatar-13.jpg"
import { Badge } from "@/components/ui/badge";
import { Button } from '@/components/ui/button'
import GroupedBar from "./components/grouped-bar";
import GradiantDonut from "./components/gradiant-donut";
import { ScrollArea } from "@/components/ui/scroll-area";
import TopSell from "./components/top-sell";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import Loading from '.././course/loading';
import { Rating } from "@/components/ui/rating";
import { Tinos } from "next/font/google";
import { getFilePath } from "../../../config/file.path";

const DashboardPageView = ({ trans }) => {
  const [enrollmentBarStats, setEnrollmentBarStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pieStats, setPieStats] = useState(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [toptrainers, setTopTrainers] = useState([]);

  const handleYearSelect = (year) => {
    setSelectedYear(year);
  };
  useEffect(() => {
    const fetchEnrollmentBarStats = async (selectedYear) => {
      // setLoading(true);
      setError(null);

      try {
        const response = await axiosInstance.get(`/api/dashboard/enrollmentBarStats?year=${selectedYear}&type=admin`);
        setEnrollmentBarStats(response?.data);
      } catch (err) {
        setError(err.response?.data || err.message);
        // } finally {
        //   setLoading(false);
        // }
      }
    };

    if (selectedYear) {
      fetchEnrollmentBarStats(selectedYear);
    }
  }, [selectedYear]);

  const fetchPieStats = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get('/api/dashboard/pieStats');
      setPieStats(response?.data);
    } catch (err) {
      setError(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    getTopInstructors();
    fetchPieStats();
    getCourses()
  }, []);

  const course_dynamicSeries = pieStats?.topCourses?.map(course => course?.average_rating);
  const course_dynamicTitles = pieStats?.topCourses?.map(course => course?.title);
  console.log("222course_dynamicTitles--", course_dynamicTitles)
  const category_dynamicSeries = pieStats?.topCategories?.map(course => parseInt(course?.courses_count, 10));
  const category_dynamicTitles = pieStats?.topCategories?.map(course => course?.category_name);
  console.log("category_dynamicTitles---", category_dynamicTitles)

  const getTopInstructors = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance({
        // url: '/api/ratings?populate=trainer&filters[trainer][$ne]',
        // url: '/api/ratings?populate[trainer][populate][profileImage][fields][0]=url&populate[trainer][populate][courses][fields][0]=title&filters[trainer][$ne]',
        url: '/api/ratings?populate[trainer][populate][profileImage][fields][0]=url&populate[trainer][populate][courses][populate][courses_categories][fields][0]=title&filters[trainer][$ne]',
        method: 'get',
      });
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
  console.log(toptrainers)

  const getCourses = async () => {
    try {
      const { data } = await axiosInstance({
        url: 'api/users/1?populate[course_enrollments][populate][course][populate][instructors]=true&status=published',
        method: 'get',
      });
      console.log("getCourses", data.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          Analytics {trans?.dashboard}
        </div>
        <DatePickerWithRange />
      </div> */}
      {/* reports area */}

      {loading ? <Loading /> :

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 2xl:col-span-8">
            {/* chart */}
            <div className="grid grid-cols-12 gap-6">
              <div className="col-span-12 lg:col-span-12">
                <Card>

                  <CardContent>
                    <GroupedBar dynamicSeries={enrollmentBarStats} setSelectedYear={handleYearSelect} selectedYear={selectedYear} />
                  </CardContent>
                </Card>
              </div>
            </div>


            <div className="grid grid-cols-12 gap-6 pt-7 py-3 ">
              <div className="col-span-12 lg:col-span-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Courses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {course_dynamicSeries?.length > 0 ? (
                      <GradiantDonut dynamicSeries={course_dynamicSeries} dynamicTitles={course_dynamicTitles} />
                    ) : (
                      <p className="text-muted-foreground text-center text-lg">No Activity Found</p>
                    )}
                  </CardContent>
                </Card>
              </div>
              <div className="col-span-12 lg:col-span-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Top Categories</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {category_dynamicSeries?.length > 0 ? (
                      <GradiantDonut dynamicSeries={category_dynamicSeries} dynamicTitles={category_dynamicTitles} />
                    ) : (
                      <p className="text-muted-foreground text-center text-lg">No Activity Found</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>

            {toptrainers.length > 0 &&
              <>
                <div className="grid grid-cols-12 gap-6 pt-5 py-3 items-center">
                  <div className="col-span-6 lg:col-span-6 instructorHeading"><h2>Top Instructor</h2></div>
                  <div className="col-span-6 lg:col-span-6 text-end">
                    {/* <Button variant="ghost">Explore all
                    <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24"><path fill="currentColor" d="M6 12h8.25L11 8.75l.67-.75l4.5 4.5l-4.5 4.5l-.67-.75L14.25 13H6zm15 .5a9.5 9.5 0 0 1-9.5 9.5C6.26 22 2 17.75 2 12.5A9.5 9.5 0 0 1 11.5 3a9.5 9.5 0 0 1 9.5 9.5m-1 0A8.5 8.5 0 0 0 11.5 4A8.5 8.5 0 0 0 3 12.5a8.5 8.5 0 0 0 8.5 8.5a8.5 8.5 0 0 0 8.5-8.5" /></svg>
                  </Button> */}
                  </div>
                </div>

                <div className="grid grid-cols-12 gap-6 instructorBlock">
                  {toptrainers.map((trainerData, tin) => (

                    <div className="col-span-12 lg:col-span-4" key={tin}>
                      <Card>
                        <CardContent className="p-3 grid grid-cols-12 gap-4">
                          <Avatar className="rounded-none h-full w-full col-span-12 lg:col-span-4">
                            <AvatarImage src={getFilePath(trainerData?.trainer?.profileImage?.url)} alt="" className="rounded-md" />
                            <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                              {trainerData?.trainer?.username.slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>

                          {/* </div> */}
                          <div className="col-span-12 lg:col-span-8 break-words">
                            <h3>{trainerData?.trainer?.firstName + " " + (trainerData?.trainer?.lastName || "")}</h3>
                            <p className="py-1 capitalize">{trainerData?.coursesCategories.length > 3 ? trainerData?.coursesCategories.slice(0, 3).join(', ') : trainerData?.coursesCategories.join(', ') || 'Data Science, AI'}</p>
                            <Badge color="info" variant="soft">{trainerData?.courseCount || 0} Courses</Badge>
                            <Rating style={{ maxWidth: 125 }} className="space-x-1.5" readOnly value={trainerData?.averageRating} />
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                  ))}
                </div>

              </>}


          </div>


          <div className="col-span-12 2xl:col-span-4">

            <TopCustomers />

            <div className="col-span-12 lg:col-span-4 2xl:col-span-5 pt-7 py-3">
              <Card>
                <CardHeader className="mb-0 py-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <CardTitle className="flex-1 whitespace-nowrap">
                      New Enrollments
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-0 pt-0 h-[500px] pb-2">
                  <ScrollArea className="h-full break-all">
                    <TopSell />
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>

        </div>
      }


    </div>
  );
};

export default DashboardPageView;
