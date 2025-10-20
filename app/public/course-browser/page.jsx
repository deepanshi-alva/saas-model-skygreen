"use client"
import axiosInstance from '@/config/axios.config';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import admin from "@/public/images/avatar/avatar-13.jpg";
import Link from 'next/link'; // Import Link component
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "../../admin/course/FacetedFilter"
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { fetchSiteSetting } from '@/provider/slice/siteSettingSlice';
import DefaultPagination from "../../dafault-pagi";
import { useSearchParams } from 'next/navigation';
import { getFilePath } from '../../../config/file.path';

import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    AvatarGroup,
} from "@/components/ui/avatar";

import { useTheme } from "next-themes";

const Page = () => {
    const searchParams = useSearchParams();
    const category = searchParams.get("category");
    const categoryName = searchParams.get("categoryName");    

    const [courses, setCourses] = useState([]);
    console.log("courses---fromcourse", courses)
    const [emptyState, setEmptyState] = useState(false);
    const [filterState, setfilterStatus] = useState(false);
    const [filterValue, setFilterValue] = useState("");
    const [clearFilter, setClearFilter] = useState(0)
    const [filterBy, setFilterBy] = useState([])
    const [filterStatus, setFilterStatus] = useState(false);
    const [courseDepartment, setCourseDepartment] = useState([])
    console.log("courseDepartment", courseDepartment);
    const [locations, setLocations] = useState([]);
    const dispatch = useDispatch();
    const siteSetting = useSelector((state) => state.siteSetting);
    const { data, loading, error } = siteSetting || {};
    const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
    const user = useSelector((state) => state.user);
    console.log("emptyState", emptyState, "filterState", filterState);

    const [courseCategory, setCourseCategory] = useState([])

    const prioritiesColorMap = {
        high: "destructive",
        low: "info",
        medium: "warning",
    };

    const { theme: mode } = useTheme();

    useEffect(() => {
        fetchCourse()
        setFilterStatus(filterBy.length > 0)
    }, [filterBy])
    useEffect(() => {
        dispatch(fetchSiteSetting());
    }, [dispatch]);
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
    const UpdateGenerateQuery = () => {
        const params = new URLSearchParams({
            'populate[course_tags]': 'true',
            'populate[course_thumbnail]': 'true',
            'populate[course_intro_video]': 'true',
            'populate[modules][populate][topics][populate][videos]': 'true',
            'populate[modules][populate][topics][populate][files]': 'true',
            'populate[modules][populate][topics][populate][audios]': 'true',
            'populate[modules][populate][topics][populate][images]': 'true',
            'populate[modules][populate][videos]': 'true',
            'populate[modules][populate][files]': 'true',
            'populate[modules][populate][audios]': 'true',
            'populate[modules][populate][images]': 'true',
            'populate[certificate]': 'true',
            'populate[instructors]': 'true',
            'populate[departments]': 'true',
            'populate[locations]': 'true',
            'populate[courses_categories]': 'true',
            'populate[highlights]': 'true',
            'populate[roles]': 'true',
            status: "publish"
        });

        return params.toString();
    };
    const fetchCourse = async (pageNo = 1) => {
        try {
            const query = new URLSearchParams();
            if (category) {
                query.append('filters[courses_categories][id][$eq]', category);
            }
            if (filterValue) {
                query.append('filters[title][$containsi]', filterValue);
                setfilterStatus(true);
            }
            else {
                filterBy.forEach(ele => {
                    let filterKey;
                    switch (ele.type) {
                        // case 'courses_categories':
                        //     filterKey = `filters[${ele.type}][id][$eq]`;
                        //     break;
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
                url: `/api/courses?populate[modules]=true&populate[course_thumbnail][fields][0]=url&populate[instructors][fields][0]=username&populate[locations]=true&populate[departments]=true&${query}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}`,
                method: 'get',
            });


            console.log("axiosInstance", data.data);
            setCourses(data?.data || []);
            setMeta({ ...data.meta.pagination, currentPage: pageNo });
            setEmptyState(data?.data?.length === 0);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    };

    useEffect(() => {
        fetchCourse();
    }, []);

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

    return (
        <div className="space-y-5">
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800">
                {categoryName ? `Courses in ${categoryName}` : "Courses Browse"}
                </div>
            </div>
            {
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
                                {/* <Filter
                                    title="Category"
                                    options={courseCategory.map(ele => ({
                                        label: ele.title,
                                        value: ele.id,
                                    }))}
                                    clearFilter={clearFilter}
                                    onChange={(value) => handleFilter('courses_categories', value)}

                                /> */}
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
            }

            {emptyState && !filterState ? (
                <div className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
                    <div className="text-default-900 text-xl font-semibold">
                        No Record
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-12 gap-6 instructorBlock">
                        {courses.length > 0 ?
                            courses.map((courseDetail, i) =>
                            (
                                <div className="col-span-12 lg:col-span-6 2xl:col-span-4">
                                    <Card key={courseDetail.id} className="mb-4">
                                        <CardContent className="p-3 grid grid-cols-12 gap-0">

                                            <Link href={`/public/course/${courseDetail.documentId}/#overview`} className="col-span-12 lg:col-span-12 courseLightBlueBg rounded-md">
                                                <div className="w-full h-[140px] overflow-hidden bg-card">
                                                    {courseDetail?.course_thumbnail?.url ? <img src={getFilePath(courseDetail?.course_thumbnail?.url)} alt="user" className="rounded-md  mx-auto" />
                                                        : <Image src={admin} alt="user" className="rounded-md" />}</div>
                                                <div className='flex courseLightBlueBg'>
                                                    <div className="p-4 w-full">

                                                        {courseDetail.modules?.filter((ele) => ele.type === 'Module').length ? (
                                                            <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                                                {`${courseDetail.modules.filter((ele) => ele.type === 'Module').length} Modules`}
                                                            </Badge>
                                                        ) : null}

                                                        {courseDetail.modules?.filter((ele) => ele.type === 'Topic').length ? (
                                                            <Badge className="courseBadge mr-2 " color="info" variant="soft">
                                                                {`${courseDetail.modules.filter((ele) => ele.type === 'Topic').length} Topics`}
                                                            </Badge>
                                                        ) : null}

                                                        <Badge
                                                                                    color="info"
                                                                                    className="capitalize ml-0 bg-black/80 w-full max-w-max courseBadge"
                                                                                  >
                                                                                    {courseDetail?.course_mandatory
                                                                                      ? "Mandatory"
                                                                                      : "Elective"}
                                                                                    </Badge>

                                                        <h3 className='hover:text-primary  dark:text-default-100'>{courseDetail.title}</h3>

                                                        <div className="flex  mt-6 gap-10">
                                                            {courseDetail?.instructors?.length > 0 && (
                                                                <div className="flex-1">
                                                                    <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3">Trainer:</div>
                                                                    <div className="flex gap-1 items-center">
                                                                        {courseDetail.instructors.slice(0, 2).map((user, index) => (
                                                                            <Avatar key={`trainer-${index}`} className="ring-1 ring-background ring-offset-[2px] ring-offset-background h-7 w-7">
                                                                                <AvatarImage src={user.profileImageUrl} />
                                                                                <AvatarFallback>
                                                                                    {user.username ? user.username.substring(0, 2).toUpperCase() : "NA"}
                                                                                </AvatarFallback>
                                                                            </Avatar>
                                                                        ))}
                                                                        {courseDetail.instructors.length > 2 && (
                                                                            <Badge color="default" variant="outline">
                                                                                +{courseDetail.instructors.length - 2}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {courseDetail?.departments?.length > 0 && (
                                                                <div className="flex flex-col items-end">
                                                                    <div className="text-sm font-medium text-default-900 dark:text-default-100 mb-3 text-right">
                                                                        Department:
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {courseDetail.departments.slice(0, 2).map((department, index) => (
                                                                            <Badge
                                                                                key={department.id}
                                                                                color={prioritiesColorMap[department.title]}
                                                                                variant={mode === "dark" ? "solid" : "solid"}
                                                                                className="capitalize"
                                                                            >
                                                                                {department.title}
                                                                            </Badge>
                                                                        ))}
                                                                        {courseDetail.departments.length > 2 && (
                                                                            <Badge
                                                                                color="default"
                                                                                variant="outline"
                                                                                className="capitalize"
                                                                            >
                                                                                +{courseDetail.departments.length - 2}
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Link>
                                            <div className="col-span-12 lg:col-span-12">

                                               

                                                    {courseDetail?.locations?.length > 0 && (
                                                         <div className='p-4'>
                                                        <div className="flex flex-col items-end">
                                                            <div className="text-sm font-medium text-default-900 mb-3 text-right">Location:</div>
                                                            <div className="flex gap-1">
                                                                {courseDetail.locations.slice(0, 2).map((location, index) => (
                                                                    <Badge key={`location-${index}`} color="info" variant="soft">
                                                                        {location.title}
                                                                    </Badge>
                                                                ))}
                                                                {courseDetail.locations.length > 2 && (
                                                                    <Badge color="default" variant="outline">
                                                                        +{courseDetail.locations.length - 2}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                        </div>
                                                         </div>
                                                    )}
                                               
                                            </div>

                                        </CardContent >
                                    </Card >
                                </div >
                            )) :
                            ""
                        }
                    </div>
                    <DefaultPagination meta={meta} func={fetchCourse} />
                </>
            )}
        </div>
    );
};

export default Page;