import React from 'react'
import Image from "next/image";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

const page = () => {
  
  return (

  <>
    <div className="rounded-none bg-card text-card-foreground shadow-sm mb-6">
    <CardHeader className="flex-row items-center border-none">
      
    <CardTitle className="flex w-full capitalize p-2 text-xl font-medium capitalize">
      
            <div className="mt-3 flex flex-wrap items-center gap-2 lg:gap-6">
              <div className="mb-0">
                <div className="text-3xl font-bold text-default-800 capitalize">
                  Title here
                </div>
                <div className="text-lg text-primary/90 font-medium capitalize">
                <div className="flex col- items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden">
                      <Image
                        src=''
                        alt=''
                        className="h-full w-full object-cover"
                        width=''
                        height=''
                      />
                    </div>
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium text-default-700">Mukesh Bhardwaj</span>
                        <span className="text-xs font-medium text-default-600">Design, Marketing</span>
                      </div>
                </div>
                </div>
              </div>
            </div>

    </CardTitle>

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-medium text-default-700">Previous</span>
                <span className="text-xs font-medium text-default-600">Next</span>
              </div>
            </div>

          
    </CardHeader>

    <CardContent className="">

          <div className="flex-none">
            <div className="min-h-[400px] w-full border-none rounded-md bg-secondary">
             
   
            <video className='w-[100%] rounded-md object-fit' controls muted>
              <source src="https://example.com/sample.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>


            </div>
          </div>

    <Tabs className="md:w-full mt-6">
      <TabsList className="grid w-full grid-cols-12 bg-default-none">
        <TabsTrigger value="content">Content</TabsTrigger>
        <TabsTrigger value="q-a">Q & A</TabsTrigger>
        <TabsTrigger value="announcement">Announcement</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger> 
        <TabsTrigger value="course-overview">Course Overview</TabsTrigger>        
      </TabsList>
      <TabsContent value="content">
        <p>Content comes here</p>
      </TabsContent>
      <TabsContent value="q-a">
      <p>Q-A comes here</p>
      </TabsContent>
      <TabsContent value="announcement">
      <p>Announcement comes here</p>
      </TabsContent>
      <TabsContent value="reviews">
      <p>Reviews comes here</p>
      </TabsContent>
      <TabsContent value="course-overview">
      <p>Course overview comes here</p>
      </TabsContent>
    </Tabs>

    </CardContent>
    </div>

</>


  )
}


export default page