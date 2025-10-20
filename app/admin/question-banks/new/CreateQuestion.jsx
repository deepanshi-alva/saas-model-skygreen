"use client"
import React, { useEffect, useState } from 'react'
import { useForm } from "react-hook-form"
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

const CreateQuestion = ({ params, onSave, questionId, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange'
  });
  const [isPending, startTransition] = React.useTransition();

  const user = useSelector((state) => state.user);
  // const questionBankDocId = params?.questionBankId;
  // const isEdit = Boolean(params?.questionBankId);
  const isEdit = questionId && questionId !== 'new';
  const onSubmit = async (formData) => {
    startTransition(async () => {
      try {
        const { data } = await axiosInstance({
          url: isEdit ? `/api/question-banks/${questionId}` : '/api/question-banks',
          method: isEdit ? 'PUT' : 'POST',
          data: {
            data: {
              ...formData,
              author: user.id,
              modifiedBy: user.id
            }
          }
        })

        // const questionBankId = data?.data?.id; 
        const questionBankId = data?.data?.documentId;
        if (typeof onSave === 'function') {
          onSave(data);
        }

        if (questionBankId) {
          toast.success("Question Bank saved successfully!");
          // router.push(`/admin/question-banks/${questionBankId}`);
          // router.push(`/admin/question-banks/${questionBankId}`);

        } else {
          throw new Error("Failed to retrieve question bank ID");
        }
      } catch (error) {
        toast.error("Something went wrong: " + error.message);
      }
    });
  };

  // useEffect(() => {
  //   if (isEdit) {
      

  //     populateQuestionBank();
  //   }
  // }, [isEdit])
  async function populateQuestionBank(questionId) {
    console.log("questionId",questionId);
    try {
      const { data } = await axiosInstance({
        url: `/api/question-banks/${questionId}`,
        method: 'GET',
      })

      reset({
        title: data?.data?.title || "",
        description: data?.data?.description || "",
      });

    } catch (error) {
      console.log("failed to populate question bank data", error);
    }
  }
  useEffect(() => {
    if (questionId && questionId !== "new") {
  
      populateQuestionBank(questionId);
    }
  }, [questionId]);

  const handleCancel = () => {
    setTimeout(() => {
      reset({
        title: '',
        description: '',
      });
    }, 0);
  
    // reset();
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  console.log("new questionid", questionId);
  return (
    <div className="space-y-6">
      <div className="flex items-center flex-wrap justify-between gap-4">
        <div className="text-2xl font-medium text-default-800 ">
          {isEdit ? "Update Question Bank" : "Create Question Bank"}
        </div>
      </div>
      <div className="col-span-12 xl:col-span-9 mr-5">
        <form onSubmit={handleSubmit(onSubmit)}>

          <div className="p-0 bg-card rounded-md shadow-sm mb-6">

            <div className="col-span-12 mb-4 mt-0 space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
              <h3 className="text-xl font-medium capitalize">
                Basic Question Bank Info
              </h3>
            </div>

            <div className="grid grid-cols-12 gap-7 p-6">

              {/* Basic Course Information */}
              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Title <span class="text-red-500">*</span></Label>
                  <Input
                    type="text"
                    placeholder="Question Title"
                    className="rounded-sm h-14 text-base text-default-700"
                    {...register("title", { required: "Question Title is required" })}
                  />
                  <FromError error={errors} name={'title'} />
                </div>
              </div>

              <div className="col-span-12 lg:col-span-12">
                <div className="space-y-2">
                  <Label className="text-base">Description</Label>
                  <Textarea
                    type="text"
                    placeholder="Question Description"
                    className="rounded-sm h-14 text-base text-default-700"
                    {...register("description")}
                  />
                  <FromError error={errors} name={'description'} />
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
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateQuestion;
