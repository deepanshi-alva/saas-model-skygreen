"use client";
import React, { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, LayoutGrid, List, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProjectGrid from "./project-grid";
// import ProjectList from "./ProjectList";
import { cn } from "@/lib/utils";
// import {
//   getCoreRowModel,
//   getFacetedRowModel,
//   getFacetedUniqueValues,
//   getFilteredRowModel,
//   getPaginationRowModel,
//   getSortedRowModel,
//   useReactTable,
// } from "@tanstack/react-table";
// import { columns } from "./project-list/components/columns";
import Blank from "@/components/blank";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { Filter } from './FacetedFilter'
import { getFilePath } from "../../../config/file.path";
const ProjectsView = ({ }) => {
  const router = useRouter()
  const [pageView, setPageView] = React.useState("grid");
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [projects, setProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState("");
  
  // const table = useReactTable({
  //   data: projects,
  //   columns,
  //   state: {
  //     sorting,
  //     columnVisibility,
  //     rowSelection,
  //     columnFilters,
  //   },
  //   enableRowSelection: true,
  //   onRowSelectionChange: setRowSelection,
  //   onSortingChange: setSorting,
  //   onColumnFiltersChange: setColumnFilters,
  //   onColumnVisibilityChange: setColumnVisibility,
  //   getCoreRowModel: getCoreRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getFacetedRowModel: getFacetedRowModel(),
  //   getFacetedUniqueValues: getFacetedUniqueValues(),
  // });
  const [courseCategory, setCourseCategory] = useState([])
  console.log("courseCategory------frorm manage", courseCategory)
  const [clearFilter, setClearFilter] = useState(0)
  const [filterBy, setFilterBy] = useState([])
  const [filterStatus, setFilterStatus] = useState(false);

  console.log("projects1234", projects);



  const getCourseStatus = (date) => {
    try {
      if (!date)
        return 'draft'
      if (date) {
        if (new Date(date) > new Date())
          return 'Scheduled'
        return 'Published'
      }
    } catch (error) {
      console.log(error)
    }
  }

  const fetchCourse = async () => {
    try {
      let publishCourseTransformed ;
      const query = new URLSearchParams();

      filterBy.forEach(ele => {
        let filterKey;
        switch (ele.type) {
          case 'courses_categories':
            filterKey = `filters[${ele.type}][id][$eq]`;
            break;
          default:
            console.warn(`Unknown filter type: ${ele.type}`);
            return;
        }

        ele.value.forEach(val => query.append(filterKey, val));
      });
      const { data } = await axiosInstance({
        url: '/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&status=published&status=draft&' + query.toString(),
        method: 'GET'
      })

      function getDocument(ele) {
        return {
          documentId: ele.documentId,
          title: ele.title,
          short_description: ele.short_description,
          status: getCourseStatus(ele.publishedAt),
          thumbnail: ele?.course_thumbnail?.url ? getFilePath(ele?.course_thumbnail?.url) : '',
          course_type: ele?.course_type,
          completed_progress: ele.completed_progress,
          createdAt: ele.createdAt,
          publishedAt: ele.publishedAt,
          mandatory: ele.course_mandatory,
          instructors: ele.instructors.map(ele => ({ id: ele.id, profileImageUrl: ele?.profileImage?.url ? getFilePath(ele?.profileImage?.url) : '' })),
          categories_title: ele.courses_categories?.map(ele => ele.title).slice(0, 2)
        }
      }
      const response = await axiosInstance({
        url: '/api/courses?populate[0]=course_thumbnail&populate[1]=instructors.profileImage&populate[2]=courses_categories&status=published&' + query.toString(),
        method: 'GET'
      })
      console.log("response from managed courses", response.data.data);

      const publishCourse = response.data.data
      // if (data.data.length === 0) {
      //   console.log("run");

      //   publishCourseTransformed = publishCourse.map(ele => {
      //     return {
      //       documentId: ele.documentId,
      //       title: ele.title,
      //       short_description: ele.short_description,
      //       status: getCourseStatus(ele.publishedAt),
      //       thumbnail: ele?.course_thumbnail?.url ? process.env.NEXT_PUBLIC_STRAPI_URL + ele?.course_thumbnail?.url : '',
      //       course_type: ele?.course_type,
      //       completed_progress: ele.completed_progress,
      //       createdAt: ele.createdAt,
      //       publishedAt: ele.publishedAt,
      //       mandatory: ele.course_mandatory,
      //       instructors: ele.instructors.map(instr => ({
      //         id: instr.id,
      //         profileImageUrl: instr?.profileImage?.url ? process.env.NEXT_PUBLIC_STRAPI_URL + instr?.profileImage?.url : ''
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

      publishCourseTransformed = publishCourse.map(ele => {
            return {
              documentId: ele.documentId,
              title: ele.title,
              short_description: ele.short_description,
              status: getCourseStatus(ele.publishedAt),
              thumbnail: ele?.course_thumbnail?.url ? getFilePath(ele?.course_thumbnail?.url) : '',
              course_type: ele?.course_type,
              completed_progress: ele.completed_progress,
              createdAt: ele.createdAt,
              publishedAt: ele.publishedAt,
              mandatory: ele.course_mandatory,
              instructors: ele.instructors.map(instr => ({
                id: instr.id,
                profileImageUrl: instr?.profileImage?.url ? getFilePath(instr?.profileImage?.url) : ''
              })),
              categories_title: ele.courses_categories?.map(cat => cat.title).slice(0, 2)
            };
          });

          setProjects(publishCourseTransformed)
      

    } catch (error) {
      console.log(error)
    }
  }

  const deleteCourse = async (id) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses/${id}`,
        method: 'DELETE'
      })
      setProjects(old => old.filter(ele => ele.documentId !== id))
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchCourse()
    setFilterStatus(filterBy.length > 0)
  }, [filterBy])

  const createCourse = () => {
    router.push('/admin/course/new/1')
  }

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
    if (!value.length) {
      setFilterBy((old) => old.filter(ele => ele.type !== type))
    } else {
      setFilterBy(old => old.length ? old.map(ele => ele.type === type ? { type, value } : ele) : [{ type, value }])
    }
  }

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
  };
  return (
    <>
      {
        (!projects.length) || ((filteredProjects.length === 0) && (searchQuery))        ?
          (<>
            <Blank className="max-w-[320px] mx-auto flex flex-col items-center justify-center h-full space-y-3">
              <div className=" text-default-900 text-xl font-semibold">
                No Course Here
              </div>
              <div className=" text-sm  text-default-600 ">
                There is no course. create If you want to create a new course then click this
                button & create new course.
              </div>
              <div></div>
              <Button onClick={createCourse}>
                <Plus className="w-4 h-4 text-primary-foreground mr-2" />
                Add Course
              </Button>
            </Blank>
          </>)
          :
          (<div className="space-y-5">

            <div className="flex items-center flex-wrap justify-between gap-4">
              <div className="text-2xl font-medium text-default-800 ">
                Manage Courses
              </div>
            </div>


            <Card>
              <CardContent className="pt-6">
                <div className="flex lg:flex-row flex-col flex-wrap gap-6">

                  <div className=" flex-1  flex gap-3">
                    {pageView === "grid" && <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                      <Input
                        placeholder="Filter Courses..."
                        value={searchQuery}
                        onChange={handleSearch}
                        className="h-8 min-w-[200px] max-w-sm"
                      />
                    </div>
                    }
                    {pageView === "list" && <div className="flex lg:flex-row flex-col w-fit flex-wrap items-center gap-2 lg:mr-2">
                      <Input
                        placeholder="Filter tasks..."
                        value={table.getColumn("title")?.getFilterValue() ?? ""}
                        onChange={(event) =>
                          table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="h-8 w-full lg:w-[250px] lg:mb-0 mb-3"
                      />
                    </div>}
                  </div>

                  <div className="flex-none flex gap-3">
                    <Filter
                      title="Category"
                      options={courseCategory.map(ele => ({
                        label: ele.title,
                        value: ele.id,
                      }))}
                      clearFilter={clearFilter}
                      onChange={(value) => handleFilter('courses_categories', value)}

                    />
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
                    <Button onClick={createCourse} className="whitespace-nowrap">
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
            {pageView === "grid" && (
              <div className="grid  xl:grid-cols-3 lg:grid-cols-2 grid-cols-1 gap-5">
                {projects?.map((project, i) => (
                  <ProjectGrid
                    project={project}
                    key={`project-grid-${i}`}
                    onDelete={deleteCourse}
                  />
                ))}
              </div>
            )}
            {/* {pageView === "list" && (
              <ProjectList data={projects} table={table} columns={columns} />
            )} */}
          </div>)
      }
    </>
  );
};

export default ProjectsView;
