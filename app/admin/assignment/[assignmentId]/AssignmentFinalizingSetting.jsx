import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from "@/components/ui/switch";

import ReactSelect from 'react-select'
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Controller, useForm, } from "react-hook-form"
import axiosInstance from '@/config/axios.config';
import { Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import { getValue } from '@unovis/ts';
import { useRouter } from 'next/navigation';
import { CleaveInput } from "@/components/ui/cleave";
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
function AssignmentFinalizingSetting({ handleBack, assignment }) {
    console.log("assignmnet from final page --",assignment)
    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        formState: { errors },
    } = useForm({
        mode: 'onChange'
    })
    const [assignmentDocumentId] = useState(assignment?.documentId)
    const router = useRouter()
    const [isPending, startTransition] = React.useTransition();
    const maxScore = watch('max_score')
    console.log("maxScore--from final page",maxScore)
    function hmsToMinutes(hms) {
        const [hours, minutes] = hms.split(":").map(Number);
        const totalMinutes = (hours * 60) + minutes;
        return Math.round(totalMinutes);
    }
    const onSubmit = (form) => {
        console.log('form', form);
        startTransition(async () => {
            try {
                const data = await axiosInstance({
                    url: `/api/assignments/${assignmentDocumentId}`,
                    method: 'PUT',
                    data: { data: { ...form, time_limits: hmsToMinutes(form.time_limits),    available: form.available, } },
                })
                toast.success("Save Successful");
                router.push('/admin/assignment')
            } catch (error) {
                console.log(error)
                toast.error('Something went wrong')
            }
        })
    }

    function minutesToHMS(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    useEffect(() => {
        setTimeout(() => {
            reset({
                max_score: assignment.max_score,
                options_randomization: assignment.options_randomization,
                question_randomization: assignment.question_randomization,
                time_limits: assignment.time_limits ? minutesToHMS(assignment.time_limits) : '',
                valid_attempts: assignment.valid_attempts,
                min_score: assignment.min_score,
                available: assignment?.available ?? false,
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
                                General Settings
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Allow Attempts <span class="text-red-500">*</span></Label>
                                    <Input type="number" placeholder="Maximum Attempts" className="rounded-sm h-14 text-base text-default-700" {...register("valid_attempts", {
                                        required: "Allow Attempts is required"
                                    })} />
                                    <FromError error={errors} name={'valid_attempts'} />
                                </div>
                            </div>

                        </div>

                        <div className="col-span-12 lg:col-span-12 px-6 pb-6">
                            <div className="space-y-2">
                                <Label className="text-base mr-2">Make Assignment Available</Label>
                                <Controller
                                    name="available"
                                    control={control}
                                    defaultValue={true}
                                    render={({ field }) => (
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    )}
                                />
                            </div>
                        </div>


                    </div>

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Scoring Settings
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Total Score <span class="text-red-500">(Calculated based on the scores assigned in questions)</span></Label>
                                    <Input disabled type="number" placeholder="Maximum Score" className="rounded-sm h-14 text-base text-default-700" {...register("max_score", {
                                        required: "Maximum Score is required"
                                    })} />
                                    <FromError error={errors} name={'max_score'} />
                                </div>
                            </div>


                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Qualification score <span class="text-red-500">*</span></Label>
                                    <Input type="number" placeholder="Qualification score" className="rounded-sm h-14 text-base text-default-700" {...register("min_score", {
                                        required: "Qualification Score is required",
                                        min: {
                                            value: 1,
                                            message: "Qualification Score Must be greater then 1"
                                        },
                                        max: {
                                            value: maxScore || 0,
                                            message: 'Qualification Score Must be less then total score'
                                        }
                                    })} />
                                    <FromError error={errors} name={'min_score'} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Time and Randomization Settings
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Time Limits <span class="text-red-500">*</span></Label>
                                    <Controller
                                        name="time_limits"
                                        control={control}
                                        rules={{ required: "Time Limits is required" }}
                                        render={({ field }) => <CleaveInput
                                            value={field.value}
                                            className="rounded-sm h-14 text-base text-default-700 read-only:leading-[48px]"
                                            id="time_limits"
                                            options={{
                                                blocks: [2, 2],
                                                delimiters: [":",],
                                                numericOnly: true,
                                            }}
                                            ref={field.ref}
                                            placeholder="HH:MM"
                                            onChange={(event) => field.onChange(event.target.value)}
                                        />}
                                    />
                                    <FromError error={errors} name={'time_limits'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base mr-2">Question Randomization <span class="text-red-500"></span></Label>
                                    <Controller
                                        name="question_randomization"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) =>
                                            // <Switch defaultValue={field.value} value={field.value} onValueChange={(value) => { field.onChange(value) }} />
                                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                                        }
                                    />

                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base mr-2">Options Randomization <span class="text-red-500"></span></Label>
                                    <Controller
                                        name="options_randomization"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) =>
                                            <Switch
                                                checked={field.value} // Use checked instead of value
                                                onCheckedChange={field.onChange} // Use onCheckedChange instead of onValueChange
                                            />
                                            // <Switch defaultValue={field.value} value={field.value} onValueChange={(value) => { field.onChange(value) }} />
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex mt-6 gap-4 justify-end">
                        <Button
                            type={'button'}
                            size="xl"
                            variant="outline"
                            color="default"
                            className="cursor-pointer"
                            onClick={() => { handleBack(assignment.documentId) }}
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
                            Submit
                        </Button>
                    </div>

                </form>
            </div>
        </>
    )
}

export default AssignmentFinalizingSetting