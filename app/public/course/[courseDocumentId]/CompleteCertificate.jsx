"use client";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/config/axios.config";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getFilePath } from "@/config/file.path";
import { cn } from "@/lib/utils";

const CompleteCertificate = ({ course, enrollmentStatus, user, }) => {
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [signature, setSignature] = useState(null);
  const [logo, setLogo] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const certificateRef = useRef();
  const [contentOrder, setContentOrder] = useState([]);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [errorLoadingBackground, setErrorLoadingBackground] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLoggedIn = !!token;
  console.log("isLogged--", isLoggedIn);
  // Log props for debugging

  useEffect(() => {
    if (enrollmentStatus && course?.documentId) {
      // console.log("enrollmentStatuses ",enrollmentStatus ,course?.documentId)
      fetchCertificateDetails();
    }
  }, [enrollmentStatus, course]);

  useEffect(() => {
    if (certificateData?.content_order && user && course) {
      setContentOrder(
        mergeCertificateContent(certificateData.content_order, user, course)
      );
    }
  }, [certificateData, user, course]);

  const userData = async () => {
    try {
      const response = await axiosInstance({
        url: `/api/users/${user?.id}?populate[course_enrollments][populate]=certificate_enrollment`,
        method: "GET",
      });

      console.log("response.dataa", response.data);
      return response.data; // This should return the user details
    } catch (error) {
      console.error("Error fetching user data:", error);
      throw error; // Rethrow the error if needed for further handling
    }
  };

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance({
        url: `/api/courses?filters[documentId][$eq]=${course.documentId}&populate[certificate][populate]=*`,
        method: "get",
      });
      const courseData = data?.data[0];
      console.log("data for certitificate :-", data);
      if (
        courseData &&
        courseData?.certificate &&
        [courseData?.certificate]?.length > 0
      ) {
        const cert = [courseData?.certificate].find(
          (cert) =>
            cert.certificate_type === "on completion" ||
            cert.certificate_type === "pass certificate"
        );
        if (cert) {
          // Parse JSON strings into objects
          const parsedCert = {
            ...cert,
            logo_position: cert.logo_position
              ? JSON.parse(cert.logo_position)
              : null,
            logo_size: cert.logo_size ? JSON.parse(cert.logo_size) : null,
            signature_position: cert.signature_position
              ? JSON.parse(cert.signature_position)
              : null,
            signature_size: cert.signature_size
              ? JSON.parse(cert.signature_size)
              : null,
          };
          setCertificateData(parsedCert);

          if (cert.signature_file?.url) {
            setSignature(getFilePath(cert.signature_file.url));
          }
          if (cert.logo?.url) {
            setLogo(getFilePath(cert.logo.url));
          }
          // const defaultBackground = "/images/defaultImage/landscape.png";
          // setBackgroundImage(cert.background_img?.url
          //   ? `${process.env.NEXT_PUBLIC_STRAPI_URL}${cert.background_img.url}`
          //   : defaultBackground
          // )


          setBackgroundImage(
            cert.background_img?.url ?? getFilePath(cert.background_img.url)
          );
        }
      }
    } catch (error) {
      console.error("Error fetching certificate details:", error);
      toast.error("Failed to load certificate details.");
    } finally {
      setLoading(false);
    }
  };

  const generateCertificate = async () => {
    if (!certificateData) {
      toast.error("No certificate available for this course.");
      return;
    }
    toast.success("Downloading certificate ");
    // setLoading(true);
    try {
      const element = certificateRef.current;

      // Ensure the element is available before capturing
      if (!element) {
        console.error("Certificate element not found!");
        return;
      }

      const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better resolution
        useCORS: true, // Ensure CORS-enabled images are loaded
        allowTaint: true,
        logging: true, // Debugging logs in console
      });

      const imgData = canvas.toDataURL("image/png"); // Convert canvas to PNG image

      // Create PDF with proper orientation
      const pdf = new jsPDF({
        orientation:
          certificateData.certificate_layout === "portrait"
            ? "portrait"
            : "landscape",
        unit: "px",
        format: [canvas.width, canvas.height], // Set format based on canvas size
      });

      // Add the image to the PDF
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      const pdfBlob = pdf.output("blob");

      // Upload the certificate PDF file
      await uploadCertificate(pdfBlob, course.documentId, user.id);

      // Download the PDF after successful upload
      pdf.save(
        `${certificateData.certificate_name || "certificate_of_completion"}.pdf`
      );

      toast.success(
        "Certificate generated, uploaded, and downloaded successfully!"
      );
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate.");
    } finally {
      setLoading(false);
    }
  };

  const uploadCertificate = async (pdfBlob, courseId, userId) => {
    console.log("pdfBlob, courseId, userId", pdfBlob, courseId, userId);
    try {
      // Step 1: Upload the certificate file
      const formData = new FormData();
      formData.append("files", pdfBlob, "certificate.pdf");

      const uploadResponse = await axiosInstance({
        url: "/api/upload",
        method: "POST",
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Extract the file ID from the upload response (Strapi returns an array of objects in data)
      const uploadedFile = uploadResponse.data[0]; // Get the first file object
      const fileId = uploadedFile.id; // Extract the ID
      console.log("File uploaded successfully. File ID:", fileId);

      // Step 2: Fetch the user data using userId
      const userResponse = await axiosInstance({
        url: `/api/users/${userId}?populate[course_enrollments][populate]=certificate_enrollment&populate[course_enrollments][populate]=course`,
        method: "GET",
      });

      const userData = userResponse.data;
      console.log("User Data:", userData); // Debugging log to inspect response

      // If course_enrollments is empty, inform the user
      if (userData.course_enrollments.length === 0) {
        toast.error("No course enrollment found for this user.");
        return;
      }
      console.log("courseiddd", courseId);

      // Step 3: Find the course enrollment based on courseId
      const courseEnrollment = userData.course_enrollments.find(
        (enrollment) => enrollment.course?.documentId === courseId
      );

      if (!courseEnrollment) {
        toast.error("No enrollment found for this course.");
        return;
      }
      const logoId = certificateData.certificate_logo.id;
      console.log(logoId);

      // Step 4: Update the certificate_enrollment field with the uploaded file ID
      await axiosInstance({
        url: `/api/course-enrollments/${courseEnrollment.documentId}`, // Use 'documentId' or 'id' based on your Strapi config
        method: "PUT",
        data: {
          data: {
            certificate_complection: fileId, // Directly assign the file ID (adjust if Strapi expects { id: fileId })
            certificateCompletionLogoId: logoId,
          },
        },
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Failed to upload certificate.");
    }
  };
  const mergeCertificateContent = (contentOrder, user, course) => {
    if (!contentOrder) return [];
    return contentOrder.map((item) => ({
      ...item,
      text: item.text
        .replace(
          "[Recipient's Full Name]",
          `${user?.firstName || "Recipient"} ${user?.lastName || ""}`
        )
        .replace("[Course Title]", course?.title || "Course Title")
        .replace("[Assessment Title]", course?.title || "Course Title")
        .replace("[Completion Date]", new Date().toLocaleDateString())
        .replace(
          "[Course Duration]",
          `${Math.floor(course?.course_duration / 60)} hour${
            Math.floor(course?.course_duration / 60) !== 1 ? "s" : ""
          }${
            course?.course_duration % 60 !== 0
              ? ` ${course?.course_duration % 60} min${
                  course?.course_duration % 60 !== 1 ? "s" : ""
                }`
              : ""
          }` || "N/A"
        )
        .replace(
          "[Assessment Duration]",
          `${Math.floor(course?.course_duration / 60)} hour${
            Math.floor(course?.course_duration / 60) !== 1 ? "s" : ""
          }${
            course?.course_duration % 60 !== 0
              ? ` ${course?.course_duration % 60} min${
                  course?.course_duration % 60 !== 1 ? "s" : ""
                }`
              : ""
          }` || "N/A"
        )
        // `${assignment.time_limits || 0} minutes`
        .replace(
          "[Organization/Institution Name]",
          course?.organization || "Your Institution"
        ),
    }));
  };

  const orientation = certificateData?.certificate_layout || "portrait";
  return (
    <div>
      {certificateData && (
        <div>
          <div className="flex justify-center mt-4 mb-4 space-x-4">
            {isLoggedIn && (
              <Button
                onClick={generateCertificate}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                Generate & Download Certificate
              </Button>
            )}
          </div>

          {/* Certificate Preview */}
          <div
            ref={certificateRef}
            className="col-span-12 transition-transform mx-auto"
            style={{
              width: orientation === "portrait" ? "8.27in" : "11.69in",
              height: orientation === "portrait" ? "11.69in" : "8.27in",
              position: "relative",
            }}
          >
            {backgroundImage && (
              <img
                src={getFilePath(backgroundImage)}
                alt="Background"
                className="object-fill absolute inset-0 w-full h-full z-[-1]"
                onLoad={() => {
                  setBackgroundLoaded(true); // Set background as loaded
                }}
                onError={() => {
                  setErrorLoadingBackground(true);
                  console.error("Error loading background image");
                }}
                crossOrigin="anonymous"
              />
            )}
            <div
              className={cn(
                "flex flex-col items-center py-10",
                orientation === "portrait" ? "pt-20" : "pt-16"
              )}
              style={{
                gap: orientation === "portrait" ? "2rem" : "1rem",
              }}
            >
              {contentOrder.map((item) => {
                const ElementTag = item.type === "header" ? "h1" : "p";
                return (
                  <ElementTag
                    key={item.id}
                    className={`mt-5 z-10  ${item.style}`}
                    style={{
                      textAlign: item.textAlign || "center",
                      wordWrap: "break-word",
                      whiteSpace: "pre-line",
                      color: item.color || "#000",
                      fontSize: item.fontSize || "inherit",
                      fontWeight: item.fontWeight || "normal",
                      fontStyle: item.fontStyle || "normal",
                      lineHeight: item.lineHeight || "1.5em",

                      left: `${item.left}px`,
                      top: `${item.top}px`,
                    }}
                  >
                    {item.text}
                  </ElementTag>
                );
              })}
            </div>

            <div className="w-full">
              {logo && (
                <img
                  src={getFilePath(logo)}
                  className="object-contain"
                  alt="Logo"
                  style={{
                    position: "absolute",
                    top: `${certificateData.logo_position?.y}px`,
                    left: `${certificateData.logo_position?.x}px`,
                    width: `${certificateData.logo_size?.width}px`,
                    // height: `${certificateData.logo_size?.height}px`,
                  }}
                  crossOrigin="anonymous"
                />
              )}
              {signature && (
                <img
                  className="object-contain"
                  style={{
                    position: "absolute",
                    top: `${certificateData.signature_position?.y}px`,
                    left: `${certificateData.signature_position?.x}px`,
                    width: `${certificateData.signature_size?.width}px`,
                    // height: `${certificateData.signature_size?.height}px`,
                  }}
                  src={getFilePath(signature)}
                  alt="Signature"
                  crossOrigin="anonymous"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompleteCertificate;
