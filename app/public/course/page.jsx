'use client';

import Blank from "@/components/blank";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/config/axios.config";
import admin from "@/public/images/avatar/avatar-13.jpg";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Filter } from "../../admin/course/FacetedFilter";

import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
import { useDispatch } from "react-redux";
import DefaultPagination from "./../../dafault-pagi";
import { getFilePath } from "../../../config/file.path";
const page = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterValue, setFilterValue] = useState("");
  const [emptyState, setEmptyState] = useState(true);
  const [filterState, setfilterStatus] = useState(false);
  const router = useRouter();
  const user = useSelector((state) => state.user);
  const [courseCategory, setCourseCategory] = useState([])
  const [courseDepartment, setCourseDepartment] = useState([])
  console.log("courseDepartment", courseDepartment);
  const [locations, setLocations] = useState([]);

  const [clearFilter, setClearFilter] = useState(0)
  const [filterBy, setFilterBy] = useState([])
  const [filterStatus, setFilterStatus] = useState(false);
  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data } = siteSetting || {};
  const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
  console.log(user, '...')
  const fetchCourse = async (pageNo = 1) => {
    if (!user.id) {
      return;
    }
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (filterValue) {
        query.append('filters[title][$containsi]', filterValue);
        setfilterStatus(true);
      } else {
        filterBy.forEach(ele => {
          let filterKey;
          switch (ele.type) {
            case 'courses_categories':
              filterKey = `filters[${ele.type}][id][$eq]`;
              break;
            case 'departments':
              filterKey = `filters[${ele.type}][id][$in]`
              break;
            case 'locations':
              filterKey = `filters[${ele.type}][$in]`;
              break;
            default:
              console.warn(`Unknown filter type: ${ele.type}`);
              return;
          }
          ele.value.forEach(val => query.append(filterKey, val));
        });
        setfilterStatus(false);
      }
      query.append('status', 'published');
      const pageSize = meta.pageSize;
      const { data } = await axiosInstance({
        // url: `/api/course-enrollments?populate[courses][populate][instructors][fields][0]=username&populate[courses][populate][course_thumbnail][fields][0]=url&populate[courses][populate][modules]=true&filters[user][id][$eq]=${user.id}`,
        url: `/api/courses?filters[course_enrollments][user][id]=${user.id}&populate[instructors][fields][0]=firstName&populate[instructors][fields][1]=lastName&populate[course_thumbnail][fields][0]=url&populate[modules]=true&populate[course_enrollments][filters][user][id]=${user.id}&${query}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
        method: 'get'
      });
      if (!data.data.length) {
        setEmptyState(true);
      } else {
        setEmptyState(false);
      }
      console.log("All Courses ", data.data)
      setCourses(data.data);
      setMeta({ ...data.meta.pagination, currentPage: pageNo });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchCourse();
  }, [])
  useEffect(() => {
    fetchCourse()
    setFilterStatus(filterBy.length > 0)
  }, [filterBy])
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
    debounce(fetchCourse, 400)()
  }, [filterValue])

  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);


  const getAllCategory = async () => {
    try {
      const { data } = await axiosInstance({
        url: '/api/courses-categories',
        method: 'get',
      })
      setCourseCategory(data.data)
    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    getAllCategory()
  }, [])

  const handleFilter = (type, value) => {
    console.log("handleFilter", type, value);

    if (!value.length) {
      setFilterBy((old) => old.filter(ele => ele.type !== type))
    } else {
      setFilterBy(old => old.length ? old.map(ele => ele.type === type ? { type, value } : ele) : [{ type, value }])
    }
  }

  const getAllDepartments = async () => {
    try {
      const { data } = await axiosInstance({
        url: '/api/departments',
        method: 'get',
      })
      setCourseDepartment(data.data)
    } catch (error) {
      console.log(error)
    }
  }
  useEffect(() => {
    getAllDepartments()
  }, [])

  const getAllLocations = async () => {

    try {
      const { data } = await axiosInstance({
        url: '/api/locations',
        method: 'get',
      })
      console.log("getAllLocations", data.data);
      setLocations(data.data)
    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    getAllLocations()
  }, [])
  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);
  return (
    <div className="space-y-5">

      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          My Learning
        </div>
      </div>

      {emptyState && !filterState ?
        (<Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
          <div className=" text-default-900 text-xl font-semibold">
            No Enrolled Courses
          </div>
          <div className="text-sm text-default-600">
            Looks like you're not enrolled in any courses yet. Time to change that and start learning!
          </div>
        </Blank>) :
        (
          <>
            <Card>
              <CardContent className="pt-6">
                <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                  <div className=" flex-1  flex gap-3">
                    <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                      <Input placeholder="search..." value={filterValue}
                        onChange={(event) => setFilterValue(event.target.value)} className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Filter
                      title="Category"
                      options={courseCategory.map(ele => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter('courses_categories', value)}
                    />

                    <Filter
                      title="Department"
                      options={courseDepartment.map(ele => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter('departments', value)}
                    />
                    <Filter
                      title="Location"
                      options={locations.map(ele => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter('locations', value)}
                    />

                    {filterBy.length > 0 && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setClearFilter((old) => old + 1);
                          // table.setColumnFilters([]);
                        }}
                        className="h-8 px-2 lg:px-3"
                      >
                        Reset
                        <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5">
              {courses?.map((course, i) => (
                <CourseGrid
                  project={course}
                  key={`project-grid-${i}`}
                // onDelete={deleteCourse}
                />
              ))}
            </div> */}
            <div className="grid grid-cols-12 gap-6 instructorBlock">
              {/* <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5"> */}
              {emptyState && filterState ? (

                <div className="col-span-12 flex items-center justify-center">
                  <p>No Courses found matching your criteria.</p>
                </div>
              ) :
                courses?.map((course, i) => (
                  <div className="col-span-12 lg:col-span-6 2xl:col-span-4 cursor-pointer hover:translate-y-1 transition-all relative" key={i} onClick={() => router.push(`/public/course/${course.documentId}`)}>
                    <Card className="mb-6 shadow-md rounded-lg overflow-hidden">
                      <CardContent className="p-4 grid grid-cols-12 gap-0">
                   
                        

                        {/* Course Image */}
                        <div className="col-span-12 h-[140px] overflow-hidden rounded-md bg-card">
                          <img
                            src={course?.course_thumbnail?.url ? getFilePath(course.course_thumbnail.url) : admin}
                            alt={course?.title || "Course Thumbnail"}
                            className="w-full h-full object-cover rounded-md"
                            loading="lazy"
                          />
                        </div>

                        {/* Course Info */}
                        <div className="col-span-12 p-4 bg-blue-50 rounded-md courseLightBlueBg">
                          {/* Modules & Topics Badges */}
                          <div className="flex flex-wrap gap-2 mb-2">
                            {course.modules?.filter(ele => ele.type === 'Module').length > 0 && (
                              <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                {`${course.modules.filter(ele => ele.type === 'Module').length} Modules`}
                              </Badge>
                            )}
                            {course.modules?.filter(ele => ele.type === 'Topic').length > 0 && (
                              <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                {`${course.modules.filter(ele => ele.type === 'Topic').length} Topics`}
                              </Badge>
                            )}
                            <Badge
                            className="capitalize ml-0 bg-black/80 w-full max-w-max courseBadge"
                          >
                            {course?.course_mandatory ? "Mandatory" : "Elective"}
                          </Badge>
                          </div>

                          {/* Title */}
                          <h3 className="text-base text-gray-900 hover:text-primary line-clamp-1">
                            {course?.title || "Untitled Course"}
                          </h3>

                          {/* Instructors */}
                          <p className="mt-1 text-sm text-gray-700 line-clamp-1">
                            {course.instructors?.slice(0, 2).map((el, i) => (
                              <span key={i}>
                                {el?.firstName} {el?.lastName || ""}
                                {i < course.instructors.length - 1 ? ", " : ""}
                              </span>
                            )) || "N/A"}
                          </p>
                        </div>

                        {/* Progress Bar & Button */}
                        <div className="col-span-12 flex items-center justify-between px-4 pt-4">
                          <div className="flex-1 mr-4">
                            <Progress
                              value={course?.course_enrollments?.[0]?.progress || 0}
                              size="sm"
                              color={course?.course_enrollments?.[0]?.progress === 100 ? "success" : "warning"}
                            />
                            <small className="text-gray-600 dark:text-gray-100">
                              {course?.course_enrollments?.[0]?.progress === null
                                ? "0%"
                                : course?.course_enrollments?.[0]?.progress === 100
                                  ? "Completed"
                                  : `${course?.course_enrollments?.[0]?.progress}%`}
                            </small>
                          </div>

                          <button
                            onClick={() =>
                              gotoCourse(
                                course.documentId,
                                course.topicId,
                                course.url
                              )
                            }
                            aria-label="Go to course"
                            className="text-primary hover:text-primary-dark"
                          >
                            {course?.course_enrollments?.[0]?.progress === 100 ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 15 15"
                                fill="none"
                              >
                                <path
                                  fill="#38d8c2"
                                  fillRule="evenodd"
                                  d="M0 7.5a7.5 7.5 0 1 1 15 0a7.5 7.5 0 0 1-15 0m7.072 3.21l4.318-5.398l-.78-.624l-3.682 4.601L4.32 7.116l-.64.768z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 48 48"
                                fill="none"
                              >
                                <defs>
                                  <mask id="ipSPlay0">
                                    <g
                                      fill="none"
                                      strokeLinejoin="round"
                                      strokeWidth="4"
                                      stroke="none"
                                    >
                                      <path fill="#fff" d="M24 44c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20Z" />
                                      <path fill="#000" d="M20 24v-6.928l6 3.464L32 24l-6 3.464l-6 3.464z" />
                                    </g>
                                  </mask>
                                </defs>
                                <path fill="#f97316" d="M0 0h48v48H0z" mask="url(#ipSPlay0)" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </CardContent>
                    </Card>

                  </div>
                ))}
              <div className="col-span-12 flex justify-center mt-6">
                <DefaultPagination meta={meta} func={fetchCourse} />
              </div>
            </div>
          </>)}

    </div>
  )
}

export default page