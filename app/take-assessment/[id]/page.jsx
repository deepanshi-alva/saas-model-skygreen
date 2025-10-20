"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import ShowAssessmentDetails from "../ShowAssessmentDetails";
import { Wifi, WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import ProfileInfo from "@/components/partials/header/profile-info";
import { toast } from "react-hot-toast";
import ExitConfirmation from "../ExitConfirmation";
import ThankYouModal from "../ThankYouModal";
import { useAppSelector } from "@/provider/Store";
import ShowAttributeModal from "../ShowAttributeModal";
import MediaRenderer from "../MediaRenderer";
import ShowVideoAttributeModal from "../ShowVideoAttributeModal";
import { Eye } from "lucide-react"; // Import the desired icon
import { set } from "date-fns";
import _ from "lodash";
const Page = () => {
  const user = useAppSelector((state) => state.user);
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // State to store user's answers
  const [timerRunning, setTimerRunning] = useState(false);
  const [showQuiz, setShowQuiz] = useState(true);
  const [assignmentDetails, setAssignmentDetails] = useState({}); // New state for assignment details
  const [isOffline, setIsOffline] = useState(false); // State for internet status
  const [isDataRestored, setIsDataRestored] = useState(false); // New state to check if data was restored
  const [isExitConfirmationOpen, setIsExitConfirmationOpen] = useState(false);
  // Timer using useRef to prevent re-render
  const timeLeftRef = useRef(20); // 2 minutes timer
  const [displayTime, setDisplayTime] = useState(timeLeftRef.current);
  const answersRef = useRef(answers);
  const timerIntervalRef = useRef(null);
  const [documentId, setDocumentId] = useState(null);
  const [submittedAnswers, setSubmittedAnswers] = useState([]); // Holds submitted answers
  const [timeLimit, setTimeLimit] = useState(0); // Store time limit in seconds
  const [isOpen, setIsOpen] = useState(false);
  const [showThankYouModal, setShowThankYouModal] = useState(false);
  const [current_attempts, setCurrentAttempts] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setVideoIsModalOpen] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState("");
  const [modalVideoSrc, setModalVideoSrc] = useState("");

  const [modalContentForOption, setModalContentForOption] = useState("");
  const [isModalOpenOption, setIsModalOpenOption] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [getMarks, setGetMarks] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [maxScore, setMaxScore] = useState(0);
  const [courseId, setCourseId] = useState(null);
  console.log("setGetMarks", getMarks);

  const [hasSubjective, setHasSubjective] = useState(false); // State for subjective questions
  console.log("hasSubjective", hasSubjective);

  // const isSubmittingRef = useRef(false);

  console.log(
    "modalContentForOption isModalOpenOption",
    modalContentForOption,
    isModalOpenOption
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // alert("Switching between browser tabs or applications is not allowed during the test!");
        // Optional: Log the event or end the test
      }
    };
    const handleWindowBlur = () => {
      // alert("You have left the test window. Please return immediately!");
      // Optional: Log this event or take appropriate action
    };
    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    // Cleanup event listeners
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  // useEffect(() => {
  //     const disableRightClick = (event) => {
  //         event.preventDefault();

  //         if (document.hidden) {
  //             alert("Switching between browser tabs or applications is not allowed during the test!");
  //             // Optional: Log the event or end the test
  //         }
  //     };

  //     const handleWindowBlur = () => {
  //         alert("You have left the test window. Please return immediately!");
  //         // Optional: Log this event or take appropriate action
  //     };

  //     // Add event listeners
  //     document.addEventListener("visibilitychange", handleVisibilityChange);
  //     window.addEventListener("blur", handleWindowBlur);

  //     // Cleanup event listeners
  //     return () => {
  //         document.removeEventListener("visibilitychange", handleVisibilityChange);
  //         window.removeEventListener("blur", handleWindowBlur);
  //     };
  // }, []);
  // useEffect(() => {
  //     const onFullscreenChange = () => {
  //         if (!document.fullscreenElement) {
  //             // User has exited fullscreen mode
  //             toast.error("You are not allowed to exit full-screen mode during the test!");
  //             setIsExitConfirmationOpen(true)

  //             // Re-enter fullscreen after a short delay
  //             setTimeout(() => {
  //                 enterFullscreen();
  //             }, 1000);
  //         }
  //     };

  //     // Listen for fullscreen change
  //     document.addEventListener('fullscreenchange', onFullscreenChange);

  //     return () => {
  //         document.removeEventListener('fullscreenchange', onFullscreenChange);
  //     };
  // }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        toast.error(
          "You are not allowed to exit full-screen mode during the test!"
        );
        setIsExitConfirmationOpen(true);

        setTimeout(() => {
          enterFullscreen();
        }, 1000);
      }
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // useEffect(() => {
  //     const handleKeyDown = (event) => {
  //         if (event.key === "Escape") {
  //             event.preventDefault();
  //             toast.error("You cannot exit full-screen during the test!");
  //             setIsExitConfirmationOpen(true);
  //         }
  //     };

  //     document.addEventListener("keydown", handleKeyDown);

  //     return () => {
  //         document.removeEventListener("keydown", handleKeyDown);
  //     };
  // }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === " Escape") {
        event.preventDefault();
        toast.error(
          "You are not allowed to exit full-screen mode during the test!"
        );
        setIsExitConfirmationOpen(true);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    const disableRightClick = (event) => {
      event.preventDefault();
    };
    // Add the event listener when the assessment starts
    document.addEventListener("contextmenu", disableRightClick);
    // Cleanup to restore functionality when the component unmounts
    return () => {
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isInFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isInFullscreen);
    };
    const disableRightClick = (event) => {
      event.preventDefault();

      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  const enterFullscreen = () => {
    const element = document.documentElement;

    if (document.fullscreenElement) return; // Prevent duplicate requests

    if (element.requestFullscreen) {
      element
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => {
          console.error("Fullscreen request failed:", err);
          toast.error("Failed to enter fullscreen mode. Please try again.");
        });
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  };

  const handleFullscreenChange = () => {
    if (!document.fullscreenElement) {
      setIsExitConfirmationOpen(true); // Show the confirmation modal
    }
  };

  useEffect(() => {
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handleUserChoice = (choice) => {
    setIsExitConfirmationOpen(false);
    if (choice === "resume") {
      enterFullscreen();
    } else {
      toast.error("You exited the test!");
      router.push("/public/all-assignments"); // Redirect to home or exit page
    }
  };

  const exitFullscreen = () => {
    if (document?.exitFullscreen) {
      document?.exitFullscreen();
    } else if (document?.mozCancelFullScreen) {
      document.mozCancelFullScreen(); // Firefox
    } else if (document?.webkitExitFullscreen) {
      document.webkitExitFullscreen(); // Chrome, Safari, Opera
    } else if (document?.msExitFullscreen) {
      document.msExitFullscreen(); // IE/Edge
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const isInFullscreen = Boolean(document.fullscreenElement);
      setIsFullscreen(isInFullscreen);
    };
    const disableRightClick = (event) => {
      event.preventDefault();
    };
    // Set up listeners
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("contextmenu", disableRightClick);

    // Cleanup listeners on component unmount
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("contextmenu", disableRightClick);
    };
  }, []);

  useEffect(() => {
    // Automatically enter fullscreen when the assessment starts
    enterFullscreen();
  }, []);

  // console.log("submittedAnswers", submittedAnswers);

  // Start the timer
  const startTimer = () => {
    setTimerRunning(true);
    setDisplayTime(timeLeftRef.current); // Ensure display time syncs with the new time
  };

  // Stop the timer
  const stopTimer = () => {
    clearInterval(timerIntervalRef.current);
    setTimerRunning(false);
  };

  useEffect(() => {
    getUserAttempts();
  }, []);

  const getUserAttempts = async () => {
    try {
      // Validate that user.id and params.id are defined
      if (!user?.id || !params?.id) {
        console.warn("User ID or Assignment ID is missing during build.");
        setCurrentAttempts(0); // Fallback to 0 attempts
        return;
      }

      const response = await axiosInstance({
        url: `/api/attempt-contents?filters[user][id][$eq]=${user.id}&filters[assignment][documentId][$eq]=${params.id}`,
        method: "GET",
      });

      console.log("getUserAttempts data:", response?.data?.data);
      // Check the response structure and update attempts
      const attempts = Array.isArray(response?.data?.data)
        ? response.data?.data?.length
        : 0;
      setCurrentAttempts(attempts);
    } catch (error) {
      console.log(error);
      setCurrentAttempts(0); // Fallback to 0 attempts on error
    }
  };

  console.log("current_attempts", current_attempts);

  // Fetching questions
  const fetchAssignments = async () => {
    console.log("fetchAssignments");

    try {
      setIsLoading(true);
      const { data } = await axiosInstance({
        url: `/api/assignments/${params.id}?populate[questions][populate]=*&populate[course][fields][0]=documentId`,
        method: "GET",
      });

      if (data.data) {
        getUserAttempts();
      }
      let processedQuestions = data.data.questions || [];

      // Check if options should be randomized
      if (data.data.options_randomization) {
        processedQuestions = processedQuestions.map((question) => ({
          ...question,
          options: _.shuffle(question?.options), // Shuffle options inside each question
        }));
      }
      if (data.data.question_randomization) {
        processedQuestions = _.shuffle(processedQuestions);
      }
      setAssignmentDetails(data.data); // Save assignment details
      setMinScore(data.data.min_score);
      setMaxScore(data.data.max_score);
      setQuestions(processedQuestions);
      setCourseId(data.data?.course?.documentId);

      // Check for subjective questions
      const hasSubjectiveQuestion = processedQuestions.some(
        (question) => question.question_type === "Subjective"
      );
      setHasSubjective(hasSubjectiveQuestion); // Update state

      // setAssignmentDetails(data.data); // Save assignment details
      // setQuestions(data.data.questions || []);

      // Extract and set time limit
      const fetchedTimeLimit = data.data.time_limits || 20 * 60; // Default to 20 minutes if not provided
      const timeInSeconds = fetchedTimeLimit * 60; // Convert minutes to seconds
      setTimeLimit(timeInSeconds);
      timeLeftRef.current = timeInSeconds;
      setDisplayTime(timeInSeconds);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetching questions useEffect
  // Fetch questions useEffect
  useEffect(() => {
    if (typeof window !== "undefined" && !isDataRestored) {
      console.log("fetchAssignments1");

      fetchAssignments();
    }
  }, [params.id, isDataRestored]);

  // Sync answersRef with answers state whenever answers change
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Timer Effect
  useEffect(() => {
    if (timerRunning && timeLeftRef.current > 0) {
      timerIntervalRef.current = setInterval(() => {
        timeLeftRef.current -= 1;
        setDisplayTime(timeLeftRef.current);

        if (timeLeftRef.current <= 0) {
          clearInterval(timerIntervalRef.current);
          setTimerRunning(false);

          // Get the current question ID
          const questionId = questions[currentQuestionIndex]?.id;

          // Get the current answer
          const currentAnswer = answers[questionId];

          // Submit current question's answer in desired format
          handleSubmit("time", { [questionId]: currentAnswer });
        }
      }, 1000);
    }

    return () => clearInterval(timerIntervalRef.current);
  }, [timerRunning, currentQuestionIndex, answers]);

  // Effect: Listen for online/offline events
  // Offline/Online Event Handlers
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      stopTimer(); // Pause the timer
      toast.error("You are offline!");

      // const savedIndex = localStorage.getItem("currentQuestionIndex");

      // Save current state (current question index and answers) to localStorage
      localStorage.setItem(
        "quizState",
        JSON.stringify({
          currentQuestionIndex: currentQuestionIndex,
          answers: answersRef.current,
        })
      );

      // alert("Internet connection lost! Your progress has been saved.");
    };

    const handleOnline = () => {
      setIsOffline(false);
      // alert("Internet connection restored. Resuming your session...");
      toast.success("You are back online!");

      // Retrieve saved state
      const savedState = JSON.parse(localStorage.getItem("quizState"));
      console.log("savedState", savedState);

      if (savedState) {
        const { currentQuestionIndex, answers } = savedState;

        // Restore state
        setCurrentQuestionIndex(Number(currentQuestionIndex));
        setAnswers(answers);
        answersRef.current = answers; // Keep answersRef in sync
        setIsDataRestored(true);

        localStorage.removeItem("quizState"); // Clear saved state
        // localStorage.removeItem("currentQuestionIndex");
      }

      startTimer(); // Resume the timer
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  // Function to handle "Next" button click
  const handleNextQuestion = () => {
    // console.log("handleNextQuestion");
    saveCurrentAnswer(); // Save the current answer before moving
    if (currentQuestionIndex < questions?.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      localStorage.setItem("currentQuestionIndex", currentQuestionIndex + 1); // Save to localStorage
    }
  };

  // Function to handle "Previous" button click
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Function to handle input change for subjective answers
  const handleSubjectiveInput = (e) => {
    const questionId = questions[currentQuestionIndex]?.id;
    const updatedAnswers = {
      ...answers,
      [questionId]: e.target.value, // Save the input value for the current question's ID
    };
    setAnswers(updatedAnswers);
  };

  // Function to handle option selection for MCQ answers
  const handleMCQChange = (
    optionId,
    optionValue,
    optionIndex,
    correctOption
  ) => {
    const questionId = questions[currentQuestionIndex]?.id;

    setAnswers((prevAnswers) => {
      const updatedAnswer = {
        id: optionId,
        value: optionValue,
        index: optionIndex,
        correctOption: correctOption,
      };

      return {
        ...prevAnswers,
        [questionId]: updatedAnswer, // Update the answer for the current question
      };
    });
  }; //

  // Function to submit the current question's answer only
  const saveCurrentAnswer = () => {
    const questionId = questions[currentQuestionIndex]?.id;
    // console.log(questionId);

    if (questionId) {
      const currentAnswer = answers[questionId];

      // Call handleSubmit with only the current question's answer
      handleSubmit("manual", { [questionId]: currentAnswer });

      // Remove the answer for the current question after saving
      // setAnswers((prevAnswers) => {
      //     const updatedAnswers = { ...prevAnswers };
      //     delete updatedAnswers[questionId]; // Remove the current question's data
      //     return updatedAnswers;
      // });
    }
  };

  // handleSubmit updated to print submission answers
  const handleSubmit = async (
    type = "manual",
    submissionAnswers = answersRef.current
  ) => {
    console.log(
      "Submitting Quiz Answers:",
      submissionAnswers,
      "Submission Type:",
      type
    );

    if (type === "manual" && currentQuestionIndex === questions?.length - 1) {
      setTimerRunning(false);
      setShowThankYouModal(true);
    }
    if (type === "time") {
      setTimerRunning(false);
      setShowThankYouModal(true);
    }

    // Check if this is the last question

    const isLastQuestion = currentQuestionIndex === questions?.length - 1;

    // Format new answers (remove the 'id' field)
    const newAnswers = Object.keys(submissionAnswers).map((questionId) => {
      const answer = submissionAnswers[questionId];
      console.log("answer", answer);

      // Find the current question to get its documentId
      const currentQuestion = questions.find(
        (q) => q.id === Number(questionId)
      );
      console.log("currentQuestion", currentQuestion);

      const currentQuestiondocumentId = currentQuestion?.documentId || ""; // Get the documentId
      console.log("answer main", answer);
      // Determine if the answer is correct and assign marks
      const isCorrect = answer?.correctOption;
      const marksAwarded = isCorrect ? currentQuestion?.score || 0 : 0;

      console.log("Answer evaluation:", {
        questionId,
        isCorrect,
        marksAwarded,
      });

      return {
        question: currentQuestiondocumentId, // Ensure question ID is a number
        answer_value: typeof answer === "string" ? answer : answer?.value || "",
        is_correct: isCorrect,
        marks_awarded: marksAwarded,
        feedback: null,
        question_submit_time: new Date(),
      };
    });

    console.log("newAnswers", newAnswers);

    // Combine previous answers and new ones, removing duplicates
    const answerMap = new Map();
    submittedAnswers.forEach((prevAnswer) =>
      answerMap.set(prevAnswer.question, prevAnswer)
    );
    newAnswers.forEach((newAnswer) =>
      answerMap.set(newAnswer.question, newAnswer)
    );
    const combinedAnswers = Array.from(answerMap.values());

    console.log("combinedAnswers", combinedAnswers);

    // Prepare formatted data
    const formattedData = {
      data: {
        answers: combinedAnswers, // Use cleaned and merged answers
        attempt_content_status: isLastQuestion ? "Complete" : "In Progress", // Update status if it's the last question
        end_time: isLastQuestion ? new Date() : null, // Set end time only if it's the last question
        // total_marks:"",
        // auto_graded_marks:""
      },
    };

    console.log("Final Submission Data:", formattedData);
    // if (isSubmittingRef.current) {
    //     console.log("Submission already in progress... skipping duplicate");
    //     return;
    // }
    // isSubmittingRef.current = true;
    try {
      if (documentId) {
        const response = await axiosInstance({
          url: `/api/attempt-contents/${documentId}?populate=answers.question`,
          method: "PUT",
          data: formattedData,
        });
        console.log("Submission Successful:", response.data);

        // Transform the answers array to include only `documentId`
        const updatedAnswers =
          response.data?.data?.answers.map((answer) => ({
            is_correct: answer.is_correct,
            marks_awarded: answer.marks_awarded,
            feedback: answer.feedback,
            answer_value: answer.answer_value,
            question_submit_time: answer.question_submit_time,
            question: answer.question.documentId, // Extract documentId directly
          })) || [];
        console.log("Transformed Answers:", updatedAnswers);
        setSubmittedAnswers(updatedAnswers); // Update state with new answers
        const totalScoreFromBackend = updatedAnswers.reduce(
          (total, ans) => total + ans.marks_awarded,
          0
        );
        if (isLastQuestion) {
          const formattedLastData = {
            data: {
              // total_marks:"",
              auto_graded_marks: totalScoreFromBackend,
            },
          };
          const response = await axiosInstance({
            url: `/api/attempt-contents/${documentId}?populate=answers.question`,
            method: "PUT",
            data: formattedLastData,
          });
          console.log(response);
        }
        setGetMarks(totalScoreFromBackend);
      } else {
        console.error("Document ID not found. Cannot submit data.");
      }
    } catch (error) {
      console.error("Error submitting answers:", error);
    }
  };

  const handleSkip = async () => {
    // Save current answer if there's any (even if it's empty)
    // saveCurrentAnswer();

    if (!questions) {
      return;
    }

    // Get the current question ID
    const questionId = questions[currentQuestionIndex]?.id;

    // Get the current answer
    const currentAnswer = answers[questionId];

    // Check if this is the last question

    const isLastQuestion = currentQuestionIndex === questions?.length - 1;

    // Transform answers to include documentId
    const newAnswers = Object.keys(answers).map((questionId) => {
      const answer = answers[questionId];
      // Find the current question to get its documentId
      const currentQuestion = questions.find(
        (q) => q.id === Number(questionId)
      );
      const currentQuestiondocumentId = currentQuestion?.documentId || ""; // Get the documentId

      return {
        question: currentQuestiondocumentId, // Add the documentId to the question field
        answer_value: typeof answer === "string" ? answer : answer?.value || "",
        is_correct: null, // Set this to null as no validation is done yet
        marks_awarded: 0, // You can adjust this value based on your validation logic
        feedback: null, // You can set this to feedback if needed
        question_submit_time: new Date(), // Time when the question was answered or skipped
      };
    });

    // Combine the new answers in the request data format
    const formattedData = {
      data: {
        answers: newAnswers, // Use the transformed answers
        attempt_content_status: isLastQuestion ? "Complete" : "In Progress", // Update status if it's the last question
        end_time: isLastQuestion ? new Date() : null, // Set end time only if it's the last question
      },
    };

    console.log("Submitting Skipped Answer:", formattedData);

    try {
      // Send the request to update the attempt with the skipped answer
      const response = await axiosInstance({
        url: `/api/attempt-contents/${documentId}?populate=answers.question`,
        method: "PUT",
        data: formattedData,
      });

      console.log("Submission Successful:", response.data);

      // Transform the answers array to include only `documentId` and update state
      const updatedAnswers =
        response.data?.data?.answers.map((answer) => ({
          is_correct: answer.is_correct,
          marks_awarded: answer.marks_awarded,
          feedback: answer.feedback,
          answer_value: answer.answer_value,
          question_submit_time: answer.question_submit_time,
          question: answer.question.documentId, // Extract documentId directly
        })) || [];

      console.log("Transformed Answers:", updatedAnswers);

      // Update state with the new answers
      setSubmittedAnswers(updatedAnswers);

      // Move to the next question
      handleNextQuestion();
    } catch (error) {
      console.error("Error submitting skipped answer:", error);
    }
  };

  // Image click handler
  const handleImageClick = (src) => {
    setModalImageSrc(src); // Set the image source in state
    setIsModalOpen(true); // Open the modal
  };

  // Video click handler (you can customize this if you want video-specific modal behavior)
  const handleVideoClick = (src) => {
    setModalVideoSrc(src);
    setVideoIsModalOpen(true);
  };

  // Close modal handler
  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageSrc(""); // Clear the image source when closing
  };

  const handleMediaClick = (src) => {
    // Create a temporary DOM element to parse the HTML string
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = src;

    // Find the img element within the paragraph
    const imgElement = tempDiv.querySelector("p img");

    // Extract the src attribute if img exists
    if (imgElement) {
      const imgSrc = imgElement.getAttribute("src");
      console.log("imgSrc", imgSrc); // This will log the base64 image data
      setModalContentForOption(imgSrc);
      setIsModalOpenOption(true);
    } else {
      console.log("No image found within paragraph tag");
    }
  };

  const closeModalForOption = () => {
    setIsModalOpenOption(false); // Close the modal
  };

  console.log("questions1", questions);

  // Calculate progress as a percentage
  // const progress = ((currentQuestionIndex + 1) / questions?.length) * 100;
  const progress =
    ((currentQuestionIndex + 1) / (questions?.length || 1)) * 100;
  // if (!questions || questions.length === 0) {
  //     return <div>Loading...</div>;
  // }
  return (
    // (showQuiz === true ? <ShowAssessmentDetails setShowQuiz={setShowQuiz} startTimer={startTimer} assignmentDetails={assignmentDetails}
    //     questions={questions} setDocumentId={setDocumentId} current_attempts={current_attempts} exitFullscreen={exitFullscreen} /> :
    showQuiz ? (
      assignmentDetails?.id && questions.length > 0 ? (
        <ShowAssessmentDetails
          setShowQuiz={setShowQuiz}
          startTimer={startTimer}
          assignmentDetails={assignmentDetails}
          questions={questions}
          setDocumentId={setDocumentId}
          // current_attempts={currentAttempts}
          current_attempts={current_attempts}
          exitFullscreen={exitFullscreen}
        />
      ) : isFullscreen ? (
        <div className="basis-full md:basis-1/2 w-full flex justify-center items-center bg-card">
          <div className="w-full">
            <Card className="min-h-screen flex items-center justify-center">
              <CardContent>
                <p className="text-xl text-center">Preparing your exam...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null
    ) : (
      // (isFullscreen &&

      <div className="basis-full md:basis-1/2 w-full flex justify-center items-center bg-card">
        <div className="w-full">
          <Card className="min-h-screen">
            <CardHeader className="border-none">
              {/* {isOffline && <p style={{ color: "red" }}>You are offline. Submitting your data...</p>} */}
              {/* <WifiOff /> <Wifi/> */}
              <section className="flex justify-between items-center">
                {/* <span className="text-xl font-bold">Question {currentQuestionIndex + 1}</span> */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="80"
                  height="80"
                  viewBox="0 0 112 109.76"
                  class="text-primary h-25 w-25"
                >
                  <defs>
                    <clipPath id="logo_svg__b">
                      <path
                        d="M0 0h112v109.834H0z"
                        data-name="Rectangle 1"
                      ></path>
                    </clipPath>
                    <clipPath id="logo_svg__a">
                      <path d="M0 0h112v109.76H0z"></path>
                    </clipPath>
                  </defs>
                  <g
                    clip-path="url(#logo_svg__a)"
                    data-name="Custom Size \u2013 1"
                  >
                    <g clip-path="url(#logo_svg__b)" data-name="Artboard 1">
                      <g data-name="Group 1">
                        <path
                          fill="#3f3f3f"
                          d="M46.908 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.68l-1.566-2.476Zm-2.29 0h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Z"
                          data-name="Path 1"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M55.86 70.101v-3.762h.737v3.763Zm-1.413-2v.126a2.2 2.2 0 0 1-.043.45 1.6 1.6 0 0 1-.135.393 2 2 0 0 1-.723.818 1.9 1.9 0 0 1-1.037.288 1.9 1.9 0 0 1-.788-.164 1.9 1.9 0 0 1-.651-.483 1.9 1.9 0 0 1-.366-.61 2 2 0 0 1-.127-.723 1.9 1.9 0 0 1 .153-.746 2 2 0 0 1 .447-.642 1.8 1.8 0 0 1 .621-.411 2.1 2.1 0 0 1 .759-.133 1.84 1.84 0 0 1 1.048.3 1.9 1.9 0 0 1 .682.869h-.893a1.05 1.05 0 0 0-.384-.305 1.2 1.2 0 0 0-.494-.1 1.1 1.1 0 0 0-.819.348 1.24 1.24 0 0 0 0 1.7 1.146 1.146 0 0 0 1.872-.338h-1.476v-.63Z"
                          data-name="Path 2"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M68.357 70.101h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Zm-3.6 0h-2.03v-3.763h2.03v.661h-1.3v.859h1.3v.651h-1.3v.931h1.3Zm-5.859 0h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.567-2.476Z"
                          data-name="Path 3"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M73.892 70.101v-3.763h.736v3.763Zm-3.224 0h-.736v-3.763h.894a5 5 0 0 1 .636.03 1.3 1.3 0 0 1 .354.1 1.12 1.12 0 0 1 .489.419 1.17 1.17 0 0 1 .168.632 1.15 1.15 0 0 1-.24.74 1.08 1.08 0 0 1-.654.387l.941 1.46h-.878l-.971-1.747Zm0-1.932h.164a1.18 1.18 0 0 0 .678-.162.54.54 0 0 0 .231-.471.51.51 0 0 0-.193-.443 1.03 1.03 0 0 0-.6-.142h-.274Z"
                          data-name="Path 4"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M76.931 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.566-2.476Z"
                          data-name="Path 5"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M84.434 68.101v.126a2.2 2.2 0 0 1-.043.45 1.6 1.6 0 0 1-.135.393 2 2 0 0 1-.723.818 1.9 1.9 0 0 1-1.037.288 1.9 1.9 0 0 1-.788-.163 1.9 1.9 0 0 1-.651-.483 1.9 1.9 0 0 1-.366-.61 2 2 0 0 1-.127-.723 1.9 1.9 0 0 1 .153-.746 2 2 0 0 1 .447-.642 1.8 1.8 0 0 1 .621-.411 2.1 2.1 0 0 1 .759-.133 1.84 1.84 0 0 1 1.048.3 1.9 1.9 0 0 1 .682.869h-.893a1.06 1.06 0 0 0-.384-.305 1.2 1.2 0 0 0-.495-.1 1.1 1.1 0 0 0-.819.348 1.24 1.24 0 0 0 0 1.7 1.146 1.146 0 0 0 1.872-.338h-1.476v-.63Z"
                          data-name="Path 6"
                        ></path>
                        <path
                          fill="#3f3f3f"
                          d="M84.711 69.393h.661v.708h-.661z"
                          data-name="Rectangle 1"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M87.747 70.101h-.736v-3.763h.935a3 3 0 0 1 .562.039.9.9 0 0 1 .331.123 1.1 1.1 0 0 1 .366.417 1.2 1.2 0 0 1 .132.552 1.1 1.1 0 0 1-.356.863 1.38 1.38 0 0 1-.961.324h-.274Zm0-2.081h.2a.73.73 0 0 0 .471-.133.53.53 0 0 0 0-.763.78.78 0 0 0-.481-.125h-.189Z"
                          data-name="Path 7"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="m90.888 69.316-.292.788h-.763l1.459-3.763h.636l1.439 3.763h-.788l-.3-.788Zm1.151-.7-.444-1.213-.454 1.213Z"
                          data-name="Path 8"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M97.879 68.932h.672v.054a.56.56 0 0 0 .124.381.41.41 0 0 0 .331.144.47.47 0 0 0 .351-.133.5.5 0 0 0 .129-.36q0-.365-.522-.522l-.1-.035a1.35 1.35 0 0 1-.651-.388.95.95 0 0 1-.213-.638 1.2 1.2 0 0 1 .294-.851 1 1 0 0 1 .781-.32.96.96 0 0 1 .728.285 1.22 1.22 0 0 1 .3.8h-.666v-.03a.4.4 0 0 0-.108-.293.39.39 0 0 0-.285-.111.36.36 0 0 0-.285.114.44.44 0 0 0-.1.31.4.4 0 0 0 .022.146.3.3 0 0 0 .067.115 1.04 1.04 0 0 0 .454.215c.1.027.183.05.238.069a1.17 1.17 0 0 1 .573.377 1.02 1.02 0 0 1 .184.628 1.33 1.33 0 0 1-.322.935 1.1 1.1 0 0 1-.859.353 1.04 1.04 0 0 1-.814-.342 1.3 1.3 0 0 1-.318-.9m-3.484 0h.672v.054a.57.57 0 0 0 .124.381.41.41 0 0 0 .33.144.47.47 0 0 0 .351-.133.5.5 0 0 0 .129-.36q0-.365-.522-.522l-.1-.035a1.35 1.35 0 0 1-.651-.388.95.95 0 0 1-.213-.638 1.2 1.2 0 0 1 .294-.851 1 1 0 0 1 .781-.32.96.96 0 0 1 .728.285 1.22 1.22 0 0 1 .3.8h-.666v-.03a.4.4 0 0 0-.108-.293.39.39 0 0 0-.285-.111.36.36 0 0 0-.285.114.5.5 0 0 0-.083.456.3.3 0 0 0 .068.115 1.03 1.03 0 0 0 .454.215c.1.027.183.05.238.069a1.17 1.17 0 0 1 .573.377 1 1 0 0 1 .184.628 1.33 1.33 0 0 1-.322.935 1.1 1.1 0 0 1-.859.353 1.04 1.04 0 0 1-.814-.342 1.31 1.31 0 0 1-.317-.9Z"
                          data-name="Path 9"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M103.746 68.212a2 2 0 0 1 .083-.587 1.9 1.9 0 0 1 .246-.515 1.92 1.92 0 0 1 1.619-.848 1.9 1.9 0 0 1 .723.144 2 2 0 0 1 .621.417 2 2 0 0 1 .429.633 1.9 1.9 0 0 1 .147.737 2.1 2.1 0 0 1-.138.758 1.8 1.8 0 0 1-.407.629 1.9 1.9 0 0 1-.629.44 1.9 1.9 0 0 1-.754.154 2 2 0 0 1-.775-.15 1.8 1.8 0 0 1-.627-.444 1.9 1.9 0 0 1-.4-.627 2 2 0 0 1-.137-.743m.772-.025a1.2 1.2 0 0 0 .081.452 1.2 1.2 0 0 0 .237.381 1.2 1.2 0 0 0 .393.291 1.1 1.1 0 0 0 .454.1 1.1 1.1 0 0 0 .827-.353 1.22 1.22 0 0 0 .334-.875 1.13 1.13 0 0 0-.336-.822 1.1 1.1 0 0 0-.811-.339 1.15 1.15 0 0 0-.836.338 1.11 1.11 0 0 0-.345.826Zm-2.915 1.915v-3.761h.736v3.763Z"
                          data-name="Path 10"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M109.751 70.101h-.724v-3.763h.7l1.553 2.4v-2.4h.721v3.763h-.682l-1.566-2.476Z"
                          data-name="Path 11"
                        ></path>
                        <path
                          fill="#ccc"
                          d="M13.111 41.184s13.727 22.9 9.53 41.068C18.008 102.314 0 109.768 0 109.768l29.34.066c8.643-12.031 6.675-24.291 4.868-32.24-4.868-21.425-21.1-36.41-21.1-36.41"
                          data-name="Path 12"
                        ></path>
                        <path
                          d="m19.516 108.223-.39-.385a37 37 0 0 0 2.085-2.3l.421.349c-.663.8-1.373 1.583-2.117 2.337m4.11-4.98-.453-.309c.612-.9 1.187-1.831 1.705-2.777l.48.264a34 34 0 0 1-1.732 2.822m3.181-5.8-.5-.215c.424-.992.806-2.019 1.136-3.055l.521.166a33 33 0 0 1-1.152 3.1Zm2.009-6.3-.535-.116a38 38 0 0 0 .559-3.215l.543.071c-.141 1.1-.333 2.2-.566 3.26Zm.861-6.554-.547-.028c.035-.7.051-1.424.051-2.142 0-.371 0-.749-.013-1.123l.547-.013q.015.569.015 1.136c0 .727-.014 1.457-.05 2.169Zm-.7-6.554a58 58 0 0 0-.4-3.246l.542-.084c.171 1.1.307 2.2.409 3.278Zm-1-6.463a62 62 0 0 0-.775-3.18l.53-.144c.29 1.068.553 2.149.781 3.209Zm-1.714-6.318a65 65 0 0 0-1.095-3.088l.514-.2a62 62 0 0 1 1.1 3.114Zm-2.343-6.116c-.821-1.855-1.417-2.935-1.424-2.945l.478-.266c.007.011.612 1.111 1.445 2.989Z"
                          data-name="Path 13"
                        ></path>
                        <path
                          d="M14.162.395s-2.352 20.679 3.724 30.97c.011.016-4.1 7.557-5.194 12.578-1.829 8.428-3.234 22.216-3.234 22.216-10.977-36.067 4.7-65.763 4.7-65.763"
                          data-name="Path 14"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M17.2 82.752c-11.556-35.577.685-57.121 40.379-55.493 0 0-42.656 13.613-40.379 55.493"
                          data-name="Path 15"
                        ></path>
                        <path
                          d="M19.144 0s-1.06 4.805.178 6.9a39 39 0 0 0-2.894 3.222c-.78 1.161-2.653 4.383-2.653 4.383C13.364 8.334 19.144 0 19.144 0"
                          data-name="Path 16"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M59.4 64.005h-2.895l-1.888-5.041a4.9 4.9 0 0 0-.686-1.2 4.7 4.7 0 0 0-.99-.947 4.6 4.6 0 0 0-1.257-.619 4.8 4.8 0 0 0-1.47-.22h-4.933v8.027h-2.667v-18.8h8.911q.806 0 1.537.035a11 11 0 0 1 1.395.157 6.4 6.4 0 0 1 1.256.363 4.6 4.6 0 0 1 1.127.669 4.9 4.9 0 0 1 1.385 1.823 5.4 5.4 0 0 1 .472 2.207 5.1 5.1 0 0 1-.311 1.808 4.5 4.5 0 0 1-.9 1.467 5.2 5.2 0 0 1-1.424 1.082 6.4 6.4 0 0 1-1.889.626v.043a5.22 5.22 0 0 1 3.229 3.4Zm-14.118-10.28h5.97a11.4 11.4 0 0 0 2.125-.171 3.9 3.9 0 0 0 1.463-.555 2.27 2.27 0 0 0 .837-1.012 3.9 3.9 0 0 0 .267-1.523 2.77 2.77 0 0 0-1.066-2.4 5.5 5.5 0 0 0-3.229-.776h-6.367Z"
                          data-name="Path 17"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M68.477 50.063a7.9 7.9 0 0 1 2.834.483 5.9 5.9 0 0 1 2.154 1.4 6.2 6.2 0 0 1 1.371 2.242 9.6 9.6 0 0 1-.008 6.023 6.2 6.2 0 0 1-1.386 2.243 5.9 5.9 0 0 1-2.156 1.4 7.9 7.9 0 0 1-2.81.477 7.8 7.8 0 0 1-2.779-.475 5.92 5.92 0 0 1-3.563-3.617 9.56 9.56 0 0 1-.008-6.051 6.14 6.14 0 0 1 1.386-2.242 6 6 0 0 1 2.163-1.4 7.8 7.8 0 0 1 2.8-.483m0 12.358a4.2 4.2 0 0 0 1.676-.327 3.5 3.5 0 0 0 1.31-.982 4.7 4.7 0 0 0 .852-1.637 8.66 8.66 0 0 0 0-4.557 4.7 4.7 0 0 0-.852-1.638 3.5 3.5 0 0 0-1.31-.982 4.2 4.2 0 0 0-1.676-.327 4.2 4.2 0 0 0-1.69.327 3.5 3.5 0 0 0-1.31.982 4.7 4.7 0 0 0-.852 1.637 8.66 8.66 0 0 0 0 4.557 4.7 4.7 0 0 0 .852 1.637 3.5 3.5 0 0 0 1.31.982 4.2 4.2 0 0 0 1.69.326Z"
                          data-name="Path 18"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M87.439 62.392a5.46 5.46 0 0 1-4.157 1.937 6.2 6.2 0 0 1-2.582-.506 5.26 5.26 0 0 1-1.889-1.424 6.2 6.2 0 0 1-1.157-2.214 10 10 0 0 1-.388-2.878 9.1 9.1 0 0 1 .471-3.026 6.8 6.8 0 0 1 1.3-2.286 5.6 5.6 0 0 1 1.949-1.437 5.9 5.9 0 0 1 2.429-.5 6.6 6.6 0 0 1 2.187.349 6 6 0 0 1 1.835 1.032v-6.234h2.576v18.794h-2.576Zm0-2.32v-6.451a5.46 5.46 0 0 0-3.853-1.651 3.14 3.14 0 0 0-2.65 1.33 6.7 6.7 0 0 0-.989 4.008 6.5 6.5 0 0 0 .936 3.816 3.02 3.02 0 0 0 2.6 1.3 4.06 4.06 0 0 0 2.072-.575 6.6 6.6 0 0 0 1.888-1.775Z"
                          data-name="Path 19"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M96.41 47.825h-2.573v-2.62h2.573Zm0 16.175h-2.573V50.405h2.573Z"
                          data-name="Path 20"
                        ></path>
                        <path
                          fill="#f45f0e"
                          d="M106.129 64.328a7.8 7.8 0 0 1-2.78-.477 5.93 5.93 0 0 1-3.564-3.617 9.56 9.56 0 0 1-.008-6.051 6.2 6.2 0 0 1 1.386-2.242 6 6 0 0 1 2.162-1.4 7.8 7.8 0 0 1 2.8-.483 8 8 0 0 1 2.179.285 5.5 5.5 0 0 1 1.773.847 4.7 4.7 0 0 1 1.265 1.388 5 5 0 0 1 .648 1.894h-2.665a2.5 2.5 0 0 0-.29-1.083 2.4 2.4 0 0 0-.684-.783 3.1 3.1 0 0 0-1-.477 4.5 4.5 0 0 0-1.226-.163 4.25 4.25 0 0 0-1.691.326 3.5 3.5 0 0 0-1.309.983 4.7 4.7 0 0 0-.854 1.637 8.7 8.7 0 0 0 0 4.557 4.7 4.7 0 0 0 .854 1.637 3.5 3.5 0 0 0 1.309.982 4.2 4.2 0 0 0 1.691.327 4.5 4.5 0 0 0 1.18-.156 3.2 3.2 0 0 0 1.006-.462 2.5 2.5 0 0 0 .707-.77 2.3 2.3 0 0 0 .305-1.09h2.666a4.9 4.9 0 0 1-.656 1.9 4.75 4.75 0 0 1-1.271 1.373 5.5 5.5 0 0 1-1.775.832 8.1 8.1 0 0 1-2.163.278"
                          data-name="Path 21"
                        ></path>
                      </g>
                    </g>
                  </g>
                </svg>

                <div className="flex justify-between items-center flex-col sm:flex-row gap-2 sm:gap-0">
                  {/* <Badge color="destructive">Danger</Badge> */}
                  <span className="">
                    {isOffline ? (
                      <span className="flex justify-between">
                        <Badge
                          color="ghost"
                          variant=""
                          className="border-none text-dark-200 py-1 px-4 text-md ml-1 opacity-50"
                        >
                          <WifiOff className="mr-2" /> Offline
                        </Badge>
                      </span>
                    ) : (
                      <span className="flex justify-between">
                        <Badge
                          color="ghost"
                          variant=""
                          className="border-none text-success py-1 px-4 text-md ml-1"
                        >
                          <Wifi className="mr-2" /> Online
                        </Badge>
                      </span>
                    )}
                  </span>
                  <Badge
                    color="ghost"
                    className="text-default border py-2 px-4 text-md ml-2 text-base font-semibold flex flex-row gap-1"
                  >
                    <span className="">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M5.455 15L1 18.5V3a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v12zm-.692-2H16V4H3v10.385zM8 17h10.237L20 18.385V8h1a1 1 0 0 1 1 1v13.5L17.546 19H9a1 1 0 0 1-1-1z"
                        />
                      </svg>
                    </span>
                    <span className="">
                      Question {currentQuestionIndex + 1} / {questions?.length}
                    </span>
                  </Badge>
                  <Badge
                    color="ghost"
                    className="text-default border py-2 px-4 text-md ml-2 text-base font-semibold flex flex-row gap-1"
                  >
                    <span className="">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                        >
                          <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0-18 0" />
                          <path d="M12 7v5l3 3" />
                        </g>
                      </svg>
                    </span>
                    <span className="w-full sm:w-auto">
                      {`${Math.floor(displayTime / 3600)
                        .toString()
                        .padStart(2, "0")} : ${Math.floor(
                        (displayTime % 3600) / 60
                      )
                        .toString()
                        .padStart(2, "0")} : ${(displayTime % 60)
                        .toString()
                        .padStart(2, "0")}`}
                    </span>
                  </Badge>

                  <span className="mx-2">
                    <ProfileInfo />
                  </span>
                </div>
              </section>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <p>Loading...</p>
              ) : questions && questions?.length > 0 ? (
                <div className="my-0 flex mx-auto max-w-[1024px] h-auto md:h-[calc(100vh-184px)] items-center">
                  <div className="flex-col w-full">
                    {/* Display Question */}
                    <section className="flex justify-center content-center flex-col font-bold text-base md:text-2xl">
                      <span className="font-medium text-base flex">
                        Question {currentQuestionIndex + 1}
                      </span>
                      <h2
                        className="mb-2 flex"
                        dangerouslySetInnerHTML={{
                          __html: questions[currentQuestionIndex]?.question,
                        }}
                      ></h2>

                      {questions[currentQuestionIndex]?.description &&
                        !questions[currentQuestionIndex]?.description
                          .trim()
                          .startsWith("<p><br>") &&
                        questions[currentQuestionIndex]?.description.trim() !==
                          "" && (
                          <MediaRenderer
                            description={
                              questions[currentQuestionIndex]?.description
                            }
                            handleImageClick={handleImageClick}
                            handleVideoClick={handleVideoClick}
                          />
                        )}
                    </section>

                    {/* Render Based on Question Type */}
                    {questions[currentQuestionIndex]?.question_type ===
                    "Subjective" ? (
                      <Textarea
                        placeholder="Type your answer here..."
                        value={
                          answers[questions[currentQuestionIndex]?.id] || ""
                        }
                        onChange={handleSubjectiveInput}
                        id="rows-8"
                        rows="8"
                        className="w-full h-auto text-base text-default-700"
                      />
                    ) : questions[currentQuestionIndex]?.question_type ===
                      "MCQ" ? (
                      <div className="flex justify-start">
                        <span className="grid grid-cols-2 gap-4 w-full">
                          {questions[currentQuestionIndex]?.options?.map(
                            (option, optionIndex) => (
                              <div
                                key={option.id}
                                className="relative flex justify-start content-center bg-default-100 dark:bg-default-200 text-base text-default-700 p-6 rounded-md"
                              >
                                <Checkbox
                                  id={`option-${option.id}`}
                                  checked={
                                    answers[questions[currentQuestionIndex]?.id]
                                      ?.id === option.id || false
                                  }
                                  onCheckedChange={() =>
                                    handleMCQChange(
                                      option.id,
                                      option.option,
                                      optionIndex,
                                      option.correct
                                    )
                                  }
                                />
                                <label
                                  htmlFor={`option-${option.id}`}
                                  className="ml-2"
                                  dangerouslySetInnerHTML={{
                                    __html: option.option,
                                  }}
                                />
                                {option.option.includes("<img") && (
                                  <Eye
                                    className="absolute top-3 right-3 flex gap-1.5 text-primary cursor-pointer"
                                    onClick={() =>
                                      handleMediaClick(option.option)
                                    }
                                  />
                                )}
                              </div>
                            )
                          )}
                        </span>
                      </div>
                    ) : null}

                    {/* Navigation Buttons */}
                    <section className="flex justify-between items-center fixed bottom-0 left-0 w-full sm:p-4 p-2 bg-card">
                      {currentQuestionIndex === 0 ? (
                        <Button
                          color="destructive"
                          onClick={() => setIsOpen(true)}
                        >
                          Exit
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          onClick={handlePreviousQuestion}
                          disabled={currentQuestionIndex === 0}
                          className="me-2"
                        >
                          {"<-"} Previous
                        </Button>
                      )}
                      <span className="w-3/4 bg-gray-300 rounded-full h-2">
                        <Progress value={progress} size="sm" />
                      </span>

                      <Button
                        onClick={handleSkip} // Call handleSkip to skip the current question
                        disabled={
                          currentQuestionIndex === questions?.length - 1
                        } // Disable on the last question
                        className="mx-2"
                        variant="outline"
                      >
                        Skip
                      </Button>

                      {currentQuestionIndex === questions?.length - 1 ? (
                        <Button
                          onClick={() => {
                            saveCurrentAnswer(); // Ensure the last answer is saved
                            handleSubmit("manual"); // Submit the assessment
                          }}
                          disabled={!timerRunning} // Disable when the timer is off
                        >
                          Submit Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNextQuestion}
                          disabled={
                            currentQuestionIndex === questions?.length - 1
                          }
                        >
                          Next Question {"->"}
                        </Button>
                      )}
                    </section>
                  </div>
                </div>
              ) : (
                <p>No questions available.</p>
              )}
            </CardContent>
          </Card>
        </div>
        <ExitConfirmation
          open={isExitConfirmationOpen}
          setOpen={setIsExitConfirmationOpen}
          handleUserChoice={handleUserChoice}
        />
        {/* Thank You Modal */}
        <ThankYouModal
          showThankYouModal={showThankYouModal}
          setShowThankYouModal={setShowThankYouModal}
          exitFullscreen={exitFullscreen}
          getMarks={getMarks}
          minScore={minScore}
          documentId={documentId}
          hasSubjective={hasSubjective}
          courseId={courseId}
        />
        {/* Show Attribute Modal */}
        <ShowAttributeModal
          isModalOpen={isModalOpen}
          closeModal={() => setIsModalOpen(false)}
          imageSrc={modalImageSrc}
        />

        <ShowVideoAttributeModal
          isVideoModalOpen={isVideoModalOpen}
          closeModal={() => setVideoIsModalOpen(false)}
          modalVideoSrc={modalVideoSrc}
        />

        {/* <OptionsMediaRender
                    content={modalContentForOption}
                    isOpen={isModalOpenOption}
                    closeModal={closeModalForOption}
                /> */}
        {isModalOpenOption && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl max-h-[80%] overflow-y-auto relative">
              <button
                onClick={closeModalForOption}
                className="absolute top-4 right-4 p-2 rounded-full text-dark"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 20 20"
                >
                  <path
                    fill="currentColor"
                    d="M2.93 17.07A10 10 0 1 1 17.07 2.93A10 10 0 0 1 2.93 17.07M11.4 10l2.83-2.83l-1.41-1.41L10 8.59L7.17 5.76L5.76 7.17L8.59 10l-2.83 2.83l1.41 1.41L10 11.41l2.83 2.83l1.41-1.41L11.41 10z"
                  />
                </svg>
              </button>
              {/* <div
                            className="modal-body"
                            dangerouslySetInnerHTML={{ __html: modalContentForOption }} // Display HTML content
                        >
                            {modalContentForOption}
                        </div> */}
              <img src={modalContentForOption} />
            </div>
          </div>
        )}
      </div>
    )
  );
};

export default Page;
