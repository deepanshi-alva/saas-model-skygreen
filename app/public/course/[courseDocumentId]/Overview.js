"use client"
import React from 'react'
import { Icon } from '@iconify/react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

function Overview({ course }) {

  return (
    <div className="space-y-6">
      <div className='grid grid-cols-12 gap-6'>
        <Card className="p-2 col-span-12 lg:col-span-6 xl:col-span-6">
          <CardHeader className="border-none mb-0">
            <CardTitle className="text-lg font-medium text-default-800">Overview</CardTitle>
          </CardHeader>

          <CardContent className="px-4">
            <p className="text-md text-default-700">
              {course.short_description}
            </p>

            {course?.highlights?.length > 0 && <div className="flex-none mt-6">
              <h3 className="text-lg font-medium text-default-700 pb-2"> What you'll learn </h3>


              <ul className='grid grid-cols-2 gap-2 items-start'>
                {course.highlights.map(ele => <li className='flex items-center pb-1'>
                  <Icon icon="teenyicons:tick-small-outline" className="h-7 w-7 " />
                  <span className='text-md text-default-700'>{ele.name}</span>
                </li>
                )}
              </ul>



            </div>}

          </CardContent>
        </Card>

        <Card className="p-2 col-span-12 lg:col-span-6 xl:col-span-6">
          <CardHeader className="border-none mb-0">
            <CardTitle className="text-lg font-medium text-default-800">Course Structure</CardTitle>
          </CardHeader>

          <CardContent className="px-4">

            <div className="flex-none mt-0">

              <Accordion type="multiple" collapsible className="w-full border rounded divide-y">
                {course?.modules?.length>0 && course.modules.map((ele, index) => {

                  return ele.type === "Module" ? <AccordionItem value={'module' + index} className=" shadow-none moduleAccordionBlock">
                    <AccordionTrigger>Module {index + 1}: {ele.title}</AccordionTrigger>
                    <AccordionContent className="text-default-800">

                      {/* {ele.short_description} */}
                      <Accordion type="multiple" collapsible className="w-full">

                        {ele.topics.map((topic, topicIndex) => {

                          return <>
                            <div className='w-full bg-default-100 rounded-md p-4 mt-4 courseDetailTopic'>
                              <div className="text-sm font-medium pb-2">Topic {topicIndex + 1}: {topic.title}</div>
                              {/* <span dangerouslySetInnerHTML={{ __html: topic.description }}></span> */}
                              {/* {topic?.videos?.length && topic.videos.map((video, vindex) => <div className="flex space-x-3 items-center mt-0">
                                <div className="">
                                  <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-sm text-card-foreground">{video.name}  </div>
                                </div>
                              </div>)} */}

                              
                              {/* {topic?.images?.length && topic.images.map((image, iindex) => <div className="flex space-x-3 items-center mt-4">
                              <div className="">
                                <Icon icon="material-symbols:image" className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-sm text-card-foreground">{image.name}  </div>
                              </div>
                            </div>)}
                            {topic?.audios?.length && topic.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4">
                              <div className="">
                                <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
                              </div>
                              <div>
                                <div className="text-sm text-card-foreground">{audio.name}  </div>
                              </div>
                            </div>)} */}
                              {/* {topic?.files?.length && topic.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4">
                                <div className="">
                                  <Icon icon="mdi:files" className="w-6 h-6" />
                                </div>
                                <div>
                                  <div className="text-sm text-card-foreground">{file.name}  </div>
                                </div>
                              </div>
                              )} */}
                            </div>
                          </>
                        })}
                      </Accordion>
                    </AccordionContent>

                  </AccordionItem> : <TopicAccordian topic={ele} topicIndex={index} />

                })}
              </Accordion>

            </div>






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

          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Overview

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
  {/* <span dangerouslySetInnerHTML={{ __html: topic.description }}></span> */}
const TopicAccordian = ({ topic, topicIndex }) => {
  const isModule = !!topic?.type
  return (
    <>
      <AccordionItem value={`${topic?.type || 'topic'}` + topicIndex} className={`${isModule ? 'shadow-none bg-default-none rounded-none mt-0 ' : 'shadow-none bg-default-100 rounded-md mt-3  courseDetailTopic'}`}>
        <AccordionTrigger>Topic {topicIndex + 1}: {topic.title} </AccordionTrigger>
        {/* <AccordionContent className="text-default-800">
        
          {topic?.videos?.length && topic.videos.map((video, vindex) => <div className="flex space-x-3 items-center mt-4">
            <div className="">
              <Icon icon="material-symbols:hangout-video-rounded" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{video.name}  </div>
            </div>
          </div>)}
          {topic?.images?.length && topic.images.map((image, iindex) => <div className="flex space-x-3 items-center mt-4">
            <div className="">
              <Icon icon="material-symbols:image" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{image.name}  </div>
            </div>
          </div>)}
          {topic?.audios?.length && topic.audios.map((audio, aindex) => <div className="flex space-x-3 items-center mt-4">
            <div className="">
              <Icon icon="material-symbols:audio-file-outline" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{audio.name}  </div>
            </div>
          </div>)}
          {topic?.files?.length && topic.files.map((file, aindex) => <div className="flex space-x-3 items-center mt-4">
            <div className="">
              <Icon icon="mdi:files" className="w-6 h-6" />
            </div>
            <div>
              <div className="text-sm text-card-foreground">{file.name}  </div>
            </div>
          </div>)}
        </AccordionContent> */}
      </AccordionItem>
    </>
  )
}