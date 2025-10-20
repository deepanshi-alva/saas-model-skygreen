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

function AssignmentCertificate({ handleNext, assignment, handleBack }) {
  const { handleSubmit, control, reset, watch } = useForm({
    mode: "onChange",
  });
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();
  const [passCertificate, setPassCertificate] = useState([]);
  // const [failCertificate, setFailCertificate] = useState([]);
  // const selectedInstructor = watch('instructors')
  // const [selectedCertificateList, setSelectedCertificateList] = useState([])
  const user = useSelector((state) => state.user);

  const onSubmit = (form) => {
    startTransition(async () => {
      try {
        const passCertificate =
          [form?.passCertificate]
            ?.map((ele) => (ele?.value ? { id: Number(ele.value) } : undefined))
            ?.filter(Boolean) || [];
        // const failCertificate =
        //   form?.failCertificate
        //     ?.map((ele) => (ele?.value ? { id: Number(ele.value) } : undefined))
        //     ?.filter(Boolean) || [];
        // const role = form?.roles?.map(ele => ({ name: ele.label, roleId: String(ele.value) }))
        const formData = {
          certificate: passCertificate[0],
        };
        // let query = ''
        // if (form.publish) {
        //     query = 'status=published'
        // }
        // else if (!form.publish && !form.publishedAt) {
        //     query = 'status=draft'
        // } else if (!form.publish && form.publishedAt) {
        //     formData['publishedAt'] = form.publishedAt
        // }
        const { data } = await axiosInstance({
          url: `/api/assignments/${assignment.documentId}`,
          method: "PUT",
          data: {
            data: formData,
          },
        });
        console.log("data frgrgbvf", data);
        handleNext(assignment.documentId);
        toast.success("Save Successful");
      } catch (error) {
        console.log(error);
        toast.error("Something went wrong");
      }
    });
  };

  const getAllPassCertificate = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/certificates?filters[user]=${user.id}&filters[certificate_type]=pass certificate`,
        method: "GET",
      });
      return data.data;
    } catch (error) {
      console.log(error);
    }
  };
  // const getAllFailCertificate = async () => {
  //   try {
  //     const { data } = await axiosInstance({
  //       url: `/api/certificates?filters[user]=${user.id}&filters[certificate_type]=fail certificate`,
  //       method: "GET",
  //     });
  //     return data.data;
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const getInitialData = async () => {
    try {
      const passCertificate = await getAllPassCertificate();
      // const failCertificate = await getAllFailCertificate();
      setPassCertificate(passCertificate || []);
      // setFailCertificate(failCertificate || [])
      if (assignment) {
        const passCertificate = [assignment?.certificates]?.length
          ? [assignment?.certificate].map((ele) => {
              if (ele.certificate_type === "pass certificate")
                return { label: ele.certificate_name, value: ele.id };
            })
          : [];
        // const failCertificate = assignment?.certificates?.length
        //     ? assignment?.certificates.map(ele => {

        //         if (ele.certificate_type === 'fail certificate') return { label: ele.certificate_name, value: ele.id }
        //     })
        //     :
        //     [];
        reset({
          passCertificate,
          // failCertificate
        });
      }
    } catch (error) {
      console.log(error);
    }
  };
  // console.log("first", participationCertificate);

  useEffect(() => {
    getInitialData();
  }, []);
  return (
    <>
      <div className="col-span-12 xl:col-span-9 mr-5 ">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-0 bg-card rounded-md shadow-sm">
            <div className="col-span-12 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize">Certificates</h3>
            </div>

            <div className="grid grid-cols-12 gap-7 p-6">
              {/* Pass Certificate  */}
              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Pass Certificate</Label>
                  <Controller
                    name="passCertificate"
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
                        name="passCertificate"
                        options={passCertificate
                            .filter((loc) => !field.value || (field.value && field.value.value !== loc.id))
                          .map(ele => ({ label: ele.certificate_name, value: ele.id }))}
                        className="react-select"
                        classNamePrefix="select"
                      />
                    )}
                  />
                </div>
              </div>
              {/* Fail Certificate */}
              {/* <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Fail Certificate</Label>
                  <Controller
                    name="failCertificate"
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
                        isMulti
                        name="failCertificate"
                        options={failCertificate
                          .filter(
                            (loc) =>
                              !field.value?.some(
                                (selected) =>
                                  selected && selected.value === loc.id
                              )
                          )
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
              </div> */}
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
                handleBack(assignment.documentId);
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

export default AssignmentCertificate;
