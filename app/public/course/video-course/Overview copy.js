"use client"
import React, { useEffect, useMemo, useState } from 'react'
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import MediaPreview from '../../../admin/course/[courseDocumentId]/[steps]/MediaPreview';
import { DocumentViewer } from 'react-documents';
function Overview({ course, currentState }) {
  const [current, setCurrentState] = useState(currentState);
  useEffect(() => {
    setCurrentState(currentState);
  }, [currentState]);
  useEffect(() => {
    if (!current?.type && course.modules) {
      const newCurrent = course?.modules[0].type === 'Topic'
        ? { type: "topic", topicIndex: 0 }
        : { type: "accordian", accordianIndex: 0, topicIndex: 0 };

      setCurrentState(newCurrent);
    }
  }, []);

  console.log('current', current, 'course', course);
  console.log('currentState', currentState, 'current', current);
  return (
    <div className="space-y-6 min-h-[300px]">
      {course?.modules && current && <div className='grid grid-cols-12 gap-6'>

        <Card className="p-0 col-span-12 lg:col-span-12 xl:col-span-12 rounded-none bg-none shadow-none">
          {/* <CardHeader className="border-none mb-0">
            <CardTitle className="text-lg font-medium text-default-800">Course Structure</CardTitle>
          </CardHeader> */}
          <CardContent className="px-0 pt-0">

            <div className="flex-none mt-0">
              {/* <div className="w-full border rounded divide-y"> */}
                {
                  current.type === "accordian" ? <div className="w-full">
                    <TopicAccordian topic={course?.modules[current.accordianIndex].topics[current.topicIndex]} topicIndex={current.topicIndex} />
                  </div>  : <TopicAccordian topic={course?.modules[current.topicIndex]} topicIndex={current.topicIndex} />
                  // current.type === "accordian" ? <div value={`item-${current.accordianIndex}`} className=" shadow-none moduleAccordionBlock">
                  //   {/* <AccordionTrigger>Module: {course?.modules[current.accordianIndex].title}</AccordionTrigger> */}
                  //   <div className="text-default-800">

                  //     {/* {ele.short_description} */}
                  //     <div className="w-full">

                  //       <>
                  //         {/* <div className='w-full bg-default-100 rounded-md p-4 mt-4 courseDetailTopic'>
                  //           <div className="text-sm font-medium pb-2">Topic {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.title}</div>
                  //           <span dangerouslySetInnerHTML={{ __html: topic.description }}></span>
                  //           <div className="flex space-x-3 items-center mt-0">
                  //             <div className="">
                  //               <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
                  //             </div>
                  //             <div>
                  //               <div className="text-sm text-card-foreground">{course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.videos[0].name}  </div>
                  //             </div>
                  //           </div>
                  //           {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.images?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.images.map((image, i) => (
                  //             <div className="flex space-x-3 items-center mt-4" key={i}>
                  //               <div className="">
                  //                 <Icon icon="material-symbols:image" className="w-6 h-6" />
                  //               </div>
                  //               <div>
                  //                 <div className="text-sm text-card-foreground">{image?.name}</div>
                  //               </div>
                  //             </div>
                  //           ))}
                  //           {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.audios?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
                  //             <div className="">
                  //               <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
                  //             </div>
                  //             <div>
                  //               <div className="text-sm text-card-foreground">{audio.name}  </div>
                  //             </div>
                  //           </div>)}
                  //           {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.files?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
                  //             <div className="">
                  //               <Icon icon="mdi:files" className="w-6 h-6" />
                  //             </div>
                  //             <div>
                  //               <div className="text-sm text-card-foreground">{file.name}  </div>
                  //             </div>
                  //           </div>
                  //           )}
                  //         </div> */}
                  //         {/* {course?.modules[current.accordianIndex]?.description && <div className='topicHeading flex px-6 py-0 mb-6'>
                  //           <p className='text-base'>
                  //             {course?.modules[current.accordianIndex]?.description}

                  //           </p>
                  //         </div>} */}
                  //       </>
                  //         <TopicAccordian topic={course?.modules[current.accordianIndex].topics[current.topicIndex]} topicIndex={current.topicIndex} />
                  //     </div>
                  //   </div>
                  // </div> : <TopicAccordian topic={course?.modules[current.topicIndex]} topicIndex={current.topicIndex} />
                }
              </div>
            {/* </div> */}
          </CardContent>
        </Card>
      </div>}
    </div>
  )
}

export default Overview

