"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import CertificateGenerator from "../../course/[courseDocumentId]/CertificateGenerator";
import CompleteCertificate from "../../course/[courseDocumentId]/CompleteCertificate";
import DownloadCertificate from "@/app/take-assessment/DownloadCertificate";
import { getFilePath } from "../../../../config/file.path";

const EnrollmentCertificate = () => {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const attemptId = searchParams.get("attemptId");
  const assignmentId = searchParams.get("assignmentId");

  const [enrollmentData, setEnrollmentData] = useState(null);
  const [showCertificatePreview, setShowCertificatePreview] = useState(false);
  const [loading, setLoading] = useState(true);

  // States for Attempt-based Certificate
  const [orientation, setOrientation] = useState("portrait");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [contentOrder, setContentOrder] = useState([]);
  const [logo, setLogo] = useState(null);
  const [signature, setSignature] = useState(null);
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateLogoId, setCertificateLogoId] = useState(null);
  const [certificateData, setCertificateData] = useState(null);

  useEffect(() => {
    if (attemptId && assignmentId) {
      getCurrentAttemptData(attemptId, assignmentId);
    } else {
      fetchEnrollmentData(id);
    }
  }, [id, attemptId, assignmentId]);

  const fetchEnrollmentData = async (enrollmentId) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/course-enrollments/${enrollmentId}?populate=*`
      );

      console.log("data enrollment", data);

      if (!data || !data.data) {
        throw new Error("Invalid enrollment data received.");
      }

      setEnrollmentData(data.data);
      setTimeout(() => {
        setShowCertificatePreview(true);
      }, 100); // Small delay for state update
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentAttemptData = async (attemptId) => {
    try {
      const { data } = await axiosInstance.get(
        `/api/attempt-contents/${attemptId}?populate=*`
      );
      const user = data?.data?.user?.[0];
      const assignment = data?.data?.assignment;
      const publishedAt = data?.data?.publishedAt;

      if (user && assignment) {
        const userName = `${user?.firstName || ""} ${
          user?.lastName || ""
        }`.trim();

        const assessmentTitle = assignment.title;
        const publishedDate = new Date(publishedAt).toLocaleDateString();
        const assessmentDuration =
          `${Math.floor(assignment.time_limits / 60)} hour${
            Math.floor(assignment.time_limits / 60) !== 1 ? "s" : ""
          }${
            assignment.time_limits % 60 !== 0
              ? ` ${assignment.time_limits % 60} min${
                  assignment.time_limits % 60 !== 1 ? "s" : ""
                }`
              : ""
          }` || "N/A";
        const organizationName = "Rodic LMS";

        handleCertificate(
          userName,
          assessmentTitle,
          publishedDate,
          assessmentDuration,
          organizationName,
          assignmentId
        );
      } else {
        console.error("User or assignment data is missing.");
      }
    } catch (error) {
      console.error("Error fetching attempt data:", error);
    }
  };

  const handleCertificate = async (
    recipientName,
    assessmentTitle,
    completionDate,
    assessmentDuration,
    organizationName
  ) => {
    const resultType = "pass certificate"; // Assuming it’s a passing certificate

    try {
      const { data } = await axiosInstance.get(
        `/api/assignments/${assignmentId}?populate[certificate][populate]=*`
      );

      const selectedCertificate = [data?.data?.certificate].find(
        (cert) => cert.certificate_type === resultType
      );

      // console.log("selectedCertificate", selectedCertificate);

      if (!selectedCertificate) {
        console.error("No matching certificate found for type:", resultType);
        return;
      }

      // Replace placeholders
      const updatedContentOrder = selectedCertificate.content_order.map(
        (item) => ({
          ...item,
          text: item.text
            .replace("[Recipient's Full Name]", recipientName)
            .replace("[Assessment Title]", assessmentTitle ? assessmentTitle : enrollmentData?.course?.title)
            .replace("[Course Title]", assessmentTitle ? assessmentTitle : enrollmentData?.course?.title)
            .replace("[Completion Date]", completionDate)
            .replace("[Assessment Duration]", assessmentDuration? assessmentDuration : enrollmentData?.course?.course_duration)
            .replace("[Course Duration]", assessmentDuration? assessmentDuration : enrollmentData?.course?.course_duration)
            .replace("[Organization/Institution Name]", organizationName),
        })
      );

      // Update states
      const defaultBackground = "/images/defaultImage/landscape.png";
      setContentOrder(updatedContentOrder);
      setOrientation(selectedCertificate.certificate_layout);
      setBackgroundImage(
        selectedCertificate.background_img?.url
          ? getFilePath(selectedCertificate.background_img.url)
          : defaultBackground
      );
      setLogo(selectedCertificate.logo?.url || null);
      setSignature(selectedCertificate.signature_file?.url || null);
      setCertificateLogoId(selectedCertificate.certificate_logo?.id || null);
      setShowCertificate(true);
      setCertificateData({
        ...selectedCertificate,
        signature_position: JSON.parse(
          selectedCertificate.signature_position || "{}"
        ),
        signature_size: JSON.parse(selectedCertificate.signature_size || "{}"),
        logo_position: JSON.parse(selectedCertificate.logo_position || "{}"),
        logo_size: JSON.parse(selectedCertificate.logo_size || "{}"),
      });
    } catch (error) {
      console.error("Error fetching the certificate template:", error);
    }
  };

  return (
    <div>
      {showCertificatePreview && !attemptId && (
        <CertificateGenerator
          course={enrollmentData?.course}
          enrollmentStatus={enrollmentData?.Course_Status}
          user={enrollmentData?.user}
          onClose={() => setShowCertificatePreview(false)}
        />
      )}
      {showCertificatePreview && !attemptId && (
        <CompleteCertificate
          course={enrollmentData?.course}
          enrollmentStatus={enrollmentData?.Course_Status}
          backgroundImage={backgroundImage}
          user={enrollmentData?.user}
          onClose={() => setShowCertificatePreview(false)}
        />
      )}

      {showCertificate && attemptId && (
        <DownloadCertificate
          orientation={orientation}
          backgroundImage={backgroundImage}
          contentOrder={contentOrder}
          logo={logo}
          signature={signature}
          documentId={attemptId}
          certificateLogoId={certificateLogoId}
          certificateData={certificateData}
        />
      )}
    </div>
  );
};

export default EnrollmentCertificate;
