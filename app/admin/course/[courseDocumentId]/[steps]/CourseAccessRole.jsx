"use client";
import { Label } from "@/components/ui/label";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Controller, useForm } from "react-hook-form";
import axiosInstance from "@/config/axios.config";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import DatePicker from "./DatePicker";
import { Switch } from "@/components/ui/switch";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarGroup,
} from "@/components/ui/avatar";
import { getFilePath } from "@/config/file.path";
// const styles = {
//     multiValue: (base, state) => {
//         return state.data.isFixed ? { ...base, opacity: "0.5" } : base;
//     },
//     multiValueLabel: (base, state) => {
//         return state.data.isFixed
//             ? { ...base, color: "#626262", paddingRight: 6 }
//             : base;
//     },
//     multiValueRemove: (base, state) => {
//         return state.data.isFixed ? { ...base, display: "none" } : base;
//     },
//     option: (provided, state) => ({
//         ...provided,
//         fontSize: "14px",
//     }),
// };

const styles2 = {
  multiValue: (base, state) => ({
    ...base,
    maxWidth: "100%", // Prevents text overflow
    overflow: "hidden",
    textOverflow: "ellipsis",
  }),
  multiValueLabel: (base) => ({
    ...base,
    fontSize: "14px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    cursor: "pointer",
  }),
  control: (base) => ({
    ...base,
    maxHeight: "100px", // Restricting height
    overflowY: "auto", // Enable vertical scrolling when content overflows
  }),
  valueContainer: (base) => ({
    ...base,
    maxHeight: "80px", // Maximum height for selected items
    overflowY: "auto", // Adds scroll when many items are selected
  }),
  menuList: (base) => ({
    ...base,
    maxHeight: "200px", // Limits dropdown height
    overflowY: "auto", // Enables scrolling
  }),
};

