"use client"
import React, { useEffect, useState } from 'react'
import { Controller, useForm } from "react-hook-form"
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import axiosInstance from '@/config/axios.config';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useSelector } from 'react-redux';
import { CleaveInput } from "@/components/ui/cleave";
import ReactSelect from "react-select";

const FromError = ({ error, name }) => {
    return (
        <>
            {error[name]?.message ? (
                <p className={cn("text-xs text-destructive leading-none px-1.5 py-2 rounded-0.5")}>
                    {error[name]?.message}
                </p>
            ) : <></>}
        </>
    )
}
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
const ProposeCourse = ({ onSave, proCourseId, onClose }) => {
    const {
        register,
        handleSubmit,
        reset,
        watch,
        control,
        formState: { errors,isSubmitting  },
    } = useForm({
        mode: 'onChange'
    });
    const [isPending, startTransition] = React.useTransition();
    const [courseCategory, setCourseCategory] = useState([])
    const user = useSelector((state) => state.user);
    // const questionBankDocId = params?.questionBankId;
    // const isEdit = Boolean(params?.questionBankId);
    function hmsToMinutes(hms) {
        const [hours, minutes] = hms.split(":").map(Number);
        const totalMinutes = (hours * 60) + minutes;
        return Math.round(totalMinutes);
    }
    const isEdit = proCourseId && proCourseId !== 'new';
    const onSubmit = async (formData) => {
        console.log('formdata', formData);
        let result;
        if (isEdit) {
            const { data: fetch } = await axiosInstance({
                url: `/api/course-proposals/${proCourseId}?populate=*`,
                method: 'get'
            });
            result = fetch.data;
        }
        startTransition(async () => {
            try {
                const { data } = await axiosInstance({
                    url: isEdit ? `/api/course-proposals/${proCourseId}` : '/api/course-proposals',
                    method: isEdit ? 'PUT' : 'POST',
                    data: {
                        data: {
                            ...formData,
                            courses_categories: formData?.courses_categories.map((ele) => { return { id: ele.value } }) || [],
                            course_duration: hmsToMinutes(formData.course_duration),
                            author: user.id,
                            total_votes: !isEdit ? 0 : result?.total_votes,
                        }
                    }
                })

                // const questionBankId = data?.data?.id; 
                const proposedId = data?.data?.documentId;
                if (typeof onSave === 'function') {
                    onSave(data);
                }

                if (proposedId) {
                    toast.success("Course Proposed successfully!");
                } else {
                    throw new Error("Failed to Proposed Course");
                }
            } catch (error) {
                toast.error("Something went wrong: " + error.message);
            }
        });
    };
    function minutesToHMS(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    async function populateProposedCourse(proCourseId) {
        console.log("proCourseId", proCourseId);
        try {
            const { data } = await axiosInstance({
                url: `/api/course-proposals/${proCourseId}?populate=*`,
                method: 'GET',
            })
            console.log('data', data);
            reset({
                name: data?.data?.name || "",
                description: data?.data?.description || "",
                course_duration: data?.data?.course_duration ? minutesToHMS(data?.data?.course_duration) : '',
                // courses_categories: data?.data?.courses_categories || []
                courses_categories: data?.data?.courses_categories.map(ele => ({ label: ele.title, value: ele.id })) || []
            });

        } catch (error) {
            console.log("failed to populate question bank data", error);
        }
    }
    useEffect(() => {
        if (proCourseId && proCourseId !== "new") {

            populateProposedCourse(proCourseId);
        }
        getAllCategory();
    }, [proCourseId]);

    const handleCancel = () => {
        setTimeout(() => {
            reset({
                name: '',
                description: '',
                course_duration: ''
            });
        }, 0);

        // reset();
        if (typeof onClose === 'function') {
            onClose();
        }

    };

    const getAllCategory = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/courses-categories?status=draft',
                method: 'get',
            })
            console.log(data.data)
            setCourseCategory(data.data)
        } catch (error) {
            console.log(error)
        }
    }


    console.log("new proCourseId", proCourseId, 'categories', courseCategory);
    return (
        <div className="space-y-6">
            <div className="flex items-center flex-wrap justify-between gap-4">
                <div className="text-2xl font-medium text-default-800 ">
                    {isEdit ? "Update Proposed Course" : "Propose a Course"}
                </div>
            </div>
            <div className="col-span-12 xl:col-span-9 mr-5">
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="grid grid-cols-12 gap-7 p-6">

                            {/* Basic Course Information */}
                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Name<span class="text-red-500">*</span></Label>
                                    <Input
                                        type="text"
                                        placeholder="Course Title"
                                        className="rounded-sm h-14 text-base text-default-700"
                                        {...register("name", { required: "Course Title is required", maxLength: 100 })}
                                        disabled={isSubmitting}
                                    />
                                    <FromError error={errors} name={'name'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Description</Label>
                                    <Textarea
                                        type="text"
                                        placeholder="Course Description"
                                        className="rounded-sm h-14 text-base text-default-700"
                                        {...register("description", {
                                            maxLength: {
                                                value: 255,  // Limit to 255 characters (adjust if needed)
                                                message: "Description must be 255 characters or less."
                                            }
                                        })}
                                    // {...register("description")}
                                    />
                                    <FromError error={errors} name={'description'} />
                                    {/* {watch("description")?.length > 255 && (
                                        <p className="text-red-500 text-sm">Exceeded the character limit of 255.</p>
                                    )} */}
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Category <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name="courses_categories"
                                        control={control}
                                        rules={{ required: 'Course Categories is required' }}
                                        render={({ field }) =>
                                            <ReactSelect
                                                defaultValue={field.value}
                                                value={field.value}
                                                onChange={(value) => { field.onChange(value) }}
                                                isClearable={false}
                                                isDisabled={isSubmitting}
                                                styles={styles}
                                                isMulti
                                                name='courses_categories'
                                                options={courseCategory.map(ele => ({ label: ele.title, value: ele.id }))}
                                                className="react-select h-14 text-base text-default-700"
                                                classNamePrefix="select"
                                            />
                                        }
                                    />
                                    <FromError error={errors} name={'courses_categories'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Duration <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name="course_duration"
                                        control={control}
                                        rules={{ required: "Course Duration is required" }}
                                        render={({ field }) => <CleaveInput
                                            value={field.value}
                                            className="rounded-sm h-14 text-base text-default-700 read-only:leading-[48px]"
                                            id="course_duration"
                                            options={{
                                                blocks: [2, 2],
                                                delimiters: [":"],
                                                numericOnly: true,
                                            }}
                                            disabled={isSubmitting}
                                            ref={field.ref}
                                            placeholder="HH:MM"
                                            onChange={(event) => { field.onChange(event.target.value); }}
                                        />}
                                    />
                                    <FromError error={errors} name={'course_duration'} />
                                </div>
                            </div>
                            {/* <div className="flex">
                <Button
                  size="xl"
                  variant=""
                  color="default"
                  className="cursor-pointer"
                >
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
              </div> */}
                            <div className="flex mt-6 gap-4 justify-start col-start-8">
                                <Button
                                    type={'button'}
                                    size="xl"
                                    variant="outline"
                                    color="destructive"
                                    className="cursor-pointerl"
                                    onClick={handleCancel}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    size="xl"
                                    variant=""
                                    color="default"
                                    className="cursor-pointer"
                                    disabled={isSubmitting}
                                >
                                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit
                                </Button>

                            </div>
                        </div>

                    </div>
                </form>
            </div>
        </div>
    )
}

export default ProposeCourse;
