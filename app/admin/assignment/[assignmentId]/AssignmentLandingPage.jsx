import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import ReactSelect from 'react-select'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Controller, useForm, } from "react-hook-form"
import axiosInstance from '@/config/axios.config';
import { Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
const QuestionType = [{ label: 'Short', value: 'Short' }, { label: 'Long', value: 'Long' }, { label: 'MCQ', value: 'MCQ' }]

const FromError = ({ error, name }) => {
    return (
        <>
            {error[name]?.message ? <p className={cn("text-xs text-destructive leading-none px-1.5 py-2  rounded-0.5")} >
                {error[name]?.message}
            </p> : <></>}
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
function AssignmentLandingPage({ handleNext, assignment }) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: { errors },
    } = useForm({
        mode: 'onChange'
    })
    const [assignmentDocumentId] = useState(assignment?.documentId)
    const [isPending, startTransition] = React.useTransition();
    const [courseCategory, setCourseCategory] = useState([])
    const user = useSelector((state) => state.user);
    const onSubmit = (form) => {
        startTransition(async () => {
            try {
                const formData = {
                    ...form,
                    difficulty_level: form.difficulty_level,
                    courses_categories: form.courses_categories ? form.courses_categories.map((ele) => ele.value) : [],
                    user:user.id
                }
                const { data } = await axiosInstance({
                    url: assignmentDocumentId ? `/api/assignments/${assignmentDocumentId}` : '/api/assignments',
                    method: assignmentDocumentId ? 'PUT' : 'POST',
                    data: { data: formData },
                })
                if (typeof handleNext === 'function')
                    handleNext(data.data.documentId)
                toast.success("Save Successful");
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong')
            }
        })
    }

    const getAllCategory = async () => {
        try {
            const { data } = await axiosInstance({
                url: '/api/courses-categories?status=published',
                method: 'GET',
            })
            setCourseCategory(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getAllCategory()
        setTimeout(() => {
            reset({
                title: assignment.title,
                description: assignment.description,
                question_type: QuestionType.find(ele => ele.value === assignment.question_type),
                courses_categories: assignment?.courses_categories?.map(ele => ({ label: ele.title, value: ele.id })),
                difficulty_level: assignment?.difficulty_level
            })

        }, 0)
    }, [])

    return (
        <>
            <div className="col-span-12 xl:col-span-9 mr-5 ">
                <form onSubmit={handleSubmit(onSubmit)}>

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Basic Assignment Info
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">
                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Title <span class="text-red-500">*</span></Label>
                                    <Input type="text" placeholder="Assignment Title" className="rounded-sm h-14 text-base text-default-700" {...register("title", {
                                        required: "Assignment Title is required"
                                    })} />
                                    <FromError error={errors} name={'title'} />
                                </div>
                            </div>



                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Descriptions</Label>
                                    <Textarea className="rounded-sm text-base text-default-700" placeholder="Type Descriptions Here..." id="rows-5" rows="4" {...register("description", {
                                    })} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label >Difficulty Level</Label>
                                    <Controller
                                        name="difficulty_level"
                                        defaultValue="Intermediate"
                                        control={control}
                                        render={({ field }) =>
                                            <Select defaultValue={field.value} value={field.value} onValueChange={(value) => { field.onChange(value) }} >
                                                <SelectTrigger className="rounded-sm h-14  text-base text-default-700">
                                                    <SelectValue placeholder="Select Difficulty Level" >
                                                    </SelectValue>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        }
                                    />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Category</Label>
                                    <Controller
                                        name="courses_categories"
                                        control={control}
                                        render={({ field }) =>
                                            <ReactSelect
                                                defaultValue={field.value}
                                                value={field.value}
                                                onChange={(value) => { field.onChange(value) }}
                                                isClearable={false}
                                                styles={styles}
                                                isMulti
                                                name='courses_categories'
                                                options={courseCategory.map(ele => ({ label: ele.title, value: ele.id }))}
                                                className="react-select text-base text-default-700"
                                                classNamePrefix="select"
                                            />
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex mt-6 gap-4 justify-end">
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
    )
}

export default AssignmentLandingPage