"use client";
import { Card, CardContent } from "@/components/ui/card";
import axiosInstance from "@/config/axios.config";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import GernateCertificate from "../GernateCertificate";
import { RefreshCcw } from "lucide-react";
import { Eye } from "lucide-react";
import Image from "next/image";

const Page = () => {
  const params = useParams();
  let attemptID = params.attemptid;

  // Get the mode from query params, if it exists
  const mode = new URLSearchParams(window.location.search).get("mode");

  const [attemptData, setAttemptData] = useState(null);
  console.log("attemptData---", attemptData);
  const [marksFeedback, setMarksFeedback] = useState({});
  console.log("marksFeedback---", marksFeedback);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [assessmentID, setAssigmentDocID] = useState("");
  const [showGenerateButton, setShowGenerateButton] = useState(false); // State to control visibility of the button
  // Access attemptId from the params

  const [orientation, setOrientation] = useState("portrait");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [contentOrder, setContentOrder] = useState([]);
  const [logo, setLogo] = useState(null); // State for the logo image
  const [signature, setSignature] = useState(null); // State for the signature image
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateLogoId, setCertificateLogoId] = useState(null);
  const [certificates, setCertificates] = useState();
  const [certificateData, setCertificateData] = useState(null);

  const getAttemptData = async () => {
    try {
      const { data } = await axiosInstance({
        url: `api/attempt-contents?filters[documentId][$eq]=${params.attemptid}&populate[answers][populate][question][populate]=options&populate[assignment][populate]=course&populate=user`,
        method: "GET",
      });
      // console.log("jkdfnvjfbjkgfnknf ", data);
      if (data?.data && data?.data.length > 0) {
        const fetchedData = data.data[0];
        setAttemptData(fetchedData); // Store first response object
        setAssigmentDocID(fetchedData.assignment.documentId);

        // Check if answers exist before proceeding
        if (fetchedData.answers && Array.isArray(fetchedData.answers)) {
          // Initialize marksFeedback state with marks_awarded from backend
          const initialMarksFeedback = {};
          fetchedData.answers.forEach((answer) => {
            initialMarksFeedback[answer.id] = {
              marks: answer.marks_awarded || 0, // Set marks_awarded as initial value
              feedback: answer.feedback || "", // Set feedback as initial value
            };
          });
          setMarksFeedback(initialMarksFeedback);
        } else {
          console.error("Answers are missing or not an array.");
        }
      } else {
        console.error("No attempt data found.");
      }
    } catch (error) {
      console.error("Error fetching attempt data:", error);
    }
  };

  useEffect(() => {
    getAttemptData();
  }, []);

  // Function to clean HTML tags and special characters from answer
  const cleanAnswer = (answer) => {
    return answer
      ?.replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags like <p> or <span>
      ?.replace(/&nbsp;/g, " ") // Replace non-breaking spaces with normal spaces
      ?.trim(); // Remove extra spaces
  };

  // Handle input changes for marks & feedback
  const handleChange = (answerId, field, value, maxScore) => {
    if (field === "marks") {
      value = Math.max(0, Math.min(value, maxScore)); // Ensure marks are within range
    }
    setMarksFeedback((prev) => ({
      ...prev,
      [answerId]: {
        ...prev[answerId],
        [field]: value,
      },
    }));
  };

  // Compute total subjective score
  const totalSubjectiveScore = () => {
    return attemptData?.answers
      .filter((ans) => ans.question.question_type === "Subjective")
      .reduce((sum, ans) => sum + (ans.marks_awarded || 0), 0);
  };

  const totalSubjectiveMarks = () => {
    return attemptData?.answers
      ?.filter((ans) => ans.question.question_type === "Subjective")
      ?.reduce((sum, ans) => sum + (ans.question.score || 0), 0);
  };

  // Compute total MCQ marks_awarded
  const totalMCQScore = () => {
    return attemptData?.answers
      ?.filter((ans) => ans.question.question_type === "MCQ")
      ?.reduce((sum, ans) => sum + (ans.marks_awarded || 0), 0);
  };

  const totalMcqMarks = () => {
    return attemptData?.answers
      ?.filter((ans) => ans.question.question_type === "MCQ")
      ?.reduce((sum, ans) => sum + (ans.question.score || 0), 0);
  };

  // Save all marks & feedback for subjective questions and attempt details
  const saveAllMarksFeedback = async () => {
    setSaving(true);
    setSuccessMessage("");

    try {
      // Calculate total marks (sum of auto_graded_marks and trainer_assigned_marks)
      const totalMarks =
        (attemptData.auto_graded_marks || 0) + totalSubjectiveScore();

      // Prepare updated answers with only the necessary fields
      const updatedAnswers = attemptData.answers.map((answer) => {
        const { answer_value, question_submit_time, question } = answer;
        const { question_type } = question || {};

        // If it's a Subjective question, update the marks_awarded, feedback, and keep the original question_submit_time
        if (question_type === "Subjective") {
          return {
            answer_value, // Keep original answer_value
            marks_awarded: marksFeedback[answer.id]?.marks || 0, // Marks awarded from input
            feedback: marksFeedback[answer.id]?.feedback || "", // Feedback from input
            question_submit_time: question_submit_time, // Keep the original question_submit_time
            question: question.documentId, // Include documentId instead of id
          };
        }

        // For MCQ questions, keep the original question_submit_time and only include documentId
        return {
          answer_value, // Keep original answer_value
          marks_awarded: answer.marks_awarded, // Include marks_awarded (even for MCQ)
          feedback: answer.feedback || "", // Include feedback (even for MCQ, though it could be null or "")
          question_submit_time: question_submit_time, // Keep the original question_submit_time for MCQs
          is_correct: answer.is_correct, // Include is_correct for MCQs
          question: question.documentId, // Include documentId instead of id for MCQs
        };
      });

      // Prepare the payload for saving the attempt data
      const attemptPayload = {
        data: {
          answers: updatedAnswers, // Include updated answers
          trainer_assigned_marks: totalSubjectiveScore(),
          total_marks: totalMarks, // Include total_marks
          attempt_content_status: "Reviewed",
        },
      };

      console.log("attemptPayload", attemptPayload);
      // return false
      // Send the save request
      let response = await axiosInstance.put(
        `/api/attempt-contents/${params.attemptid}?populate=*`,
        attemptPayload
      );
      console.log("response", response.data);
      // Extract required data
      const data = response.data;
      const user = data?.data?.user?.[0];
      const assignment = data?.data?.assignment;
      const publishedAt = data?.data?.publishedAt;

      if (user && assignment) {
        const userName = `${user?.firstName || ""} ${
          user?.lastName || ""
        }`.trim();
        const assessmentTitle = assignment.title;
        const publishedDate = new Date(publishedAt).toLocaleDateString();
        const assessmentDuration = `${assignment.time_limits || 0} minutes`;
        const minScore = assignment.min_score;
        const organizationName = "Rodic LMS"; // Customize if needed

        // Call the certificate function with extracted values
        handleCertificate(
          userName,
          assessmentTitle,
          publishedDate,
          assessmentDuration,
          organizationName,
          minScore,
          totalMarks,
          assessmentID
        );
      }
      setSuccessMessage("All marks and feedback saved successfully!");
      // Set showGenerateButton to true after successful submission
      setShowGenerateButton(true);
    } catch (error) {
      console.error("Error saving data:", error);
      setSuccessMessage("Failed to save data. Please try again.");
    } finally {
      setSaving(false);
      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3s
    }
  };

  const handleCertificate = async (
    recipientName,
    assessmentTitle,
    completionDate,
    assessmentDuration,
    organizationName,
    minScore,
    totalMarks,
    assessmentID
  ) => {
    // Determine the result type (pass or fail)
    const resultType =
      totalMarks >= minScore ? "pass certificate" : "fail certificate";

    try {
      // Fetch assignment and its related certificates
      const { data } = await axiosInstance({
        url: `/api/assignments/${assessmentID}?populate[certificate][populate]=*`,
        method: "GET",
      });

      if (!data?.data) {
        console.error("Assignment data not found.");
        return;
      }
      // console.log("handleCertificate Response:", data?.data);

      const certificates = [data?.data?.certificate] || [];
      setCertificates(certificates);
      // Find the matching certificate by type
      const selectedCertificate = certificates?.find(
        (cert) => cert?.certificate_type === resultType
      );
      if (!selectedCertificate) {
        console.error(`No certificate found for type: ${resultType}`);
        return;
      }

      // Replace placeholders with actual values
      const updatedContentOrder = (selectedCertificate.content_order || []).map(
        (item) => {
          const updatedText = item.text
            .replace("[Recipient's Full Name]", recipientName)
            .replace("[Assessment Title]", assessmentTitle)
            .replace("[Completion Date]", completionDate)
            .replace("[Assessment Duration]", assessmentDuration)
            .replace("[Organization/Institution Name]", organizationName)
            .replace("[Total Marks Obtained]", `${totalMarks}`)
            .replace("[Minimum Score]", `${minScore}`);

          return {
            ...item,
            text: updatedText,
          };
        }
      );
      console.log("selectedCertificate", updatedContentOrder);
      // Update certificate UI state
      setContentOrder(updatedContentOrder);
      setOrientation(selectedCertificate?.certificate_layout || "landscape");
      setBackgroundImage(selectedCertificate?.background_img?.url || null);
      setLogo(selectedCertificate?.logo?.url || null);
      setSignature(selectedCertificate?.signature_file?.url || null);
      setCertificateLogoId(selectedCertificate?.certificate_logo?.id || null);
      setCertificateData({
        ...selectedCertificate,
        signature_position: JSON.parse(
          selectedCertificate.signature_position || "{}"
        ),
        signature_size: JSON.parse(selectedCertificate.signature_size || "{}"),
        logo_position: JSON.parse(selectedCertificate.logo_position || "{}"),
        logo_size: JSON.parse(selectedCertificate.logo_size || "{}"),
      });
    } catch (error) {
      console.error("Error fetching or processing certificate:", error);
    }
  };

  const getQuestionStatusIcon = (question, isCorrect) => {
    if (question.question_type === "MCQ") {
      return isCorrect ? (
        <span className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 16 16"
          >
            <path
              fill="#ffffff"
              fill-rule="evenodd"
              d="M13.7 4.19c.31.274.339.748.065 1.06l-5.75 6.5a.75.75 0 0 1-1.074.051l-3.75-3.5a.75.75 0 0 1 1.023-1.097l3.19 2.97l5.24-5.92a.75.75 0 0 1 1.06-.064z"
              clip-rule="evenodd"
            />
          </svg>
        </span>
      ) : (
        <span className="">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path
              fill="none"
              stroke="#ffffff"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2.5"
              d="m7 7l10 10M7 17L17 7"
            />
          </svg>
        </span>
      );
    }
    return (
      <span className="">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path fill="#ffffff" d="M10.75 15.75h2.5v2.5h-2.5z" />
          <path
            fill="#ffffff"
            fill-rule="evenodd"
            d="M12 8c-1.195 0-2 1.086-2 2H8c0-1.802 1.496-4 4-4c2.496 0 4 2.142 4 4c0 1.578-1.108 2.378-1.794 2.873l-.116.084c-.755.552-1.09.866-1.09 1.543h-2c0-1.762 1.161-2.61 1.907-3.155l.003-.002c.832-.609 1.09-.84 1.09-1.343c0-.95-.796-2-2-2"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    );
  };

  // const renderQuestionStatus = (answer, index) => {
  //   const { question } = answer;
  //   const isCorrect = answer.is_correct;

  //   return (
  //     <div
  //       key={index}
  //       className="relative flex justify-center items-center w-16 h-12 rounded-md bg-gray-100"
  //     >
  //       <span className="relative left-0 text-lg font-bold text-black">{index + 1}</span>
  //       <div className="absolute right-1 top-1">
  //         {getQuestionStatusIcon(question, isCorrect)}
  //       </div>
  //     </div>
  //   );
  // };

  // Import the refresh icon

  const renderQuestionStatus = (answer, index) => {
    const { question } = answer;
    const isSkipped = answer.answer_value === "";
    const isCorrect = answer.is_correct;
    const isSubjective = question.question_type === "Subjective";

    let bgColor = "";
    if (isSkipped) {
      bgColor = "bg-gray-300";
    } else if (isSubjective) {
      bgColor = "bg-primary";
    } else if (isCorrect) {
      bgColor = "bg-success";
    } else {
      bgColor = "bg-destructive";
    }

    return (
      <div
        key={index}
        className={`relative flex justify-start items-center w-14 h-10 ${bgColor} rounded-md`} // Square box for skipped
      >
        <span className="relative text-left text-lg font-bold text-gray-900 pl-2">
          {index + 1}
        </span>
        <div className="absolute right-1 top-1">
          {isSkipped ? (
            <div className="w-6 h-6 flex justify-center items-center rounded-full">
              {/* <RefreshCcw className="text-black" size={20} /> */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  fill="currentColor"
                  d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0a6.5 6.5 0 0 0-13 0m9.78-2.22l-5.5 5.5a.749.749 0 0 1-1.275-.326a.75.75 0 0 1 .215-.734l5.5-5.5a.75.75 0 0 1 1.042.018a.75.75 0 0 1 .018 1.042"
                />
              </svg>
            </div>
          ) : (
            getQuestionStatusIcon(question, isCorrect)
          )}
        </div>
      </div>
    );
  };

  // const renderMCQOptions = (options, userAnswer) => {
  //   return options.map((option, index) => {
  //     const isCorrect = option.correct;
  //     const isSelected = userAnswer && userAnswer.answer_value === option.option;
  //     let bgColor = "";
  //     let label = "";
  //     let icon = null;
  //     let answerMessage = "";

  //     if (isCorrect) {
  //       bgColor = "bg-green-500";
  //       icon = <span className="text-white text-lg">

  //         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16"><path fill="#ffffff" fill-rule="evenodd" d="M13.7 4.19c.31.274.339.748.065 1.06l-5.75 6.5a.75.75 0 0 1-1.074.051l-3.75-3.5a.75.75 0 0 1 1.023-1.097l3.19 2.97l5.24-5.92a.75.75 0 0 1 1.06-.064z" clip-rule="evenodd" /></svg>

  //       </span>;
  //       if (isSelected) {
  //         label = "Your answer is correct";
  //       } else {
  //         label = "Correct answer";
  //       }
  //     } else if (isSelected) {
  //       bgColor = "bg-red-600";
  //       label = "Your Answer";
  //       icon = <span className="text-white text-lg">
  //         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="none" stroke="#ffffff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="m7 7l10 10M7 17L17 7" /></svg>

  //       </span>;
  //     }

  //     return (
  //       <Card key={index} className={`p-3 rounded-md ${bgColor} mb-2`}>
  //         <div className="flex justify-between items-center">
  //           <div className="flex items-center gap-2">
  //             <input
  //               type="checkbox"
  //               checked={isSelected}
  //               disabled={mode === "preview"}
  //               className="mr-3"
  //               style={{ display: "none" }}
  //             />
  //             <div
  //               className={`w-6 h-6 border-2 flex justify-center items-center rounded-md ${bgColor}`}
  //             >
  //               {icon}
  //             </div>
  //             <p className="text-left text-md flex-1">{cleanAnswer(option.option)}</p>
  //           </div>
  //           {icon && (
  //             <span className="ml-4 text-white font-semibold">
  //               {label}
  //             </span>
  //           )}
  //         </div>
  //         {answerMessage && (
  //           <p className={`text-base ${isCorrect ? "text-success" : "text-destructive"}`}>
  //             {answerMessage}
  //           </p>
  //         )}
  //       </Card>
  //     );
  //   });
  // };

  const renderMCQOptions = (options, userAnswer) => {
    const isExistsFilesType = ["img", "iframe"];
    const checkFileTypeExists = (option) => {
      // Loop through the file types array and check if any of them are present in the 'option'
      return isExistsFilesType.some((type) => option.includes(type));
    };
    return options.map((option, index) => {
      const isCorrect = option.correct;
      const isSelected =
        userAnswer && userAnswer.answer_value === option.option;
      const isSkipped = userAnswer && userAnswer.answer_value === ""; // Check if the answer is skipped
      let bgColor = "";
      let label = "";
      let icon = null;
      let answerMessage = "";

      if (isCorrect) {
        bgColor = "bg-green-500";
        icon = (
          <span className="text-white text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 16 16"
            >
              <path
                fill="#ffffff"
                fill-rule="evenodd"
                d="M13.7 4.19c.31.274.339.748.065 1.06l-5.75 6.5a.75.75 0 0 1-1.074.051l-3.75-3.5a.75.75 0 0 1 1.023-1.097l3.19 2.97l5.24-5.92a.75.75 0 0 1 1.06-.064z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        );
        if (isSelected) {
          label = "Your answer is correct";
        } else {
          label = "Correct answer";
        }
      } else if (isSelected) {
        bgColor = "bg-red-600";
        label = "Your Answer";
        icon = (
          <span className="text-white text-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="none"
                stroke="#ffffff"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2.5"
                d="m7 7l10 10M7 17L17 7"
              />
            </svg>
          </span>
        );
      }

      return (
        <Card key={index} className={`p-3 rounded-md ${bgColor} mb-2`}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isSelected}
                disabled={mode === "preview"}
                className="mr-3"
                style={{ display: "none" }}
              />
              <div
                className={`w-6 h-6 border-2 flex justify-center items-center rounded-md ${bgColor}`}
              >
                {icon}
              </div>
              <p className="text-left text-md flex-1">
                {checkFileTypeExists(option.option) ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: replaceImageSrcAndRemoveHTML(option.option),
                    }}
                  ></div>
                ) : (
                  cleanAnswer(option.option)
                )}
              </p>
            </div>

            {/* Render the "Skipped" text just left of the Max Score */}
            {/* {isSkipped && (
              <span className="text-red-600 font-semibold text-sm">Skipped</span>
            )} */}

            {icon && (
              <span className="ml-4 text-white font-semibold">{label}</span>
            )}
          </div>
          {answerMessage && (
            <p
              className={`text-base ${
                isCorrect ? "text-success" : "text-destructive"
              }`}
            >
              {answerMessage}
            </p>
          )}
        </Card>
      );
    });
  };

  // console.log("this is the attempt data", attemptData);

  const replaceImageSrcAndRemoveHTML = (text) => {
    const updatedText = text.replace(
      /<(img|iframe)[^>]*src="([^"]+)"[^>]*>/g,
      (match, tag, src) => {
        const newSrc = src.replace("somthing.com", "newdomain.com");

        // If it's an <img> tag
        if (tag === "img") {
          return `<img class="w-full h-auto mx-auto" src="${newSrc}" />`;
        }

        // If it's an <iframe> tag
        if (tag === "iframe") {
          return `<iframe class="w-full h-auto mx-auto" src="${newSrc}" frameborder="0" allowfullscreen></iframe>`;
        }

        return match; // In case the tag doesn't match img or iframe (though it should)
      }
    );

    // 2. Wrap media content outside of <p> tags like <img>, <video>, <iframe>
    const finalContentt = text.replace(
      /(<img .*?>|<video .*?>|<iframe .*?>)/g,
      (match) => {
        // Wrap media content outside <p> tags inside a flex container with styling
        return `<div class="flex justify-center w-full h-60 p-2">${match}</div>`;
      }
    );
    console.log("Update: ", finalContentt);
    const plainText = updatedText.replace(
      /<(?!img|video|iframe|p)([^>]+)>/g,
      ""
    ); // Remove all tags except <img>, <video>, <iframe>

    // Handle <p> tags: Remove text content inside <p> tags but keep <img>, <video>, <iframe> inside <p> tags
    const withoutParagraphText = plainText.replace(
      /<p[^>]*>(.*?)<\/p>/g,
      (match, content) => {
        // Check if the content contains media tags (<img>, <video>, <iframe>)
        const hasMedia = /<img|<video|<iframe/.test(content);

        if (hasMedia) {
          // If media content exists, keep the media content inside the <p> tag
          return `<p class="text-xl">${content}</p>`;
        }

        // If no media, return empty <p> tag
        return "";
      }
    );

    // Wrap <img>, <video>, and <iframe> tags in grid-styled div
    const gridLayoutText = withoutParagraphText.replace(
      /(<img .*?>|<video .*?>|<iframe .*?>)/g,
      (match) => {
        // Wrap <img>, <video>, and <iframe> tags in a flex container to center them and apply padding
        return `<div class="flex justify-center w-full h-60 p-2">${match}</div>`;
      }
    );

    // Wrap everything in a grid container (you can adjust the grid configuration as per your design needs)
    const finalContent = `<div class="grid grid-cols-2 gap-4">${gridLayoutText}</div>`;

    return finalContent;
  };

  return (
    <div className="space-y-4">
      <Card className="rounded-none bg-transparent shadow-none">
        <div className="p-6 rounded-md bg-card text-card-foreground shadow-sm mb-6">
          {/* Display Assignment & Course Title */}
          <div className="flex justify-between">
            <div>
              {attemptData?.assignment && (
                <div className="mb-4 flex flex-col">
                  <div className="max-w-4xl">
                    {/* <small className="text-base font-semibold text-gray-800">Assignment Name:</small>  */}
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white pb-2">
                      {attemptData.assignment.title}
                    </h2>
                  </div>
                  {attemptData.assignment.course && (
                    <div className="text-base font-semibold text-gray-800 dark:text-white">
                      Course Name: {attemptData.assignment.course.title}
                    </div>
                  )}
                  {attemptData?.user?.length > 0 && (
                    <div className="">
                      <p className="text-base font-semibold text-gray-800 dark:text-white">
                        Employee name: {attemptData.user[0].firstName}{" "}
                        {attemptData.user[0].lastName}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="">
                <p className="text-xl font-semibold text-gray-800 dark:text-white">
                  Attempt #{attemptData?.id}
                </p>
              </div>

              {attemptData?.user?.length > 0 && (
                <div className="">
                  {/* Display Date and Time below the candidate name */}
                  {attemptData.createdAt && (
                    <p className="text-md text-gray-700 dark:text-white">
                      Attempted on{" "}
                      {new Date(attemptData.createdAt).toLocaleString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between bg-card border rounded-md p-1 mb-6 items-center">
            <div className="flex-1 pr-4 text-center text-2xl font-bold">
              <div className="bg-card py-6 rounded-md">
                <p className="text-base font-medium">Subjective Score</p>
                <span className="">{totalSubjectiveScore()}</span>/
                <span className="">{totalSubjectiveMarks()}</span>
              </div>
            </div>
            <div className="flex-1 px-4 border-l border-gray-200 text-center text-2xl font-bold">
              <div className="bg-card py-6 rounded-md">
                <p className="text-base font-medium">MCQ Score</p>
                <span className="">{totalMCQScore()}</span>/
                <span className="">{totalMcqMarks()}</span>
              </div>
            </div>
            <div className="flex-1 pl-4 border-l border-gray-200 text-center text-2xl font-bold">
              <div className="bg-green-600 py-6 text-white rounded-md">
                <p className="text-base font-medium">Total Score</p>
                <span className="">
                  {totalSubjectiveScore() + totalMCQScore()}
                </span>
                /
                <span className="">
                  {totalMcqMarks() + totalSubjectiveMarks()}{" "}
                </span>
              </div>
            </div>
          </div>

          <div className="mb-0 flex flex-wrap gap-2">
            {attemptData?.answers.map((answer, index) => (
              <div key={answer.id} className="relative mb-2">
                {renderQuestionStatus(answer, index)}
              </div>
            ))}
          </div>
        </div>

        {attemptData ? (
          attemptData.answers.map((answer, index) => {
            const { id, answer_value, is_correct, marks_awarded, question } =
              answer;
            const {
              question_type,
              score,
              options,
              question: questionText,
            } = question || {};

            return (
              <CardContent className="p-0 pt-0 bg-card" key={id}>
                <div className="border rounded-lg p-4 mb-4 shadow-md">
                  <div className="flex flex-wrap justify-between">
                    <div>
                      <p className="text-sm font-semibold mb-2 text-white bg-primary rounded-full px-3 flex inline-flex">
                        {question_type === "MCQ"
                          ? "Multiple Choice (MCQ)"
                          : "Subjective"}
                      </p>
                    </div>

                    <div className="flex gap-6">
                      {/* <p className="mt-2 text-sm font-semibold text-white bg-success rounded-full px-3 flex inline-flex">
                        Marks: <span className="font-bold">{marks_awarded}</span>
                      </p> */}

                      {answer.answer_value === "" && (
                        <span className="mt-2 text-sm text-gray-500 font-semibold">
                          Skipped
                        </span>
                      )}
                      {/* Question Score */}
                      <p className="mt-2 text-sm font-semibold">
                        Max Score: <span className="font-bold">{score}</span>
                      </p>

                      {/* Show Correct/Incorrect Status for MCQ Questions */}
                      {question_type === "MCQ" && (
                        <div>
                          <p className="mt-2 text-sm text-green-700 font-semibold">
                            Marks Awarded:{" "}
                            <span className="font-bold">{marks_awarded}</span>
                          </p>
                        </div>
                      )}

                      {question_type === "Subjective" && (
                        <>
                          <p className="mt-2 text-sm text-green-700 font-semibold">
                            Marks Awarded:{" "}
                            <span className="font-bold">{marks_awarded}</span>
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-lg font-bold mb-2 me-3 dark:text-white">
                        Question {index + 1}: {questionText}
                      </p>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: replaceImageSrcAndRemoveHTML(
                            question.description
                          ),
                        }}
                      ></div>
                    </div>
                  </div>

                  {question_type === "MCQ" && (
                    <div className="mb-4">
                      {renderMCQOptions(options, answer)}
                    </div>
                  )}

                  {question_type === "Subjective" && (
                    <>
                      <label className="block mt-0 font-semibold dark:text-white text-lg ">
                        Answer:
                      </label>
                      <textarea
                        className="w-full border rounded-md p-4 bg-gray-100 mt-1 min-h-[164px] text-md "
                        value={cleanAnswer(answer_value)} // Cleaned answer text
                        disabled
                      />
                    </>
                  )}

                  {question_type === "Subjective" && (
                    <div>
                      {/* <p className="mt-2 text-sm text-green-700 font-semibold">
                          Correct answer: <span className="font-bold">{cleanAnswer(options.find(option => option.correct === true)?.option) || "No Correct Answer"}</span>
                        </p> */}
                      {question_type === "Subjective" && (
                        <div>
                          {/* <p className="mt-2 text-sm text-red-700 font-semibold">
                              Marks: <span className="font-bold">{question.score || "No Marks Assigned"}</span>
                            </p> */}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show Marks & Feedback **ONLY** for Subjective Questions */}
                  {question_type === "Subjective" && (
                    <>
                      {/* Input for Marks */}

                      <>
                        <div className="flex gap-4 mt-2">
                          <label className="block mt-2 text-gray-700 font-semibold dark:text-white">
                            Marks:
                          </label>
                          <input
                            type="number"
                            min="0"
                            max={score}
                            value={marksFeedback[id]?.marks || ""}
                            // onChange={(e) =>
                            //   handleChange(id, "marks", Number(e.target.value), score)
                            // }
                            // className="border rounded-md p-2 w-full"
                            // placeholder={`Enter marks (0 - ${score})`}
                            onChange={(e) =>
                              mode !== "preview" &&
                              handleChange(
                                id,
                                "marks",
                                Number(e.target.value),
                                score
                              )
                            }
                            className="border border-gray-300 rounded-md p-2 w-[160px]"
                            placeholder={`Enter marks (0 - ${score})`}
                            disabled={mode === "preview"}
                          />
                        </div>
                      </>

                      {/* Input for Feedback */}

                      <>
                        <label className="block mt-2 text-gray-700 font-semibold dark:text-white">
                          Feedback:
                        </label>
                        <textarea
                          className="w-full border border-gray-300 rounded-md p-2"
                          value={marksFeedback[id]?.feedback || ""}
                          // onChange={(e) => handleChange(id, "feedback", e.target.value)}
                          // placeholder="Enter feedback"
                          onChange={(e) =>
                            mode !== "preview" &&
                            handleChange(id, "feedback", e.target.value)
                          }
                          placeholder="Enter feedback"
                          disabled={mode === "preview"}
                        />
                      </>
                    </>
                  )}
                </div>
              </CardContent>
            );
          })
        ) : (
          <p className="text-gray-500 dark:text-white">
            Loading attempt data...
          </p>
        )}

        {/* {mode !== "preview" || attemptData?.attempt_content_status !== "Reviewed" && (
          <button
            onClick={saveAllMarksFeedback}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Score"}
          </button>
        )} */}

        {!(
          mode === "preview" ||
          attemptData?.attempt_content_status === "Reviewed"
        ) && (
          <button
            onClick={saveAllMarksFeedback}
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-md"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Score"}
          </button>
        )}

        {successMessage && (
          <p className="mt-4 text-green-600 font-semibold">{successMessage}</p>
        )}

        {/* {showGenerateButton && mode !== "preview" && (
            <button
              onClick={() => setShowCertificate(true)} // Assuming you handle certificate generation with this
              className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md ms-4"
            >
              See Certificate
            </button>
          )} */}

        {certificates?.length > 0 && mode !== "preview" && (
          <button
            onClick={() => setShowCertificate(true)} // Handle certificate generation
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-md ms-4"
          >
            See Certificate
          </button>
        )}

        {showCertificate && (
          <GernateCertificate
            orientation={orientation}
            backgroundImage={backgroundImage}
            contentOrder={contentOrder}
            logo={logo}
            signature={signature}
            showCertificate={showCertificate}
            setShowCertificate={setShowCertificate}
            attemptID={attemptID}
            certificateLogoId={certificateLogoId}
            certificateData={certificateData}
          />
        )}
      </Card>
    </div>
  );
};

export default Page;
