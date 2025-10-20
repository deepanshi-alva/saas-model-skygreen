"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from '@/config/axios.config';

function Enrollments({ course }) {
  return (
    <div className="space-y-6">
      <div className='grid grid-cols-12 gap-6'>
        <Card className="p-6 col-span-12 lg:col-span-12 xl:col-span-12 min-h-[300px]">
          <CardTitle className="text-lg font-medium text-default-800">Enrollments</CardTitle>
          <CardContent className="px-0 py-4">
            {course?.course_enrollments && course.course_enrollments.length > 0 ? (
              <div className="h-[400px] overflow-auto custom-scrollbar">
                <table className="w-full caption-top text-sm">
                  <thead className="[&amp;_tr]:border-b">
                    <tr className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted">
                      <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize bg-default-100 last:pr-6 sticky top-0">Name</th>
                      <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize bg-default-100 last:pr-6 sticky top-0">Email</th>
                      <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize bg-default-100 last:pr-6 sticky top-0">Role</th>
                      <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize bg-default-100 last:pr-6 sticky top-0">Department</th>
                      <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize bg-default-100 last:pr-6 sticky top-0">Location</th>
                    </tr>
                  </thead>
                  <tbody className="[&amp;_tr:last-child]:border-0">
                    {course.course_enrollments.map((ce, index) => (
                      <tr key={index} className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.username || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.email || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.role?.type || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.department?.title || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.location?.title || 'N/A'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center text-default-600 py-4">No Enrollments Found</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Enrollments
