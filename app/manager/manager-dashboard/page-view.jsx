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
// import Loading from '.././course/loading';
import Loading from "../loading";
import { Rating } from "@/components/ui/rating";
import { Tinos } from "next/font/google";

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
        const response = await axiosInstance.get(`/api/dashboard/enrollmentBarStats?year=${selectedYear}&type=manager`);
        setEnrollmentBarStats(response?.data);
      } catch (err) {
        setError(err.response?.data || err.message);
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
    fetchPieStats();
    getCourses()
  }, []);

  const course_dynamicSeries = pieStats?.topCourses?.map(course => course?.average_rating);
  const course_dynamicTitles = pieStats?.topCourses?.map(course => course?.title);

  const category_dynamicSeries = pieStats?.topCategories?.map(course => parseInt(course?.courses_count, 10));
  const category_dynamicTitles = pieStats?.topCategories?.map(course => course?.category_name);



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
          <div className="col-span-12 lg:col-span-8">
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
                  <CardContent >
                  {course_dynamicSeries?.length > 0 ? (
          <GradiantDonut dynamicSeries={course_dynamicSeries} dynamicTitles={course_dynamicTitles} />
        ) : (
          <p className="text-muted-foreground text-lg">No Activity Found</p>
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
                    <GradiantDonut dynamicSeries={category_dynamicSeries} dynamicTitles={category_dynamicTitles} />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>


          <div className="col-span-12 lg:col-span-4">

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
                <CardContent className="px-0 pt-0 min-h-[300px] pb-2">
                  <ScrollArea className="h-full">
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
