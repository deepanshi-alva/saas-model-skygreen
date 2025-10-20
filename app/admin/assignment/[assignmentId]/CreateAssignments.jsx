"use client";
import React, { useEffect, useState } from "react";
import { Stepper, Step, StepLabel } from "@/components/ui/steps";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Loader from "./loading";
import AssignmentLandingPage from "./AssignmentLandingPage";
import AssignmentContent from "./AssignmentContent";
import AssignmentCertificate from "./AssignmentCertificate";
import AssignmentFinalizingSetting from "./AssignmentFinalizingSetting";
import axiosInstance from "@/config/axios.config";
const CreateAssignments = ({ }) => {
  const router = useRouter()
  const params = useParams()
  const [isLoading, setIsLoading] = useState(false)
  const [activeStep, setActiveStep] = React.useState(0);
  const [assignment, setAssignment] = useState({})
  const getHash = () =>
    typeof window !== 'undefined' ? window.location.hash : ''


  const steps = [
    {
      label: "Assignment Details",
      content: "Set up the details of your assignment.",
    },
    {
      label: "Assignment Questions",
      content: "Add questions for your assignment.",
    },
    {
      label: "Certificates",
      content: "Set up certificates for your assignment.",
    },
    {
      label: "Assignment Settings",
      content: "Set qualification scores, enable randomization, and configure additional settings.",
    },
  ]

  const isStepOptional = (step) => {
    return step === 1;
  };

  const handleNext = (assignmentId) => {
    router.push(`/admin/assignment/${assignmentId}#${activeStep + 2}`)
  };

  const handleBack = (courseId) => {
    router.push(`/admin/assignment/${courseId}#${activeStep}`)
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const fetchAssignments = async () => {
    try {
      setIsLoading(true)
      const { data } = await axiosInstance({
        url: `api/assignments/${params.assignmentId}?populate[questions][populate][options]=*&populate[courses_categories]=true&populate[certificate]=true&status=published`, 
        method: 'GET',
      })
      console.log("Assigemet: ",data);
      setAssignment(data.data)
console.log("data from assignmne t--",data.data)
    } catch (error) {
      console.log(error)
      router.replace('/admin/assignment/new#1')
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    const hash = Number(getHash().replaceAll('#', ''))
    if (params.assignmentId === 'new') {
      if (hash !== 1)
        router.replace('/admin/assignment/new#1')
      else {
        setActiveStep(0)
        setIsLoading(false)
      }
    } else if (hash < 1 && hash > 3) {
      router.replace('/admin/course/new/#1')
    } else {
      fetchAssignments()
      if (!hash)
        router.replace(`/admin/assignment/${params.assignmentId}#1`)
    }
  }, [])

  useEffect(() => {
    const hash = Number(getHash().replaceAll('#', ''))
    setActiveStep(hash - 1)
  }, [params])
  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center flex-wrap justify-between gap-4">
          <div className="text-2xl font-medium text-default-800 ">
            {assignment?.title || 'Create Assignments'}
          </div>
        </div>
        <div>
          {isLoading ?
            <Loader />
            : <div className="grid grid-cols-12">
              {activeStep === 0 && <AssignmentLandingPage handleNext={handleNext} assignment={assignment} />}
              {activeStep === 1 && <AssignmentContent assignment={assignment} handleNext={handleNext} handleBack={handleBack} />}
              {activeStep === 2 && <AssignmentCertificate assignment={assignment} handleNext={handleNext} handleBack={handleBack} />}
              {activeStep === 3 && <AssignmentFinalizingSetting assignment={assignment} handleNext={handleNext} handleBack={handleBack} />}
              <div className="xl:col-span-3 col-span-12 px-3 courseStepsRight">
                <Stepper current={activeStep} direction="vertical">
                  {steps.map((label, index) => {
                    const stepProps = {};
                    const labelProps = {};
                    if (isStepOptional(index)) {
                      labelProps.optional = (
                        <StepLabel variant="caption">Optional</StepLabel>
                      );
                    }
                    return (
                      <Step key={label} {...stepProps} onClick={() => { assignment?.documentId && router.push(`/admin/assignment/${assignment.documentId}#${index + 1}`) }} >
                        <StepLabel {...labelProps}>
                          <div className="flex flex-col">
                            <span> {label.label}</span>
                            <span> {label.content}</span>
                          </div>
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>
              </div>
            </div>}
        </div>

      </div>

    </>
  );
};

export default CreateAssignments;
