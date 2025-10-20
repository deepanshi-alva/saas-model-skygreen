import React from 'react'
import CreateCourse from "./CourseCreate";
function page({ params }) {
  return (
    <>
      <CreateCourse params={params} />
    </>
  )
}

export default page
