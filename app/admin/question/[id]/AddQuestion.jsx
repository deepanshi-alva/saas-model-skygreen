"use client";
import { useEffect, useState, useTransition } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import Select from "react-select";
import axiosInstance from "@/config/axios.config";
import { Loader2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const handleError = (error, message) => {
    console.error(message, error);
    return null;
};

const fetchSingleQuestion = async (questionDocumentId) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/question-banks/${questionDocumentId}?populate=*`,
            method: "GET"
        });
        return data?.data || null;
    } catch (error) {
        return handleError(error, "Failed to fetch the question");
    }
};

const addNewQuestion = async (questionData) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/question-banks`,
            method: "POST",
            data: questionData
        });
        return data?.data;
    } catch (error) {
        return handleError(error, "Failed to add Question");
    }
};

const updateQuestion = async (questionDocumentId, questionData) => {
    try {
        const { data } = await axiosInstance({
            url: `/api/question-banks/${questionDocumentId}`,
            method: "PUT",
            data: questionData,
        });
        return data?.data;
    } catch (error) {
        return handleError(error, "Failed to update the question");
    }
};

export default function AddQuestion({ existingQuestion }) {

    useEffect(() => {
        if (existingQuestion !== "new") {
            fetchSingleQuestion(existingQuestion);
        }
    }, [existingQuestion]);

    const {
        control,
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        reset,
        formState: { errors, isValid },
    } = useForm({
        defaultValues: existingQuestion ? {
            questions: existingQuestion.questions || [{ type: "short", text: "", options: [] }]
        } : {
            questions: [{ type: "short", text: "", options: [] }],
        },
        mode: "onChange"
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "questions",
    });

    const watchQuestions = watch("questions");
    const [isPending, startTransition] = useTransition();
    const isEmptyOrSpaces = (str) => !str.trim().length;

    const addOption = (questionIndex) => {
        const currentOptions = watchQuestions[questionIndex]?.options || [];
        if (currentOptions.length === 0) {
            setValue(`questions.${questionIndex}.options`, [
                { text: "", isCorrect: false },
            ]);
        } else {
            setValue(`questions.${questionIndex}.options`, [
                ...currentOptions,
                { text: "", isCorrect: false },
            ]);
        }
    };

    const handleUpdate = async (input) => {
        const formattedQuestion = formatQuestion(input.questions[0]);
        if (existingQuestion) {
            const updatedQuestion = await updateQuestion(existingQuestion, formattedQuestion);
            if (updatedQuestion) console.log("Question updated successfully");
        }
    };

    const onSubmit = async (input) => {
        let hasError = false;

        input.questions.forEach((question, index) => {
            if (question.correctOption === undefined) {
                setError(`questions.${index}.correctOption`, {
                    type: "manual",
                    message: "Please select a correct option.",
                });
                hasError = true;
            }
        });

        const formattedQuestion = formatQuestion(input.questions[0]);
        if (existingQuestion && existingQuestion !== "new") {
            const res = await handleUpdate(input);
            if (res) console.log("Question updated successfully");
        } else {
            if (formattedQuestion) {
                const result = await addNewQuestion(formattedQuestion);
                if (result) console.log("Question added successfully");
            }
        }
        reset();
    };

    const formatQuestion = (question) => {
        const { type, text, options } = question;
        const formattedQuestion = {
            data: {
                Name: text?.trim() || "",
                Type: type || "",
            },
        };
    
        if (type === "mcq" && Array.isArray(options)) {
            formattedQuestion.data.Options = options
                .filter(({ text }) => text?.trim()) 
                .map(({ text, isCorrect }) => ({
                    text: text.trim(),
                    isCorrect: !!isCorrect, 
                }));
        }
    
        return formattedQuestion;
    };
    

    return (
        <div className="">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <h2 className="text-lg font-medium text-default-800">{existingQuestion !== "new" ? "Edit Question" : "Add Questions"}</h2>

                {fields.map((question, questionIndex) => (
                    <div
                        key={questionIndex}
                        className="p-4 border border-default-300 rounded-md shadow-sm mb-4 bg-card"
                    >
                        <h4 className="text-md font-medium text-default-700 mb-2">Question {questionIndex + 1}</h4>

                        {/* Question Type */}
                        <div className="mb-4">
                            <Controller
                                control={control}
                                name={`questions.${questionIndex}.type`}
                                rules={{ required: "Question type is required" }}
                                render={({ field: { onChange, value } }) => (
                                    <>
                                        <Tabs defaultValue="short" className="inline-block w-auto"
                                            value={value}
                                            onValueChange={(selectedValue) => {
                                                onChange(selectedValue);
                                                if (selectedValue === "mcq") {
                                                    addOption(questionIndex);
                                                } else {
                                                    setValue(`questions.${questionIndex}.options`, []);
                                                }
                                            }}
                                        >
                                            <TabsList className="rounded-full">
                                                <TabsTrigger
                                                    value="short"
                                                    className="rounded-full data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
                                                >
                                                    Short
                                                </TabsTrigger>
                                                <TabsTrigger
                                                    value="long"
                                                    className="rounded-full data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
                                                >
                                                    Long
                                                </TabsTrigger>

                                                <TabsTrigger
                                                    value="mcq"
                                                    className="rounded-full data-[state=active]:bg-warning data-[state=active]:text-warning-foreground"
                                                >
                                                    MCQ
                                                </TabsTrigger>
                                            </TabsList>
                                        </Tabs>
                                    </>
                                )}
                            />
                        </div>


                        {/* Question Text */}
                        <div className="mb-4">
                            <Label className="py-2">Question Name</Label>
                            <Input
                                className="input"
                                {...register(`questions.${questionIndex}.text`, {
                                    required: "Question text is required",
                                    maxLength: {
                                        value: 200,
                                        message: "Question text cannot exceed 200 characters",
                                    },
                                    validate: (value) => !isEmptyOrSpaces(value) || "Cannot be empty spaces",
                                })}
                                placeholder="Enter question text"
                            />
                            {errors?.questions?.[questionIndex]?.text && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.questions?.[questionIndex]?.text.message}
                                </p>
                            )}
                            
                        </div>

                        {/* MCQ Options */}
                        {watchQuestions[questionIndex]?.type === "mcq" && (
                            <div className="mt-4 grid grid-cols-2">
                                <h5 className="text-sm font-medium text-default-700">Options</h5>
                                {watchQuestions[questionIndex]?.options?.map((option, optIndex) => (
                                    <div key={optIndex}>
                                        <div key={optIndex} className="flex items-center gap-2 mb-2">

                                            {/* Option Input */}
                                            <Input
                                                className="input w-full"
                                                {...register(`questions.${questionIndex}.options.${optIndex}.text`, {
                                                    required: "Option text is required",
                                                    validate: {
                                                        emptyCheck: (value) =>
                                                            !isEmptyOrSpaces(value) || "Cannot be empty spaces",
                                                    },
                                                })}
                                                placeholder={`Option ${optIndex + 1}`}
                                            />

                                            {/* Delete Option Button */}
                                            {watchQuestions[questionIndex]?.options?.length > 1 && <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                color="destructive"
                                                onClick={() => {
                                                    const updatedOptions = watchQuestions[questionIndex]?.options.filter(
                                                        (_, index) => index !== optIndex
                                                    );
                                                    setValue(`questions.${questionIndex}.options`, updatedOptions);

                                                    if (
                                                        watch(`questions.${questionIndex}.correctOption`) === optIndex ||
                                                        watch(`questions.${questionIndex}.correctOption`) >= updatedOptions.length
                                                    ) {
                                                        setValue(`questions.${questionIndex}.correctOption`, null);
                                                    }
                                                }}
                                            >
                                                ✕
                                            </Button>
                                            }
                                        </div>

                                        {/* Error Message for Option */}
                                        {errors?.questions?.[questionIndex]?.options?.[optIndex]?.text && (
                                            <p className="text-xs text-destructive mt-1">
                                                {errors.questions?.[questionIndex].options[optIndex].text.message}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {/* Correct Option Dropdown */}
                                {watchQuestions[questionIndex]?.options?.length > 0 && (
                                    <div className="mt-2">
                                        <Label className="text-sm text-default-700">Select Correct Option</Label>
                                        <Controller
                                            control={control}
                                            name={`questions.${questionIndex}.correctOption`}
                                            rules={{
                                                validate: (value) =>
                                                    value !== undefined || "Please select a correct option.",
                                            }}
                                            render={({ field, fieldState: { error } }) => (
                                                <>
                                                    <Select
                                                        options={watchQuestions[questionIndex]?.options.map((_, index) => ({
                                                            value: index,
                                                            label: `Option ${index + 1}`,
                                                        }))}
                                                        value={
                                                            field.value !== undefined
                                                                ? {
                                                                    value: field.value,
                                                                    label: `Option ${field.value + 1}`,
                                                                }
                                                                : null
                                                        }
                                                        onChange={(selected) => {
                                                            const selectedIndex = selected?.value;

                                                            setValue(`questions.${questionIndex}.correctOption`, selectedIndex, {
                                                                shouldValidate: true,
                                                            });

                                                            const updatedOptions = watchQuestions[questionIndex]?.options.map(
                                                                (option, index) => ({
                                                                    ...option,
                                                                    isCorrect: index === selectedIndex,
                                                                })
                                                            );

                                                            setValue(`questions.${questionIndex}.options`, updatedOptions, {
                                                                shouldValidate: true,
                                                            });
                                                        }}
                                                        placeholder="Select Correct Option"
                                                        isClearable
                                                    />
                                                    {error && (
                                                        <p className="text-xs text-destructive mt-1">
                                                            {error.message}
                                                        </p>
                                                    )}
                                                </>
                                            )}
                                        />

                                    </div>
                                )}


                                {/* Add Option Button */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    color="primary"
                                    className="mt-2"
                                    onClick={() => addOption(questionIndex)}
                                >
                                    <Plus className="mr-1" />
                                    Add Option
                                </Button>
                            </div>
                        )}
                        {fields.length > 1 && (
                            <Button
                                type="button"
                                variant="outline"
                                color="destructive"
                                className="mt-4"
                                onClick={() => remove(questionIndex)}
                            >
                                <Trash className="mr-1" />
                                Delete Question
                            </Button>
                        )}
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    color="success"
                    className="w-full"
                    onClick={() => append({ type: "short", text: "", options: [] })}
                >
                    <Plus className="mr-1" />
                    Add Question
                </Button>

                <Button
                    type="submit"
                    variant="solid"
                    color="primary"
                    className="w-full mt-4"
                    disabled={!isValid || isPending}
                >
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit
                </Button>
            </form>
        </div>
    );
}
