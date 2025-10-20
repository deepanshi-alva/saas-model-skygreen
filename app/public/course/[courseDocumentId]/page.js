import React from "react";
import CourseView from './CourseView'
function page({ params }) {
  return (
    <CourseView params={params} />
  )
}

export default page