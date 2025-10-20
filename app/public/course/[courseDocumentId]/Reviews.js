"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReviewsPage from '../video-course/ReviewsPage';

function Reviews({ course }) {
  console.log("course12345", course.documentId);

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-12 gap-6'>
        <Card className="p-6 col-span-12 lg:col-span-12 xl:col-span-12 min-h-[300px]">
          <CardTitle className="text-lg font-medium text-default-800">Reviews</CardTitle>
          <CardContent className="px-0 py-4">
            <ReviewsPage course={course} />
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default Reviews