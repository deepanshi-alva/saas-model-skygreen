import React, { useRef, useState, useEffect } from "react";
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
import { getFilePath } from "@/config/file.path";
import { cn } from "@/lib/utils";

const GernateCertificate = ({
  orientation,
  backgroundImage,
  contentOrder,
  logo,
  signature,
  showCertificate,
  setShowCertificate,
  //   showCertificateButton,
  attemptID,
  certificateLogoId,
  certificateData,
}) => {
  console.log("certificateData", certificateData);
  const router = useRouter();
  const certificateRef = useRef(); // Reference for the certificate container
  const [loading, setLoading] = useState(false);
  const waitForImagesToLoad = (container) => {
    const imgs = container.querySelectorAll('img, [style*="background-image"]');
    const promises = [];

    imgs.forEach((img) => {
      if (img.tagName === "IMG") {
        if (!img.complete) {
          promises.push(
            new Promise((resolve) => {
              img.onload = img.onerror = resolve;
            })
          );
        }
      } else {
        // For background images, create Image objects to preload
        const bg = window.getComputedStyle(img).backgroundImage;
        const urlMatch = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (urlMatch) {
          const url = urlMatch[1];
          const image = new Image();
          promises.push(
            new Promise((resolve) => {
              image.onload = image.onerror = resolve;
              image.src = url;
            })
          );
        }
      }
    });

    return Promise.all(promises);
  };

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

      // Step 2: Link the uploaded file to a specific `attempt-content` entry
      const updateResponse = await axiosInstance({
        url: `/api/attempt-contents/${attemptID}`, // Update the specific entry
        method: "PUT",
        data: {
          data: {
            certificate: uploadedFile.id, // Save the file reference
            certificateLogo: certificateLogoId, // Save the logo reference
          },
        },
      });
    } catch (error) {
      console.error("Error uploading file to Strapi:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAndUploadPDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);
    try {
      // Wait briefly to ensure images/fonts loaded
      await new Promise((r) => setTimeout(r, 1000));
      await waitForImagesToLoad(certificateRef.current);
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: orientation === "portrait" ? "portrait" : "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      // Get PDF blob
      const pdfBlob = pdf.output("blob");

      // Upload PDF blob to backend
      await uploadCertificate(pdfBlob);

      // Trigger browser download
      pdf.save("certificate.pdf");
    } catch (err) {
      console.error("Error generating or uploading PDF:", err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => {
      console.log("Generating and uploading PDF...");
      generateAndUploadPDF();
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);
  // Function to upload the certificate

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
                      // setBackgroundLoaded(true); // Set background as loaded
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

export default GernateCertificate;
