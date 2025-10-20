"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import axiosInstance from "@/config/axios.config";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useSelector } from "react-redux";
import { X } from "lucide-react";

import ReactSelect from "react-select";
import FileInput from "../course/[courseDocumentId]/[steps]/FileSelectInput";
import {
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import ProjectList from "../course/ProjectList";
import { Checkbox } from "@/components/ui/checkbox";
import { SortHeader } from "../assignment/SortHeader";
import { CardContent } from "@/components/ui/card";
import { Filter } from "../course-recommend/FacetedFilter";

const styles = {
  multiValue: (base, state) => {
    return state.data.isFixed ? { ...base, opacity: "0.5" } : base;
  },
  multiValueLabel: (base, state) => {
    return state.data.isFixed
      ? { ...base, color: "#626262", paddingRight: 6 }
      : base;
  },
  multiValueRemove: (base, state) => {
    return state.data.isFixed ? { ...base, display: "none" } : base;
  },
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
  }),
};
const Difficulty_level = [
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" },
];
const FromError = ({ error, name }) => {
  return (
    <>
      {error[name]?.message ? (
        <p
          className={cn(
            "text-xs text-destructive leading-none px-1.5 py-2 rounded-0.5"
          )}
        >
          {error[name]?.message}
        </p>
      ) : (
        <></>
      )}
    </>
  );
};

