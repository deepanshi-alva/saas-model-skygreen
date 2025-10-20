"use client";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/config/axios.config";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { getFilePath } from "@/config/file.path";

const CertificateGenerator = ({ course, enrollmentStatus, user }) => {
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [signature, setSignature] = useState(null);
  const [logo, setLogo] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const certificateRef = useRef();

  console.log(
    "course:",
    course,
    "enrollmentStatus:",
    enrollmentStatus,
    "user:",
    user
  );
  // Log props for debugging
  const btn = () => {};

  useEffect(() => {
    if (enrollmentStatus && course?.documentId) {
      // console.log("enrollmentStatuses ",enrollmentStatus ,course?.documentId)
      fetchCertificateDetails();
    }
  }, [enrollmentStatus, course]);

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
      const courseData = data.data && data.data[0];
      // console.log("data :-", data)
      if (
        courseData &&
        courseData.certificates &&
        courseData.certificates.length > 0
      ) {
        const cert = courseData.certificates.find(
          (cert) => cert.certificate_type === "participation"
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
          if (cert.background_img?.url) {
            setBackgroundImage(getFilePath(cert.background_img.url));
          }
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

    setLoading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const pdf = new jsPDF({
        orientation:
          certificateData.certificate_layout === "portrait"
            ? "portrait"
            : "landscape",
        unit: "px",
        format: [element.offsetWidth, element.offsetHeight],
      });

      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        element.offsetWidth,
        element.offsetHeight
      );

      const pdfBlob = pdf.output("blob");
      await uploadCertificate(pdfBlob, course.documentId, user.id); // Pass user.id explicitly
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
      console.log(
        "courseEnrollment",
        courseEnrollment,
        courseEnrollment.documentId,
        "courseid",
        courseId
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
            certificate_enrollment: fileId, // Directly assign the file ID (adjust if Strapi expects { id: fileId })
            enrollCertificateLogoId: logoId,
          },
        },
      });

      console.log(
        "Certificate file uploaded and associated with course enrollment successfully."
      );
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Failed to upload certificate.");
    }
  };

  if (!enrollmentStatus) return null;

  const contentOrder = certificateData?.content_order?.map((item, index) => ({
    id: index + 1,
    type: item.type || "p",
    text: item.text || "",
    style: item.style || "text-base text-center text-black",
    textAlign: item.textAlign || "center",
    fontSize: item.fontSize || "16px",
  })) || [
    {
      id: 1,
      type: "header",
      text: "Certificate of Completion",
      style: "text-2xl font-bold text-center text-black",
      textAlign: "center",
      fontSize: "24px",
    },
    {
      id: 2,
      type: "p",
      text: `This certificate is proudly awarded to ${user?.firstName} ${
        user?.lastName || ""
      }`,
      style: "text-lg text-center text-black",
      textAlign: "center",
      fontSize: "16px",
    },
    {
      id: 3,
      type: "p",
      text: `For successfully completing the course: ${course?.title}`,
      style: "text-lg text-center text-black",
      textAlign: "center",
      fontSize: "16px",
    },
    {
      id: 4,
      type: "p",
      text: `On ${new Date().toLocaleDateString()}`,
      style: "text-sm text-center text-gray-600",
      textAlign: "center",
      fontSize: "14px",
    },
    {
      id: 5,
      type: "p",
      text: "This certificate is awarded in recognition of the recipient’s dedication and commitment to enhancing their skills and knowledge through our learning platform.",
      style: "text-sm text-center text-gray-600",
      textAlign: "center",
      fontSize: "14px",
    },
    {
      id: 6,
      type: "p",
      text: `Awarded by Rodic`,
      style: "text-sm text-center text-gray-600",
      textAlign: "center",
      fontSize: "12px",
    },
  ];

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
                className="object-contain absolute inset-0 w-full h-full z-[-1]"
                onLoad={() => {
                  console.log("Background image loaded");
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

export default CertificateGenerator;
