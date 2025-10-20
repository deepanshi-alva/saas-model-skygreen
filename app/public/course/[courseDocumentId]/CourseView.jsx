"use client";
import React, { useEffect, useMemo, useState } from "react";
import Loading from "./loading";
import { Card, CardFooter } from "@/components/ui/card";
import axiosInstance from "@/config/axios.config";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useRouter, useParams, usePathname } from "next/navigation";
import CourseHeader from "./CourseHeader";

import OverView from "./Overview";
import Reviews from "./Reviews";
import Stats from "./Stats";
import Enrollments from "./Enrollments";
import { getFilePath } from "@/config/file.path";
import { useSelector } from "react-redux";

const pages = [
  { text: "overview", value: "overview" },
  { text: "Reviews", value: "reviews" },
  { text: "Enrollments", value: "enrollments" },
];

const getHash = () =>
  typeof window !== "undefined" ? window.location.hash : "";

function CourseView() {
  const [course, setCourse] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);
  const locationName = usePathname();
  const router = useRouter();
  const [hash, setHash] = useState(getHash());
  const routeParams = useParams();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    const h = getHash();
    if (!h) router.push(`${locationName}#${pages[0].value}`);
    else setHash(h);
    // keep hash in sync when user clicks other tabs
    const onHashChange = () => setHash(getHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeParams]);

  const UpdateGenerateQuery = (status) => {
    const qs = new URLSearchParams({
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
      "populate[instructors][populate][profileImage]": "true",
      "populate[createdby][populate][profileImage]": "true",
      "populate[departments]": "true",
      "populate[locations]": "true",
      "populate[courses_categories]": "true",
      "populate[highlights]": "true",
      "populate[roles]": "true",
      "populate[users]": "true",
      "populate[assignments]": "true",
      "populate[course_enrollments][populate][user][populate][role]": "true",
      "populate[course_enrollments][populate][user][populate][department]":
        "true",
      "populate[course_enrollments][populate][user][populate][location]":
        "true",
      "populate[course_enrollments][populate][certificateCompletionLogoId]":
        "true",
      "populate[course_enrollments][populate][certificate_complection]": "true",
      "populate[skills][populate][skill]": "true",
      status: status || "",
    });

    return qs.toString();
  };

  const getCourseStatus = (date) => {
    try {
      if (!date) return "draft";
      if (new Date(date) > new Date()) return "Scheduled";
      return "Completed";
    } catch (error) {
      console.log(error);
      return "draft";
    }
  };

  function minutesToHMS(totalMinutes = 0) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${String(hours).padStart(2, "0")} hours ${String(minutes).padStart(
      2,
      "0"
    )} minutes`;
  }

  function minutesToDays(totalMinutes = 0) {
    const days = Math.floor(totalMinutes / 1440);
    return `${days} days`;
  }

  const fetchCourse = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses/${
          routeParams.courseDocumentId
        }?${UpdateGenerateQuery("published")}`,
        method: "GET",
      });

      const c = data?.data || {};
      const courseObj = {
        ...c,
        documentId: c.documentId,
        title: c.title,
        short_description: c?.short_description,
        status: getCourseStatus(c.publishedAt),
        thumbnail: c?.course_thumbnail?.url
          ? getFilePath(c.course_thumbnail.url)
          : "",
        course_intro_video: c?.course_intro_video?.url
          ? getFilePath(c.course_intro_video.url)
          : "",
        course_type: c?.course_type,
        completed_progress: c?.completed_progress,
        createdAt: c?.createdAt,
        publishedAt: c?.publishedAt,
        createdBy: c?.createdby && {
          id: c.createdby.id,
          documentId: c.createdby.documentId,
          username: c.createdby.username,
          firstName: c.createdby?.firstName,
          lastName: c.createdby?.lastName,
          profileImageUrl: c.createdby?.profileImage?.url
            ? getFilePath(c.createdby.profileImage.url)
            : "",
        },
        instructors:
          c?.instructors?.map((ele) => ({
            id: ele.id,
            documentId: ele.documentId,
            username: ele.username,
            firstName: ele?.firstName,
            lastName: ele?.lastName,
            profileImageUrl: ele?.profileImage?.url
              ? getFilePath(ele.profileImage.url)
              : "",
          })) || [],
        course_duration: minutesToHMS(c?.course_duration),
        course_completion_time: c?.course_completion_time
          ? minutesToDays(c.course_completion_time)
          : "",
        course_tags: (c?.course_tags || [])
          .map((ele) => ele?.tag_name)
          .filter(Boolean)
          .join(","),
        courses_categories: (c?.courses_categories || [])
          .map((ele) => ele?.title)
          .filter(Boolean)
          .join(", "),
        course_enrollments: c?.course_enrollments || [],
        flatList:
          c?.modules?.map((ele) =>
            ele.type === "Module"
              ? {
                  id: ele.id,
                  type: "accordian",
                  topics:
                    ele.topics?.map((topic) => ({
                      id: topic.id,
                      videoUrl: topic?.videos?.[0]?.url || "",
                    })) || [],
                }
              : {
                  id: ele?.id,
                  videoUrl: ele?.videos?.[0]?.url || "",
                  type: "Topic",
                }
          ) || [],
      };

      setCourse(courseObj);
    } catch (error) {
      console.log(error);
      setIsNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- permissions: ADMIN, creator, any instructor can view Enrollments
  const canSeeEnrollments = useMemo(() => {
    const isAdmin = user?.role?.name === "ADMIN";
    const userId = user?.id;
    const userDocId = user?.documentId;

    const isCreator =
      !!course?.createdBy &&
      (course.createdBy.id === userId ||
        course.createdBy.documentId === userDocId);

    const isInstructor =
      Array.isArray(course?.instructors) &&
      course.instructors.some(
        (i) => i.id === userId || i.documentId === userDocId
      );

    return isAdmin || isCreator || isInstructor;
  }, [
    user?.role?.name,
    user?.id,
    user?.documentId,
    course?.createdBy,
    course?.instructors,
  ]);

  return (
    <>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <Card className="mb-6">
            <CourseHeader course={course} Path={`${locationName}${hash}`} />
            <CardFooter className="gap-x-4 gap-y-3 lg:gap-x-6 pb-0 pt-6 flex-wrap detailsTabHeadLink">
              {pages.map((item) => (
                <Link
                  key={item.value}
                  href={`/public/course/${course.documentId}#${item.value}`}
                  className={cn(
                    "text-lg font-semibold text-default-500 capitalize pb-3 border-Link border-transparent cursor-pointer",
                    {
                      "border-primary border-b-2 text-primary":
                        hash === `#${item.value}`,
                    }
                  )}
                >
                  {item.value === "enrollments"
                    ? canSeeEnrollments
                      ? "enrollments"
                      : null
                    : item.value}
                </Link>
              ))}
            </CardFooter>
          </Card>

          {hash === "#overview" && <OverView course={course} />}
          {hash === "#reviews" && <Reviews course={course} />}
          {canSeeEnrollments && hash === "#enrollments" && (
            <Enrollments course={course} />
          )}
          {/* {hash === "#stats" && <Stats course={course} />} */}
        </>
      )}
    </>
  );
}

export default CourseView;
