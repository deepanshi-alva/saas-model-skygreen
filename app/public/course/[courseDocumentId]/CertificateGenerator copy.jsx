"use client";
import React, { useState, useEffect, useRef } from "react";
import axiosInstance from "@/config/axios.config";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas"; // For capturing the certificate as an image

const CertificateGenerator = ({ course, enrollmentStatus, user }) => {
  const [loading, setLoading] = useState(false);
  const [certificateData, setCertificateData] = useState(null);
  const [signature, setSignature] = useState(null); // For signature image URL
  const [logo, setLogo] = useState(null); // For logo image URL
  const [backgroundImage, setBackgroundImage] = useState(null); // For certificate background URL
  const certificateRef = useRef(); // Reference for the certificate container

  const btn = () => {
    console.log("course :---", course, "enrollmentStatus : - ", enrollmentStatus, "user : - ", user);
  }

  // When the course is enrolled, fetch certificate details.
  useEffect(() => {
    if (enrollmentStatus && course?.documentId) {
      fetchCertificateDetails();
    }
  }, [enrollmentStatus, course]);

  const fetchCertificateDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance({
        url: `/api/courses?filters[documentId][$eq]=${course.documentId}&populate[certificate][populate]=*`,
        method: "get",
      });
      const courseData = data.data && data.data;
      if (courseData && courseData.certificate && [courseData.certificate].length > 0) {
        const cert = [courseData.certificate].find(
          (cert) => cert.certificate_type === "on completion"
        );
        if (cert) {
          setCertificateData(cert);
          // Ensure we get the correct URL for images from Strapi
          if (cert.signature_file && cert.signature_file.url) {
            setSignature(`${process.env.NEXT_PUBLIC_STRAPI_URL}${cert.signature_file.url}`);
          }
          if (cert.logo && cert.logo.url) {
            setLogo(`${process.env.NEXT_PUBLIC_STRAPI_URL}${cert.logo.url}`);
          }
          if (cert.background_img && cert.background_img.url) {
            setBackgroundImage(`${process.env.NEXT_PUBLIC_STRAPI_URL}${cert.background_img.url}`);
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

  // Generate and download the certificate PDF, mimicking the design from the sample.
  const generateCertificate = async () => {
    if (!certificateData) {
      toast.error("No certificate available for this course.");
      return;
    }

    setLoading(true);
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // Enable cross-origin images
        allowTaint: true, // Allow tainted canvases if needed
      });

      // Create a new PDF document based on the certificate layout
      const pdf = new jsPDF({
        orientation: certificateData.certificate_layout === "portrait" ? "portrait" : "landscape",
        unit: "px",
        format: [element.offsetWidth, element.offsetHeight], // Use element's dimensions
      });

      // Add the canvas image to the PDF
      const imgData = canvas.toDataURL("image/png");
      pdf.addImage(imgData, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);

      // Save the PDF locally
      const pdfBlob = pdf.output("blob");

      // Upload the certificate to the backend
      await uploadCertificate(pdfBlob, course.documentId);

      pdf.save(`${certificateData.certificate_name || "certificate_of_completion"}.pdf`);
      toast.success("Certificate generated, uploaded, and downloaded successfully!");
    } catch (error) {
      console.error("Error generating certificate:", error);
      toast.error("Failed to generate certificate.");
    } finally {
      setLoading(false);
    }
  };

  // Function to upload the certificate to Strapi
  const uploadCertificate = async (pdfBlob, courseId) => {
    try {
      // Step 1: Upload the file to Strapi's Media Library
      const formData = new FormData();
      formData.append("files", pdfBlob, "certificate.pdf");

      const uploadResponse = await axiosInstance({
        url: "/api/upload", // Strapi's default upload endpoint
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data", // Required for file upload
        },
      });

      const uploadedFile = uploadResponse.data[0]; // Assume single file upload
      console.log("File uploaded successfully:", uploadedFile);

      // Step 2: Link the uploaded file to the specific course or certificate entry
      const updateResponse = await axiosInstance({
        url: `/api/courses/${courseId}`, // Update the specific course entry
        method: "PUT",
        data: {
          data: {
            certificates: [
              {
                ...certificateData,
                certificateFile: uploadedFile.id, // Save the file reference
              },
            ],
          },
        },
      });
      console.log("Course updated with certificate:", updateResponse.data);
    } catch (error) {
      console.error("Error uploading file to Strapi:", error);
      throw error; // Re-throw to handle in the parent try-catch
    }
  };

  if (!enrollmentStatus) return null;

  // Dynamically generate content order from certificateData if available, otherwise use default
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
        fontSize: "24px"
      },
      {
        id: 2,
        type: "p",
        text: `This certificate is proudly awarded to ${user.firstName} ${user.lastName || ""}`,
        style: "text-lg text-center text-black",
        textAlign: "center",
        fontSize: "16px"
      },
      {
        id: 3,
        type: "p",
        text: `For successfully completing the course: ${course.title}`,
        style: "text-lg text-center text-black",
        textAlign: "center",
        fontSize: "16px"
      },
      {
        id: 4,
        type: "p",
        text: `On ${new Date().toLocaleDateString()}`,
        style: "text-sm text-center text-gray-600",
        textAlign: "center",
        fontSize: "14px"
      },
      {
        id: 5,
        type: "p",
        text: "This certificate is awarded in recognition of the recipient’s dedication and commitment to enhancing their skills and knowledge through our learning platform.",
        style: "text-sm text-center text-gray-600",
        textAlign: "center",
        fontSize: "14px"
      },
      {
        id: 6,
        type: "p",
        text: `Awarded by Rodic`,
        style: "text-sm text-center text-gray-600",
        textAlign: "center",
        fontSize: "12px"
      },
    ];

  return (
    <div >

      {loading ? (
        <Loader2 className="animate-spin text-blue-500" />
      ) : certificateData ? (
        <div className="space-y-4">
          <p className="text-lg font-semibold">
            Certificate: <strong>{certificateData.certificate_name}</strong>
          </p>
          <p className="text-gray-600">Layout: {certificateData.certificate_layout || "Default"}</p>

          {/* Certificate Preview */}
          <div
            ref={certificateRef}
            className="mx-auto mb-4"
            style={{
              width: certificateData.certificate_layout === "portrait" ? "8.27in" : "11.69in",
              height: certificateData.certificate_layout === "portrait" ? "11.69in" : "8.27in",
              backgroundImage: backgroundImage ? `url(${backgroundImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              position: "relative",
              border: "10px solid #00008B", // Blue border from screenshot
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div className="flex flex-col items-center w-full py-10">
              {contentOrder.map((item) => {
                const ElementTag = item.type === "header" ? "h1" : "p";
                return (
                  <ElementTag
                    key={item.id}
                    className={`mt-5 ${item.style}`}
                    style={{
                      textAlign: item.textAlign || "center",
                      wordWrap: "break-word",
                      whiteSpace: "pre-line",
                      color: item.color || "#000",
                      fontSize: item.fontSize || "inherit",
                      fontWeight: item.fontWeight || "normal",
                      fontStyle: item.fontStyle || "normal",
                    }}
                  >
                    {item.text}
                  </ElementTag>
                );
              })}
            </div>

            {/* Logo and Signature with dynamic positioning and sizing */}
            <div className="flex justify-between w-full mt-8">
              <div
                className={`flex items-center justify-center ${!logo ? "border border-dashed" : ""}`}
                style={{
                  width: certificateData.logo_size || "140px", // Default size
                  height: certificateData.logo_size || "140px",
                  position: "absolute",
                  left: certificateData.logo_position?.x || "10px", // Default position
                  top: certificateData.logo_position?.y || "auto",
                  bottom: certificateData.logo_position?.y || "10px",
                }}
              >
                {logo && (
                  <img
                    src={logo}
                    alt="Rodic Logo"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous" // Handle CORS
                  />
                )}
              </div>
              <div
                className={`flex items-center justify-center ${!signature ? "border border-dashed" : ""}`}
                style={{
                  width: certificateData.signature_size || "140px", // Default size
                  height: certificateData.signature_size || "140px",
                  position: "absolute",
                  right: certificateData.signature_position?.x || "10px", // Default position
                  top: certificateData.signature_position?.y || "auto",
                  bottom: certificateData.signature_position?.y || "10px",
                }}
              >
                {signature && (
                  <img
                    src={signature}
                    alt="Signature"
                    className="w-full h-full object-contain"
                    crossOrigin="anonymous" // Handle CORS
                  />
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={generateCertificate}
            className="bg-blue-500 text-white hover:bg-blue-600"
          >
            Generate & Download Certificate
          </Button>
        </div>
      ) : (
        <p className="text-gray-500">No certificate available for this course.</p>
      )}



      <button onClick={btn}>btnnnnn</button>
    </div>
  );
};

export default CertificateGenerator;