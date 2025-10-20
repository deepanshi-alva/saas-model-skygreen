import React, { useEffect, useMemo, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm, Controller } from "react-hook-form"
import QuillEditor from '@/components/common/add-question/QuillEditor'
import { Button } from '@/components/ui/button'
import { ArrowRight, Loader2 } from 'lucide-react'
import { cn, formatDateToIST } from '@/lib/utils'
// import Loader from "../../../../components/common/loading";
import toast from 'react-hot-toast'
import axiosInstance from '@/config/axios.config'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { useSelector } from 'react-redux'
import MessageHeader from './components/message-header';
import MessageFooter from './components/message-footer';
import Loader from './components/loader';
import Messages from './components/messages';
import EmptyMessage from './components/empty-message';
import Blank from './components/blank'
import Select from "react-select";
import { getFilePath } from '@/config/file.path'

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
  option: (provided, state) => ({
    ...provided,
    fontSize: "14px",
  }),
};
const initial = { page: 1, pageSize: 5, pageCount: 0, total: 0 };
function AskQA({ courseDetails, getCourseDetails, locationName, topicId }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange'
  })
  const [IsCreateQuestionOpen, setIsCreateQuestionOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState(initial)
  const [toggle, toggleQuestion] = useState(false);
  const [answers, SetAnswers] = useState([]);
  const [questionId, setQuestionId] = useState();
  const [messageLoading, setMessageLoading] = useState();
  const [messageIsError, setMessageIsError] = useState();
  const [isPending, startTransition] = React.useTransition();
  const totalQuestions = meta?.total;
  const typeQna = [
    {
      value: 'All',
      label: "All lectures"
    },
    {
      value: topicId,
      label: 'Current lecture'
    }
  ];
  const user = useSelector((state) => state.user);
  const [selectedFilter, setSelectedFilter] = useState(typeQna[0].value);
  const handleSelectChange = (selectedOption) => {
    setSelectedFilter(selectedOption.value);
    // Call the filter function with selected value
    setQuestions([]);
    getAllQuestion(1, false, selectedOption.value);
  };
  const onSubmit = (form) => {
    console.log(form, 'form data');
    if (!courseDetails?.enrollmentId) {
      return;
    }
    startTransition(async () => {
      try {
        const formData = {
          title: form.title,
          description: form.description,
          course_enrollment: courseDetails?.enrollmentId,
          topic: locationName,
          topicId
        };
        const { data } = await axiosInstance({
          url: `/api/qas`,
          method: 'POST',
          data: {
            data: formData
          }
        })
        console.log(data, 'form submitted');
        toast.success("Your question has been submitted successfully!");
        reset();
        getAllQuestion(1, true, typeQna[0].value);
        setIsCreateQuestionOpen(false)
        setSelectedFilter(typeQna[0].value);
      } catch (error) {
        console.log(error)
        toast.error('Something went wrong')
      }
    })
  }
  async function getAllQuestion(currentPage = 1, onAdded = false, value = "All") {
    if (!courseDetails?.courseId) {
      return;
    }
    setLoading(true);
    try {
      const { data } = await axiosInstance({
        url: `/api/Qas?filters[course_enrollment][course][documentId][$eq]=${courseDetails.courseId}&${value !== "All" ? `filters[topicId]=${value}&` : ''}populate[course_enrollment][populate][user][populate][profileImage][fields][0]=url&pagination[page]=${currentPage}&pagination[pageSize]=${meta.pageSize}&sort=createdAt:desc`,
        method: 'get'
      });
      console.log(data.data, 'data q&a')
      const FormatQuestions = data.data.map((question) => {
        return {
          title: question.title,
          description: question.description,
          username: question?.course_enrollment?.user?.username,
          profileImageUrl: question?.course_enrollment?.user?.profileImage?.url,
          createdAt: question.createdAt,
          lecture: question?.topic,
          id: question.documentId
        }
      });
      if (onAdded) {
        setQuestions([...FormatQuestions]);
        setMeta(data.meta.pagination)
      } else {
        setQuestions((prev) => {
          const uniqueQuestions = FormatQuestions.filter(
            (question) => !prev.some((q) => q.id === question.id)
          );
          return [...prev, ...uniqueQuestions];
        });
        setMeta((prev) => { return { ...prev, pageCount: data.meta.pagination.pageCount, page: currentPage, total: data.meta.pagination.total } })
      }
      console.log(data, 'questions...');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }
  async function getAnswers(questionId) {
    try {
      SetAnswers([]);
      const { data } = await axiosInstance({
        url: `/api/Qas/${questionId}?populate[answers][populate][user][populate][profileImage][fields][0]=url`,
        method: 'get',
      });

      SetAnswers(data.data?.answers);
    } catch (error) {
      console.error(error);
    }
  }
  async function handleSendMessage(message) {
    setMessageLoading(true);
    try {

      const { data } = await axiosInstance({
        url: `/api/Qas/${questionId}?populate[answers][populate][user][fields]=id`
      });
      const newAnswer = {
        answer: message,
        createdTime: new Date().toISOString(),
        user: {
          id: user.id
        },
      };
      let formatAnswers;
      if (data.data.answers) {
        formatAnswers = [...data.data.answers.map(({ id, ...rest }) => rest).map((ele) => ({ ...ele, user: { id: ele.user.id } })), newAnswer]
      } else {
        formatAnswers = [newAnswer]

      }
      console.log(formatAnswers, "formatAnswers");
      await axiosInstance({
        url: `/api/Qas/${questionId}`,
        method: 'put',
        data: {
          data: {
            answers: formatAnswers
          }
        }
      });
      const { data: result } = await axiosInstance({
        url: `/api/Qas/${questionId}?populate[answers][populate][user][populate][profileImage][fields][0]=url`
      });
      SetAnswers(result.data.answers);
    } catch (error) {
      console.log(error, 'error..')
    } finally {
      setMessageLoading(false);
    }
  }
  useEffect(() => {
    (async () => {
      await getCourseDetails();
    })();
  }, [])
  useEffect(() => {
    if (courseDetails?.courseId) {
      getAllQuestion(1, false, selectedFilter);
    }
  }, [courseDetails?.courseId])

  console.log(questions, 'questions', "courseDetails", courseDetails)
  console.log(meta, 'meta', 'user', user);
  console.log(toggle, 'selectedQuestionId')
  console.log(answers, 'selectedQuestionId')
  return (
    <div className='min-h-[300px]'>
      <div className='justify-between items-center flex border-b pb-5 mb-5'>
        <h3 className="text-xl">
          {`All questions in this course (${totalQuestions})`}
        </h3>
        <div className="flex gap-4 justify-between">
          <Select
            defaultValue={typeQna[0]}
            value={typeQna.find((option) => option.value === selectedFilter)}
            onChange={handleSelectChange}
            className="react-select text-md border-default-400 text-default-600"
            classNamePrefix="select"
            placeholder={typeQna[0].label}
            styles={styles}
            options={typeQna}
          />

          <Button
            type='button'
            size="md"
            variant=""
            // color="default"
            className="cursor-pointer"
            onClick={() => setIsCreateQuestionOpen(prev => !prev)}
          >
            Ask Question <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M18 12h-6m0 0H6m6 0V6m0 6v6" /></svg>
          </Button>
        </div>
      </div>
      {IsCreateQuestionOpen &&
        <form onSubmit={handleSubmit(onSubmit)} className='relative'>
          <div className="grid grid-cols-12">

            <div className="col-span-12 lg:col-span-12">
              <div className="space-y-2">
                <Label className="text-base">Title or summary<span className='text-red-500'>*</span></Label>
                <Input type="text" placeholder="Course Title" className="rounded-sm h-14 text-base text-default-700" {...register("title", {
                  required: "Course Title is required"
                })} onChange={(e) => {
                  setValue("title", e.target.value);
                }} />
                <FromError error={errors} name={'title'} />
              </div>
            </div>

            <div className="col-span-12 lg:col-span-12">
              <Label className="py-4 text-base">Details (optional)</Label>
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <QuillEditor
                    value={field.value}
                    onValueChange={(content) => field.onChange(content)}
                    qna={true}
                  />
                )}
              />
            </div>

            <div className="relative mt-6 mb-6">
              <Button
                size="md"
                variant=""
                color="default"
                className="cursor-pointer"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Publish
              </Button>
            </div>
          </div>
        </form>
      }
      {questions.length > 0 ? <div className='relative'>
        {questions && questions?.map((question, index) => (
          <>
            <Card className="border-none shadow-none rounded-none px-5 mb-3 py-5" key={index}>
              <div onClick={() => {
                console.log(question?.id)
                toggleQuestion((prev) => (prev === question.id ? null : question.id));
                getAnswers(question?.id)
                setQuestionId(question?.id);
              }}>
                <CardContent className="flex flex-row gap-8 p-0">
                  <div>
                    <Avatar
                      className="ring-1 ring-background ring-offset-[2px]  ring-offset-background h-14 w-14">
                      <AvatarImage src={getFilePath(question?.profileImageUrl)} />

                      <AvatarFallback className="rounded uppercase bg-success/30 text-success">
                        {question?.username?.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div>
                    <h3 className='text-xl font-semibold mb-1 cursor-pointer'>{question?.title}</h3>
                    {question?.description &&
                      <div
                        className="text-base font-normal mt-0"
                        dangerouslySetInnerHTML={{ __html: question.description }}
                      />
                    }

                    <div className='flex flex-row gap-2 items-center mt-2 text-default-500 text-sm font-normal'>
                      {question?.username &&
                        <p className="">
                          {question?.username || ""}
                        </p>
                      }

                      |

                      <p className="">
                        {formatDateToIST(question?.createdAt)?.date || ""}
                      </p>

                      |

                      <p className="" onClick={(e) => e.stopPropagation()}>
                        {/* <div href={`${process.env.NEXT_PUBLIC_SITE_URL}${question?.lecture}#q-a`}> */}
                        lecture {question?.lecture?.split("/").pop()}
                        {/* </> */}
                      </p>
                    </div>

                  </div>

                </CardContent>

              </div>

              {(toggle === question.id) && (

                <div className="flex-1 flex gap-8">
                  <div className='w-[100px]'></div>
                  <Card className="h-full w-full bg-card-none shadow-none rounded-none mt-6">

                    <CardContent className="px-0 relative flex-1">
                      <div
                        className="h-full"
                      // ref={chatHeightRef}
                      >
                        {messageLoading ? (
                          <Loader />
                        ) :
                          <>
                            {answers.length === 0 ? (
                              <EmptyMessage />
                            ) : (
                              <>
                                {answers.map((answer, i) => (
                                  <Messages
                                    key={`message-list-${i}`}
                                    answer={answer}
                                  />
                                ))}
                              </>
                            )}
                            <CardFooter className="flex-none flex-col px-0 py-0 pb-6 p-0">
                              <MessageFooter
                                handleSendMessage={handleSendMessage}
                              // replay={replay}
                              // setReply={setReply}
                              // replayData={replayData}
                              />
                            </CardFooter>
                          </>
                        }

                      </div>
                    </CardContent>

                  </Card>
                </div>

              )}



            </Card >

          </>
        ))}
      </div>
        :
        <div className="col-span-12 lg:col-span-12">
         <p className='text-base text-center'>No questions yet! Be the first to ask about this course and help others with your insights.</p>
        </div>}

      {meta.pageCount !== 0 && meta && meta.page !== meta.pageCount && <div className="dark bg-muted px-4 py-3 text-foreground w-fit rounded-md mx-auto cursor-pointer" onClick={() => getAllQuestion(meta.page + 1, false, selectedFilter)}>
        <p className="flex justify-center text-sm">
          <a className="group" >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> :
              <>

                Load More

              </>}

          </a>
        </p>
      </div>}

    </div>
  )
}

export default AskQA;