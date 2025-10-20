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
import ReactSelect from "react-select";
import DatePicker from "./DatePicker";
import { Switch } from "@/components/ui/switch";
import { useSelector } from "react-redux";
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

const assignment_type = [
  { label: "All Assignments", value: "all" },
  { label: "My Assignments", value: "my" },
];
function CourseCertificate({ handleNext, course, handleBack, isPublished }) {
  const { handleSubmit, control, reset, watch } = useForm({
    mode: "onChange",
  });
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [completionCertificate, setCompletionCertificate] = useState([]);
  const [participationCertificate, setParticipationCertificate] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]);
  const [myAssignments, setMyAssignments] = useState([]);
  // const selectedInstructor = watch('instructors')
  // const [selectedCertificateList, setSelectedCertificateList] = useState([])
  const user = useSelector((state) => state.user);
  const type = watch("assignment_type");
  const onSubmit = (form) => {
    startTransition(async () => {
      try {
        const completionCertificate =
          [form?.completionCertificate]
            ?.map((ele) => (ele?.value ? { id: Number(ele.value) } : undefined))
            ?.filter(Boolean) || [];
        const participationCertificate =
          form?.participationCertificate
            ?.map((ele) => (ele?.value ? { id: Number(ele.value) } : undefined))
            ?.filter(Boolean) || [];
        // const assignments = form?.Assignment?.map((ele) => (ele?.value ? { id: Number(ele.value) } : undefined))
        //     ?.filter(Boolean) || [];
        // const role = form?.roles?.map(ele => ({ name: ele.label, roleId: String(ele.value) }))
        const assignments = form?.Assignment
          ? Array.isArray(form?.Assignment?.value)
            ? form?.Assignment[0]?.value
            : form?.Assignment?.value
          : null;

        console.log("assignments", assignments, form?.Assignment);
        const formData = {
          certificate: completionCertificate[0],
          assignments,
          is_attached_assignments: !!assignments,
        };

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
        handleNext(course.documentId);
        toast.success("Save Successful");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    });
  };

  /**
   * Fetches all participation certificates for the current user, filtered by the status (draft or published)
   * @returns {Promise<Array<{id: number, certificate_name: string, background_img: {url: string}, logo: {url: string}, description: string, certificate_type: string, signature_file: {url: string}>}>}
   */
  const getAllParticipationCertificate = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/certificates?filters[user]=${
          user.id
        }&filters[certificate_type]=participation&status=${
          isPublished ? "published" : "draft"
        }`,
        method: "GET",
      });
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };
  /**
   * Fetches all completion certificates for the current user, filtered by the status (draft or published)
   * @returns {Promise<Array<{id: number, certificate_name: string, background_img: {url: string}, logo: {url: string}, description: string, certificate_type: string, signature_file: {url: string}>}>}
   */
  const getAllCompletionCertificate = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/certificates?filters[user]=${
          user.id
        }&filters[certificate_type]=on%20completion&status=${
          isPublished ? "published" : "draft"
        }`,
        method: "GET",
      });
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };
  const getAllAssignments = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/assignments?filters[available][$eq]=true&status=${
          isPublished ? "published" : "draft"
        }`,
        method: "GET",
      });
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };
  const getMyAssignments = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/assignments?filters[available][$eq]=true&filters[user]=${
          user.id
        }&status=${isPublished ? "published" : "draft"}`,
        method: "GET",
      });
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };

  const getInitialData = async () => {
    try {
      const completionCertificate = await getAllCompletionCertificate();
      const participationCertificate = await getAllParticipationCertificate();
      const myAssignments = await getMyAssignments();
      const allAssignments = await getAllAssignments();
      setCompletionCertificate(completionCertificate || []);
      setParticipationCertificate(participationCertificate || []);
      setMyAssignments(myAssignments || []);
      setAllAssignments(allAssignments || []);
      if (course) {
        const completionCertificate = course?.certificate
          ? [
              {
                label: course?.certificate.certificate_name,
                value: course?.certificate.id,
              },
            ]
          : [];
        // const participationCertificate = course?.certificates?.length
        //     ? course?.certificates.map(ele => {
        //         if (ele.certificate_type === 'participation') return { label: ele.certificate_name, value: ele.id }
        //     })
        //     :
        //     [];
        const assignments = course?.assignments?.length
          ? course?.assignments.map((ele) => {
              return { label: ele.title, value: ele.documentId };
            })
          : [];
        reset({
          completionCertificate,
          participationCertificate,
          Assignment: assignments,
          assignment_type: assignment_type[0],
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  // const getAssignments = async () => {
  //     try {
  //         // let assignments;
  //         // if (type.value === 'my') {

  //         // } else {

  //         // }
  //         if (course) {

  //             reset({

  //             });

  //         }
  //     } catch (error) {
  //         console.log(error);
  //     }

  // };
  useEffect(() => {
    getInitialData();
  }, []);
  // useEffect(() => {
  //     getAssignments();
  // }, [type])
  return (
    <>
      <div className="col-span-12 xl:col-span-9 mr-5 ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-0 bg-card rounded-md shadow-sm mb-6">
            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize">Certificates</h3>
            </div>

            <div className="grid grid-cols-12 gap-7 p-6">
              {/* <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Participation Certificate</Label>
                                    <Controller
                                        name="participationCertificate"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) =>
                                            <Select
                                                defaultValue={field.value}
                                                value={field.value}
                                                onChange={(value) => { field.onChange(value) }}
                                                isClearable={false}
                                                styles={styles}
                                                isMulti
                                                name='participationCertificate'
                                                options={participationCertificate
                                                    .filter(loc => !field.value?.some(selected => selected && selected.value === loc.id))
                                                    .map(ele => ({ label: ele.certificate_name, value: ele.id }))}
                                                className="react-select"
                                                classNamePrefix="select"
                                            />
                                        }
                                    />
                                </div>
                            </div> */}
              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Completion Certificate</Label>
                  <Controller
                    name="completionCertificate"
                    control={control}
                    rules={{}}
                    render={({ field }) => (
                      <Select
                        defaultValue={field.value}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        isClearable={false}
                        styles={styles}
                        isMulti={false}
                        name="completionCertificate"
                        options={completionCertificate
                          .filter(
                            (loc) =>
                              !field.value ||
                              (field.value && field.value.value !== loc.id)
                          ) // Filter out the already selected value
                          .map((ele) => ({
                            label: ele.certificate_name,
                            value: ele.id,
                          }))}
                        className="react-select"
                        classNamePrefix="select"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* {
                            selectedCertificateList.map((item) =>
                                <div className='bg-card rounded-none border-b shadow-none ml-6 mr-6 px-0 py-4 '>
                                    <div className='flex gap-2'>
                                        <div>
                                            {console.log(item)}
                                            <Avatar className="rounded-full h-12 w-12">
                                                <AvatarImage src={item?.profileImage ? process.env.NEXT_PUBLIC_STRAPI_URL + item?.profileImage.url : ''} alt="" />
                                                <AvatarFallback className=" uppercase bg-success/30 text-success">
                                                    {item?.firstName?.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className='flex self-center'>
                                            <div className="text-base font-semibold text-default-900 capitalize mb-1">
                                                {`${item.firstName} ${item.lastName || ''}`}  <span class="text-default-600 text-sm">({item?.role?.name.toLowerCase()})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        } */}
          </div>

          <div className="p-0 bg-card rounded-md shadow-sm">
            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize">Assignments</h3>
            </div>

            <div className="grid grid-cols-12 gap-7 p-6">
              <div className="col-span-6 lg:col-span-6">
                <Label className="py-2 text-lg">Assignment Type</Label>
                <Controller
                  name="assignment_type"
                  control={control}
                  render={({ field }) => (
                    <div className="flex flex-row gap-6 items-center">
                      {assignment_type.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center space-x-2 py-2 text-base"
                        >
                          <input
                            type="radio"
                            value={option.value}
                            checked={field.value?.value === option.value}
                            onChange={() => field.onChange(option)}
                            className="form-radio text-blue-600"
                            defaultChecked={option.value === "all"}
                          />
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                />
              </div>

              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Assignment</Label>
                  <Controller
                    name="Assignment"
                    control={control}
                    rules={{}}
                    render={({ field }) => (
                      <Select
                        defaultValue={field.value}
                        value={field.value}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        isClearable={true}
                        styles={styles}
                        // isMulti
                        name="Assignment"
                        options={
                          type?.value === "all"
                            ? allAssignments
                                .filter(
                                  (loc) => loc.documentId !== field.value?.value
                                )
                                .map((ele) => ({
                                  label: ele.title,
                                  value: ele.documentId,
                                }))
                            : myAssignments
                                .filter(
                                  (loc) => loc.documentId !== field.value?.value
                                )
                                .map((ele) => ({
                                  label: ele.title,
                                  value: ele.documentId,
                                }))
                        }
                        // options={type?.value === "all" ? allAssignments
                        //     .filter(loc => !field.value?.some(selected => selected && selected.value === loc.id))
                        //     .map(ele => ({ label: ele.title, value: ele.id })) : myAssignments
                        //         .filter(loc => !field.value?.some(selected => selected && selected.value === loc.id))
                        //         .map(ele => ({ label: ele.title, value: ele.id }))}
                        className="react-select"
                        classNamePrefix="select"
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            {/* {
                            selectedCertificateList.map((item) =>
                                <div className='bg-card rounded-none border-b shadow-none ml-6 mr-6 px-0 py-4 '>
                                    <div className='flex gap-2'>
                                        <div>
                                            {console.log(item)}
                                            <Avatar className="rounded-full h-12 w-12">
                                                <AvatarImage src={item?.profileImage ? process.env.NEXT_PUBLIC_STRAPI_URL + item?.profileImage.url : ''} alt="" />
                                                <AvatarFallback className=" uppercase bg-success/30 text-success">
                                                    {item?.firstName?.slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>
                                        <div className='flex self-center'>
                                            <div className="text-base font-semibold text-default-900 capitalize mb-1">
                                                {`${item.firstName} ${item.lastName || ''}`}  <span class="text-default-600 text-sm">({item?.role?.name.toLowerCase()})</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        } */}
          </div>
          <div className="flex justify-end gap-4 mt-6 w-full">
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
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Next
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}

export default CourseCertificate;