{/* <ul className="mt-6 space-y-4">
<li className="flex items-center">
  <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
   
    <span className="text-sm font-medium text-default-800">Type:</span>
  </div>
  <div className="flex-1 text-sm text-default-700">{course.course_type}</div>
</li>
<li className="flex items-center">
  <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
    
    <span className="text-sm font-medium text-default-800">Duration:</span>
  </div>
  <div className="flex-1 text-sm text-default-700">{course.course_duration}</div>
</li>
<li className="flex items-center">
  <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
    
    <span className="text-sm font-medium text-default-800">Mandatory:</span>
  </div>
  <div className="flex-1 text-sm text-default-700">{course.course_mandatory ? 'Mandatory' : 'Elective'}</div>
</li>
<li className="flex items-center">
  <div className="flex-none  2xl:w-56 flex items-center gap-1.5">
   
    <span className="text-sm font-medium text-default-800">Tags:</span>
  </div>
  <div className="flex-1 text-sm text-default-700">{course.course_tags||'-'}</div>
</li>
</ul> */}

// <Accordion type="single" collapsible className="w-full bg-default-100 rounded-md divide-y mt-4 ">
// <AccordionItem value="item-1" className=" shadow-none  rounded-none">
//   <AccordionTrigger>Topic 1: Data Science</AccordionTrigger>
//   <AccordionContent className="text-default-800">
//     Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping.

//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>
//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>
//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>

//   </AccordionContent>
// </AccordionItem>
// </Accordion>

// <Accordion type="single" collapsible className="w-full bg-default-100 rounded-md divide-y mt-4 ">
// <AccordionItem value="item-1" className=" shadow-none  rounded-none">
//   <AccordionTrigger>Topic 2: Data Science</AccordionTrigger>
//   <AccordionContent className="text-default-800">
//     Lemon drops chocolate cake gummies carrot cake chupa chups muffin topping.

//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>
//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>
//     <div className="flex space-x-3 items-center mt-4">
//       <div className="">
//         <Icon icon="material-symbols:image" className="w-8 h-8" />
//       </div>
//       <div>
//         <div className="text-sm text-card-foreground">Intro Video</div>

//       </div>
//     </div>

//   </AccordionContent>
// </AccordionItem>
// </Accordion>
const TopicAccordian = ({ topic, topicIndex }) => {
  const isModule = !!topic?.type
  return (
    <>
      <div value={`${topic?.type || 'topic'}` + topicIndex} className={`${isModule ? 'shadow-none bg-default-none rounded-none mt-0' : 'shadow-none bg-default-none rounded-md mt-0  courseDetailTopic'}`}>
        <div className=' flex topicHeading topicEditContent'>
          <div className="text-lg font-bold capitalize pb-3">{topic?.title}</div>
        </div>
        {/* <AccordionContent className="text-default-800">
          <span dangerouslySetInnerHTML={{ __html: topic.description }}></span>
          {topic?.videos?.length && topic.videos.map((video, vindex) => <div className="flex space-x-3 items-center mt-4" key={vindex}>
            <div className="">
              <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{video.name}  </div>
            </div>
          </div>)}
          {topic?.images?.length && topic.images.map((image, iindex) => <div className="flex space-x-3 items-center mt-4" key={iindex}>
            <div className="">
              <Icon icon="material-symbols:image" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{image.name}  </div>
            </div>
          </div>)}
          {topic?.audios?.length && topic.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
            <div className="">
              <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{audio.name}  </div>
            </div>
          </div>)}
          {topic?.files?.length && topic.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
            <div className="">
              <Icon icon="mdi:files" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{file.name}  </div>
            </div>
          </div>)}
        </AccordionContent> */}
        <div className={`wp-full justify-center`}>

          {topic?.description &&
            <div className='flex topicHeading topicEditContent'>
              <div className="text-base" dangerouslySetInnerHTML={{ __html: topic?.description }}></div>
            </div>
          }
          {/* {topic?.videos && <MediaPreview files={topic?.videos} type={'videos'} isPublic={true} />} */}
          {topic?.files && <MediaPreview files={topic?.files} type={'files'} isPublic={true} />}
          {/* {topic?.files && <DocumentViewer
                                              queryParams="hl=Nl"
                                              url={selectedDoc}
                                              viewerUrl={selectedViewer.viewerUrl}
                                              viewer={selectedViewer.name}
                                              overrideLocalhost="https://react-doc-viewer.firebaseapp.com/">
                                          </DocumentViewer> } */}
          {topic?.audios && <MediaPreview files={topic?.audios} type={'audios'} isPublic={true} />}

          {topic?.images && 
          <div className='flex'>
            <MediaPreview 
            files={topic?.images} 
            type={'images'} 
            isPublic={true}
            />
          </div>
          
          }
          
         
        </div>
      </div>
    </>
  )
}