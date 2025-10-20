"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectGrid from "./project-grid";
import ProjectList from "./ProjectList";
import { cn } from "@/lib/utils";
import { getFilePath } from "@/config/file.path";
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { columns } from "./project-list/components/columns";
import Blank from "@/components/blank";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { useSelector } from "react-redux";
import { Filter } from "./FacetedFilter";
import DefaultPagination from "../../dafault-pagi";

import { useDispatch } from "react-redux";
import { fetchSiteSetting } from "@/provider/slice/siteSettingSlice";
const ProjectsView = ({}) => {
  const router = useRouter();
  const [pageView, setPageView] = React.useState("grid");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [projects, setProjects] = useState([]);
  console.log("projects---", projects);
  const [searchQuery, setSearchQuery] = useState("");
  const [courseDepartment, setCourseDepartment] = useState([]);
  console.log("courseDepartment", courseDepartment);
  const [locations, setLocations] = useState([]);
  // const [filterValue, setFilterValue] = useState("");
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const siteSetting = useSelector((state) => state.siteSetting);
  const { data, loading, error } = siteSetting || {};
  const [meta, setMeta] = useState({
    page: 1,
    pageSize: data?.pageSize || 12,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  const [filterValue, setFilterValue] = useState("");
  const [emptyState, setEmptyState] = useState(false);
  const [filterState, setfilterStatus] = useState(false);

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });
  const [courseCategory, setCourseCategory] = useState([]);
  const [clearFilter, setClearFilter] = useState(0);
  const [filterBy, setFilterBy] = useState([]);
  const [filterStatus, setFilterStatus] = useState(false);

  useEffect(() => {
    dispatch(fetchSiteSetting());
  }, [dispatch]);

  const getCourseStatus = (date) => {
    try {
      if (!date) return "draft";
      if (date) {
        if (new Date(date) > new Date()) return "Scheduled";
        return "Published";
      }
    } catch (error) {
      console.log(error);
    }
  };

  const debounce = (func, delay) => {
    let debounceTimer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };

  useEffect(() => {
    debounce(fetchCourse, 400)();
  }, [filterValue]);
  const fetchCourse = async (pageNo = 1) => {
    try {
      let publishCourseTransformed;
      const query = new URLSearchParams();
      if (filterValue) {
        query.append("filters[title][$containsi]", filterValue);
        // setfilterStatus(true);
      } else {
        filterBy.forEach((ele) => {
          let filterKey;
          console.log("ele.type", ele.type);
          switch (ele.type) {
            case "courses_categories":
              filterKey = `filters[${ele.type}][id][$eq]`;
              break;
            case "departments":
              filterKey = `filters[${ele.type}][id][$in]`;
              break;
            case "locations":
              filterKey = `filters[${ele.type}][$in]`;
              break;
            default:
              console.warn(`Unknown filter type: ${ele.type}`);
              return;
          }

          ele.value.forEach((val) => query.append(filterKey, val));
        });
      }
      // const { data } = await axiosInstance({
      //   url: '/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&status=published&status=draft&' + query.toString(),
      //   method: 'GET'
      // })

      // function getDocument(ele) {
      //   return {
      //     documentId: ele.documentId,
      //     title: ele.title,
      //     short_description: ele.short_description,
      //     status: getCourseStatus(ele.publishedAt),
      //     thumbnail: ele?.course_thumbnail?.url ? process.env. + ele?.course_thumbnail?.url : '',
      //     course_type: ele?.course_type,
      //     completed_progress: ele.completed_progress,
      //     createdAt: ele.createdAt,
      //     publishedAt: ele.publishedAt,
      //     mandatory: ele.course_mandatory,
      //     instructors: ele.instructors.map(ele => ({ id: ele.id, profileImageUrl: ele?.profileImage?.url ? process.env. + ele?.profileImage?.url : '' })),
      //     categories_title: ele.courses_categories?.map(ele => ele.title).slice(0, 2)
      //   }
      // }

      console.log("query.toString()", query.toString());
      console.log("response ", user);
      let response;
      const pageSize = meta.pageSize || 5;
      if (user?.role?.name === "ADMIN") {
        response = await axiosInstance({
          url:
            `/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&status=draft&` +
            query.toString() +
            "&sort=updatedAt:desc",
          method: "GET",
        });
      } else {
        response = await axiosInstance({
          url:
            `/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&filters[instructors]=${user?.id}&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&status=draft&` +
            query.toString() +
            "sort=updatedAt:desc",
          method: "GET",
        });
      }

      console.log("response-- from the thsi page", response);
      const publishCourse = response.data.data;
      // if (data.data.length === 0) {
      //   console.log("run");

      //   publishCourseTransformed = publishCourse.map(ele => {
      //     return {
      //       documentId: ele.documentId,
      //       title: ele.title,
      //       short_description: ele.short_description,
      //       status: getCourseStatus(ele.publishedAt),
      //       thumbnail: ele?.course_thumbnail?.url ? process.env. + ele?.course_thumbnail?.url : '',
      //       course_type: ele?.course_type,
      //       completed_progress: ele.completed_progress,
      //       createdAt: ele.createdAt,
      //       publishedAt: ele.publishedAt,
      //       mandatory: ele.course_mandatory,
      //       instructors: ele.instructors.map(instr => ({
      //         id: instr.id,
      //         profileImageUrl: instr?.profileImage?.url ? process.env. + instr?.profileImage?.url : ''
      //       })),
      //       categories_title: ele.courses_categories?.map(cat => cat.title).slice(0, 2)
      //     };
      //   });
      //   console.log("publishCourseTransformed", publishCourseTransformed);

      // }
      // const obj = data.data.map(ele => {
      //   const ob = publishCourse.find(ele1 => ele1.documentId === ele.documentId)
      //   if (ob) {
      //     console.log("This first one is call");
      //     return getDocument(ob)
      //   }
      //   else {
      //     console.log("This second one is call");
      //     return getDocument(ele)
      //   }
      // }
      // )

      // if (!obj) {
      //   setProjects(publishCourseTransformed)
      // }else{
      //   setProjects(obj)
      // }

      publishCourseTransformed = publishCourse.map((ele) => {
        return {
          documentId: ele.documentId,
          title: ele.title,
          short_description: ele.short_description,
          status: getCourseStatus(ele.publishedAt),
          // status: ele.isPublished
          //   ? "Published"
          //   : ele.isModeration
          //     ? "Under Moderation"
          //     : "Draft",
          thumbnail: ele?.course_thumbnail?.url
            ? getFilePath(ele?.course_thumbnail?.url)
            : "",
          course_type: ele?.course_type,
          completed_progress: ele.completed_progress,
          createdAt: ele.createdAt,
          isPublished: ele.isPublished,
          publishedAt: ele.publishedAt,
          mandatory: ele.course_mandatory,
          instructors: ele.instructors.map((instr) => ({
            id: instr.id,
            firstName: instr.firstName,
            lastName: instr.lastName,
            profileImageUrl: instr?.profileImage?.url
              ? getFilePath(instr?.profileImage?.url)
              : "",
          })),
          categories_title: ele.courses_categories
            ?.map((cat) => cat.title)
            .slice(0, 2),
        };
      });

      setProjects(publishCourseTransformed);

      setMeta({ ...response.data.meta.pagination, currentPage: pageNo });
    } catch (error) {
      console.log(error);
    }
  };
  // const fetchCourse = async (pageNo = 1) => {
  //   try {
  //     const query = new URLSearchParams();

  //     // Apply filters
  //     if (filterValue) {
  //       query.append('filters[title][$containsi]', filterValue);
  //     } else {
  //       filterBy.forEach(ele => {
  //         let filterKey;
  //         switch (ele.type) {
  //           case 'courses_categories':
  //             filterKey = `filters[${ele.type}][id][$eq]`;
  //             break;
  //           case 'departments':
  //             filterKey = `filters[${ele.type}][id][$in]`;
  //             break;
  //           case 'locations':
  //             filterKey = `filters[${ele.type}][$in]`;
  //             break;
  //           default:
  //             console.warn(`Unknown filter type: ${ele.type}`);
  //             return;
  //         }
  //         ele.value.forEach(val => query.append(filterKey, val));
  //       });
  //     }

  //     const pageSize = meta.pageSize || 5;
  //     let response;

  //     // Step 1: Fetch courses with isPublished = true (published courses)
  //     response = await axiosInstance({
  //       url: `/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&filters[isPublished][$eq]=true&` + query.toString(),
  //       method: 'GET'
  //     });

  //     let courseData = response.data.data;

  //     // Step 2: If no published courses exist, fetch draft courses (isPublished = false)
  //     if (!courseData.length) {
  //       response = await axiosInstance({
  //         url: `/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&pagination[page]=${pageNo}&pagination[pageSize]=${pageSize}&filters[isPublished][$eq]=false&` + query.toString(),
  //         method: 'GET'
  //       });
  //       courseData = response.data.data;
  //     }

  //     // Transform course data
  //     const transformedCourses = courseData.map(ele => ({
  //       documentId: ele.documentId,
  //       title: ele.title,
  //       short_description: ele.short_description,
  //       status: ele.isPublished ? "Published" : "Draft",
  //       thumbnail: ele?.course_thumbnail?.url ? process.env. + ele?.course_thumbnail?.url : '',
  //       course_type: ele?.course_type,
  //       completed_progress: ele.completed_progress,
  //       createdAt: ele.createdAt,
  //       publishedAt: ele.publishedAt,
  //       mandatory: ele.course_mandatory,
  //       instructors: ele.instructors.map(instr => ({
  //         id: instr.id,
  //         firstName: instr.firstName,
  //         lastName: instr.lastName,
  //         profileImageUrl: instr?.profileImage?.url ? process.env. + instr?.profileImage?.url : ''
  //       })),
  //       categories_title: ele.courses_categories?.map(cat => cat.title).slice(0, 2)
  //     }));

  //     setProjects(transformedCourses);
  //     setMeta({ ...response.data.meta.pagination, currentPage: pageNo });
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  console.log("projects---from manage courses", projects);
  const deleteCourse = async (id) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses/${id}`,
        method: "DELETE",
      });
      setProjects((old) => old.filter((ele) => ele.documentId !== id));
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchCourse();
    setFilterStatus(filterBy.length > 0);
  }, [filterBy]);

  const createCourse = () => {
    router.push("/admin/course/new/1");
  };

  const getAllCategory = async () => {
    try {
      const { data } = await axiosInstance({
        url: "/api/courses-categories",
        method: "get",
      });
      setCourseCategory(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const getAllDepartments = async () => {
    try {
      const { data } = await axiosInstance({
        url: "/api/departments",
        method: "get",
      });
      setCourseDepartment(data.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getAllDepartments();
  }, []);

  const getAllLocations = async () => {
    try {
      const { data } = await axiosInstance({
        url: "/api/locations",
        method: "get",
      });
      console.log("getAllLocations", data.data);
      setLocations(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllLocations();
  }, []);

  useEffect(() => {
    getAllCategory();
  }, []);

  const handleFilter = (type, value) => {
    if (!value.length) {
      setFilterBy((old) => old.filter((ele) => ele.type !== type));
    } else {
      setFilterBy((old) =>
        old.length
          ? old.map((ele) => (ele.type === type ? { type, value } : ele))
          : [{ type, value }]
      );
    }
  };

  const filteredProjects = useMemo(() => {
    if (!searchQuery || !Array.isArray(projects) || projects.length === 0) {
      return projects;
    }
    const queryRegex = new RegExp(searchQuery.split("").join(".*"), "i");
    return projects.filter((project) => {
      return project?.title && queryRegex.test(project?.title);
    });
  }, [projects, searchQuery]);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
    console.log("event.target.value", event.target.value);
  };
  console.log("projects", projects);
  return (
    <>
      {!projects.length &&
      !filteredProjects.length &&
      !filterBy.length &&
      filterStatus ? (
        <>
          <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
            <div className=" text-default-900 text-xl font-semibold">
              No Course Here
            </div>
            <div className=" text-sm  text-default-600 ">
              There is no course. create If you want to create a new course then
              click this button & create new course.
            </div>
            <div></div>
            <Button onClick={createCourse}>
              <Plus className="w-4 h-4 text-primary-foreground mr-2" />
              Add Course
            </Button>
          </Blank>
        </>
      ) : (
        <>
          {
            <div className="space-y-5">
              <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                  Manage Courses
                </div>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex lg:flex-row flex-col flex-wrap justify-between gap-6">
                    <div className="flex-1 flex flex-wrap gap-3 items-center ">
                      {pageView === "grid" && (
                        <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                          <Input
                            placeholder="search..."
                            value={filterValue}
                            onChange={(event) =>
                              setFilterValue(event.target.value)
                            }
                            className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                          />
                        </div>
                      )}
                      {pageView === "list" && (
                        <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                          <Input
                            placeholder="Filter course..."
                            value={filterValue}
                            onChange={(event) =>
                              setFilterValue(event.target.value)
                            }
                            className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex-wrap flex gap-3">
                      <Filter
                        title="Category"
                        options={courseCategory.map((ele) => ({
                          label: ele.title,
                          value: ele.id,
                        }))}
                        clearFilter={clearFilter}
                        onChange={(value) =>
                          handleFilter("courses_categories", value)
                        }
                      />
                      <Filter
                        title="Department"
                        options={courseDepartment.map((ele) => ({
                          label: ele.title,
                          value: ele.id,
                        }))}
                        clearFilter={clearFilter}
                        onChange={(value) => handleFilter("departments", value)}
                      />
                      <Filter
                        title="Location"
                        options={locations.map((ele) => ({
                          label: ele.title,
                          value: ele.id,
                        }))}
                        clearFilter={clearFilter}
                        onChange={(value) => handleFilter("locations", value)}
                      />

                      {/* <Filter
                      title="Location"
                      options={locations.map(ele => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter('locations', value)}

                    /> */}
                      {filterBy.length > 0 && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            setClearFilter((old) => old + 1);
                            table.setColumnFilters([]);
                          }}
                          className="h-8 px-2 lg:px-3"
                        >
                          Reset
                          <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={createCourse}
                        className="whitespace-nowrap"
                      >
                        <Plus className="w-4 h-4  ltr:mr-2 rtl:ml-2 " />
                        Add Course
                      </Button>

                      <Button
                        size="icon"
                        variant="outline"
                        className={cn("hover:bg-transparent  ", {
                          "hover:border-primary hover:text-primary":
                            pageView === "grid",
                          "hover:border-muted-foreground hover:text-muted-foreground":
                            pageView !== "grid",
                        })}
                        color={pageView === "grid" ? "primary" : "secondary"}
                        onClick={() => setPageView("grid")}
                      >
                        <LayoutGrid className="h-5 w-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className={cn("hover:bg-transparent  ", {
                          "hover:border-primary hover:text-primary":
                            pageView === "list",
                          "hover:border-muted-foreground hover:text-muted-foreground":
                            pageView !== "list",
                        })}
                        color={pageView === "list" ? "primary" : "secondary"}
                        onClick={() => setPageView("list")}
                      >
                        <List className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          }

          {!filteredProjects.length && !(searchQuery || filterBy.length) ? (
            <Blank className="flex flex-col items-center justify-center h-full space-y-3">
              <div className="text-default-900 text-xl font-semibold">
                No Records Found
              </div>
              <div className="text-sm text-default-600">
                No results available. Adjust your filters or search terms.
              </div>
            </Blank>
          ) : (
            <>
              {pageView === "grid" && (
                <>
                  <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5 my-4">
                    {projects?.map((project, i) => (
                      <ProjectGrid
                        project={project}
                        key={`project-grid-${i}`}
                        onDelete={deleteCourse}
                      />
                    ))}
                  </div>
                  {/* <Card title="Default Pagination"> */}
                  <DefaultPagination meta={meta} func={fetchCourse} />
                  {/* </Card> */}
                </>
              )}
              {pageView === "list" && (
                <ProjectList
                  data={projects}
                  table={table}
                  columns={columns}
                  meta={meta}
                  func={fetchCourse}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default ProjectsView;
