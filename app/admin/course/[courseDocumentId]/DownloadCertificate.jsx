import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { getFilePath } from "../../../../config/file.path";

const DownloadCertificate = ({
  orientation,
  backgroundImage,
  contentOrder,
  logo,
  signature,
  exitFullscreen,
  showCertificate,
  setShowCertificate,
  docID,
  showCertificateButton,
  enrollCertificateLogoId,
  certificateData,
}) => {
  const router = useRouter();
  const certificateRef = useRef(); // Reference for the certificate container
  const [loading, setLoading] = useState(false);

  const downloadPDF = async () => {
    const element = certificateRef.current;
    const canvas = await html2canvas(element, {
      scale: 2, // Increase scale for better quality
      useCORS: true, // Enable cross-origin images
    });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: orientation === "portrait" ? "portrait" : "landscape",
      unit: "px",
      format: [element.offsetWidth, element.offsetHeight], // Use element's dimensions
    });
    pdf.addImage(
      imgData,
      "PNG",
      0,
      0,
      element.offsetWidth,
      element.offsetHeight
    );

    // Save the PDF locally
    const pdfBlob = pdf.output("blob");

    // Save the file in the backend
    await uploadCertificate(pdfBlob);

    pdf.save("certificate.pdf");

    // exitFullscreen();
    // router.push("/admin/assignment");
  };

  // Function to upload the certificate
  const uploadCertificate = async (pdfBlob) => {
    setLoading(true);
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

      const fieldToUpdate = showCertificateButton
        ? "certificate_enrollment"
        : "certificate_complection";
      const certificateLogoId = showCertificateButton
        ? "enrollCertificateLogoId"
        : "certificateCompletionLogoId";

      // Step 2: Link the uploaded file to a specific `attempt-content` entry
      const updateResponse = await axiosInstance({
        url: `/api/course-enrollments/${docID}`, // Update the specific entry
        method: "PUT",
        data: {
          data: {
            [fieldToUpdate]: uploadedFile.id, // Set the correct field dynamically
            [certificateLogoId]: enrollCertificateLogoId,
          },
        },
      });
      console.log(
        "Attempt content updated with certificate:",
        updateResponse.data
      );
      setLoading(false);
    } catch (error) {
      console.error("Error uploading file to Strapi:", error);
    }
  };

  return (
    <>
      <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
        <DialogContent className="overflow-y-auto max-h-[90vh]" size="4xl">
          {contentOrder && (
            <div>
              {/* Download Button */}
              <div className="flex justify-center mt-4 mb-4">
                <button
                  onClick={generateAndUploadPDF}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {loading ? "Isssue..." : "Issue Certificate"}
                </button>
              </div>

              {/* Certificate Container */}
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
          <DialogFooter className="mt-[32px] flex justify-between">
            {/* <Button type="submit" color="primary" onClick={generateCertificate}>
            Generate Certificate
          </Button>
          <Button type="submit" color="secondary" onClick={handleClose}>
            Close
          </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DownloadCertificate;
