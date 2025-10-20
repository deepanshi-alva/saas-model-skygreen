"use client";
import Select from "react-select";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { addUser, updateUser, fetchAllRoles, fetchAllUsers, fetchAllDepartments, fetchAllLocations, fetchEmailMessageTemplate } from "@/components/auth/admin-operation";
import toast from "react-hot-toast";
import ProfileImageUpload from "./file-uploader";
import axiosInstance from "@/config/axios.config";
import { useSelector } from "react-redux";

const styles = {
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
  }),
};

export default function SubmitFormInSheet({ open, onClose, user = null, onUserUpdated }) {
  const isUpdateMode = !!user;
  console.log(isUpdateMode, "updatemode");
  console.log('user inside add user', user);


  const loggedInUser = useSelector((state) => state.user);
  const isDisabled = loggedInUser && loggedInUser?.role?.name === "EMPLOYEE" || !loggedInUser?.role;
  const [file, setFile] = useState(null);

  const [roles, setRoles] = useState([]);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [locations, setLocations] = useState([]);

  const [emailTemplateType, setEmailTemplateType] = useState([]);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    employeeCode: "",
    role: null,
    manager: null,
    department: null,
    location: null,
    profileImage: null,
    profileImageUrl: "",
  });

  const [initialFormData, setInitialFormData] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const loadRoles = async () => {
    try {
      const fetchedRoles = await fetchAllRoles();
      const fetchedManagers = await fetchAllUsers();
      const fetchDepartments = await fetchAllDepartments();
      const fetchLocations = await fetchAllLocations();
      const formattedRoles = fetchedRoles?.roles.map((role) => ({
        value: role.id,
        label: role.name,
      }));
      const formattedManagers = fetchedManagers?.map((user) => ({
        value: user.id,
        label: user.username,
      }));
      const formattedDepartments = fetchDepartments?.map((department) => ({
        value: department.id,
        label: department.title
      }));
      const formattedLocations = fetchLocations?.map((location) => ({
        value: location.id,
        label: location.title
      }))

      setRoles(formattedRoles.filter(ele => ele.label));
      setManagers(formattedManagers.filter(ele => ele.label));
      setDepartments(formattedDepartments.filter(ele => ele.label));
      setLocations(formattedLocations.filter(ele => ele.label));
      setRolesLoaded(true);
    } catch (error) {
      console.error("Failed to fetch roles:", error);
    }
  };
  useEffect(() => {
    const setFormDataWithRoles = () => {
      if (isUpdateMode && rolesLoaded && roles.length > 0
        // && managers.length > 0 && departments.length > 0 && locations.length > 0
      ) {
        const userRole = roles.find((role) => role.value === user?.role?.id) || null;
        const userManager = managers.find((manager) => manager.value === user?.reporting_to?.id) || null;
        const userDepartment = departments.find((department) => department.value === user?.department?.id) || null;
        const userLocation = locations.find((location) => location.value === user?.location?.id) || null;
        setFormData({
          username: user?.username || "",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          employeeCode: user?.employeeCode || "",
          role: userRole,
          manager: userManager,
          department: userDepartment,
          location: userLocation,
          profileImage: user?.profileImage?.id || null,
          profileImageUrl: user?.profileImage?.url || user?.profileImage || "",
        });

        setInitialFormData({
          username: user?.username || "",
          firstName: user?.firstName || "",
          lastName: user?.lastName || "",
          email: user?.email || "",
          employeeCode: user?.employeeCode || "",
          role: userRole,
          manager: userManager,
          department: userDepartment,
          location: userLocation,
          profileImage: user?.profileImage?.id || null,
          profileImageUrl: user?.profileImage?.url || user?.profileImage || "",
        });
      }
    };
    loadRoles();
    setFormDataWithRoles();
  }, [user, rolesLoaded, isUpdateMode]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    checkChanges({ ...formData, [id]: value });
  };

  const handleSelectChange = (selectedOption, field) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [field]: selectedOption,
    }));
    checkChanges({ ...formData, [field]: selectedOption });
  };

  const handleImageUpload = (image) => {
    setFile(image);
    checkChanges({ ...formData, profileImage: image });
  };

  const uploadFile = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append("files", file);
    try {
      const { data } = await axiosInstance({
        url: "/api/upload/",
        method: "post",
        data: formData,
      });

      const fileId = data[0].id;
      return fileId;
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload image.");
      return null;
    }
  };

  const validateForm = () => {
    const { username, firstName, email, password, role } = formData;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!firstName || firstName.trim() === "" || !email || email.trim() === "" || !role?.value) {
      toast.error("Please fill in all required fields: (*)");
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    if (!isUpdateMode && !password || !isUpdateMode && password.trim() === "") {
      toast.error("Password is required.");
      return false;
    }

    if (isUpdateMode) {
      if (!username.trim() || !firstName.trim() || !email.trim() || !role) {
        toast.error("No field can be empty.");
        return false;
      }
    }
    return true;
  };

  const checkChanges = (newFormData) => {
    if (!initialFormData) return;

    const hasChanges = Object.keys(newFormData).some(
      (key) => newFormData[key] !== initialFormData[key]
    );
    setIsSubmitDisabled(!hasChanges);
  };

  const handleFetchEmailTemplate = async () => {
    const data = await fetchEmailMessageTemplate();
    setEmailTemplateType(data);
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    formData.username = formData.email;

    if (file) {
      const fileId = await uploadFile(file);
      if (fileId) {
        formData.profileImage = fileId;
      }
    }

    const submissionData = {
      ...formData,
      // role: {
      //   connect: [{ id: formData.role?.value }],
      //   disconnect: isUpdateMode
      //     ? initialFormData.role && initialFormData.role.value !== formData.role?.value
      //       ? [{ id: initialFormData.role.value }]
      //       : []
      //     : [],
      // },
      // reporting_to: {
      //   connect: [{ id: formData.manager?.value }],
      //   disconnect: isUpdateMode
      //     ? initialFormData.manager && initialFormData.manager.value !== formData.manager?.value
      //       ? [{ id: initialFormData.manager.value }]
      //       : []
      //     : [],
      // },
      // department: {
      //   connect: [{ id: formData.department?.value }],
      //   disconnect: isUpdateMode
      //     ? initialFormData.department && initialFormData.department.value !== formData.department?.value
      //       ? [{ id: initialFormData.department.value }]
      //       : []
      //     : [],
      // },
      // location: {
      //   connect: [{ id: formData.location?.value }],
      //   disconnect: isUpdateMode
      //     ? initialFormData.location && initialFormData.location.value !== formData.location?.value
      //       ? [{ id: initialFormData.location.value }]
      //       : []
      //     : [],
      // },
      role: formData.role ? { connect: [{ id: formData.role.value }] } : null,
      reporting_to: formData.manager ? { connect: [{ id: formData.manager.value }] } : null,
      department: formData.department ? { connect: [{ id: formData.department.value }] } : null,
      location: formData.location ? { connect: [{ id: formData.location.value }] } : null,
    };

    console.log("formData", formData);

    try {
      if (isUpdateMode) {
        await updateUser(user.id, submissionData);
      } else {
        await addUser(submissionData, emailTemplateType);
      }

      setFormData({
        username: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        employeeCode: "",
        role: null,
        manager: null,
        department: null,
        location: null,
        profileImage: null,
        profileImageUrl: "",
      });

      setFile(null);
      onClose();
      onUserUpdated();
    } catch (error) {
      console.error(`${isUpdateMode ? "Failed to update" : "Failed to create"} user:`, error);
    }
  };

  useEffect(() => {
    handleFetchEmailTemplate();
  }, [])

  const handleCancel = () => {
    setFormData({
      username: "",
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      employeeCode: "",
      role: null,
      manager: null,
      department: null,
      location: null,
      profileImage: null,
      profileImageUrl: "",
    });
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="max-w-[736px]">
        <SheetHeader>
          <SheetTitle>{isUpdateMode ? "Update User" : "Add New User"}</SheetTitle>
        </SheetHeader>
        <SheetDescription>
          <div className="flex flex-col justify-between h-full"
          >
            <div className="py-5 overflow-y-auto max-h-[87vh] pr-6 pl-2 mb-4">
              <hr></hr>
              <div className="md:grid md:grid-cols-2 gap-6 mt-6 space-y-6 md:space-y-0">
                <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="text-md border-default-400 text-default-600"
                    placeholder="Please enter first name"
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="lastName">Last Name</Label>
                  <Input
                    type="text"
                    className="text-md border-default-400 text-default-600"
                    placeholder="Please enter last name"
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    className="text-md border-default-400 text-default-600"
                    placeholder="Please enter email"
                    id="email"
                    required
                    readOnly={isUpdateMode}
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>

                {/* <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="username">
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    className="text-md border-default-400 text-default-600"
                    placeholder="Please enter username"
                    id="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div> */}

                {!isUpdateMode && (
                  <div className="flex flex-col gap-2">
                    <Label className="text-default-600" htmlFor="password">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="password"
                      className="text-md border-default-400 text-default-600"
                      placeholder="Please enter password"
                      id="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                )}

                {!isDisabled && <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="password">
                    Employee Code
                  </Label>
                  <Input
                    type="employeeCode"
                    className="text-md border-default-400 text-default-600"
                    placeholder="Please enter employee code"
                    id="employeeCode"
                    required
                    readOnly={isUpdateMode}
                    value={formData.employeeCode}
                    onChange={handleChange}
                  />
                </div>}

                {!isDisabled && <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="role">
                    Role <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    defaultValue={formData.role}
                    value={formData.role}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, "role")}
                    className="react-select text-md border-default-400 text-default-600"
                    classNamePrefix="select"
                    placeholder="Select a role"
                    styles={styles}
                    options={roles}
                  />
                </div>}

                {!isDisabled && <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="role">
                    Reporting To
                  </Label>
                  <Select
                    defaultValue={formData.manager}
                    value={formData.manager}
                    onChange={(selectedOption) => {
                      console.log('selectedOptions', selectedOption);

                      handleSelectChange(selectedOption, "manager")
                    }}
                    className="react-select text-md border-default-400 text-default-600"
                    classNamePrefix="select"
                    placeholder="Select a manager"
                    styles={styles}
                    options={managers}
                  />
                </div>}

                {!isDisabled && <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="role">
                    Department
                  </Label>
                  <Select
                    defaultValue={formData.department}
                    value={formData.department}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, "department")}
                    className="react-select text-md border-default-400 text-default-600"
                    classNamePrefix="select"
                    placeholder="Select a department"
                    styles={styles}
                    options={departments}
                  />
                </div>}

                {!isDisabled && <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="role">
                    Location
                  </Label>
                  <Select
                    defaultValue={formData.location}
                    value={formData.location}
                    onChange={(selectedOption) => handleSelectChange(selectedOption, "location")}
                    className="react-select text-md border-default-400 text-default-600"
                    classNamePrefix="select"
                    placeholder="Select a location"
                    styles={styles}
                    options={locations}
                  />
                </div>}

                <div className="flex flex-col gap-2">
                  <Label className="text-default-600" htmlFor="profileImage">
                    Profile Image <span className="text-red-500"></span>
                  </Label>
                  <ProfileImageUpload onFileChange={handleImageUpload} initialImage={formData.profileImageUrl || ""} id="profileImage" />
                </div>
              </div>
            </div>

            <div className="space-x-4 rtl:space-x-reverse">
              <Button variant="outline" size="xs" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="xs" color="default" onClick={handleSubmit} disabled={isSubmitDisabled}>
                Submit
              </Button>
            </div>
          </div>
        </SheetDescription>
        <SheetFooter>
          <SheetClose asChild>Footer content</SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
