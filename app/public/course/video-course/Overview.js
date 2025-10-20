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
          <CardContent className="px-4 pt-5">

            <div className="flex-none mt-0">
           
              <Accordion type="single" collapsible className="w-full border rounded divide-y">
                {current.type === "accordian" ? <AccordionItem className="bg-background border-b-2 moduleAccordionBlock p-0 shadow-sm" value={`item-${current.accordianIndex}`}>
                  <AccordionTrigger className="space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center topicHeading">
                    <div className="flex items-center text-xl font-medium capitalize justify-between w-full " style={{ zIndex: 999 }}>
                      <div className="flex items-center"><svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="36" height="36" viewBox="0 0 48 48"><path fill="#ffa000" d="M40 12H22l-4-4H8c-2.2 0-4 1.8-4 4v8h40v-4c0-2.2-1.8-4-4-4" /><path fill="#ffca28" d="M40 12H8c-2.2 0-4 1.8-4 4v20c0 2.2 1.8 4 4 4h32c2.2 0 4-1.8 4-4V16c0-2.2-1.8-4-4-4" /></svg>
                        {/* <span className="lightTextModule">Module {current.accordianIndex + 1}.&nbsp;</span> */}
                        {course?.modules[current.accordianIndex].title}

                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <>
                      {course?.modules[current.accordianIndex]?.description && <div className='topicHeading flex px-6 py-0 mb-6'>
                        <p className='text-base'>
                          {course?.modules[current.accordianIndex]?.description}

                        </p>
                      </div>}
                      <Accordion type="single" collapsible className="w-full px-6 py-6 mb-6 space-y-3.5 mt-4">
                        <Topic topic={course?.modules[current.accordianIndex]?.topics[current.topicIndex]} topicIndex={current.topicIndex} />
                      </Accordion>
                    </>
                  </AccordionContent>
                </AccordionItem> : <Topic topic={course?.modules[current.topicIndex]} topicIndex={current.topicIndex} />
                }
              </Accordion>
            </div>
          </CardContent>
        </Card>
      </div>
      }
    </div>
  )
}

export default Overview;
const Topic = ({ topic, topicIndex }) => {
  return (
    <AccordionItem className="bg-background border-b-2 topicAccordionBlock shadow-sm p-0" value={`topic-${topicIndex}` }  >
      <AccordionTrigger className='topicHeading space-y-1.5 px-6 py-6 mb-0 border-b border-border flex flex-row items-center'>
        <div className="flex items-center space-x-2 text-xl font-medium justify-between w-full">
          <div className='flex items-center'><svg xmlns="http://www.w3.org/2000/svg" className="mr-2" width="26" height="26" viewBox="0 0 2048 2048"><path fill="#f97316" d="M1755 512h-475V37zm37 128v1408H128V0h1024v640z" /></svg>
            {/* <span className="lightTextModule">Topic {topicIndex + 1}.&nbsp;</span> */}
            {topic?.title || (`Topic ${topicIndex + 1}`)}
           
          </div>
        </div>
      </AccordionTrigger>
  
      <AccordionContent className={` p-6 wp-full justify-center`}>
        
        {topic?.description &&
          <div className='flex topicHeading topicEditContent'>
            <div className="text-base truncate-multiline" dangerouslySetInnerHTML={{ __html: topic?.description }}></div>
          </div>
        }
        {topic?.videos && <MediaPreview files={topic?.videos} type={'videos'} isPublic={true} />}
        {topic?.files && <MediaPreview files={topic?.files} type={'files'} isPublic={true} />}
        {topic?.images && <MediaPreview files={topic?.images} type={'images'} isPublic={true} />}
        {topic?.audios && <MediaPreview files={topic?.audios} type={'audios'} isPublic={true} />}
      </AccordionContent>
    </AccordionItem >
  )
};
// const TopicAccordian = ({ topic, topicIndex }) => {
//   const isModule = !!topic?.type
//   return (
//     <>
//       <AccordionItem value={`${topic?.type || 'topic'}` + topicIndex} className={`${isModule ? 'shadow-none bg-default-none rounded-none mt-0 ' : 'shadow-none bg-default-100 rounded-md mt-3  courseDetailTopic'}`}>
//         <AccordionTrigger>Topic: {topic?.title} </AccordionTrigger>
//         <AccordionContent className="text-default-800">
//           {/* <span dangerouslySetInnerHTML={{ __html: topic.description }}></span> */}
//           {topic?.videos?.length && topic.videos.map((video, vindex) => <div className="flex space-x-3 items-center mt-4" key={vindex}>
//             <div className="">
//               <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
//             </div>
//             <div>
//               <div className="text-sm text-card-foreground">{video.name}  </div>
//             </div>
//           </div>)}
//           {topic?.images?.length && topic.images.map((image, iindex) => <div className="flex space-x-3 items-center mt-4" key={iindex}>
//             <div className="">
//               <Icon icon="material-symbols:image" className="w-6 h-6" />
//             </div>
//             <div>
//               <div className="text-sm text-card-foreground">{image.name}  </div>
//             </div>
//           </div>)}
//           {topic?.audios?.length && topic.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
//             <div className="">
//               <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
//             </div>
//             <div>
//               <div className="text-sm text-card-foreground">{audio.name}  </div>
//             </div>
//           </div>)}
//           {topic?.files?.length && topic.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
//             <div className="">
//               <Icon icon="mdi:files" className="w-6 h-6" />
//             </div>
//             <div>
//               <div className="text-sm text-card-foreground">{file.name}  </div>
//             </div>
//           </div>)}
//         </AccordionContent>
//       </AccordionItem>
//     </>
//   )
// }}

// <Accordion type="single" collapsible className="w-full border rounded divide-y">
// {
//   current.type === "accordian" ? <AccordionItem value={`item-${current.accordianIndex}`} className=" shadow-none moduleAccordionBlock">
//     <AccordionTrigger>Module: {course?.modules[current.accordianIndex].title}</AccordionTrigger>
//     <AccordionContent className="text-default-800">


//       <Accordion type="single" collapsible className="w-full">

//         <>
//           <div className='w-full bg-default-100 rounded-md p-4 mt-4 courseDetailTopic'>
//             <div className="text-sm font-medium pb-2">Topic {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.title}</div>
          
//             <div className="flex space-x-3 items-center mt-0">
//               <div className="">
//                 <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
//               </div>
//               <div>
//                 <div className="text-sm text-card-foreground">{course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.videos[0].name}  </div>
//               </div>
//             </div>
//             {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.images?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.images.map((image, i) => (
//               <div className="flex space-x-3 items-center mt-4" key={i}>
//                 <div className="">
//                   <Icon icon="material-symbols:image" className="w-6 h-6" />
//                 </div>
//                 <div>
//                   <div className="text-sm text-card-foreground">{image?.name}</div>
//                 </div>
//               </div>
//             ))}
//             {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.audios?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
//               <div className="">
//                 <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
//               </div>
//               <div>
//                 <div className="text-sm text-card-foreground">{audio.name}  </div>
//               </div>
//             </div>)}
//             {course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.files?.length && course?.modules[current.accordianIndex]?.topics[current.topicIndex]?.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4" key={aindex}>
//               <div className="">
//                 <Icon icon="mdi:files" className="w-6 h-6" />
//               </div>
//               <div>
//                 <div className="text-sm text-card-foreground">{file.name}  </div>
//               </div>
//             </div>
//             )}
//           </div>
//         </>
//       </Accordion>
//     </AccordionContent>
//   </AccordionItem> : <TopicAccordian topic={course?.modules[current.topicIndex]} topicIndex={current.topicIndex} />
// }
// </Accordion> 