function CourseAccessRole({ course, handleBack, isPublished }) {
  const { handleSubmit, control, reset, watch } = useForm({
    mode: "onChange",
  });
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [courseConfig, setCourseConfig] = useState(
    course?.course_configuration || "Configurable"
  );
  const [selectedUserList, setSelectedUserList] = useState([]);
  const selectedUsers = watch("users");
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);

  // const [isPublished, setIsPublished] = useState(course?.isPublished || false);
  const onSubmit = (form) => {
    startTransition(async () => {
      try {
        const departmentsData =
          form?.departments?.map((ele) => Number(ele.value)) || [];
        const locationsData =
          form?.locations?.map((ele) => Number(ele.value)) || [];
        const role = form?.roles?.map((ele) => ({
          name: ele.label,
          roleId: String(ele.value),
        }));
        const usersData = form?.users?.map((user) => user.value) || [];

        const formData = {
          departments: departmentsData,
          locations: locationsData,
          roles: role,
          completed_progress: 100,
          users: usersData,
          course_configuration: courseConfig,
        };
        // let query = ''
        // if (form.publish) {
        //     query = 'status=published';
        //     // setIsPublished(true);
        // }
        // else if (!form.publish && !form.publishedAt) {
        //     query = 'status=draft';
        //     // setIsPublished(false);
        // } else if (!form.publish && form.publishedAt) {
        //     formData['publishedAt'] = form.publishedAt
        // }
        if (form.publishedAt) {
          formData["publishedAt"] = form.publishedAt;
        }
        await axiosInstance({
          url: `/api/courses/${course.documentId}?status=${
            isPublished ? "published" : "draft"
          }`,
          method: "PUT",
          data: {
            data: {
              ...formData,
              course_enrollments: {
                set: course?.course_enrollments.map((ele) => ({
                  documentId: ele.documentId,
                })),
              },
            },
          },
        });
        toast.success("Save Successful");
        router.push("/admin/course");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    });
  };

  const getRoles = async () => {
    try {
      const { data } = await axiosInstance({
        url: "/api/users-permissions/roles",
        method: "GET",
      });
      return data.roles;
    } catch (error) {
      console.log(error);
    }
  };
  const getAllLocations = async (searchQuery = "") => {
    try {
      const { data } = await axiosInstance({
        url: `/api/all-locations?status=${isPublished ? "published" : "draft"}`,
        method: "GET",
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  const getAllDepartments = async (searchQuery = "") => {
    try {
      const { data } = await axiosInstance({
        url: `/api/all-departments?status=${
          isPublished ? "published" : "draft"
        }`,
        method: "GET",
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getAllInstructor = async (searchQuery = "") => {
    const queryParams = new URLSearchParams();
    if (searchQuery) {
      queryParams.append("filters[$or][0][firstName][$containsi]", searchQuery);
      queryParams.append("filters[$or][1][lastName][$containsi]", searchQuery);
    }
    const { data } = await axiosInstance({
      url: `/api/users?${queryParams.toString()}populate=*&limit=50`,
      method: "GET",
    });
    setAllUsers(data);
    setUsers(
      data.map((ele) => ({
        label: `${ele.firstName} ${ele.lastName || ""}`,
        value: ele.id,
      }))
    );
  };

  useEffect(() => {
    getAllInstructor();
  }, []);

  useEffect(() => {
    if (!selectedUsers || !Array.isArray(selectedUsers)) return;
    const selected = allUsers.filter((user) =>
      selectedUsers.some((sel) => sel.value === user.id)
    );
    setSelectedUserList(selected);
  }, [selectedUsers, allUsers]);

  // const getInitialData = async () => {
  //     try {
  //         const roles = await getRoles();
  //         const location = await getAllLocations();
  //         const departments = await getAllDepartments();
  //         setRoles(roles || []);
  //         setLocations(location || []);
  //         setDepartments(departments || []);
  //         if (course) {
  //             const selectedDepartments = course?.departments?.length
  //                 ? course?.departments.map(ele => ({ label: ele.title, value: ele.id }))
  //                 : [];
  //             const selectedLocations = course?.locations?.length
  //                 ? course?.locations.map(ele => ({ label: ele.title, value: ele.id }))
  //                 : [];
  //             const role = course?.roles?.length
  //                 ? course?.roles.map(ele => ({ label: ele.name, value: ele.roleId }))
  //                 : [];
  //             reset({
  //                 departments: selectedDepartments,
  //                 locations: selectedLocations,
  //                 roles: role
  //             });

  //             console.log("Selected Departments:", selectedDepartments);
  //             console.log("Selected Locations:", selectedLocations);
  //             console.log("Selected Roles:", role);
  //         }
  //     } catch (error) {
  //         console.log(error);
  //     }
  // };

  const getInitialData = async () => {
    try {
      const roles = await getRoles();
      const location = await getAllLocations();
      const departments = await getAllDepartments();
      setRoles(roles || []);
      setLocations(location || []);
      setDepartments(departments || []);
      if (course?.course_configuration) {
        setCourseConfig(course.course_configuration);
      }

      if (course) {
        const selectedDepartments = course?.departments?.length
          ? course?.departments.map((ele) => ({
              label: ele.title,
              value: ele.id,
            }))
          : [];
        const selectedLocations = course?.locations?.length
          ? course?.locations.map((ele) => ({
              label: ele.title,
              value: ele.id,
            }))
          : [];
        const role = course?.roles?.length
          ? course?.roles.map((ele) => ({ label: ele.name, value: ele.roleId }))
          : [];
        const selectedUsers = course?.users?.length
          ? course.users.map((user) => ({
              label: `${user.firstName} ${user.lastName}`,
              value: user.id,
            }))
          : [];
        reset({
          departments: selectedDepartments,
          locations: selectedLocations,
          roles: role,
          users: selectedUsers,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    getInitialData();
  }, [course]);
  return (
    <>
      <div className="col-span-12 xl:col-span-9 mr-5 ">
        <div className="p-0 bg-card rounded-md shadow-sm">
          <div className="row-span-12 lg:row-span-12 flex gap-12 items-center mb-8">
            <div className="col-span-12 gap-6 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center w-full">
              <h3 className="text-xl font-medium capitalize">
                Course Configuration
              </h3>

              <div className="flex gap-2 items-center">
                <Button
                  color="warning"
                  onClick={() => setCourseConfig("Configurable")}
                  variant={
                    courseConfig === "Configurable" ? "default" : "outline"
                  }
                >
                  Configurable
                </Button>
                <Button
                  color="warning"
                  onClick={() => setCourseConfig("User Specific")}
                  variant={
                    courseConfig === "User Specific" ? "default" : "outline"
                  }
                >
                  User Specific
                </Button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {courseConfig === "Configurable" && (
              <div className="">
                <h3 className="text-lg font-medium capitalize px-6">
                  Access Roles Management
                </h3>

                <div className="grid grid-cols-12 gap-7 p-6">
                  {/* Department */}
                  <div className="col-span-12 lg:col-span-12">
                    <div className="space-y-2">
                      <Label className="text-base">Department</Label>
                      <Controller
                        name="departments"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            isClearable={false}
                            styles={styles2}
                            isMulti
                            options={departments
                              .filter(
                                (dept) =>
                                  !field.value?.some(
                                    (selected) => selected.value === dept.id
                                  )
                              )
                              .map((ele) => ({
                                label: ele.title,
                                value: ele.id,
                              }))}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="col-span-12 lg:col-span-12">
                    <Label className="mb-2">Roles</Label>
                    <Controller
                      name="roles"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isClearable={false}
                          styles={styles2}
                          isMulti
                          options={roles
                            .filter(
                              (role) =>
                                !field.value?.some(
                                  (selected) =>
                                    selected.value === String(role.id)
                                )
                            )
                            .map((ele) => ({ label: ele.name, value: ele.id }))}
                        />
                      )}
                    />
                  </div>

                  {/* Locations */}
                  <div className="col-span-12 lg:col-span-12">
                    <div className="space-y-2">
                      <Label className="text-base">Locations</Label>
                      <Controller
                        name="locations"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            isClearable={false}
                            styles={styles2}
                            isMulti
                            options={locations
                              .filter(
                                (loc) =>
                                  !field.value?.some(
                                    (selected) => selected.value === loc.id
                                  )
                              )
                              .map((ele) => ({
                                label: ele.title,
                                value: ele.id,
                              }))}
                          />
                        )}
                      />
                    </div>
                  </div>

                  {/* Publish Date */}
                  {!watch("publish") && (
                    <div className="col-span-12 lg:col-span-12 mt-3">
                      <div className="space-y-2">
                        <Label className="text-base">Course Publish Date</Label>
                        <span className="p-2">
                          <Controller
                            name="publishedAt"
                            control={control}
                            render={({ field }) => (
                              <DatePicker
                                defaultValue={field.value}
                                value={field.value}
                                onDateChange={(value) => field.onChange(value)}
                                variant="filled"
                                id="fill_1"
                              />
                            )}
                          />
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {courseConfig === "User Specific" && (
              <div className="">
                <h3 className="text-lg font-medium capitalize px-6">
                  Assign Users
                </h3>

                <div className="grid grid-cols-12 gap-7 p-6">
                  <div className="col-span-12 lg:col-span-12">
                    <div className="space-y-2">
                      <Label className="text-base">Users *</Label>
                      <Controller
                        name="users"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            isMulti
                            options={users}
                            isClearable={false}
                            styles={styles2}
                            onInputChange={(inputValue, actionMeta) => {
                              // Handle search input changes (for filtering/API calls)
                              if (actionMeta.action === "input-change") {
                                getAllInstructor(inputValue);
                              }
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Selected user preview */}
                {selectedUserList.map((item) => (
                  <div
                    key={item.id}
                    className="bg-card border-b ml-6 mr-6 px-0 py-4"
                  >
                    <div className="flex gap-2">
                      <Avatar className="rounded-full h-12 w-12">
                        <AvatarImage
                          src={
                            item?.profileImage
                              ? getFilePath(item?.profileImage.url)
                              : ""
                          }
                          alt=""
                        />
                        <AvatarFallback className="uppercase bg-success/30 text-success">
                          {item?.firstName?.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex self-center">
                        <div className="text-base font-semibold text-default-900 capitalize mb-1">
                          {`${item.firstName} ${item.lastName || ""}`}{" "}
                          <span className="text-default-600 text-sm">
                            ({item?.role?.name.toLowerCase()})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6 w-full pb-6 pr-6">
              <Button
                type={"button"}
                size="xl"
                variant="outline"
                color="default"
                className="cursor-pointerl"
                onClick={() => {
                  handleBack(course.documentId);
                }}
              >
                Back
              </Button>
              <Button
                size="xl"
                variant=""
                color="default"
                className="cursor-pointer"
              >
                Finish
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default CourseAccessRole;
