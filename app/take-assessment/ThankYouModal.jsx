"use client";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "@/config/axios.config";
import DownloadCertificate from "./DownloadCertificate";
import { useParams } from "next/navigation";
import toast from "react-hot-toast";

const ThankYouModal = ({
  showThankYouModal,
  setShowThankYouModal,
  exitFullscreen,
  getMarks,
  minScore,
  documentId,
  hasSubjective,
  courseId,
}) => {
  const router = useRouter();
  const params = useParams();
  const [orientation, setOrientation] = useState("portrait");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [contentOrder, setContentOrder] = useState([]);
  const [logo, setLogo] = useState(null); // State for the logo image
  const [signature, setSignature] = useState(null); // State for the signature image
  const [showCertificate, setShowCertificate] = useState(false);
  const [certificateLogoId, setCertificateLogoId] = useState(null);
  const [certificateAvailable, setCertificateAvailable] = useState(false); // Add this state to track certificate availability
  const [certificateData, setCertificateData] = useState(null);

  const handleClose = () => {
    if (!hasSubjective) updateMCQScore();
    exitFullscreen();
    // if (courseId) router.push(`/public/course/${courseId}`);
    // else
    router.push("/public/my-attempts");
  };

  // const handleCertificate = async () => {
  //   const result = getMarks >= minScore ? "pass certificate" : "fail certificate";

  //   try {
  //     const { data } = await axiosInstance({
  //       url: `/api/certificates?filters[certificate_type][$eq]=${result}&populate=*`,
  //       method: "GET",
  //     });
  //     setContentOrder(data.data[0].content_order);
  //     setOrientation(data.data[0].certificate_layout);
  //     setBackgroundImage(data.data[0].background_img?.url || null);
  //     setLogo(data.data[0].logo?.url || null);
  //     setSignature(data.data[0].signature_file?.url || null);
  //   } catch (error) {
  //     console.error("Error fetching the certificate template:", error);
  //   }
  // };

  // useEffect(() => {
  //     handleCertificate();
  // }, [getMarks]);

  useEffect(() => {
    getCurrentAttemptData();
  }, [getMarks]);

  const getCurrentAttemptData = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/attempt-contents/${documentId}?populate=*`,
        method: "GET",
      });
      // Extract required data
      const user = data?.data?.user?.[0];
      const assignment = data?.data?.assignment;
      const publishedAt = data?.data?.publishedAt;

      if (user && assignment) {
        const userName = `${user?.firstName || ""} ${
          user?.lastName || ""
        }`.trim();
        const assessmentTitle = assignment.title;
        const publishedDate = new Date(publishedAt).toLocaleDateString();
        const assessmentDuration = `${assignment.time_limits || 0} minutes`;
        const organizationName = "Rodic LMS"; // Customize if needed
        // Call the certificate function with extracted values
        handleCertificate(
          userName,
          assessmentTitle,
          publishedDate,
          assessmentDuration,
          organizationName
        );
      } else {
        console.log("User or assignment data is missing.");
      }
    } catch (error) {
      console.log("Error fetching attempt data:", error);
    }
  };

  const handleCertificate = async (
    recipientName,
    assessmentTitle,
    completionDate,
    assessmentDuration,
    organizationName
  ) => {
    const resultType =
      getMarks >= minScore ? "pass certificate" : "fail certificate";

    try {
      const { data } = await axiosInstance({
        url: `/api/assignments/${params.id}?populate[certificate][populate]=*`,
        method: "GET",
      });
      console.log("Certificate Data:", data.data);
      // Find the certificate that matches the result type
      const selectedCertificate = [data.data?.certificate].find(
        (cert) => cert.certificate_type === resultType
      );

      if (!selectedCertificate) {
        console.error("No matching certificate found for type:", resultType);
        return;
      }
      setCertificateAvailable(true);
      // Replace placeholders in the content order
      const updatedContentOrder = selectedCertificate.content_order.map(
        (item) => {
          let updatedText = item.text
            .replace("[Recipient's Full Name]", recipientName)
            .replace("[Assessment Title]", assessmentTitle)
            .replace("[Completion Date]", completionDate)
            .replace("[Assessment Duration]", assessmentDuration)
            .replace("[Organization/Institution Name]", organizationName);

          return {
            ...item,
            text: updatedText,
          };
        }
      );

      // Update states
      const defaultBackground = "/images/defaultImage/landscape.png";
      // setBackgroundImage(cert.background_img?.url
      //   ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${cert.background_img.url}`
      //   : defaultBackground
      setContentOrder(updatedContentOrder);
      setOrientation(selectedCertificate.certificate_layout);
      setBackgroundImage(
        selectedCertificate.background_img?.url || defaultBackground
      );
      setLogo(selectedCertificate.logo?.url || null);
      setSignature(selectedCertificate.signature_file?.url || null);
      setCertificateLogoId(selectedCertificate.certificate_logo?.id || null);
      setCertificateData({
        ...selectedCertificate,
        signature_position: JSON.parse(
          selectedCertificate.signature_position || "{}"
        ),
        signature_size: JSON.parse(selectedCertificate.signature_size || "{}"),
        logo_position: JSON.parse(selectedCertificate.logo_position || "{}"),
        logo_size: JSON.parse(selectedCertificate.logo_size || "{}"),
      });
      console.log("Updated Certificate Data:", {
        contentOrder: updatedContentOrder,
        orientation: selectedCertificate.certificate_layout,
        backgroundImage: selectedCertificate.background_img?.url || null,
        logo: selectedCertificate.logo?.url || null,
        signature: selectedCertificate.signature_file?.url || null,
      });
    } catch (error) {
      console.error("Error fetching the certificate template:", error);
    }
  };

  const updateMCQScore = async () => {
    console.log("updateMCQScore", getMarks);
    const response = await axiosInstance({
      url: `/api/attempt-contents/${documentId}`,
      method: "PUT",
      data: {
        data: {
          auto_graded_marks: getMarks,
          total_marks: getMarks,
          attempt_content_status: "Reviewed",
        },
      },
    });
  };

  const generateCertificate = () => {
    if (!hasSubjective) updateMCQScore();
    if (minScore > getMarks) {
      toast.error("You have failed. Please reattempt to get the certificate.");

      setTimeout(() => {
        exitFullscreen();
        router.push("/public/all-assignments");
      }, 1000);

      return;
    }

    exitFullscreen();
    // setShowCertificate(true);
    router.push(
      `/public/certificates/${documentId}?attemptId=${documentId}&assignmentId=${params.id}`
    );
  };

  return (
    <Dialog open={showThankYouModal} onOpenChange={setShowThankYouModal}>
      <DialogContent className="p-6" size={showCertificate ? "full" : "md"}>
        {showCertificate ? (
          <DownloadCertificate
            orientation={orientation}
            backgroundImage={backgroundImage}
            contentOrder={contentOrder}
            logo={logo}
            signature={signature}
            exitFullscreen={exitFullscreen}
            documentId={documentId}
            certificateLogoId={certificateLogoId}
            certificateData={certificateData}
          />
        ) : (
          <div className="flex flex-col items-center text-center">
            <span className="text-8xl text-primary mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10s10-4.5 10-10S17.5 2 12 2m-2 15l-5-5l1.41-1.41L10 14.17l7.59-7.59L19 8z"
                />
              </svg>
            </span>
            {!hasSubjective && (
              <>
                <h2 className="text-3xl text-primary font-bold text-default-600 text-center mb-4">
                  Assessment Completed!
                </h2>

                <div className="grid grid-cols-2 gap-4 mb-8 w-full">
                  <div className="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">
                    <p>Your Total Score</p>
                    <h3 className="mt-0 mb-0 text-primary text-xl font-semibold">
                      {getMarks}
                    </h3>
                  </div>

                  <div className="flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center">
                    <p>Qualification Score</p>
                    <h3 className="mt-0 mb-0 text-primary text-xl font-semibold">
                      {minScore}
                    </h3>
                  </div>

                  <div className="col-span-2 flex flex-col border rounded-md p-2 text-center min-h-[80px] items-center justify-center mx-auto w-1/2">
                    <p>Result</p>
                    <h3 className="mt-0 mb-0 text-primary text-xl font-semibold">
                      {minScore <= getMarks ? "Pass" : "Fail"}
                    </h3>
                  </div>
                </div>
              </>
            )}
            <p className="text-sm text-default-500">
              Thank you for completing the assessment. Your responses have been
              submitted successfully.
            </p>
          </div>
        )}
        <DialogFooter className="mt-8 flex justify-between">
          {!hasSubjective && (
            <Button
              type="submit"
              color={minScore > getMarks ? "danger" : "primary"}
              onClick={generateCertificate}
              disabled={!certificateAvailable}
            >
              {minScore > getMarks ? "Reattempt" : "Generate Certificate"}
            </Button>
          )}
          <Button type="submit" color="secondary" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ThankYouModal;
