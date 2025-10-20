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
import ReactSelect from "react-select";
import { CleaveInput } from "@/components/ui/cleave";
import FileInput from "./FileSelectInput"
import React, { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils";
import { Controller, useFieldArray, useForm, } from "react-hook-form"
import axiosInstance from '@/config/axios.config';
import { Loader2 } from "lucide-react";
import toast from 'react-hot-toast';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
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
function CourseLandingPage({ handleNext, course, isPublished, setIsPublished }) {
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { errors, submitCount },
    } = useForm({
        mode: 'onChange',
        defaultValues: {
            highlights: [{ name: '' }, { name: '' }],
            isPublished: course?.isPublished || false,
        }
    })
    const { fields, append, remove } = useFieldArray({ control, name: "highlights", });
    const [isPending, startTransition] = React.useTransition();
    const [imageFiles, setImageFiles] = useState([])
    const [imageId, setImageId] = useState(course?.course_thumbnail?.id || null); // Initialize with the existing image ID
    const [videoFiles, setVideoFiles] = useState([])
    const [courseCategory, setCourseCategory] = useState([])
    const [courseDocumentId, setCourseDocumentId] = useState('')
    const [isFormModified, setIsFormModified] = useState(false);
    const [isImageChanged, setIsImageChanged] = useState(false);
    const [isLoading,setIsLoading] = useState(false)

    const handlePublishToggle = async (value) => {
        try {
            await axiosInstance({
                url: `/api/courses/${course.documentId}?status=published`,
                method: 'PUT',
                data: { data: { isPublished: value } }
            });

            // Update state only on success
            setIsPublished(value);
            setValue("isPublished", value);
            toast.success(value ? "Course Published!" : "Course Unpublished!");
        } catch (error) {
            console.log(error);
            toast.error("Failed to update publish status");
        }
    };
    const uploadFile = async (files) => {

        let formData = new FormData();
        formData.append("files", files);
        const { data } = await axiosInstance({
            url: '/api/upload/',
            method: 'post',
            data: formData
        })
        const fileId = data[0].id
        return fileId
    }

    // const handleImageChange = (file) => {
    //     console.log("we are in the handle image change section", file);
    //     setImageFiles(file);
    //     setImageId(null);
    //     setIsImageChanged(true);
    // };
    const handleImageChange = async (file) => {
        setImageFiles(file);
        setImageId(null);
        setIsImageChanged(true);

        if (file?.length && file[0]?.name) {
            try {
                const uploadedImageId = await uploadFile(file[0]);

                if (courseDocumentId) {
                    // Immediately save thumbnail to course
                    await axiosInstance.put(`/api/courses/${courseDocumentId}`, {
                        data: {
                            course_thumbnail: uploadedImageId,
                        },
                    });
                    toast.success("Image uploaded and saved!");
                    setIsImageChanged(false); // reset this since image is now saved
                }
            } catch (error) {
                console.error("Image upload failed:", error);
                toast.error("Image upload failed");
            }
        }
    };
    const handleVideoChange = async (file) => {
        console.log("Video selected", file);
        setVideoFiles(file)
       
        if (!file?.length) {
            console.log("file empty fjfnvkj", file);
            if (courseDocumentId) {
                try {
                    
                    await axiosInstance.put(`/api/courses/${courseDocumentId}`, {
                        data: {
                            course_intro_video: null, 
                        },
                    });
                    toast.success("Video removed successfully from the backend!");
                } catch (error) {
                    console.error("Error removing video:", error);
                    toast.error("Failed to remove vid b           eo from the backend.");
                }
            }
        } else if (file?.length && file[0]?.name) {
           
            try {
                const uploadedVideoId = await uploadFile(file[0]);
                if (courseDocumentId) {
                    await axiosInstance.put(`/api/courses/${courseDocumentId}`, {
                        data: {
                            course_intro_video: uploadedVideoId,  
                        },
                    });
                    toast.success("Video uploaded and saved!");
                }
            } catch (error) {
                console.error("Video upload failed:", error);
                toast.error("Video upload failed");
            }
        }
    };

    const handleFieldChange = () => {
        setIsFormModified(true);
    };

    const getAllCategory = async () => {
        try {
            const { data } = await axiosInstance({
                url: `/api/courses-categories?status=${isPublished ? "published" : "draft"}`,
                method: 'get',
            })
            console.log(data.data)
            setCourseCategory(data.data)
        } catch (error) {
            console.log(error)
        }
    }

    const onSubmit = async (form) => {
        startTransition(async () => {
            try {
                const tags = form?.course_tags ? form?.course_tags.split(',') : [];
                const formData = {
                    'data': {
                        ...form,
                        course_duration: hmsToMinutes(form.course_duration),
                        course_completion_time: form.course_completion_time ? daysToMinutes(form.course_completion_time) : 0,
                        course_mandatory: form.course_mandatory === 'on' || form.course_mandatory === true,
                        course_tags: tags.map((tag) => ({ tag_name: tag })),
                        courses_categories: form?.courses_categories?.map((category) => category.value),
                        // course_thumbnail: imageFiles?.length && imageFiles[0]?.name ? await uploadFile(imageFiles[0]) : null,
                        // course_intro_video: videoFiles?.length && videoFiles[0]?.name ? await uploadFile(videoFiles[0]) : null,
                    },
                };

                if (!courseDocumentId) {
                    formData.data['completed_progress'] = 10;
                }

                // if (imageFiles?.length && imageFiles[0]?.name) {
                //     const fileId = await uploadFile(imageFiles[0]);
                //     formData.data['course_thumbnail'] = await uploadFile(imageFiles[0]);
                // } 


                if (!courseDocumentId && imageFiles?.length && imageFiles[0]?.name) {
                    const fileId = await uploadFile(imageFiles[0]);
                    formData.data['course_thumbnail'] = fileId;
                }
                // else if (courseDocumentId) {
                //     formData.data['course_thumbnail'] = null;
                // }

                if (videoFiles?.length && videoFiles[0]?.name) {
                    const fileId = await uploadFile(videoFiles[0]);
                    formData.data['course_intro_video'] = fileId;
                }
                const { data } = await axiosInstance({
                    url: courseDocumentId ? `/api/courses/${courseDocumentId}?status=${isPublished ? "published" : "draft"}` : `/api/courses?status=${isPublished ? "published" : "draft"}`,
                    method: courseDocumentId ? 'PUT' : 'POST',
                    data: formData,
                    // { ...formData, course_enrollments: enrollments }
                    // data: courseDocumentId ? { "data": { ...formData?.data, course_enrollments: enrollments } } : { "data": { ...formData?.data } },
                });
                if (typeof handleNext === 'function' && !courseDocumentId) {
                    handleNext(data.data.documentId);
                }

                setIsFormModified(false);
                setIsImageChanged(false);
                toast.success("Save Successful");
            } catch (error) {
                console.error(error);
                toast.error('Something went wrong');
            }
        });
    };

    useEffect(() => {
        getAllCategory()
        if (course) {
            console.log(course, 'coursess')
            const data = {
                title: course.title,
                short_description: course.short_description,
                course_type: course.course_type,
                course_mandatory: course.course_mandatory,
                course_duration: course.course_duration ? minutesToHMS(course.course_duration) : '',
                course_completion_time: course.course_completion_time ? minutesToDays(course.course_completion_time) : '',
                courses_categories: course?.courses_categories?.map(ele => ({ label: ele.title, value: ele.id })),
                difficulty_level: course?.difficulty_level,
                highlights: course?.highlights.map(ele => ({ name: ele.name }))
            }

            if (course?.course_tags?.length)
                data['course_tags'] = course.course_tags.map(ele => ele.tag_name).join(',')
            if (course.course_thumbnail) {
                setImageFiles([course.course_thumbnail.url])
            }
            setCourseDocumentId(course.documentId)
            if (course.course_intro_video)
                setVideoFiles([course.course_intro_video.url])
            // setTimeout(() => {
            //     reset(data)
            // }, 0)
            setTimeout(() => {
                reset(data);
            }, 500);
        }
    }, [course])
    function minutesToHMS(totalMinutes) {
        const hours = Math.floor(totalMinutes / 60);
        const minutes = Math.floor(totalMinutes % 60);
        const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    function minutesToDays(totalMinutes) {
        const days = Math.floor(totalMinutes / 1440);
        return days;
    }
    function hmsToMinutes(hms) {
        const [hours, minutes, seconds] = hms.split(":").map(Number);
        const totalMinutes = (hours * 60) + minutes + (seconds / 60);
        return Math.round(totalMinutes);
    }
    function daysToMinutes(days) {
        const totalMinutes = Number(days) * 1440
        return totalMinutes;
    }


    const appendHightLight = () => {
        append({ name: '' })
    }
    const removeHightLight = (index) => {
        remove(index)
    }

    const handleOnBlur = () => {
        console.log(202, courseDocumentId)
        if (courseDocumentId) {
            handleSubmit(onSubmit)
        }
    }
    const formEvent = {
        onSubmit: !courseDocumentId ? handleSubmit(onSubmit) : () => { },
        onBlur: courseDocumentId
            ? () => {
                if (isFormModified || isImageChanged) {
                    console.log('niknikeninvinevik')
                    handleSubmit(onSubmit)();
                }
            }
            : () => { },
    };
    return (
        <>
            <div className="col-span-12 xl:col-span-9 md:mr-5 mr-0">
                <form
                    {...formEvent}
                >

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row justify-between">
                            <h3 className="text-xl font-medium capitalize">
                                Basic Course Info
                            </h3>
                            {/* <div className="col-span-12 lg:col-span-12 mt-3"> */}
                            <div className="space-y-2 justify-end">
                                <Label className="text-base">Course Publish</Label>
                                <span className='p-2'>
                                    <Controller
                                        name="isPublished"
                                        control={control}
                                        render={({ field }) => (
                                            <Switch
                                                checked={isPublished}
                                                onCheckedChange={handlePublishToggle}
                                                variant="filled"
                                                id="fill_1"
                                                disabled={!courseDocumentId}
                                            />
                                        )}
                                    />
                                </span>
                            </div>
                            {/* </div> */}
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">

                            {/* Basic Course Information */}
                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Title <span className='text-red-500'>*</span></Label>
                                    <Input type="text" placeholder="Course Title" className="rounded-sm h-14 text-base text-default-700" {...register("title", {
                                        required: "Course Title is required"
                                    })} onChange={(e) => {
                                        handleFieldChange();
                                        setValue("title", e.target.value);
                                    }} />
                                    <FromError error={errors} name={'title'} />
                                </div>
                            </div>



                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Short Descriptions <span className='text-red-500'>*</span></Label>
                                    <Textarea className="rounded-sm text-base text-default-700" placeholder="Type Descriptions Here..." id="rows-5" rows="2" {...register("short_description", {
                                        required: "Course descriptions is required"
                                    })} onChange={(e) => {
                                        handleFieldChange();
                                        setValue("short_description", e.target.value);
                                    }} />
                                    <FromError error={errors} name={'short_description'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Category <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name="courses_categories"
                                        control={control}
                                        rules={{ required: 'Course Categories is required' }}
                                        render={({ field }) => {
                                            console.log('fields', field);
                                            console.log('courseCategory', courseCategory);
                                            return <ReactSelect
                                                defaultValue={field.value}
                                                value={field.value}
                                                onChange={(value) => { handleFieldChange(); field.onChange(value) }}
                                                isClearable={false}
                                                styles={styles}
                                                isMulti
                                                name='courses_categories'
                                                options={courseCategory
                                                    .filter((ele) =>
                                                        !field.value?.some((selected) => selected.value === ele.id) // Compare numbers directly
                                                    )
                                                    .map((ele) => ({ label: ele.title, value: ele.id }))}

                                                className="react-select h-14 text-base text-default-700"
                                                classNamePrefix="select"
                                            />
                                        }}
                                    />
                                    <FromError error={errors} name={'courses_categories'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <div className="space-y-2">
                                    <Label className="text-base">Tags (use a comma separator)</Label>
                                    <Textarea className="rounded-sm  text-base text-default-700" placeholder="Enter Tags" id="rows-10" rows="3"  {...register("course_tags")} onChange={(e) => {
                                        handleFieldChange();
                                        setValue("course_tags", e.target.value);
                                    }} />
                                </div>
                            </div>

                        </div>

                    </div>

                    {/* Course Hightlights */}

                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Course Highlights
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">
                            {fields.map((ele, index) =>
                                <div className="col-span-12 lg:col-span-12">
                                    <div className="space-y-2">
                                        <Label className="text-base">Highlight {index + 1} <span className='text-red-500'>*</span></Label>
                                        <div className='flex gap-4'>
                                            <Input key={ele.id} type="text" placeholder="Course Title" className="rounded-sm h-14 text-base text-default-700" {...register(`highlights.${index}.name`, {
                                                required: "Course Highlight is required"
                                            })} onChange={(e) => {
                                                handleFieldChange();
                                                setValue(`highlights.${index}.name`, e.target.value);
                                            }} />
                                            <Button
                                                type="button"
                                                size="md"
                                                variant="outline"
                                                color="default"
                                                className="cursor-pointer rounded-full h-6 w-6 p-0"
                                                onClick={() => { removeHightLight(index) }}
                                            >

                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 40 40"><path fill="currentColor" d="M21.499 19.994L32.755 8.727a1.064 1.064 0 0 0-.001-1.502c-.398-.396-1.099-.398-1.501.002L20 18.494L8.743 7.224c-.4-.395-1.101-.393-1.499.002a1.05 1.05 0 0 0-.309.751c0 .284.11.55.309.747L18.5 19.993L7.245 31.263a1.064 1.064 0 0 0 .003 1.503c.193.191.466.301.748.301h.006c.283-.001.556-.112.745-.305L20 21.495l11.257 11.27c.199.198.465.308.747.308a1.06 1.06 0 0 0 1.061-1.061c0-.283-.11-.55-.31-.747z" /></svg>

                                            </Button>

                                        </div>
                                        {errors?.highlights?.[index]?.name?.message && <p className={cn("text-xs text-destructive leading-none px-1.5 py-2  rounded-0.5")} >
                                            {errors.highlights[index].name.message}
                                        </p>}
                                    </div>
                                </div>
                            )}
                            <div>
                                <Button
                                    type="button"
                                    size="md"
                                    variant="outline"
                                    color="default"
                                    className="cursor-pointer rounded-full"
                                    onClick={() => { appendHightLight() }}
                                >

                                    Add Highlight <svg xmlns="http://www.w3.org/2000/svg" width="1.7em" height="1.7em" className="ml-2" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12m11-4.243a1 1 0 1 0-2 0V11H7.757a1 1 0 1 0 0 2H11v3.243a1 1 0 1 0 2 0V13h3.243a1 1 0 1 0 0-2H13z" clip-rule="evenodd" /></svg>
                                </Button>
                            </div>
                        </div>


                    </div>


                    {/* Course Structure */}
                    <div className="p-0 bg-card rounded-md shadow-sm mb-6">

                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Course Structure
                            </h3>
                        </div>

                        <div className="grid grid-cols-12 gap-7 p-6">

                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Type <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name="course_type"
                                        control={control}
                                        rules={{ required: "Course Type is required" }}
                                        render={({ field }) => <Select defaultValue={field.value} value={field.value} onValueChange={(value) => { handleFieldChange(); field.onChange(value) }}  >
                                            <SelectTrigger className="rounded-sm h-14 text-base text-default-700">
                                                <SelectValue placeholder="Select Course Type" >
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Self Placed">Self Placed</SelectItem>
                                                <SelectItem value="Instructor">Instructor</SelectItem>
                                            </SelectContent>
                                        </Select>}
                                    />
                                    <FromError error={errors} name={'course_type'} />
                                </div>
                            </div>


                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Difficulty level <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name="difficulty_level"
                                        control={control}
                                        rules={{ required: "Difficulty level is required" }}
                                        render={({ field }) => <Select defaultValue={field.value} value={field.value} onValueChange={(value) => { handleFieldChange(); field.onChange(value) }} >
                                            <SelectTrigger className="rounded-sm h-14  text-base text-default-700">
                                                <SelectValue placeholder="Select Course Type" >
                                                </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Beginner">Beginner</SelectItem>
                                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                                <SelectItem value="Advanced">Advanced</SelectItem>
                                            </SelectContent>
                                        </Select>}
                                    />
                                    <FromError error={errors} name={'difficulty_level'} />
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
                                                blocks: [2, 2, 2],
                                                delimiters: [":", ":"],
                                                numericOnly: true,
                                            }}
                                            ref={field.ref}
                                            placeholder="HH:MM:SS"
                                            onChange={(event) => { field.onChange(event.target.value); handleFieldChange(); }}
                                        />}
                                    />
                                    <FromError error={errors} name={'course_duration'} />
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Completion Deadline (in Days)</Label>
                                    <Input type="text" placeholder="Completion Deadline (in days)" className="rounded-sm h-14 text-base text-default-700" {...register("course_completion_time")} onChange={(e) => {
                                        handleFieldChange();
                                        setValue("course_completion_time", e.target.value);
                                    }} />
                                    {/* <Controller
                                        name="course_completion_time"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) =>
                                            <CleaveInput
                                                value={field.value}
                                                className="rounded-sm h-14 text-md read-only:leading-[48px]"
                                                id="course_completion_time"
                                                options={{
                                                    blocks: [2, 2, 2],
                                                    delimiters: [":", ":"],
                                                    numericOnly: true,
                                                }}
                                                placeholder="DD:HH:MM"
                                                onChange={(event) => field.onChange(event.target.value)}

                                            />
                                        }
                                    /> */}

                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-12">
                                <span className='space-y-2'>
                                    <Label className="text-base">Choose Type of Subject</Label>
                                    <Controller
                                        name="course_mandatory"
                                        control={control}
                                        rules={{}}
                                        render={({ field }) =>
                                            <RadioGroup defaultValue={false} value={field.value} onValueChange={(value) => { handleFieldChange(); field.onChange(value) }}>
                                                <RadioGroupItem value={true} id="r_1" color="">
                                                    Mandatory
                                                </RadioGroupItem>
                                                <RadioGroupItem value={false} id="r_2">
                                                    Elective
                                                </RadioGroupItem>
                                            </RadioGroup>
                                        }
                                    />
                                </span>
                            </div>


                        </div>
                    </div>

                    {/* Media & Visuals Block */}

                    <div className="p-0 bg-card rounded-md shadow-sm">
                        <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                            <h3 className="text-xl font-medium capitalize">
                                Media & Visuals
                            </h3>
                        </div>
                        <div className="grid grid-cols-12 gap-7 p-6">
                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Cover Image</Label>
                                    {/* <FileInput
                                        className="rounded-sm"
                                        onChange={(file) => handleImageChange(file)}
                                        initialFile={imageFiles}
                                    /> */}
                                    <FileInput
                                        className="rounded-sm"
                                        onChange={(file) => {
                                            handleImageChange(file);
                                            handleFieldChange();
                                            if (courseDocumentId) {
                                                handleSubmit(onSubmit)();
                                            }
                                        }}
                                        initialFile={imageFiles}
                                    />
                                </div>
                            </div>
                            <div className="col-span-12 lg:col-span-6">
                                <div className="space-y-2">
                                    <Label className="text-base">Intro Video</Label>
                                    {/* <FileInput
                                        className="rounded-sm"
                                        mediaType="video"
                                        onChange={(file) => {
                                            setVideoFiles(file);
                                            handleFieldChange();
                                            if (courseDocumentId) {
                                                console.log("Video changed - Submitting form");
                                                handleSubmit(onSubmit)();
                                            }
                                        }}
                                        initialFile={videoFiles}
                                    /> */}
                                    <FileInput
                                        className="rounded-sm"
                                        mediaType="video"
                                        onChange={(file) => {
                                            handleVideoChange(file);  
                                            handleFieldChange();      
                                            if (courseDocumentId) {
                                                console.log("Video changed - Submitting form");
                                                handleSubmit(onSubmit)();  
                                            }
                                        }}
                                        initialFile={videoFiles}  
                                    />

                                    {/* <FileInput className="rounded-sm" mediaType='video' onChange={(file) => { setVideoFiles(file) }} initialFile={videoFiles} /> */}
                                </div>
                            </div>


                        </div>
                    </div>

                    <div className="flex mt-6 gap-4 justify-end">
                        {courseDocumentId ? <Button
                            type="button"
                            size="xl"
                            variant=""
                            color="default"
                            className="cursor-pointer"
                            onClick={() => {
                                if (isFormModified || isImageChanged) {
                                    handleSubmit(onSubmit)();
                                }
                                handleNext(courseDocumentId);
                            }}
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next
                        </Button> : <Button
                            size="xl"
                            variant=""
                            color="default"
                            className="cursor-pointer"
                        >
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Next
                        </Button>}
                    </div>

                </form>
            </div>
        </>
    )
}

export default CourseLandingPage