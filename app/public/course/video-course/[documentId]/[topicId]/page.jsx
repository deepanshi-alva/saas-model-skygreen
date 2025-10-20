"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ReactPlayer from "react-player";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import axiosInstance from "@/config/axios.config";
import { useParams, usePathname } from "next/navigation";
import { Kbd } from "@/components/ui/kbd";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { CircularProgress, ForegroundProgress } from "@/components/ui/progress";
import { useSelector } from "react-redux";
import { Book, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Overview from "../../Overview copy";
import AnnouncementGrid from "../../AnnouncementGrid";
import { cn, formatDateToIST } from "../../../../../../lib/utils";
import CourseOverview from "../../CourseOverview";
import ReviewsPage from "../../ReviewsPage";
import AskQA from "../../AskQA";
import Link from "next/link";
import PageNotFound from "../../../../../../app/not-found";
import { getFilePath } from "../../../../../../config/file.path";
import { toast } from "react-hot-toast";
import { Icon } from "@iconify/react";

const pages = [
  {
    text: "Content",
    value: "content",
  },
  {
    text: "Q & A",
    value: "q-a",
  },
  {
    text: "Announcement",
    value: "announcement",
  },
  {
    text: "Reviews",
    value: "reviews",
  },
  {
    text: "Course Overview",
    value: "course-overview",
  },
];

const getHash = () =>
  typeof window !== "undefined" ? window.location.hash : "";
let prev = 0;
const page = () => {
  const paramms = useParams();
  const router = useRouter();
  const [course, setCourse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const [videoDuration, setVideoDuration] = useState({});
  const [isChecked, setIsChecked] = useState({});
  const [progress, setProgress] = useState({});
  const [videoUrl, setVideoUrl] = useState("");
  const [topicId, setTopicId] = useState();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [hasNext, setNext] = useState(false);
  const [hasPrevious, setPrevious] = useState(false);
  const [lectures, setLectures] = useState(0);
  const [seekDone, isSeekDone] = useState(false);
  const playerRef = useRef(null);
  const user = useSelector((state) => state.user);

  const [announcements, setAnnouncement] = useState([]);
  const [courseDetails, setCourseDetails] = useState({});
  const [openAccordion, setOpenAccordion] = useState([]);
  const [previousRoute, setPreviousRoute] = useState(null);
  // const [prev,setPrev] = useState(0);
  const [current, setCurrent] = useState({});
  const courseDocumentId = paramms.documentId;
  console.log("params", courseDocumentId);
  const params = new URLSearchParams();
  params.append("filters[user][id][$eq]", user?.id);
  params.append("filters[course][documentId][$eq]", courseDocumentId);
  const locationName = usePathname();
  const [hash, setHash] = useState(getHash());
  const dynamicParams = useParams();
  //used to update hash
  useEffect(() => {
    const updateHash = () => {
      const currentHash = getHash();
      if (!currentHash) {
        // Default to the first page's value if no hash is present
        const defaultHash = pages[0]?.value || "";
        router.push(`${locationName}#${defaultHash}`);
      } else {
        // Update the state with the new hash
        if (currentHash !== "#undefined") {
          setHash(currentHash);
        } else {
          setHash(`#${pages[0].value}`);
        }
        // console.log('Hash updated:', currentHash);
      }
    };

    updateHash();

    window.addEventListener("hashchange", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
    };
  }, [dynamicParams, locationName]);

  //open the single accordian based on index
  const openAccordionItem = (value) => {
    setOpenAccordion((prev) => {
      if (!prev.includes(value)) {
        return [...prev, value];
      }
      return prev;
    });
  };
  //seek to last watched time
  const handleSeek = async () => {
    if (!playerRef.current) return;
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: "get",
      });

      const existingTopicProgress = data?.data[0]?.topicProgress || [];
      const topic = existingTopicProgress.find(
        (topic) => topic.topicId === topicId
      );
      if (topic && topic.last_watched_time !== null) {
        console.log("seekto inside handle seek", topic.last_watched_time);
        playerRef.current.seekTo(topic.last_watched_time, "seconds");
        console.log("playerRef", playerRef.current);
      }
      isSeekDone(true);
    } catch (error) {
      console.log(error);
    }
  };

  const UpdateGenerateQuery = (status) => {
    const params = new URLSearchParams({
      "populate[course_tags]": "true",
      "populate[course_thumbnail]": "true",
      "populate[course_intro_video]": "true",
      "populate[modules][populate][topics][populate][videos]": "true",
      "populate[modules][populate][topics][populate][files]": "true",
      "populate[modules][populate][topics][populate][audios]": "true",
      "populate[modules][populate][topics][populate][images]": "true",
      "populate[modules][populate][videos]": "true",
      "populate[modules][populate][files]": "true",
      "populate[modules][populate][audios]": "true",
      "populate[modules][populate][images]": "true",
      "populate[certificate]": "true",
      "populate[instructors]": "true",
      "populate[departments]": "true",
      "populate[locations]": "true",
      "populate[course_enrollments]": "true",
      "populate[courses_categories]": "true",
      "populate[highlights]": "true",
      "populate[roles]": "true",
      "populate[modules][populate][assignment]": "true",
      status: status || "",
    });

    return params.toString();
  };
  const getCourseStatus = (date) => {
    try {
      if (!date) return "draft";
      if (date) {
        if (new Date(date) > new date()) return "Scheduled";
        return "Completed";
      }
    } catch (error) {
      console.log(error);
    }
  };
  function minutesToHMS(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    const seconds = Math.round((totalMinutes - Math.floor(totalMinutes)) * 60);
    return `${String(hours).padStart(2, "0")} hours ${String(minutes).padStart(
      2,
      "0"
    )} minutes`;
  }
  function minutesToDays(totalMinutes) {
    const days = Math.floor(totalMinutes / 1440);
    return `${days} days`;
  }
  const fetchCourse = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses/${courseDocumentId}?${UpdateGenerateQuery(
          "published"
        )}`,
        method: "GET",
      });
      // console.log(data, 'top of courseObj')
      const courseObj = {
        ...data.data,
        documentId: data.data.documentId,
        title: data.data.title,
        short_description: data.data.short_description,
        // status: getCourseStatus(data.data.publishedAt),
        thumbnail: data.data?.course_thumbnail?.url
          ? getFilePath(data.data?.course_thumbnail?.url)
          : "",
        course_type: data.data?.course_type,
        completed_progress: data.data.completed_progress,
        createdAt: data.data.createdAt,
        publishedAt: data.data.publishedAt,
        instructors: data.data.instructors?.map((ele) => ({
          id: ele.id,
          username: ele.username,
          firstName: ele?.firstName,
          lastName: ele.lastName,
          profileImageUrl: ele?.profileImage?.url
            ? getFilePath(ele?.profileImage?.url)
            : "",
        })),
        course_duration: minutesToHMS(data.data?.course_duration),
        course_completion_time: data.data.course_completion_time
          ? minutesToDays(data.data.course_completion_time)
          : "",
        course_tags:
          data.data.course_tags?.map((ele) => ele.tag_name).join(",") || [],
        courses_categories: data.data.courses_categories
          ?.map((ele) => ele.title)
          .join(", "),
        course_modules: data.data.modules,
        enrollmentLength: data.data.course_enrollments?.length || 0,
        flatList: data.data.modules?.map((ele) =>
          ele.type === "Module"
            ? {
                id: ele.id,
                type: "accordian",
                topics: ele.topics?.map((topic) => ({
                  id: topic.id,
                  videoUrl: topic?.videos?.[0]?.url || "",
                })),
              }
            : {
                id: ele?.id,
                videoUrl: ele.videos?.[0]?.url || "",
                type: "Topic",
              }
        ),
      };
      // console.log(courseObj, 'courseObj')
      // [...new Set(trainerData.courses?.flatMap((course) => course.courses_categories?.flatMap((cat) => cat.title) || []))],
      setCourse(courseObj);
    } catch (error) {
      console.log(error);
      console.log("inside fetch course catch");
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };
  //save the video progress on video is played
  function throttle(callback, delay) {
    let shouldWait = false;
    return (...args) => {
      if (shouldWait) return;
      callback(...args);
      console.log("throttle called", new Date(), delay);
      shouldWait = true;
      setTimeout(() => {
        shouldWait = false;
      }, delay);
    };
  }

  // console.log("i am called before progress handler")
  const progressHandler = (duration, playedSeconds) => {
    // This updates UI immediately
    setProgress((prev) => ({
      ...prev,
      [topicId]: duration,
    }));

    // Run throttled API update
    throttledApiUpdate(duration, playedSeconds);

    // Save previous time for delta calculation
    prev = playedSeconds;
  };

  const handleProgressApiUpdate = async (duration, playedSeconds) => {
    if (!topicId) return;

    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: "get",
      });

      const enrollmentId = data?.data[0]?.documentId;
      const existing = data?.data[0]?.topicProgress || [];

      const topicIndex = existing.findIndex((t) => t.topicId === topicId);
      const updated = [...existing];

      const watchTime = Math.max(playedSeconds - prev, 0);

      if (topicIndex !== -1) {
        updated[topicIndex] = {
          ...updated[topicIndex],
          watchTime: updated[topicIndex].watchTime + watchTime,
          progress: duration,
          last_watched_time: playedSeconds,
          updated_last: new Date().toISOString(),
          is_completed:
            !updated[topicIndex].is_completed && duration === 100
              ? true
              : updated[topicIndex].is_completed,
        };
      } else {
        updated.push({
          topicId,
          watchTime: playedSeconds,
          progress: duration,
          last_watched_time: playedSeconds,
          updated_last: new Date().toISOString(),
          is_completed: false,
          firstRecorded: new Date().toISOString(),
        });
      }

      const sanitizedProgress = updated.map(({ id, ...rest }) => rest);

      // ✅ Check if all topics in the course are completed
      // const totalTopics = course?.flatList?.reduce((acc, item) => {
      //   if (item.type === "Topic") return acc + 1;
      //   if (item.type === "accordian") return acc + (item.topics?.length || 0);
      //   return acc;
      // }, 0);

      // const completedTopics = sanitizedProgress.filter(
      //   (p) => p.is_completed
      // ).length;

      // const courseStatus =
      //   completedTopics === totalTopics ? "Completed" : undefined;

      await axiosInstance({
        url: `/api/course-enrollments/${enrollmentId}`,
        method: "PUT",
        data: {
          data: {
            course: course.id,
            topicProgress: sanitizedProgress,
            last_watched_lec: topicId,
            last_watched_lec_vid: videoUrl,
            // Course_Status: courseStatus,
          },
        },
      });

      const topic = updated.find((ele) => ele.topicId === topicId);
      setIsChecked((prev) => ({
        ...prev,
        [topicId]: topic.is_completed,
      }));
    } catch (error) {
      console.error("API update error", error);
    }
  };

  const throttledApiUpdate = useCallback(
    throttle(handleProgressApiUpdate, 10000),
    [topicId, course?.id, videoUrl]
  );

  // get video Duration to display inside accordian
  const getVideoDuration = (url, videoId) => {
    const videoElement = document.createElement("video");
    videoElement.src = url;
    videoElement.onloadedmetadata = () => {
      const durationInSeconds = videoElement.duration;

      let formattedDuration = "";

      if (durationInSeconds < 60) {
        // Less than a minute, show in seconds
        formattedDuration = `${Math.round(durationInSeconds)} sec`;
      } else if (durationInSeconds < 3600) {
        // Less than an hour, show in minutes
        const roundedMinutes = Math.round(durationInSeconds / 60);
        formattedDuration = `${roundedMinutes} min`;
      } else {
        // More than an hour, show hours and minutes
        const hours = Math.floor(durationInSeconds / 3600);
        const minutes = Math.floor((durationInSeconds % 3600) / 60);
        formattedDuration = `${hours} hr ${minutes} min`;
      }

      setVideoDuration((prev) => ({
        ...prev,
        [videoId]: formattedDuration,
      }));
    };
  };
  //mark the video progress 0 or 100 and is_completed true or false
  const handleIsComplete = async (Id, is_skip = false) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: "get",
      });
      const enrollmentId = data?.data[0]?.documentId;
      const existingTopicProgress = data?.data[0]?.topicProgress || [];

      let updatedTopicProgress = [];
      const topicIndex = existingTopicProgress.findIndex(
        (topic) => topic.topicId === Id
      );

      const modifiedTopicProgress = existingTopicProgress.map((ele) => {
        {
          /*
              is_skip is true so it is asume that function called from skip and mark as false
            */
        }
        return {
          topicId: ele.topicId,
          progress: Math.min(100, Math.max(0, ele.progress || 0)),
          is_completed: is_skip ? true : ele.is_completed,
          last_watched_time: ele.last_watched_time,
          updated_last: ele.updated_last,
          watchTime: ele.watchTime,
          firstRecorded: ele.firstRecorded,
        };
      });

      if (topicIndex !== -1) {
        updatedTopicProgress = modifiedTopicProgress.map((topic, index) =>
          index === topicIndex
            ? {
                ...topic,
                progress: topic.is_completed ? 0 : 100,
                last_watched_time: playerRef.current?.getCurrentTime(),
                is_completed: !topic.is_completed,
                updated_last: new Date().toISOString(),
              }
            : topic
        );
      } else {
        updatedTopicProgress = [
          ...modifiedTopicProgress,
          {
            topicId: Id,
            is_completed: true,
            progress: 100,
            watchTime: playerRef.current?.getCurrentTime(),
            last_watched_time: playerRef.current?.getCurrentTime(),
            updated_last: new Date().toISOString(),
            firstRecorded: new Date().toISOString(),
          },
        ];
      }
      updatedTopicProgress = updatedTopicProgress.map((topic) => ({
        ...topic,
        // progress:50
        progress: Math.min(100, Math.max(0, topic.progress)), // Ensure progress is within bounds
      }));

      await axiosInstance({
        url: `/api/course-enrollments/${enrollmentId}`,
        method: "PUT",
        data: {
          data: {
            course: course.id,
            topicProgress: updatedTopicProgress,
          },
        },
      });
      const topic = updatedTopicProgress.find((ele) => ele.topicId === Id);
      setIsChecked((prev) => ({
        ...prev,
        [Id]: topic.is_completed,
      }));
      setProgress((prev) => ({
        ...prev,
        [Id]: topic.progress,
      }));
    } catch (error) {
      console.log(error);
    }
  };

  //change the progress and last watch time, based on seek
  const handleOnSeek = async (Progress) => {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: "get",
      });
      const enrollmentId = data?.data[0]?.documentId;
      const existingTopicProgress = data?.data[0]?.topicProgress || [];

      let updatedTopicProgress = [];
      const topicIndex = existingTopicProgress.findIndex(
        (topic) => topic.topicId === topicId
      );
      const modifiedTopicProgress = existingTopicProgress.map((ele) => {
        return {
          topicId: ele.topicId,
          progress: ele.progress,
          is_completed: ele.is_completed,
          last_watched_time: ele.last_watched_time,
          updated_last: ele.updated_last,
          watchTime: ele.watchTime,
          firstRecorded: ele.firstRecorded,
        };
      });
      // console.log('modifiedTopicProgress', modifiedTopicProgress)
      if (topicIndex !== -1) {
        updatedTopicProgress = modifiedTopicProgress.map((topic, index) =>
          index === topicIndex
            ? {
                ...topic,
                last_watched_time: playerRef.current?.getCurrentTime(),
                progress: Progress,
                updated_last: new Date().toISOString(),
              }
            : topic
        );
      } else {
        updatedTopicProgress = [
          ...modifiedTopicProgress,
          {
            topicId,
            progress: Progress,
            watchTime: playerRef.current?.getCurrentTime(),
            last_watched_time: playerRef.current?.getCurrentTime(),
            updated_last: new Date().toISOString(),
            firstRecorded: new Date().toISOString(),
          },
        ];
      }

      await axiosInstance({
        url: `/api/course-enrollments/${enrollmentId}`,
        method: "PUT",
        data: {
          data: {
            course: course.id,
            topicProgress: updatedTopicProgress,
          },
        },
      });
      setProgress((prev) => ({
        ...prev,
        [topicId]: Progress,
      }));
    } catch (error) {
      console.log(error);
    }
  };
  //gets the video checkbox and circular progress status
  const getStatus = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/course-enrollments?${params}&populate=*`,
        method: "get",
      });
      const existingTopicProgress = data?.data[0]?.topicProgress || [];

      existingTopicProgress.map((ele) => {
        setIsChecked((prev) => ({
          ...prev,
          [ele.topicId]: ele.is_completed,
        }));
        setProgress((prev) => ({
          ...prev,
          [ele.topicId]: ele.progress,
        }));
      });
      console.log(isChecked);
    } catch (error) {
      console.log(error);
    }
  };
  // pagination start here
  const getCurrentTopic = () => {
    let result = null;
    course.flatList?.some((item, index) => {
      if (item.type === "accordian") {
        const topicIndex = item.topics?.findIndex(
          (topic) => topic?.id === topicId
        );
        if (topicIndex !== -1) {
          result = { type: "accordian", accordianIndex: index, topicIndex };
          return true;
        }
      } else if (item.id === topicId) {
        result = { type: "topic", topicIndex: index };
        return true;
      }
      return false;
    });
    console.log(result, "result");
    return result;
  };
  const NextButtonStatus = (result) => {
    const length = course?.flatList.length - 1;
    const topicIndex = result.topicIndex;
    console.log("log from next status", result);
    if (result.type === "accordian") {
      if (
        result.accordianIndex === length &&
        topicIndex ===
          course?.flatList[result?.accordianIndex]?.topics.length - 1
      ) {
        setNext(true);
      } else {
        setNext(false);
      }
    } else if (result.type === "topic") {
      if (topicIndex === length) {
        setNext(true);
      } else {
        setNext(false);
      }
    }
  };
  const PrevButtonStatus = (result) => {
    console.log("log from prev status", result);
    if (result.type === "accordian") {
      if (result.accordianIndex === 0 && result.topicIndex === 0) {
        setPrevious(true);
      } else {
        setPrevious(false);
      }
    } else if (result.type === "topic") {
      if (result.topicIndex === 0) {
        setPrevious(true);
      } else {
        setPrevious(false);
      }
    }
  };
  const handlePrevious = () => {
    const result = getCurrentTopic();
    let prevItem;
    if (result && result.type === "accordian") {
      if (result.topicIndex > 0) {
        // For topic in accordian, move to the previous topic
        prevItem =
          course?.flatList[result?.accordianIndex].topics[
            result?.topicIndex - 1
          ];
      } else if (
        result.accordianIndex > 0 &&
        course?.flatList[result.accordianIndex - 1].type === "Topic"
      ) {
        // for prev to be an topic
        prevItem = course?.flatList[result?.accordianIndex - 1];
      } else if (
        result.accordianIndex > 0 &&
        course?.flatList[result.accordianIndex - 1].type === "accordian"
      ) {
        //for prev to be an accordian select last topic in next accordian
        const prevAccordian = course?.flatList[result?.accordianIndex - 1];
        prevItem = prevAccordian.topics[prevAccordian.topics.length - 1];
        openAccordionItem(`item-${prevAccordian?.id}`);
      }
    } else if (result) {
      if (
        result.topicIndex > 0 &&
        course?.flatList[result.topicIndex - 1].type === "accordian"
      ) {
        //for previous Item is an accordian, select last topic in that accordian
        const prevAccordian = course?.flatList[result?.topicIndex - 1];
        prevItem = prevAccordian.topics[prevAccordian.topics.length - 1];
        openAccordionItem(`item-${prevAccordian?.id}`);
      } else if (
        result.topicIndex > 0 &&
        course?.flatList[result.topicIndex - 1].type === "Topic"
      ) {
        //If previous item is a topic
        prevItem = course?.flatList[result?.topicIndex - 1];
      }
    }
    if (prevItem) {
      const videoUrl = prevItem?.videoUrl
        ? getFilePath(prevItem?.videoUrl)
        : "";
      const topicId = prevItem?.id;
      setVideoUrl(videoUrl);
      setTopicId(topicId);
      localStorage.setItem("topicId", topicId);
      localStorage.setItem("videoUrl", videoUrl);
      PrevStatus();
    }
  };
  const handleNext = () => {
    const result = getCurrentTopic();
    console.log("currentIndex", result);

    let nextItem;
    if (result && result.type === "accordian") {
      if (
        result.topicIndex <
        course?.flatList[result?.accordianIndex]?.topics.length - 1
      ) {
        //for topic in accordian
        nextItem =
          course?.flatList[result?.accordianIndex].topics[
            result?.topicIndex + 1
          ];
      } else if (
        result.accordianIndex < course?.flatList.length - 1 &&
        course?.flatList[result.accordianIndex + 1].type === "Topic"
      ) {
        // for next to be an topic
        nextItem = course?.flatList[result?.accordianIndex + 1];
      } else if (
        result.accordianIndex < course?.flatList.length - 1 &&
        course?.flatList[result.accordianIndex + 1].type === "accordian"
      ) {
        //for next to be an accordian select first topic in next accordian
        nextItem = course?.flatList[result?.accordianIndex + 1].topics[0];
        const accId = course?.flatList[result.accordianIndex + 1]?.id;
        openAccordionItem(`item-${accId}`);
        console.log("open-accordian", `item-${nextItem.id}`);
      }
    } else if (result) {
      if (
        result.topicIndex < course?.flatList.length - 1 &&
        course?.flatList[result.topicIndex + 1].type === "accordian"
      ) {
        //for next to be an accordian select first topic in next accordian
        nextItem = course?.flatList[result?.topicIndex + 1].topics[0];
        const accId = course?.flatList[result.topicIndex + 1]?.id;
        openAccordionItem(`item-${accId}`);
      } else if (
        result.topicIndex < course?.flatList.length - 1 &&
        course?.flatList[result.topicIndex + 1].type === "Topic"
      ) {
        //for next to be an topic select the complete topic
        nextItem = course?.flatList[result?.topicIndex + 1];
      }
    }
    if (nextItem) {
      const videoUrl = nextItem?.videoUrl
        ? getFilePath(nextItem?.videoUrl)
        : "";
      const topicId = nextItem?.id;
      setVideoUrl(videoUrl);
      setTopicId(topicId);
      localStorage.setItem("topicId", topicId);
      localStorage.setItem("videoUrl", videoUrl);
      NextStatus();
    }
  };
  const NextStatus = () => {
    const result = getCurrentTopic();
    if (result) NextButtonStatus(result);
  };
  const PrevStatus = () => {
    const result = getCurrentTopic();
    if (result) PrevButtonStatus(result);
  };
  // pagination end here
  const fetchAllAnnouncement = async (courseId) => {
    if (!courseId) return;
    try {
      setIsLoading(true);
      const query = new URLSearchParams();
      query.append("filters[courses][id][$eq]", courseId);
      const { data } = await axiosInstance({
        url:
          "/api/announcements?" +
          "populate[0]=author.profileImage&" +
          "populate[1]=courses&" +
          "populate[2]=departments&" +
          "populate[3]=card_image&" +
          "populate[4]=locations&" +
          query.toString(),
        method: "GET",
      });

      const tempAnnouncements = data?.data.map((ele) => ({
        id: ele.id,
        documentId: ele.documentId,
        title: ele.title,
        description: ele?.description[0]?.children?.map(
          (item) => item.text || ""
        ),
        cardImage: ele?.card_image?.url
          ? getFilePath(ele?.card_image?.url)
          : "",
        createdAt: formatDateToIST(ele.createdAt),
        publishedAt: formatDateToIST(ele.publishedAt),
        author: {
          profileImage: ele.author?.profileImage?.url
            ? getFilePath(ele.author?.profileImage?.url)
            : "",
          name: ele.author?.firstName,
        },
        department: ele?.departments?.map((item) => item.title),
        course: ele?.courses?.map((item) => item.title),
        location: ele?.locations?.map((item) => item.title),
      }));

      setAnnouncement(tempAnnouncements);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  // sets the state of enrollmentId, userid, and courseId
  async function getCourseDetails() {
    const { data } = await axiosInstance({
      url: `/api/course-enrollments?${params}&populate=*`,
      method: "get",
    });
    console.log(data, "get enrollment Id");
    const enrollmentId = data?.data?.[0]?.documentId;
    // const lectures = data?.data?.[0]?.lectures
    setCourseDetails({
      enrollmentId,
      courseId: courseDocumentId,
      userId: user?.id,
    });
  }

  const isDataFetched = useMemo(
    () => course?.flatList && course?.flatList.length > 0,
    [course]
  );
  useEffect(() => {
    //calculate the video duration
    if (isDataFetched) {
      course.course_modules?.forEach((entity) => {
        if (entity.type === "Module") {
          entity.topics?.forEach((topic) => {
            const videoUrl = getFilePath(topic?.videos?.[0]?.url);
            getVideoDuration(videoUrl, topic.id);
          });
        } else {
          const videoUrl = getFilePath(entity?.videos?.[0]?.url);
          getVideoDuration(videoUrl, entity.id);
        }
      });
      //calculate the all topics
      const lectures = course?.flatList?.reduce(
        (acc, entity) =>
          entity.type === "Topic" ? (acc += 1) : (acc += entity.topics.length),
        0
      );
      // sets the state of enrollmentId, userid, and courseId
      console.log("lectures ", lectures);
      getCourseDetails();
      setLectures(lectures);
      //gets the video checkbox and circular progress status
      getStatus();
      fetchAllAnnouncement(course?.id);
    }
  }, [isDataFetched]);

  //seeks to exact time when the video sets
  useEffect(() => {
    if (topicId && videoUrl) {
      const timeout = setTimeout(() => {
        handleSeek();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [videoUrl]);
  //stores the total lectures in backend
  useEffect(() => {
    // console.log('lectures',lectures);
    if (lectures && courseDetails?.enrollmentId) {
      // console.log('inside lectures useeffect')
      const setLectures = async () => {
        await axiosInstance({
          url: `/api/course-enrollments/${courseDetails?.enrollmentId}`,
          method: "PUT",
          data: {
            data: {
              course: course.id,
              lectures,
            },
          },
        });
      };
      setLectures();
    }
  }, [lectures, courseDetails?.enrollmentId]);
  //fetch courses
  useEffect(() => {
    fetchCourse();
  }, []);

  //handle button status and opne all accordian once the courses fetched
  useEffect(() => {
    if (isDataFetched) {
      NextStatus();
      PrevStatus();
      setCurrent(getCurrentTopic());
    }
  }, [topicId, isDataFetched]);
  function getMountVideo() {
    const topicId = Number(localStorage.getItem("topicId"));
    const url = localStorage.getItem("videoUrl");
    // if (topicIdls !== null && topicIdls !== '' && videoUrlls !== null && videoUrlls !== '') {
    // if (localStorage.getItem('topicId') && localStorage.getItem('videoUrl')) {
    // console.log('log from if block', url, 'and', topicId)
    setTopicId(topicId);
    setVideoUrl(url);
  }

  //get last watched video
  useEffect(() => {
    if (isDataFetched) {
      getMountVideo();
    }
  }, [isDataFetched]);

  useEffect(() => {
    if (topicId && hash) {
      const newUrl = `/public/course/video-course/${courseDocumentId}/${topicId}${hash}`;
      if (router.asPath !== newUrl) {
        router.replace(newUrl, undefined, { shallow: true });
        // history.replaceState(null, "", `/listing-in-${newCity}`);
      }
    }
  }, [topicId, hash, router]);
  //open all accordian when the page mount
  useEffect(() => {
    const allIds = course?.flatList?.map((entity) => `item-${entity.id}`);
    setOpenAccordion(allIds || []);
  }, [isDataFetched]);
  useEffect(() => {
    // Only run on the first render (when the user first navigates to this page)
    const path = sessionStorage.getItem("routeDetail");
    setPreviousRoute(JSON.parse(path));
  }, []);
  console.log("previousROute", previousRoute);
  console.log(course, "course detail");
  console.log("isChecked", isChecked);
  console.log("Progress", progress);
  console.log("topic id and url", topicId, videoUrl);
  console.log("set open accordian", openAccordion);
  console.log("current", current);
  console.log("flatlist", isDataFetched);
  console.log("isNotFound", isNotFound);
  console.log("topic id", topicId);
  console.log("video url ", videoUrl);
  console.log("is seekdone", seekDone);
  console.log("is playing", isPlaying);
  let cnt = 0;

  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [isAssignmentVisible, setIsAssignmentVisible] = useState(false);

  // Handle assignment click
  const handleAssignmentClick = (assignment) => {
    setSelectedAssignment(assignment);
    setIsAssignmentVisible(true); // Show assignment details

    // Trigger toast when assignment is clicked
    toast(
      (t) => (
        <div className="flex flex-col items-center">
          <p className="text-lg font-semibold mb-4">
            Are you sure you want to attempt this assessment?
          </p>
          <div className="flex gap-4">
            <Button
              onClick={() => {
                toast.dismiss(t.id); // Dismiss the toast
                setIsAssignmentVisible(false);
                handleIsComplete(assignment.id);
                router.push(`/take-assessment/${assignment.documentId}`); // Redirect to the assessment screen
              }}
              colorScheme="blue"
            >
              Yes
            </Button>
            <Button
              onClick={() => {
                toast.dismiss(t.id); // Dismiss the toast
                setIsAssignmentVisible(false); // Close the assignment prompt
                handleNext(); // Move to the next topic
                handleIsComplete(assignment.id, true);
              }}
              variant="outline"
            >
              Skip
            </Button>
          </div>
        </div>
      ),
      {
        id: "assessment-toast",
        duration: Infinity, // Keep the toast visible until one of the buttons is clicked
        style: {
          background: "#fff",
          color: "#000",
          padding: "16px",
          borderRadius: "8px",
        },
      }
    );
  };

  return (
    <>
      {isNotFound ? (
        <PageNotFound />
      ) : (
        <>
          <div className="rounded-none  shadow-none mb-0 videoCourseleft">
            <CardHeader className="flex-row items-center border-none mb-0 bg-card text-card-foreground py-1 space-y-0">
              <CardTitle className="flex w-full capitalize p-2 text-xl font-medium capitalize">
                <div className="mt-0 flex flex-wrap items-center gap-2 lg:gap-6">
                  <div className="mb-0">
                    <div className="flex gap-1 items-center">
                      <svg
                        onClick={() => router.replace(previousRoute)}
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="m5 12l-.707-.707l-.707.707l.707.707zm12 1a1 1 0 1 0 0-2zM8.293 7.293l-4 4l1.414 1.414l4-4zm-4 5.414l4 4l1.414-1.414l-4-4zM5 13h12v-2H5z"
                        />
                      </svg>
                      <div
                        className="text-xl font-medium text-default-800 capitalize"
                        onClick={() =>
                          console.log(
                            window.location.hash,
                            "hashed",
                            hash,
                            "hash"
                          )
                        }
                      >
                        {course?.title}
                      </div>
                    </div>
                    <div className="text-lg text-primary/90 font-medium capitalize">
                      <div className="flex col- items-center gap-3"></div>
                    </div>
                  </div>
                </div>
              </CardTitle>

              <div className="flex items-center gap-3">
                <div className="flex flex-row gap-1">
                  <span className="text-xs font-medium text-default-600">
                    <Button onClick={handlePrevious} disabled={hasPrevious}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M15.41 16.58L10.83 12l4.58-4.59L14 6l-6 6l6 6z"
                        />
                      </svg>
                    </Button>
                  </span>
                  <span className="text-xs font-medium text-default-600">
                    <Button onClick={handleNext} disabled={hasNext}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fill="currentColor"
                          d="M8.59 16.58L13.17 12L8.59 7.41L10 6l6 6l-6 6z"
                        />
                      </svg>
                    </Button>
                  </span>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="flex-none">
                {!videoUrl || videoUrl === "null" ? null : (
                  <div className="h-96 w-full border-none rounded-none bg-secondary relative videoCourseView">
                    <ReactPlayer
                      url={videoUrl}
                      ref={playerRef}
                      controls
                      width="100%"
                      height="100%"
                      playing={isPlaying}
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      onSeek={(seconds) => {
                        const totalDuration = playerRef.current.getDuration();
                        if (totalDuration) {
                          const progress = Math.round(
                            (seconds / totalDuration) * 100
                          );
                          handleOnSeek(progress);
                          console.log(`Progress after seeking: ${progress}%`);
                        } else {
                          console.log("Total duration is not available.");
                        }
                      }}
                      className="w-[100%] rounded-md object-fit absolute top-0"
                      onProgress={({ played, playedSeconds }) => {
                        const progress = Math.round(played * 100);
                        if (isPlaying || progress === 100) {
                          console.log(
                            "getcurrentTime",
                            playerRef.current.getCurrentTime(),
                            "playedSeconds",
                            playedSeconds
                          );
                          if (topicId && seekDone) {
                            progressHandler(progress, playedSeconds);
                          }
                        }
                      }}
                      onEnded={() => {
                        const duration = playerRef.current?.getDuration();
                        const playedSeconds = duration; // full duration since video ended

                        // Immediately trigger final update with 100% progress
                        handleProgressApiUpdate(100, playedSeconds);

                        setProgress((prev) => ({
                          ...prev,
                          [topicId]: 100,
                        }));
                        setIsChecked((prev) => ({
                          ...prev,
                          [topicId]: true,
                        }));
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>

            <Tabs className="md:w-full">
              <TabsList className="gap-x-6 gap-y-3 lg:gap-x-6 pb-0 pt-1 flex-wrap detailsTabHeadLink bg-card shadow-md w-full justify-start h-auto px-[18px]">
                {pages.map((item, tin) => (
                  <Link
                    key={tin}
                    href={`${locationName}#${item.value}`}
                    className={cn(
                      "text-lg font-semibold text-default-500 capitalize pb-3 border-Link  border-transparent cursor-pointer",
                      {
                        //"data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border-primary": locationName === `/public/course/video-course/${course.documentId}/${topicId}#${item.value}`,
                        "border-primary border-b-2 text-primary":
                          hash === `#${item.value}`,
                      }
                    )}
                  >
                    {item.text}
                  </Link>
                ))}
              </TabsList>

              {hash === "#content" && (
                <div className="m-4 bg-card p-6 rounded-md shadow-sm">
                  {/* <p>Content comes here</p> */}
                  <Overview course={course} currentState={current} />
                </div>
              )}

              {hash === "#q-a" && (
                <div
                  className="m-4 bg-card p-6 rounded-md shadow-sm"
                  value="q-a"
                >
                  <AskQA
                    getCourseDetails={getCourseDetails}
                    courseDetails={courseDetails}
                    locationName={locationName}
                    topicId={topicId}
                  />
                </div>
              )}

              {hash === "#announcement" && (
                <div className="m-4" value="announcement">
                  {/* <p>Announcement comes here</p> */}
                  {announcements.length > 0 ? (
                    <div className="grid xl:grid-cols-1 lg:grid-cols-1 grid-cols-1 mx-auto max-w-[740px]">
                      {announcements.map((announcement, i) => (
                        <AnnouncementGrid
                          announcement={announcement}
                          key={`project-grid-${i}`}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      {" "}
                      <CardContent className="p-16">
                        <p className="text-base text-center">
                          No announcements yet! Stay tuned for updates and
                          important information about this course.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {hash === "#reviews" && (
                <div
                  className="m-4 bg-card p-6 rounded-md shadow-sm"
                  value="reviews"
                >
                  <ReviewsPage course={course} />
                </div>
              )}

              {hash === "#course-overview" && (
                <div
                  className="m-4 bg-card p-6 rounded-md shadow-sm"
                  value="course-overview"
                >
                  <CourseOverview course={course} />
                </div>
              )}
            </Tabs>
          </div>

          <div className="fixed smallScreenModulebar top-0 border-l w-[400px] m-0 bottom-0 bg-card right-0 rounded-none h-[calc(100%-40px)]">
            <Accordion
              // type="single"
              type="multiple"
              collapsible
              className="w-full h-full"
              style={{ overflowY: "auto", overflowX: "hidden" }}
              value={openAccordion}
              onValueChange={(value) => setOpenAccordion(value)}
            >
              {course.course_modules?.map((entity, index) => (
                <AccordionItem
                  value={`item-${entity.id}`}
                  className="p-0 m-0 rounded-none shadow-none"
                  key={entity.id}
                >
                  {entity.type === "Module" ? (
                    <>
                      <AccordionTrigger className="[&[data-state=open]]:bg-[#023052] px-4 py-4 text-base rounded-none shadow-none  border-b text-white bg-[#023052]">
                        {"Module "}
                        {index + 1}. {entity?.title}
                      </AccordionTrigger>
                      {entity.topics?.map((topic) => (
                        <AccordionContent
                          onClick={() => {
                            // console.log(topic?.videos[0]?.url)
                            const videoUrl = topic?.videos?.[0]?.url
                              ? getFilePath(topic?.videos?.[0]?.url)
                              : null;
                            const topicId = topic?.id;
                            setVideoUrl(videoUrl);
                            setTopicId(topicId);
                            localStorage.setItem("topicId", topicId);
                            localStorage.setItem("videoUrl", videoUrl);
                            // }} className="[&[data-state=open]>div]:pt-1" key={topic.id}>
                          }}
                          className={cn(
                            "[&[data-state=open]>div]:pt-0",
                            topicId === topic?.id ? "" : ""
                          )}
                          key={topic.id}
                        >
                          <div className="px-4 pt-4 pb-4  relative z-10 border-b">
                            {/* Background Progress */}
                            <div className="absolute inset-0 z-0">
                              <ForegroundProgress
                                title=""
                                value={progress[topic.id] || 0}
                                color={`#e5f8ed`}
                                showValue={false}
                                isStripe={true}
                                className="h-full w-full"
                              />
                            </div>
                            <div className="flex items-center mt-0 justify-between w-full relative z-10 ">
                              <div className="flex items-top space-x-2.5">
                                <Checkbox
                                  color={"success"}
                                  id="color_7"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleIsComplete(topic?.id);
                                  }}
                                  checked={isChecked[topic?.id] || false}
                                />
                                <div className="flex justify-between flex-wrap">
                                  <div className="text-base font-semibold text-[#023052] dark:text-default-500">
                                    {topic?.title}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-row items-center gap-1">
                                <p className="dark:text-default-500">
                                  {videoDuration[topic.id]}
                                </p>
                                {topic?.videos?.[0]?.url ? (
                                  <svg
                                    id="majesticons--video"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 16 16"
                                    className="dark:text-default-500"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0a6.5 6.5 0 0 0-13 0m4.879-2.773l4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="24"
                                    height="24"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      fill="currentColor"
                                      d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75m0 4a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75"
                                    />
                                    <path
                                      fill="currentColor"
                                      fill-rule="evenodd"
                                      d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695zM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25z"
                                      clip-rule="evenodd"
                                    />
                                  </svg>
                                )}
                              </div>

                              {/* {topic?.videos?.[0]?.url ?
                                  <div className="ml-auto">
                                    <CircularProgress value={progress[topic.id] || 0} color="success" size='xxs' /> 
                                  </div> : null} */}
                            </div>
                          </div>
                        </AccordionContent>
                      ))}
                      {/* Render Assignments after Topics */}
                      {entity?.assignment && (
                        <AccordionContent
                          className="px-4 pt-4 pb-4 border-b"
                          key={entity.assignment.id}
                          onClick={() => {
                            // Add logic for assignment selection, like setting videoUrl or handling assignment ID
                            const assignmentId = entity.assignment.id;
                            const assignmentTitle = entity.assignment?.title;
                            // setTopicId(assignmentId);  // Setting assignment ID as the selected topic ID
                            console.log(
                              `Assignment selected: ${assignmentTitle}`
                            );
                            handleAssignmentClick(entity.assignment);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-top space-x-2.5">
                              {/*
                                Checkbox marked every condition for example 
                                isChechecked[entity?.assignmen?.id] 
                                if true so mark as success and if false so
                                 marked as warning and if undefined so no action!
                              */}
                              <Checkbox
                                color={
                                  isChecked[entity?.assignment?.id]
                                    ? "success"
                                    : "warning"
                                } // Use 'success' for green (checked) and 'danger' for red (unchecked)
                                id="assignment-checkbox"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleIsComplete(entity?.assignment?.id);
                                }}
                                checked={
                                  isChecked[entity?.assignment?.id] !==
                                  undefined
                                }
                                icon={
                                  isChecked[entity?.assignment?.id] ? (
                                    <Check />
                                  ) : (
                                    <X />
                                  )
                                } // Green check for completed, Red X for skipped
                              />
                              <p className="text-base font-semibold text-[#023052] dark:text-default-500">
                                {entity?.assignment?.title}
                              </p>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              className="dark:text-default-500"
                            >
                              <path
                                fill="currentColor"
                                d="M5.455 15L1 18.5V3a1 1 0 0 1 1-1h15a1 1 0 0 1 1 1v12zm-.692-2H16V4H3v10.385zM8 17h10.237L20 18.385V8h1a1 1 0 0 1 1 1v13.5L17.546 19H9a1 1 0 0 1-1-1z"
                              />
                            </svg>
                          </div>
                        </AccordionContent>
                      )}
                    </>
                  ) : (
                    // <div onClick={() => {
                    //   // console.log(topic?.videos[0]?.url)
                    //   const videoUrl = entity?.videos?.[0]?.url ? getFilePath(entity?.videos?.[0]?.url) : null;
                    //   const topicId = entity?.id;
                    //   setVideoUrl(videoUrl);
                    //   setTopicId(topicId);
                    //   localStorage.setItem('topicId', topicId);
                    //   localStorage.setItem('videoUrl', videoUrl);
                    // }}
                    //   // className="px-4 py-4 rounded-none shadow-none  border-b bg-default-100"
                    //   className={`px-4 py-4 rounded-none shadow-none border-b ${topicId === entity.id ? '' : ''
                    //     }`}
                    //   key={entity.id}>
                    //   <div className="">
                    //     <div className="flex space-x-3 items-center mt-0 justify-between w-full">

                    //       <div className="flex items-top space-x-2.5">
                    //         <Checkbox color="success" id="color_7" onClick={(e) => {
                    //           e.stopPropagation();
                    //           handleIsComplete(entity?.id);
                    //         }}
                    //           checked={isChecked[entity.id] || false}

                    //         />
                    //         <div className="">
                    //           <div className="text-base font-semibold text-[#023052] dark:text-default-500">{entity?.title}</div>
                    //           <div className='flex flex-row items-center gap-1'>

                    //           </div>
                    //         </div>
                    //       </div>
                    //       <p className="dark:text-default-500">{videoDuration[entity.id]}</p>
                    //       {entity?.videos?.[0]?.url ? <svg id="majesticons--video" width="24" height="24" viewBox="0 0 24 24" className="dark:text-default-500"><path fill="currentColor" d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75m0 4a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75" /><path fill="currentColor" fill-rule="evenodd" d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695zM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25z" clip-rule="evenodd" /></svg> :

                    //         <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="dark:text-default-500"><path fill="currentColor" d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75m0 4a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75" /><path fill="currentColor" fill-rule="evenodd" d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695zM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25z" clip-rule="evenodd" /></svg>}

                    //       {entity?.videos?.[0]?.url ?
                    //         <div className="">
                    //           {/* <CircularProgress value={progress[entity.id] || 0} color="success" size='xxs' /> */}
                    //           {JSON.stringify(progress[entity.id])}
                    //           <ForegroundProgress
                    //             title=""
                    //             value={progress[entity.id] || 0}
                    //             color={`#e5f8ed`}
                    //             showValue={false}
                    //             isStripe={true}
                    //             className="h-full w-full"
                    //           />
                    //         </div> : null}

                    //     </div>
                    //   </div>
                    // </div>
                    <div
                      className="px-4 pt-4 pb-4 relative z-10 border-b"
                      onClick={() => {
                        // console.log(topic?.videos[0]?.url)
                        const videoUrl = entity?.videos?.[0]?.url
                          ? getFilePath(entity?.videos?.[0]?.url)
                          : null;
                        const topicId = entity?.id;
                        setVideoUrl(videoUrl);
                        setTopicId(topicId);
                        localStorage.setItem("topicId", topicId);
                        localStorage.setItem("videoUrl", videoUrl);
                      }}
                    >
                      {/* Background Progress (placed behind other content) */}
                      <div className="absolute inset-0 z-0">
                        <ForegroundProgress
                          title=""
                          value={progress[entity.id] || 0}
                          color={`#e5f8ed`}
                          showValue={false}
                          isStripe={true}
                          className="h-full w-full"
                        />
                      </div>

                      {/* Main Content - Positioned on top */}
                      <div className="flex items-center mt-0 justify-between w-full relative z-10">
                        {/* Checkbox and Title Section */}
                        <div className="flex items-top space-x-2.5">
                          <Checkbox
                            color={"success"}
                            id="color_7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleIsComplete(entity?.id);
                            }}
                            checked={isChecked[entity?.id] || false}
                          />
                          <div className="flex justify-between flex-wrap">
                            <div className="text-base font-semibold text-[#023052] dark:text-default-500">
                              {entity?.title}
                            </div>
                          </div>
                        </div>

                        {/* Video Duration and Icon */}
                        <div className="flex flex-row items-center gap-1">
                          <p className="dark:text-default-500">
                            {videoDuration[entity.id]}
                          </p>

                          {/* Video Icon */}
                          {entity?.videos?.[0]?.url ? (
                            <svg
                              id="majesticons--video"
                              width="24"
                              height="24"
                              viewBox="0 0 16 16"
                              className="dark:text-default-500"
                            >
                              <path
                                fill="currentColor"
                                d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0M1.5 8a6.5 6.5 0 1 0 13 0a6.5 6.5 0 0 0-13 0m4.879-2.773l4.264 2.559a.25.25 0 0 1 0 .428l-4.264 2.559A.25.25 0 0 1 6 10.559V5.442a.25.25 0 0 1 .379-.215"
                              />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                            >
                              <path
                                fill="currentColor"
                                d="M15.75 13a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75m0 4a.75.75 0 0 0-.75-.75H9a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 .75-.75"
                              />
                              <path
                                fill="currentColor"
                                fillRule="evenodd"
                                d="M7 2.25A2.75 2.75 0 0 0 4.25 5v14A2.75 2.75 0 0 0 7 21.75h10A2.75 2.75 0 0 0 19.75 19V7.968c0-.381-.124-.751-.354-1.055l-2.998-3.968a1.75 1.75 0 0 0-1.396-.695zM5.75 5c0-.69.56-1.25 1.25-1.25h7.25v4.397c0 .414.336.75.75.75h3.25V19c0 .69-.56 1.25-1.25 1.25H7c-.69 0-1.25-.56-1.25-1.25z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </>
      )}
    </>
  );
};

export default page;