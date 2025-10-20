import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/config/axios.config";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddQuestion from "@/components/common/add-question/AddQuestion";
import toast from "react-hot-toast";
import QuestionTable from "../../question-banks/[questionBankId]/QuestionTable";
function CourseModulePage({ handleNext, assignment, handleBack }) {
  console.log("assignment", assignment);
  const [questions, setQuestions] = useState([]);
  const [isCreateQuestionOpen, setIsCreateQuestionOpen] = useState();
  const [isChooseQuestionOpen, setIsChooseQuestionOpen] = useState();
  const [questionDocId, setQuestionDocId] = useState();
  const [maxScore, setMaxScore] = useState(0);
  const saveQuestionInAssignMents = async (questionIds, max_score) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/assignments/${assignment.documentId}?status=published`,
        method: "put",
        data: {
          data: {
            questions: questionIds,
            max_score: max_score,
          },
        },
      });
      toast.success("Save2 Successful");
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const handleDelete = async (index) => {
    const newQue = questions.filter((_, idx) => idx !== index);
    const preQuestionsIds = newQue.map((ele) => ele.id);
    let max_score = 0;
    max_score = newQue.reduce((acc, ele) => acc + ele.score, 0);
    await saveQuestionInAssignMents(preQuestionsIds, max_score);
    setQuestions(newQue);
    window.location.reload();
  };

  // const createQuestionCallBack = async (callBackData) => {
  //     let questionIds = callBackData.map(ele => ele.documentId)
  //     const { data } = await axiosInstance({
  //         url: `/api/questions?filters[documentId][$in]=${questionIds.join(',')}&populate=*&status=published`,
  //         method: 'GET',
  //     })
  //     console.log("getitng data from questions idds",data.data)
  //     let max_score = maxScore
  //     questionIds = data.data.map(ele => {
  //         max_score += ele.score
  //         return ele.id
  //     })
  //     setMaxScore(max_score)
  //     console.log("this is 2 maxscor--",max_score)
  //     const allQuestionIds = [...questions.map(ele => ele.documentId), ...questionIds]
  //     await saveQuestionInAssignMents(allQuestionIds, max_score)
  //     const newQuestions = data.data.map(ele => ({ id: ele.id, documentId: ele.documentId, question: ele.question, question_type: ele.question_type, score: ele.score, options: ele?.options }))
  //     // const newQuestions = data.data.map(ele => {
  //     //     const isMCQ = ele.question_type === "MCQ";
  //     //     const correctOption = isMCQ ? ele?.options?.find(opt => opt.correct) : null; // Get the correct option if MCQ
  //     //     return {
  //     //         id: ele.id,
  //     //         documentId: ele.documentId,
  //     //         question: ele.question,
  //     //         question_type: ele.question_type,
  //     //         score: ele.score,
  //     //         options: ele?.options,
  //     //         correctOption // Pass the correct option if MCQ
  //     //     };
  //     // })
  //     setQuestions(old => ([...old, ...newQuestions]))
  //     setIsCreateQuestionOpen(false)
  //     // window.location.reload();
  // }

  const createQuestionCallBack = async (callBackData) => {
    let questionIds = callBackData.map((ele) => ele.documentId);
    const { data } = await axiosInstance({
      url: `/api/questions?filters[documentId][$in]=${questionIds.join(
        ","
      )}&populate=*&status=published`,
      method: "GET",
    });

    let newMaxScore = maxScore; // Initialize with the existing maxScore value

    questionIds = data.data.map((ele) => {
      // Check if the score has changed or not
      const originalScore = questions.find(
        (q) => q.documentId === ele.documentId
      )?.score;

      if (originalScore !== ele.score) {
        if (ele.is_editted) {
          newMaxScore -= originalScore ?? 0;
        }
        // newMaxScore += ele.score; // Only add score if it has changed
        else if (ele.is_added) {
          newMaxScore -= originalScore ?? 0;
        }

        newMaxScore += ele.score; // Only add score if it has changed
      }
      return ele.id;
    });

    setMaxScore(newMaxScore); // Update the max score after checking

    const allQuestionIds = [
      ...questions.map((ele) => ele.documentId),
      ...questionIds,
    ];
    await saveQuestionInAssignMents(allQuestionIds, newMaxScore); // Save with the updated max score

    const newQuestions = data.data.map((ele) => ({
      id: ele.id,
      documentId: ele.documentId,
      question: ele.question,
      question_type: ele.question_type,
      score: ele.score,
      options: ele?.options,
    }));

    setQuestions((old) => [...old, ...newQuestions]); // Add the new questions to the state
    setIsCreateQuestionOpen(false); // Close the dialog
    window.location.reload();
  };

  // const createQuestionCallBack = async (callBackData) => {
  //     let questionIds = callBackData.map(ele => ele.documentId);
  //     const { data } = await axiosInstance({
  //         url: `/api/questions?filters[documentId][$in]=${questionIds.join(',')}&populate=*&status=published`,
  //         method: 'GET',
  //     });

  //     console.log("Getting data from questions ids:", data.data);

  //     // Initialize newMaxScore with the current maxScore value
  //     let newMaxScore = maxScore;

  //     questionIds = data.data.map(ele => {
  //         // Check if the score has changed or not
  //         const originalScore = questions.find(q => q.documentId === ele.documentId)?.score;

  //         if (originalScore !== ele.score) {
  //             newMaxScore += ele.score; // Only add score if it has changed
  //         }
  //         console.log("newMaxScore", newMaxScore);
  //         return ele.id;
  //     });

  //     // Save the questions and maxScore directly with the newMaxScore value
  //     await saveQuestionInAssignMents(questionIds, newMaxScore); // Pass newMaxScore directly here

  //     // Add the new questions to the state
  //     const newQuestions = data.data.map(ele => ({
  //         id: ele.id,
  //         documentId: ele.documentId,
  //         question: ele.question,
  //         question_type: ele.question_type,
  //         score: ele.score,
  //         options: ele?.options
  //     }));

  //     setQuestions(old => ([...old, ...newQuestions])); // Update the questions state

  //     // Update the maxScore state after saving
  //     setMaxScore(newMaxScore); // Update the UI state with the latest value
  //     setIsCreateQuestionOpen(false); // Close the dialog
  // };

  const saveChooseQuestions = (chooseQuestion) => {
    try {
      const allQuestions = [
        ...questions,
        ...chooseQuestion.map((ele) => ({
          id: ele.id,
          documentId: ele.documentId,
          question: ele.question,
          question_type: ele.question_type,
          score: ele.score,
          options: ele?.options || [],
        })),
      ];
      const uniqueData = [];
      const seen = new Set();

      allQuestions.forEach((question) => {
        if (question?.id && !seen.has(question.id)) {
          seen.add(question.id);
          uniqueData.push(question);
        }
      });

      let max_score = 0;
      const ids = uniqueData.map((ele) => {
        max_score += ele.score;
        return ele.id;
      });
      saveQuestionInAssignMents(ids, max_score);
      setQuestions(uniqueData);
      // window.location.reload();
    } catch (error) {
      console.log("choose questions error", error);
    }
  };

  useEffect(() => {
    if (assignment?.questions?.length) {
      let max_score = 0;
      const question = assignment.questions.map((ele) => {
        max_score += ele.score;
        return {
          id: ele.id,
          documentId: ele.documentId,
          question: ele.question,
          question_type: ele.question_type,
          score: ele.score,
          options: ele?.options,
        };
      });
      setMaxScore(max_score);
      setQuestions(question);
    }
  }, []);

  return (
    <>
      <div className={`col-span-12 xl:col-span-9 mr-5`}>
        <div className="grid grid-cols-12 gap-4">
          {!questions?.length ? (
            <div className="col-span-12 mb-0 mt-0 min-h-[500px]  bg-card rounded-md shadow-sm">
              <div className="grid grid-cols-12 gap-6 py-9 items-center justify-center min-h-[500px] text-center">
                <div className="col-span-12 lg:col-span-12 courseHeading">
                  <h2 className="text-3xl font-bold pb-5">
                    Create your assignment content
                  </h2>
                  <h3 className="text-2xl font-md pb-5">
                    Choose or create questions to organize your assignment
                  </h3>
                  <Button
                    type="button"
                    size="xl"
                    variant=""
                    color="default"
                    className="cursor-pointer mr-5"
                    onClick={() => setIsCreateQuestionOpen(true)}
                  >
                    Create Question{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.2em"
                      height="1.2em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                      />
                    </svg>
                  </Button>
                  <Button
                    type="button"
                    size="xl"
                    variant="outline"
                    color="default"
                    className="cursor-pointer"
                    onClick={() => setIsChooseQuestionOpen(true)}
                  >
                    Choose Question{" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="1.2em"
                      height="1.2em"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="none"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                      />
                    </svg>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="col-span-12 lg:col-span-12">
              {questions.map((item, index) => {
                return item.question_type === "MCQ" ? (
                  <Accordion
                    type="multiple"
                    className="w-full mb-2 space-y-3.5"
                  >
                    <AccordionItem
                      className="bg-card border-b-2 topicAccordionBlock shadow-sm p-0"
                      value={"assignmentQuestion" + index}
                    >
                      <AccordionTrigger className="topicHeading space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center">
                        <div className="flex items-center space-x-2 text-xl font-medium justify-between w-full">
                          <div className="flex items-top gap-4 text-left">
                            <div className="flex gap-2 mb-4">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2"
                                width="26"
                                height="26"
                                viewBox="0 0 2048 2048"
                              >
                                <path
                                  fill="#f97316"
                                  d="M1755 512h-475V37zm37 128v1408H128V0h1024v640z"
                                />
                              </svg>
                              <span className="lightTextModule">
                                Question {index + 1}.&nbsp;
                              </span>
                            </div>

                            <div className="flex-1 gap-2 mb-4">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: item.question,
                                }}
                              ></span>
                            </div>

                            <div className="flex items-top gap-3 ml-2">
                              <div
                                onClick={() => {
                                  setIsCreateQuestionOpen(true);
                                  setQuestionDocId(item?.documentId);
                                }}
                                className="editIcon"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="0.8em"
                                  height="0.8em"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M14.69 3.86L20.14 9.31L7.99 21.45H2.54V16L14.69 3.86ZM3.7 19.3H6.74L17.36 8.68L14.32 5.64L3.7 16.26V19.3ZM19.61 8.08L16.93 5.39L18.35 3.96C18.85 3.46 19.61 3.46 20.1 3.96L20.99 4.85C21.49 5.34 21.49 6.1 20.99 6.6L19.61 8.08Z"
                                  />
                                </svg>
                              </div>
                              <div
                                onClick={() => handleDelete(index)}
                                className="editIcon"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="0.8em"
                                  height="0.8em"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="m6.774 6.4l.812 13.648a.8.8 0 0 0 .798.752h7.232a.8.8 0 0 0 .798-.752L17.226 6.4zm11.655 0l-.817 13.719A2 2 0 0 1 15.616 22H8.384a2 2 0 0 1-1.996-1.881L5.571 6.4H3.5v-.7a.5.5 0 0 1 .5-.5h16a.5.5 0 0 1 .5.5v.7zM14 3a.5.5 0 0 1 .5.5v.7h-5v-.7A.5.5 0 0 1 10 3zM9.5 9h1.2l.5 9H10zm3.8 0h1.2l-.5 9h-1.2z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className={`justify-center`}>
                        <div className="p-6">
                          {item?.options?.map((ele, idx) => (
                            <div className="flex gap-6 mb-4 text-base text-default-700">
                              <div className="flex gap-2 font-semibold">
                                {" "}
                                Option {idx + 1}
                              </div>
                              <div
                                className="flex-1 gap-0 font-medium"
                                dangerouslySetInnerHTML={{ __html: ele.option }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <div className="w-full mb-2 space-y-3.5">
                    <div className="bg-card border-b-2 topicAccordionBlock shadow-sm p-0 rounded-md">
                      <div className=" topicHeading space-y-1.5 px-6 py-6 mb-0 border-none border-border flex flex-row items-center">
                        <div className="flex items-center space-x-2 text-xl font-medium justify-between w-full">
                          <div className="flex items-top gap-4 text-left">
                            <div className="flex gap-2 mb-4">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="mr-2"
                                width="26"
                                height="26"
                                viewBox="0 0 2048 2048"
                              >
                                <path
                                  fill="#f97316"
                                  d="M1755 512h-475V37zm37 128v1408H128V0h1024v640z"
                                />
                              </svg>
                              <span className="lightTextModule">
                                Question {index + 1}.&nbsp;
                              </span>
                            </div>

                            <div className="flex-1 gap-2 mb-4">
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: item.question,
                                }}
                              ></span>
                            </div>

                            <div className="flex items-top gap-3 ml-2">
                              <div
                                onClick={() => {
                                  setIsCreateQuestionOpen(true);
                                  setQuestionDocId(item?.documentId);
                                }}
                                className="editIcon"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="0.8em"
                                  height="0.8em"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="currentColor"
                                    d="M14.69 3.86L20.14 9.31L7.99 21.45H2.54V16L14.69 3.86ZM3.7 19.3H6.74L17.36 8.68L14.32 5.64L3.7 16.26V19.3ZM19.61 8.08L16.93 5.39L18.35 3.96C18.85 3.46 19.61 3.46 20.1 3.96L20.99 4.85C21.49 5.34 21.49 6.1 20.99 6.6L19.61 8.08Z"
                                  />
                                </svg>
                              </div>
                              <div
                                onClick={() => handleDelete(index)}
                                className="editIcon"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="0.8em"
                                  height="0.8em"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    fill="currentColor"
                                    fill-rule="evenodd"
                                    d="m6.774 6.4l.812 13.648a.8.8 0 0 0 .798.752h7.232a.8.8 0 0 0 .798-.752L17.226 6.4zm11.655 0l-.817 13.719A2 2 0 0 1 15.616 22H8.384a2 2 0 0 1-1.996-1.881L5.571 6.4H3.5v-.7a.5.5 0 0 1 .5-.5h16a.5.5 0 0 1 .5.5v.7zM14 3a.5.5 0 0 1 .5.5v.7h-5v-.7A.5.5 0 0 1 10 3zM9.5 9h1.2l.5 9H10zm3.8 0h1.2l-.5 9h-1.2z"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div className="col-span-12 lg:col-span-12 mt-6">
          <div className="pt-2 gap-4 flex w-full">
            {questions.length > 0 && (
              <>
                <Button
                  type="button"
                  size="xl"
                  variant=""
                  color="default"
                  className="cursor-pointer mr-2"
                  onClick={() => setIsCreateQuestionOpen(true)}
                >
                  Create Question{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                    />
                  </svg>
                </Button>
                <Button
                  type="button"
                  size="xl"
                  variant="outline"
                  color="default"
                  className="cursor-pointer"
                  onClick={() => setIsChooseQuestionOpen(true)}
                >
                  Choose Question{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="1.2em"
                    height="1.2em"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M18 12h-6m0 0H6m6 0V6m0 6v6"
                    />
                  </svg>
                </Button>
              </>
            )}
            <div className="flex justify-end gap-4 mt-0 w-full">
              <Button
                type={"button"}
                size="xl"
                variant="outline"
                color="default"
                className="cursor-pointer"
                onClick={() => {
                  handleBack(assignment.documentId);
                }}
              >
                Back
              </Button>
              <Button
                type={"button"}
                size="xl"
                variant=""
                color="default"
                className="cursor-pointer"
                onClick={() => {
                  handleNext(assignment.documentId);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
        {isCreateQuestionOpen && (
          <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
            <Dialog
              defaultOpen={true}
              onOpenChange={(value) => {
                setIsCreateQuestionOpen(value);
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-base font-medium text-default-700 ">
                  {questionDocId ? "Update Question" : "Add Question"}
                </DialogTitle>
              </DialogHeader>
              <DialogContent size="90%" className="overflow-y-auto">
                <div className="text-sm text-default-500 mx-auto  space-y-4">
                  <AddQuestion
                    multiple={false}
                    source={"ASSIGNMENTS"}
                    onSave={createQuestionCallBack}
                    questionId={questionDocId}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        {isChooseQuestionOpen && (
          <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
            <Dialog
              defaultOpen={true}
              onOpenChange={(value) => {
                setIsChooseQuestionOpen(value);
              }}
            >
              <DialogHeader>
                <DialogTitle className="text-base font-medium text-default-700 ">
                  Choose Question
                </DialogTitle>
              </DialogHeader>
              <DialogContent size="90%">
                <div className="text-sm text-default-500  space-y-4 overflow-auto  ">
                  <QuestionTable
                    source={"ASSIGNMENT"}
                    saveChooseQuestions={saveChooseQuestions}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>
    </>
  );
}

export default CourseModulePage;
