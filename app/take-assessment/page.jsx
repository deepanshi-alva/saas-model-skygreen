"use client";

import ProfileInfo from "@/components/partials/header/profile-info";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import ShowAssessmentDetails from "./ShowAssessmentDetails";

const Page = () => {
    const router = useRouter();
    // const { id } = useParams(); // Destructure id directly

    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState([]);



    return (
        <>
           <ShowAssessmentDetails />
        </>
    );
};

export default Page;
