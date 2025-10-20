"use client"
import React, { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import axiosInstance from '@/config/axios.config';
import { formatDate } from '@/app/admin/question-banks/QuestionBankGrid';
import CsvDownloader from 'react-csv-downloader';
function Enrollments({ course }) {
  const [enrollments, setEnrollments] = React.useState([]);
  async function fetchEnrollments() {
    try {
      const { data } = await axiosInstance({
        url: `/api/course/enroll?id=${course.id}`,
        method: 'get',
      });
      setEnrollments(data.filter(item => item.user));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchEnrollments();
  }, [])

  const columns = [
    { id: "employeeCode", displayName: "Employee Code" },
    { id: "name", displayName: "Name" },
    { id: "email", displayName: "Email Address" },
    { id: "coursename", displayName: "Course Name" },
    { id: "department", displayName: "Department" },
    { id: "location", displayName: "Location" },
    { id: "status", displayName: "Status" },
    { id: "fu", displayName: "Functional Unit" },
    { id: "bu", displayName: "Bussiness Unit" },
    { id: "progress", displayName: "Progress" },
    { id: "topics", displayName: "No. of Topics Completed" },
    { id: "isTakeAssignments", displayName: "Assignment Status" },
    { id: "enrollmentDate", displayName: "Date of Enrollment" },
    { id: "endDate", displayName: "Date of Completion" },
  ];

  const datas = enrollments.map((ce) => {
    const user = ce?.user || {};
    const totalTopics = course?.topics?.length || 0;
    const completedTopics = (ce?.topicProgress?.length || 0) + (ce?.moduleProgress?.length || 0);

    return {
      employeeCode: user.employeeCode || "N/A",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "N/A",
      email: user.email || "N/A",
      fu: user?.BUFunctionUnitID || "N/A",
      bu: user?.BusinessUnitCode || "N/A",
      department: user.department?.title || "N/A",
      location: user.location?.title || "N/A",
      enrollmentDate: ce?.startAt ? formatDate(ce.startAt) : "N/A",
      endDate: ce?.endAt !== null ? formatDate(ce.endAt) : "N/A",
      coursename: course?.title || "N/A",
      progress: ce?.progress != null ? `${ce.progress} %` : "N/A",
      status: ce?.Course_Status || "N/A",
      topics: `\ ${completedTopics} / ${totalTopics}`,
      isTakeAssignments: course?.assignments?.length > 0
        ? ce?.is_take_assignments
          ? "Attempted"
          : "Not Attempted"
        : "Assignment Not Available",
    };
  });

  return (
    <div className="space-y-6">

      <div className='grid grid-cols-12 gap-6'>
        <Card className="p-6 col-span-12 lg:col-span-12 xl:col-span-12 min-h-[300px]">
          <div className='flex justify-between items-center'>
            <CardTitle className="text-lg font-medium text-default-800">Enrollments</CardTitle>
            {/* <div className="flex justify-start pr-4"> */}
            <CsvDownloader
              filename={`${course.title} enrolled employees` || "enrollments"}
              extension=".csv"
              separator=","
              wrapColumnChar='"'
              columns={columns}
              datas={datas}
              text="Export to CSV"
              className="bg-[#fa7516] text-white px-4 py-2 rounded text-sm hover:bg-[#fa7516]/70 transition-colors duration-300"
            />
            {/* </div> */}
          </div>
          <CardContent className="px-0 py-4">
            <div className="h-[400px] overflow-auto custom-scrollbar">
              <table className="w-full caption-top text-sm">
                <thead className="[&amp;_tr]:border-b">
                  <tr className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted">
                    <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">
                      Name
                    </th>
                    {/* <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">Email</th>
                    <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">Role</th> */}
                    <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">
                      Department
                    </th>
                    <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">
                      Location
                    </th>
                    <th className="h-14 px-4 ltr:text-left rtl:text-right ltr:last:text-right rtl:last:text-left align-middle font-semibold text-sm text-default-800 capitalize ltr:[&amp;:has([role=checkbox])]:pr-0 rtl:[&amp;:has([role=checkbox])]:pl-0 bg-default-100 last:pr-6 sticky top-0">
                      Date of Enrollment
                    </th>
                  </tr>
                </thead>
                <tbody className="[&amp;_tr:last-child]:border-0">
                  {enrollments &&
                    enrollments.map((ce, index) => (
                      <tr
                        key={index}
                        className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">
                          {ce?.user?.firstName +
                            " " +
                            (ce?.user?.lastName || "") || "N/A"}
                        </td>
                        {/* <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.email || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.role?.type || 'N/A'}</td> */}
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">
                          {ce?.user?.department?.title || "N/A"}
                        </td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">
                          {ce?.user?.location?.title || "N/A"}
                        </td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">
                          {formatDate(ce?.createdAt) || "N/A"}
                        </td>
                      </tr>
                    ))}
                </tbody>
                {/* <tbody className="[&amp;_tr:last-child]:border-0">
                  {course?.course_enrollments &&
                    course.course_enrollments.map((ce, index) => (
                      <tr key={index} className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.firstName + " " + (ce?.user?.lastName || "") || 'N/A'}</td>
                        {/* <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.email || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.role?.type || 'N/A'}</td> */}
                {/* <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.department?.title || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.location?.title || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{formatDate(ce?.createdAt) || 'N/A'}</td>
                      </tr>
                    ))}
                </tbody>
                {/* <tbody className="[&amp;_tr:last-child]:border-0">
                  {course?.course_enrollments &&
                    course.course_enrollments.map((ce, index) => (
                      <tr key={index} className="border-b border-default-300 transition-colors data-[state=selected]:bg-muted">
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.firstName+" "+ (ce?.user?.lastName || "") || 'N/A'}</td>
                        {/* <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.email || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal">{ce?.user?.role?.type || 'N/A'}</td> */}
                {/* <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.department?.title || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{ce?.user?.location?.title || 'N/A'}</td>
                        <td className="p-4 align-middle text-sm text-default-600 last:text-right font-normal ltr:pr-6 rtl:pl-6">{formatDate(ce?.createdAt) || 'N/A'}</td>
                      </tr>
                    ))}
                </tbody> */}
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Enrollments;