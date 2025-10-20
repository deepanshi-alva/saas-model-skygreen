'use client';
import React, { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@/components/ui/avatar";
import { formatDateToIST } from '@/lib/utils';
function CourseOverview({ course }) {
  const [overView, setOverView] = useState();
  const getCourseOverView = () => {
    const courseObj = {
      title: course?.title,
      instructors: course?.instructors,
      description: course?.short_description,
      enrollmentLength: course?.enrollmentLength || 0,
      duration: course?.course_duration,
      lastUpdatedAt: course?.updatedAt,
      skillLevel: course?.difficulty_level,
      lectures: course?.flatList?.reduce((acc, entity) => entity.type === 'Topic' ? acc += 1 : acc += entity.topics.length, 0)
    };
    setOverView(courseObj);
  };
  useEffect(() => {
    if (course)
      getCourseOverView();
  }, [course])
  console.log(overView, 'overView');
  return (
    <div className="">

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="font-semibold text-base title-font text-gray-700 dark:text-gray-100">Title:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">{course?.title}</h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="font-semibold text-base title-font text-gray-700 dark:text-gray-100">Instructor:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold  title-font dark:text-gray-100">

            {/* {course?.instructors?.map((instructor) => (
                    <span className='bg-primary rounded mr-1 px-4 py-1 text-primary-foreground' key={instructor.id}>
                        {instructor.firstName} {instructor.lastName}
                    </span>
                    
                ))} */}
            <AvatarGroup max={3} total={course?.instructors?.length > 3 && course?.instructors?.length - 3}>
              {course.instructors?.map((user, index) => (
                <Avatar
                  key={index}
                  className="w-14 h-14 ring-1 ring-background ring-offset-[2px]  ring-offset-background"
                >
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback>
                    {user?.firstName?.charAt(0) || 'U'} {user.lastName?.charAt(0) || user?.firstName?.charAt(1) || 'N'}
                  </AvatarFallback>
                </Avatar>
              ))}
            </AvatarGroup>

          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Description:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
            {course?.short_description}
          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Enrollment:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
            {course?.enrollmentLength}
          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Duration:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
            {course?.course_duration}
          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Last Updated on:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
           {/* { course?.updatedAt} */}
          {course?.updatedAt && formatDateToIST(course?.updatedAt)?.date}
          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Course Level:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
            {course?.difficulty_level}
          </h2>
        </div>
      </div>

      <div class="py-4 flex flex-wrap md:flex-nowrap">
        <div class="md:w-64 md:mb-0 mb-6 flex-shrink-0 flex flex-col">
          <span class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">Lectures:</span>
        </div>
        <div class="md:flex-grow">
          <h2 class="text-base font-semibold text-gray-900 title-font dark:text-gray-100">
            {overView?.lectures}
          </h2>
        </div>
      </div>

    </div>
  )
}

export default CourseOverview;