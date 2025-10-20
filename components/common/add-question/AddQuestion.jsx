'use client'
import React, { useEffect, useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Plus, Trash, FileText } from "lucide-react";
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from '@/components/ui/label';
import QuillEditor from './QuillEditor';
import { Input } from '@/components/ui/input';
import axiosInstance from '@/config/axios.config';
import ReactSelect from "react-select";
import toast from 'react-hot-toast';
import { useParams, useRouter } from 'next/navigation';
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
const Difficulty_level = [{ label: 'Beginner', value: 'Beginner' }, { label: 'Intermediate', value: 'Intermediate' }, { label: 'Advanced', value: 'Advanced' }]
function AddQuestion({ multiple = true, questionId, questionBankId, onSave, source }) {
    const { control, register, handleSubmit, watch, getValues, setValue, reset, formState: { errors } } = useForm();
    const { fields, append, remove } = useFieldArray({ control, name: "questions" });
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [descriptionVisible, setDescriptionVisible] = useState({});
    const questions = watch('questions');
    const params = useParams();
    const [previouse,setPrevious] = useState(0)
    // const questionId = params.id;
    const isEdit = questionId && questionId !== "new";
    const defaultValues = {
        question_type: "Subjective",
        question: '',
        description: '',
        score: 1,
        correct_option: '',
        options: [],
        is_edited:false,
    };

    const isEmptyOrSpaces = (str) => !str.trim().length;
    const toggleDescriptionVisibility = (index) => {
        setDescriptionVisible((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const submitQuestions = (form) => {
        startTransition(async () => {
            try {
                const res = []
                for (const ele of form.questions) {
                    if (ele.question_type === 'MCQ') {
                        const hasCorrectOption = ele.options.some(option => option.correct);
                        if (!hasCorrectOption) {
                            toast.error('Please select a correct option for all MCQ questions');
                            return;
                        }
                    }
                }

                for (const ele of form.questions) {

                    let isEdited = false;
                    let  isAdded = false ;

                    if(previouse > ele.score){
                        isEdited = true;
                    } else if(previouse < ele.score){
                         isAdded = true
                    }

                    const formData = {
                        question: ele.question,
                        description: ele.description,
                        question_type: ele.question_type,
                        score: ele.score,
                        difficulty_level: ele.difficulty_level.value,
                        is_editted:isEdited,
                        is_added : isAdded
                    }
                    console.log("formdata from questions page--",formData)
                    if (ele.question_type === 'MCQ') {
                        formData.options = ele.options.map((option, index) => ({
                            option: option.text,
                            correct: option.correct || false  // Store correct flag inside option
                        }));
                        // formData['correct_option'] = ele.correct_option
                        // formData['options'] = ele.options.map(option => ({ option: option.text }))
                    }
                    const { data } = await axiosInstance({
                        url: `/api/questions/${isEdit ? questionId : ''}`,
                        method: `${isEdit ? 'put' : 'post'}`,
                        data: {
                            data: formData
                        }
                    })
                    res.push(data.data)
                }
                if (typeof onSave === 'function')
                    onSave(res)
                toast.success("Save Successful");
            } catch (error) {

                console.log(error)
                toast.error('Something went wrong')
            }
        });
    };

    const onQuestionTypeChange = (value, index) => {
        if (value === 'MCQ') {
            setValue(`questions.${index}.options`, [{ text: '' }, { text: '' }, { text: '' }, { text: '' }]);
        } else {
            setValue(`questions.${index}.options`, []);
        }
    };

    const appendQuestion = () => {
        append(defaultValues);
    };

    const removeQuestion = (index) => {
        remove(index);
    };

    const addOption = (index) => {
        setValue(`questions.${index}.options`, [...getValues(`questions.${index}.options`), { text: '' }]);
    };

    // const removeOption = (index, optionIndex) => {
    //     const correct_option = getValues(`questions.${index}.correct_option`)
    //     if (parseInt(correct_option) === optionIndex) {
    //         setValue(`questions.${index}.correct_option`, null)
    //     }
    //     const options = getValues(`questions.${index}.options`);
    //     setValue(`questions.${index}.options`, options.filter((_, idx) => idx !== optionIndex));
    // };
    const removeOption = (index, optionIndex) => {
        const options = getValues(`questions.${index}.options`);
        const newOptions = options.filter((_, idx) => idx !== optionIndex);

        // If the removed option was correct, reset correct flag in remaining options
        if (options[optionIndex].correct) {
            newOptions.forEach((opt) => (opt.correct = false));
        }

        setValue(`questions.${index}.options`, newOptions);
    };
    useEffect(() => {
        if (fields.length === 0) {
            append(defaultValues);
        }
    }, [])

    const fetchSingleQuestion = async (questionDocumentId) => {
        try {
            const response = await axiosInstance({
                url: `/api/questions/${questionDocumentId}?populate=*`,
                method: "GET"
            });

            const responseData = response.data?.data;
            console.log("this is the responsedata from the assignment creation", responseData);
            if (responseData) {
                const transformedQuestions =
                    [{
                        correct_option: String(responseData.correct_option) || "",
                        difficulty_level: Difficulty_level.find(ele => ele.value === responseData.difficulty_level),
                        marks: String(responseData.marks) || "",
                        options: responseData.options.map((option, index) => ({
                            text: option.option,
                            // correct: index === responseData?.correct_option,
                            correct: option.correct  // Mark correct option
                        })),
                        // options: responseData.options.map((option) => ({ text: option.option })) || [],
                        question: responseData.question || "",
                        description: responseData.description || "",
                        question_type: responseData.question_type || "",
                        score: String(responseData.score)
                    }]
                    setPrevious(responseData?.score)

                reset({ questions: transformedQuestions })

            }

        } catch (error) {
            console.log(error);
            if (error.status === 404) router.push("/admin/question/new");
            return [];
        }
    };

    useEffect(() => {
        if (questionId && questionId !== "new") {
            fetchSingleQuestion(questionId);
        }
    }, [questionId]);

    return (
        <div className="">
            <form onSubmit={handleSubmit(submitQuestions)} className="space-y-6">
                <h2 className="text-lg font-medium text-default-800">{isEdit ? "Edit Question" : "Add Questions"}</h2>
                {fields.map((ele, index) => (
                    <div key={ele.id} className="bg-card mb-4">

                        <div className="grid grid-cols-12 gap-7">

                            <div className="col-span-6 lg:col-span-6">
                                <h3 className="text-2xl font-medium text-default-700 mb-2">Question {index + 1}</h3>
                            </div>

                            <div className="col-span-6 lg:col-span-6 flex justify-end">
                                <Controller
                                    control={control}
                                    name={`questions.${index}.question_type`}
                                    rules={{ required: "Question type is required" }}
                                    render={({ field }) => (
                                        <Tabs
                                            defaultValue="short"
                                            className="inline-block w-auto pb-4"
                                            value={field.value}
                                            onValueChange={(value) => {
                                                field.onChange(value);
                                                onQuestionTypeChange(value, index);
                                            }}
                                        >
                                            <TabsList className="rounded-full">
                                                <TabsTrigger
                                                    value="Subjective"
                                                    className="rounded-full data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
                                                >
                                                    Subjective
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="MCQ"
                                                    className="rounded-full data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
                                                >
                                                    Multiple Choice
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    )}
                                />

                            </div>

                        </div>





                        <div className="mb-4">

                            <div className="mb-4">
                                <Label className="py-2 text-base">Title</Label>
                                <div className='flex justify-between gap-0 border-b-2 border-t-0 border-l-0 border-r-0'>
                                    <Input placeholder="Add question title here" className="text-default-700 text-2xl rounded-none p-0  border-b-0  border-t-0 border-l-0 border-r-0" type="text" {...register(`questions.${index}.question`, {
                                        required: "Question is required",
                                        validate: (value) => !isEmptyOrSpaces(value) || "Can not be empty or spaces"
                                    })} />

                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        color="secondary"
                                        type="button"
                                        onClick={() => toggleDescriptionVisibility(index)}
                                    >
                                        <FileText />
                                    </Button>

                                </div>
                                <div>
                                    {errors?.questions?.[index]?.question && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.questions[index]?.question.message}
                                        </p>
                                    )}
                                </div>

                                {descriptionVisible[index] && <div>
                                    <Label className="py-4 text-base">Description</Label>
                                    <Controller
                                        control={control}
                                        name={`questions.${index}.description`}
                                        render={({ field }) => (
                                            <QuillEditor
                                                value={field.value}
                                                onValueChange={(content) => field.onChange(content)}
                                            />
                                        )}
                                    />
                                </div>}
                            </div>
                            {questions[index].question_type === "MCQ" && (
                                <div className="mt-4">
                                    <h5 className="text-sm font-medium text-default-700">Options</h5>
                                    <div className="mb-2">
                                        {questions[index].options.map((option, oIndex) => (
                                            <div key={oIndex} className="flex gap-2">
                                                <div className='bg-primary-foreground/[30] p-6 mb-4 rounded-md max-w-[740px]'>
                                                    <div>
                                                        {/* QuillEditor for option text */}
                                                        <Controller
                                                            control={control}
                                                            name={`questions.${index}.options.${oIndex}.text`}
                                                            rules={{ required: "Option is required" }}
                                                            render={({ field }) => (
                                                                <QuillEditor
                                                                    value={field.value}
                                                                    onValueChange={(content) => field.onChange(content)}
                                                                />
                                                            )}
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-12 pt-6">
                                                        <div className="col-span-6 lg:col-span-6">
                                                            <label className='items-center flex gap-2'>
                                                                <Controller
                                                                    control={control}
                                                                    name={`questions.${index}.options`}
                                                                    render={({ field }) => (
                                                                        <input
                                                                            type="radio"
                                                                            name={`questions.${index}.correct_option`}
                                                                            checked={questions[index].options[oIndex].correct}
                                                                            onChange={() => {
                                                                                // Ensure only one option is marked as correct
                                                                                const updatedOptions = questions[index].options.map((opt, i) => ({
                                                                                    ...opt,
                                                                                    correct: i === oIndex
                                                                                }));
                                                                                setValue(`questions.${index}.options`, updatedOptions);
                                                                            }}
                                                                            className="form-radio h-4 w-4"
                                                                        />
                                                                    )}
                                                                />
                                                                This is the correct answer
                                                            </label>
                                                        </div>
                                                        <div className="col-span-6 lg:col-span-6 flex justify-end">
                                                            {errors?.questions?.[index]?.options?.[oIndex]?.text && (
                                                                <p className="text-xs text-destructive mt-1">
                                                                    {errors.questions[index].options[oIndex].text.message}
                                                                </p>
                                                            )}

                                                            <div>
                                                                <Button
                                                                    size="md"
                                                                    type="button"
                                                                    variant="outline"
                                                                    color="default"
                                                                    className="cursor-pointer rounded-full h-6 w-6 p-0"
                                                                    onClick={() => removeOption(index, oIndex)}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 40 40">
                                                                        <path fill="currentColor" d="M21.499 19.994L32.755 8.727a1.064 1.064 0 0 0-.001-1.502c-.398-.396-1.099-.398-1.501.002L20 18.494L8.743 7.224c-.4-.395-1.101-.393-1.499.002a1.05 1.05 0 0 0-.309.751c0 .284.11.55.309.747L18.5 19.993L7.245 31.263a1.064 1.064 0 0 0 .003 1.503c.193.191.466.301.748.301h.006c.283-.001.556-.112.745-.305L20 21.495l11.257 11.27c.199.198.465.308.747.308a1.06 1.06 0 0 0 1.061-1.061c0-.283-.11-.55-.31-.747z" />
                                                                    </svg>
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {errors?.questions?.[index]?.correct_option && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors.questions[index].correct_option.message}
                                        </p>
                                    )}
                                    <Button
                                        type="button"
                                        size="md"
                                        variant="outline"
                                        color="primary"
                                        className="mt-2 mb-6"
                                        onClick={() => addOption(index)}
                                    >
                                        Add Option
                                    </Button>
                                </div>
                            )}


                            <div className="grid grid-cols-12 gap-7">

                                <div className="col-span-6 lg:col-span-6">
                                    <Label className="py-2 text-base">Difficulty level <span className='text-red-500'>*</span></Label>
                                    <Controller
                                        name={`questions.${index}.difficulty_level`}
                                        control={control}
                                        rules={{ required: "Difficulty level is required" }}
                                        render={({ field }) =>
                                            <ReactSelect
                                                defaultValue={field.value}
                                                value={field.value}
                                                onChange={(value) => { field.onChange(value) }}
                                                isClearable={false}
                                                styles={styles}
                                                name={`questions.${index}.difficulty_level`}
                                                options={Difficulty_level}
                                                className="react-select h-14 text-base text-default-700"
                                                classNamePrefix="select"
                                            />
                                        }
                                    />
                                </div>

                                <div className="col-span-6 lg:col-span-6">
                                    <Label className="py-2 text-base">Score</Label>
                                    <Input className="text-base" type="number" {...register(`questions.${index}.score`, {
                                        required: "Score is required",
                                        min: {
                                            value: 1,
                                            message: "Score must be at least 1",
                                        },
                                        max: {
                                            value: 100,
                                            message: "Score must be less then least 100",
                                        }
                                    })} />
                                </div>



                            </div>

                            {fields.length > 1 &&
                                <Button
                                    type="button"
                                    variant="outline"
                                    color="destructive"
                                    onClick={() => removeQuestion(index)}
                                >
                                    ✕
                                </Button>
                            }
                        </div>
                    </div>
                ))}

                <Button
                    type="submit"
                    size="xl"
                    variant="solid"
                    color="primary"
                    className="mt-0"
                    disabled={isPending}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save
                </Button>
            </form>
            {multiple && !isEdit && <Button
                type="button"
                size="xl"
                variant="outline"
                color="success"
                className="my-4"
                onClick={() => appendQuestion()}
            >
                <Plus className="mr-1" />
                Add Question
            </Button>}
        </div>
    );
}

export default AddQuestion;