const AddCategory = ({ onSave, categoryId, onClose }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset,
  } = useForm({
    mode: "onChange",
    // defaultValues:{
    //     title:'',
    //     description:'',
    //     difficulty_level:''
    // },
  });
  const router = useRouter();
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [sorting, setSorting] = React.useState([]);
  const [isPending, startTransition] = React.useTransition();
  const user = useSelector((state) => state.user);
  const [imageFiles, setImageFiles] = useState([]);
  const [clearFilter, setClearFilter] = useState(0);
  const [isRoleFiltered, setIsRoleFiltered] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [allSelectedUsers, setAllSelectedUsers] = useState({});
  console.log("allSelectedUsers--", allSelectedUsers);
  const [selectedRole, setSelectedRole] = useState([]);
  console.log("selectedRole---", selectedRole);
  const [selectedDepartment, setSelectedDepartment] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  console.log("selectedTerm h ky a", searchTerm);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);
  const isEdit = categoryId && categoryId !== "new";
  // const [meta, setMeta] = useState({ "page": 1, "pageSize": data?.pageSize || 10, "pageCount": 0, "total": 0, "currentPage": 1 });
  const [metaInside, setMetaInside] = useState({
    page: 1,
    pageSize: 10,
    pageCount: 0,
    total: 0,
    currentPage: 1,
  });
  // console.log(user);
  const [allUsersData, setAllUsersData] = useState([]);
  const uploadFile = async (files) => {
    let formData = new FormData();
    formData.append("files", files);
    const { data } = await axiosInstance({
      url: "/api/upload/",
      method: "post",
      data: formData,
    });
    const fileId = data[0].id;
    return fileId;
  };
  const fetchAllUsers = async (pageNo = 1, pageSize = 10) => {
    console.log("inside the fetchAllusers");
    try {
      // Fetch all users with reporting_to populated
      setLoadingUsers(true);
      const isAdmin = user?.role?.name === "ADMIN";
      const loggedInUserId = user?.id;
      let pageCount;
      let start;
      let response;
      let total;
      console.log("pageSize", pageSize);
      if (isAdmin) {
        const { data } = await axiosInstance.get(`/api/users/count`);
        total = data;
        pageCount = Math.ceil(total / pageSize);
        start = (pageNo - 1) * pageSize;
        response = await axiosInstance.get(
          `/api/users?populate=*&start=${start}&limit=${pageSize}`
        );
      } else {
        const { data } = await axiosInstance({
          url: `/api/users?filters[reporting_to][id]=${loggedInUserId}`,
          method: "get",
        });
        total = data.length;
        pageCount = Math.ceil(total / pageSize);
        start = (pageNo - 1) * pageSize;
        response = await axiosInstance.get(
          `/api/users?filters[reporting_to][id]=${loggedInUserId}&start=${start}&limit=${pageSize}`
        );
      }

      // Validate response
      if (!response || !response.data || !Array.isArray(response.data)) {
        console.error("❌ API response is invalid:", response);
        toast.error("Failed to fetch users");
        return [];
      }
      const meta = {
        page: pageNo,
        pageSize,
        pageCount,
        total,
        currentPage: pageNo,
      };
      setMetaInside(meta);

      console.log("meta", meta);
      console.log("response", response);
      const users = response.data; // Extract users array

      // Debugging output
      console.log("✅ Raw API Users Response:", users);

      return users; // Ensure we return the users array
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to fetch users");
      return []; // Return empty array on failure
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleFetchAllUsers = async (pageNo = 1, pageSize = 10) => {
    try {
      console.log("enter in to handleFetchAllUsers");
      const res = await fetchAllUsers(pageNo, metaInside?.pageSize); // Fetch users
      if (!Array.isArray(res)) {
        console.error("❌ Expected an array but got:", res);
        return;
      }

      console.log("✅ Processed API Response:", res);

      // const loggedInUserId = user?.id;

      // console.log("Logged in User ID:", loggedInUserId);
      // console.log("Is Admin:", isAdmin);

      let filteredUsers;
      // if (isAdmin) {
      filteredUsers = res; // Admin gets all users
      // } else {
      //     filteredUsers = res.filter(u => {
      //         if (!u.reporting_to) {
      //             console.log(`⚠️ No Reporting Leader for: ${u.firstName} (ID: ${u.id})`);
      //             return false;
      //         }
      //         return u.reporting_to.id === loggedInUserId;
      //     });
      // }

      console.log("✅ Filtered Users:", filteredUsers);
      setAllUsersData(filteredUsers);
      // setUsers(filteredUsers);
    } catch (error) {
      console.error("❌ Error processing users:", error);
    }
  };

  console.log("dattsaa--", allUsersData);

  const getAllRoles = async () => {
    try {
      const { data } = await axiosInstance.get("/api/users-permissions/roles");
      console.log("rola", data);
      setRoles(data.roles); // Store roles in state
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };

  const getAllDepartments = async () => {
    try {
      const { data } = await axiosInstance.get("/api/departments");
      setDepartments(data.data); // Store departments in state
    } catch (error) {
      console.error("Failed to fetch departments:", error);
    }
  };

  const getAllLocations = async () => {
    try {
      const { data } = await axiosInstance.get("/api/locations");
      setLocations(data.data); // Store locations in state
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    }
  };

  //     const filteredDataUser = useMemo(() => {
  //         // if (isEdit && singleCourseRecData?.user) {
  //         //     setMetaInside({
  //         //         pageNo: 1,
  //         //         pageSize: 10,
  //         //         pageCount: 1,
  //         //         total: 1,
  //         //         currentPage: 1,
  //         //     });
  //         //     return [singleCourseRecData.user];
  //         // }

  //         const searchParts = searchTerm.trim().toLowerCase().split(" ");
  //         const selectedUsersList = Object.values(allSelectedUsers);

  //   // Remove selected users from the main list to avoid duplication
  //   const nonSelectedUsers = allUsersData.filter(
  //     (user) => !allSelectedUsers[user.id]
  //   );

  //   // Combine selected and non-selected users
  //   const combinedUsers = [...selectedUsersList, ...nonSelectedUsers];

  //         return combinedUsers.filter((user) => {
  //             const firstName = user.firstName?.toLowerCase() || "";
  //             const lastName = user.lastName?.toLowerCase() || "";

  //             const matchesSearch = searchParts.some(part => {
  //                 return firstName.includes(part) || lastName.includes(part);
  //             });

  //             const matchesRole = selectedRole.length
  //                 ? selectedRole.includes(user.role?.name)
  //                 : true;

  //             const matchesDepartment = selectedDepartment.length
  //                 ? selectedDepartment.includes(user.department?.title)
  //                 : true;

  //             const matchesLocation = selectedLocation.length
  //                 ? selectedLocation.includes(user.location?.title)
  //                 : true;

  //             return matchesRole && matchesDepartment && matchesLocation && matchesSearch;
  //         });
  //     }, [isEdit, allUsersData, selectedRole, selectedDepartment, selectedLocation, searchTerm]);

  const filteredDataUser = useMemo(() => {
    // Short-circuit for edit mode
    //   if (isEdit && singleCourseRecData?.user) {
    //     setMetaInside({
    //       pageNo: 1,
    //       pageSize: 10,
    //       pageCount: 1,
    //       total: 1,
    //       currentPage: 1,
    //     });
    //     return [singleCourseRecData.user];
    //   }

    const searchParts = searchTerm.trim().toLowerCase().split(" ");

    // Extract selected users from object
    const selectedUsersList = Object.values(allSelectedUsers);
    console.log("selected users", selectedUsersList);

    // Remove selected users from the main list to avoid duplication
    const nonSelectedUsers = allUsersData.filter(
      (user) => !allSelectedUsers[user.id]
    );

    // Combine selected and non-selected users
    const combinedUsers = [...selectedUsersList, ...nonSelectedUsers];

    // Apply filters
    return combinedUsers.filter((user) => {
      const firstName = user.firstName?.toLowerCase() || "";
      const lastName = user.lastName?.toLowerCase() || "";

      const matchesSearch = searchParts.some((part) => {
        return firstName.includes(part) || lastName.includes(part);
      });

      const matchesRole = selectedRole.length
        ? selectedRole.includes(user.role?.name)
        : true;

      const matchesDepartment = selectedDepartment.length
        ? selectedDepartment.includes(user.department?.title)
        : true;

      const matchesLocation = selectedLocation.length
        ? selectedLocation.includes(user.location?.title)
        : true;

      return (
        matchesSearch && matchesRole && matchesDepartment && matchesLocation
      );
    });
  }, [
    isEdit,
    //   singleCourseRecData,
    searchTerm,
    selectedRole,
    selectedDepartment,
    selectedLocation,
    allUsersData,
    allSelectedUsers,
  ]);
  const fetchFilteredUsers = async ({
    role,
    department,
    location,
    search,
    pageNo = 1,
    pageSize = 10,
  }) => {
    console.log("Fetching filtered users - Page:", pageNo, "Size:", pageSize);
    try {
      const query = new URLSearchParams();

      if (role?.length)
        role.forEach((r) => query.append("filters[role][name][$in]", r));
      if (department?.length)
        department.forEach((dep) =>
          query.append("filters[department][title][$eq]", dep)
        );
      if (location?.length)
        location.forEach((loc) =>
          query.append("filters[location][title][$eq]", loc)
        );

      if (search.trim().length > 0) {
        const searchParts = search.trim().split(" ");

        if (searchParts.length === 1) {
          query.append("filters[firstName][$containsi]", searchParts[0]);
        } else if (searchParts.length === 2) {
          query.append("filters[firstName][$containsi]", searchParts[0]),
            query.append("filters[lastName][$containsi]", searchParts[1]);
        }
      }

      let total = 0;
      let pageCount = 1;
      const countResponse = await axiosInstance.get(
        `/api/users?${query.toString()}`
      );
      if (countResponse.data) {
        (total = countResponse.data.length),
          (pageCount = Math.ceil(total / pageSize));
      }

      const start = (pageNo - 1) * pageSize;

      const dataUrl = `/api/users?populate=*&${query.toString()}&start=${start}&limit=${pageSize}`;
      console.log("Fetching paginated data:", dataUrl);
      const response = await axiosInstance.get(dataUrl);

      if (!response || !response.data || !Array.isArray(response.data)) {
        console.error("❌ Invalid API response:", response);
        toast.error("Failed to fetch filtered users");
        return;
      }

      console.log("✅ Filtered Users Data:", response.data);

      // setUsers(response.data);
      setAllUsersData(response.data);

      setMetaInside({
        page: pageNo,
        pageSize,
        pageCount,
        total,
        currentPage: pageNo,
      });
    } catch (error) {
      console.error("❌ Error fetching filtered users:", error);
      toast.error("Failed to fetch filtered users");
    }
  };

  const handleEmployeeFilter = (type, value) => {
    const updatedFilters = {
      role: type === "role" ? value : selectedRole,
      department: type === "department" ? value : selectedDepartment,
      location: type === "location" ? value : selectedLocation,
      search: type === "search" ? value : searchTerm,
    };

    setSelectedRole(updatedFilters.role);
    setSelectedDepartment(updatedFilters.department);
    setSelectedLocation(updatedFilters.location);
    setSearchTerm(updatedFilters.search);

    if (type === "search") {
      fetchFilteredUsers({
        role: updatedFilters.role,
        department: updatedFilters.department,
        location: updatedFilters.location,
        search: value, // Use the latest search value
        pageNo: metaInside.currentPage,
        pageSize: metaInside.pageSize,
      });
    } else {
      const isFiltering =
        updatedFilters.role.length > 0 ||
        updatedFilters.department.length > 0 ||
        updatedFilters.location.length > 0;
      if (isFiltering) {
        setIsRoleFiltered(true);
        fetchFilteredUsers(updatedFilters);
      } else {
        setIsRoleFiltered(false);
        handleFetchAllUsers();
      }
    }
  };

  const onSubmit = (form) => {
    const selectedUsers = Object.values(allSelectedUsers);
    console.log("selectedUserss for smes--", selectedUsers);

    if (!selectedUsers.length) {
      toast.error("At least one user must be selected");
      return;
    }

    startTransition(async () => {
      try {
        const formData = {
          data: {
            ...form,
            difficulty_level: form.difficulty_level.value,
            author: user.id,
            modifiedBy: user.id,
            smes: selectedUsers.map((u) => u.id),
          },
        };

        if (imageFiles?.length) {
          if (imageFiles?.length && imageFiles[0]?.name) {
            const fileId = await uploadFile(imageFiles[0]);
            formData.data["thumbnail"] = fileId;
          }
        } else {
          formData.data["thumbnail"] = null;
        }

        const { data } = await axiosInstance({
          url: `/api/courses-Categories/${isEdit ? categoryId : ""}`,
          method: `${isEdit ? "PUT" : "POST"}`,
          data: formData,
        });
        if (typeof onSave === "function") {
          onSave(data);
        }
        toast.success("Save Successful");
        // const questionBankId = data?.data?.id;
        // const courseCategoryId = data?.data?.documentId;
        // if (courseCategoryId) {
        //     toast.success("Category saved successfully!");
        //     // router.push(`/admin/question-banks/${questionBankId}`);
        //     router.push(`/admin/course-categories/${courseCategoryId}`);

        // } else {
        //     throw new Error("Failed to retrieve courseCategory ID");
        // }
      } catch (error) {
        toast.error("Something went wrong: " + error.message);
      }
    });
  };
  const formColumn = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          className="flex"
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: true,
      enableHiding: false,
    },
    {
      accessorKey: "employee code",
      header: ({ column }) => (
        <SortHeader column={column} title="Employee Code" />
      ),
      cell: ({ row }) => {
        console.log("row", row.original);
        return (
          <div className="  font-medium  text-card-foreground/80">
            <div className="flex space-x-3  rtl:space-x-reverse items-center">
              {`${row?.original?.employeeCode || ""}`.trim()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <SortHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }) => {
        console.log("row", row.original);
        return (
          <div className="  font-medium  text-card-foreground/80">
            <div className="flex space-x-3  rtl:space-x-reverse items-center">
              {`${row?.original?.firstName || ""} ${
                row?.original?.lastName || ""
              }`.trim()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "designation",
      header: ({ column }) => (
        <SortHeader column={column} title="Designation" />
      ),
      cell: ({ row }) => {
        console.log("row", row.original);
        return (
          <div className="  font-medium  text-card-foreground/80">
            <div className="flex space-x-3  rtl:space-x-reverse items-center">
              {`${row?.original?.Designation || ""}`.trim()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "department",
      header: ({ column }) => <SortHeader column={column} title="Department" />,
      cell: ({ row }) => {
        console.log("row", row.original);
        return (
          <div className="  font-medium  text-card-foreground/80">
            <div className="flex space-x-3  rtl:space-x-reverse items-center">
              {`${row?.original?.department?.title || ""}`.trim()}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "location",
      header: ({ column }) => <SortHeader column={column} title="Location" />,
      cell: ({ row }) => {
        console.log("row", row.original);
        return (
          <div className="  font-medium  text-card-foreground/80">
            <div className="flex space-x-3  rtl:space-x-reverse items-center">
              {`${row?.original?.location?.title || ""}`.trim()}
            </div>
          </div>
        );
      },
    },
  ];
  const tableForCourseRecForm = useReactTable({
    data: filteredDataUser,
    columns: formColumn,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      allSelectedUsers,
      columnFilters,
    },
    enableRowSelection: true,
    getRowId: (row) => row?.id,
    // onRowSelectionChange: setRowSelection,
    onRowSelectionChange: (updater) => {
      const newRowSelection =
        typeof updater === "function" ? updater(rowSelection) : updater;
      console.log("nfkvnjnrfkjfnkv", newRowSelection);
      const updatedSelections = { ...allSelectedUsers };

      // Add selected users from current visible rows
      filteredDataUser.forEach((user) => {
        const userId = user.id;
        if (newRowSelection[userId]) {
          updatedSelections[userId] = user;
        } else {
          delete updatedSelections[userId];
        }
      });

      setAllSelectedUsers(updatedSelections);
      setRowSelection(newRowSelection);
    },

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

  const fetchCategory = async (categoryDocumentId) => {
    try {
      const response = await axiosInstance({
        url: `/api/courses-Categories/${categoryDocumentId}?populate=*`,
        method: "GET",
      });
      const responseData = response.data?.data;
      if (responseData) {
        const transformedCategory = {
          title: responseData?.title || "",
          description: responseData?.description || "",
          difficulty_level: Difficulty_level.find(
            (ele) => ele.value === responseData.difficulty_level
          ),
          smes: responseData?.smes,
        };
        reset(transformedCategory);
        // setAllSelectedUsers(transformedCategory?.smes)
        const smes = responseData?.smes || [];

        const selectedUserMap = {};
        const selectedRowMap = {};

        transformedCategory?.smes.forEach((user) => {
          selectedUserMap[user.id] = user;
          selectedRowMap[user.id] = true;
        });

        setAllSelectedUsers(selectedUserMap);
        setRowSelection(selectedRowMap);

        // setImageFiles([responseData?.thumbnail?.url]);
        // 🛠️ Conditional Check for Image
        if (responseData?.thumbnail?.url) {
          setImageFiles([responseData.thumbnail.url]);
        } else {
          setImageFiles([]); // Show "Upload Image" if no thumbnail exists
        }
      }
    } catch (error) {
      console.log(error);
      if (error.status === 404) router.push("/admin/courses-Categories");
      return [];
    }
  };

  useEffect(() => {
    if (categoryId && categoryId !== "new") {
      fetchCategory(categoryId);
    }
  }, [categoryId]);

  const handleCancel = () => {
    reset({
      title: "",
      description: "",
      difficulty_level: null,
    });
    setImageFiles([]);
    if (typeof onClose === "function") {
      onClose();
      if (isEdit) window.location.reload();
    }
  };

  // const formEvent = {
  //     onSubmit: !courseDocumentId ? handleSubmit(onSubmit) : () => { },
  //     onBlur: courseDocumentId ? handleSubmit(onSubmit) : () => { }
  // }
  useEffect(() => {
    handleFetchAllUsers();
  }, []);

  useEffect(() => {
    // getAllCategory();
    getAllRoles();
    getAllDepartments();
    getAllLocations();
  }, []);
  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          {isEdit ? "Update Course Category" : "Create Course Category"}
        </div>
      </div>

      <div className="col-span-12 xl:col-span-9 mr-5 p-1">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* course Category Structure */}
          <div className="p-0 bg-card rounded-md shadow-sm mb-6">
            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize text-default-700">
                Basic Course Category Info
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-7 p-6">
              {/* Basic Course Information */}
              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base text-default-700">
                    Title <span class="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="Category Title"
                    className="rounded-sm h-14 text-base text-default-700"
                    {...register("title", {
                      required: "Category Title is required",
                    })}
                  />
                  <FromError error={errors} name={"title"} />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base text-default-700">
                    Difficulty level <span className="text-red-500">*</span>
                  </Label>
                  <Controller
                    name={`difficulty_level`}
                    control={control}
                    rules={{ required: "Difficulty level is required" }}
                    render={({ field }) => (
                      <ReactSelect
                        defaultValue={field.value}
                        value={field.value}
                        onChange={(select) => {
                          field.onChange(select);
                        }}
                        isClearable={false}
                        styles={styles}
                        name={`difficulty_level`}
                        options={Difficulty_level}
                        className="react-select h-14 text-base text-default-700"
                        classNamePrefix="select"
                      />
                    )}
                  />
                  <FromError error={errors} name={"difficulty_level"} />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base  text-default-700">
                    Description
                  </Label>
                  <Textarea
                    type="text"
                    placeholder="Category Description"
                    className="rounded-sm h-14 text-base text-default-700"
                    {...register("description")}
                  />
                  <FromError error={errors} name={"description"} />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-base text-default-700 mb-2">
              Select SMEs
            </Label>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Filter
                  title="Role"
                  options={roles.map((role) => ({
                    label: role.name,
                    value: role.name,
                  }))}
                  clearFilter={clearFilter}
                  onChange={(value) => handleEmployeeFilter("role", value)}
                />
                <Filter
                  title="Department"
                  options={departments.map((department) => ({
                    label: department.title,
                    value: department.title,
                  }))}
                  clearFilter={clearFilter}
                  onChange={(value) =>
                    handleEmployeeFilter("department", value)
                  }
                />

                <Filter
                  title="Location"
                  options={locations.map((location) => ({
                    label: location.title,
                    value: location.title,
                  }))}
                  clearFilter={clearFilter}
                  onChange={(value) => handleEmployeeFilter("location", value)}
                />

                <Input
                  placeholder="Search Employee..."
                  value={searchTerm}
                  onChange={(e) =>
                    handleEmployeeFilter("search", e.target.value)
                  }
                />
                {selectedRole.length > 0 ||
                selectedDepartment.length > 0 ||
                selectedLocation.length > 0 ||
                searchTerm ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedRole([]);
                      setSelectedDepartment([]);
                      setSelectedLocation([]);
                      setSearchTerm("");
                      setClearFilter((old) => old + 1);
                      tableForCourseRecForm.setColumnFilters([]);
                    }}
                    className="h-8 px-2 lg:px-3"
                  >
                    Reset
                    <X className="ltr:ml-2 rtl:mr-2 h-4 w-4" />
                  </Button>
                ) : null}
              </div>
            </CardContent>
            {/* <ProjectList
                            data={filteredDataUser}  // Pass the correct user data
                            table={tableForCourseRecForm}
                            columns={formColumn}
                            meta={metaInside}
                            // func={handleFetchAllUsers}  // Function to fetch paginated users
                            func={(pageNo) => {
                                if (isEdit) {
                                    return
                                }
                                if (isRoleFiltered || searchTerm.trim().length > 0) {
                                    fetchFilteredUsers({
                                        role: selectedRole,
                                        department: selectedDepartment,
                                        location: selectedLocation,
                                        search: searchTerm,
                                        pageNo,
                                        pageSize: metaInside.pageSize,
                                    });
                                } else {
                                    handleFetchAllUsers(pageNo, metaInside.pageSize)
                                }
                            }}
                        /> */}
            {!loadingUsers ? (
              <ProjectList
                data={filteredDataUser}
                table={tableForCourseRecForm}
                columns={formColumn}
                meta={metaInside}
                func={(pageNo) => {
                  if (isEdit) return;
                  if (isRoleFiltered || searchTerm.trim().length > 0) {
                    fetchFilteredUsers({
                      role: selectedRole,
                      department: selectedDepartment,
                      location: selectedLocation,
                      search: searchTerm,
                      pageNo,
                      pageSize: metaInside.pageSize,
                    });
                  } else {
                    handleFetchAllUsers(pageNo, metaInside.pageSize);
                  }
                }}
              />
            ) : (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Loading users...
              </div>
            )}

            {/* <ProjectList table={tableForCourseRecForm} columns={formColumn} /> */}
          </div>

          {/* {allUsersData &&   <ProjectList
                        data={allUsersData}  // Pass the correct user data
                        table={tableForCourseRecForm}
                        columns={formColumn}
                        meta={metaInside}
                        func={handleFetchAllUsers}  // Function to fetch paginated users
                    // func={(pageNo) => {
                    //     handleFetchAllUsers(pageNo, metaInside.pageSize)
                    // }}
                    />} */}
          {/* Media & Visuals Block */}

          <div className="p-0 bg-card rounded-md shadow-sm">
            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize text-default-700">
                Media & Visuals
              </h3>
            </div>
            <div className="grid grid-cols-12 gap-7 p-6">
              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">
                    Thumbnail <span className="text-red-500">*</span>
                  </Label>
                  <FileInput
                    className="rounded-sm"
                    onChange={(file) => {
                      setImageFiles(file);
                    }}
                    initialFile={imageFiles.length ? imageFiles : null}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex mt-6 gap-4 justify-end">
            <Button
              type={"button"}
              size="xl"
              variant="outline"
              color="destructive"
              className="cursor-pointerl"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              size="xl"
              variant=""
              color="default"
              className="cursor-pointer"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;
