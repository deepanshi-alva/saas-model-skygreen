"use client"
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Stats() {
  return (
    <div className="space-y-6">
      <div className='grid grid-cols-12 gap-6'>
      <Card className="p-6 col-span-12 lg:col-span-12 xl:col-span-12 min-h-[300px]">
      <CardTitle className="text-lg font-medium text-default-800">Stats</CardTitle>
      <CardContent className="px-0 py-4">
            <p className="text-md text-default-700">
              Content comes here
            </p>
            </CardContent>
      </Card>
        
        </div>
    </div>
  )
}

export default Stats