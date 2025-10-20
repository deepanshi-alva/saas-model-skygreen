import React, { useRef, useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useRouter } from "next/navigation";
import axiosInstance from "@/config/axios.config";
import { getFilePath } from "../../config/file.path";
import { cn } from "@/lib/utils";

const DownloadCertificate = ({
  orientation,
  backgroundImage,
  contentOrder,
  logo,
  signature,
  documentId,
  certificateLogoId,
  certificateData,
}) => {
  // console.log("certificateData", certificateData);
  const router = useRouter();
  const certificateRef = useRef();
  const [loading, setLoading] = useState(false);
  const [backgroundLoaded, setBackgroundLoaded] = useState(false);
  const [errorLoadingBackground, setErrorLoadingBackground] = useState(false);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const isLoggedIn = !!token;

  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.src = getFilePath(backgroundImage);
      img.onload = () => {
        setBackgroundLoaded(true);
      };
      img.onerror = () => {
        setErrorLoadingBackground(true);
        console.error("Error loading background image.");
      };
    }
  }, [backgroundImage]);

  const uploadCertificate = async (pdfBlob) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("files", pdfBlob, "certificate.pdf");

      const uploadResponse = await axiosInstance({
        url: "/api/upload",
        method: "POST",
        data: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const uploadedFile = uploadResponse.data[0];
      await axiosInstance({
        url: `/api/attempt-contents/${documentId}`,
        method: "PUT",
        data: {
          data: {
            certificate: uploadedFile.id,
            certificateLogo: certificateLogoId,
          },
        },
      });
    } catch (error) {
      console.error("Error uploading certificate:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAndUploadPDF = async () => {
    if (!certificateRef.current || !backgroundLoaded) return; // Ensure image is loaded before generating PDF
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000)); // Ensure DOM updates
      await waitForImagesToLoad(certificateRef.current);

      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null, // Set background to null to capture the transparency
      });

      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: orientation === "portrait" ? "portrait" : "landscape",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

      const pdfBlob = pdf.output("blob");

      await uploadCertificate(pdfBlob);
      pdf.save("certificate.pdf");
    } catch (err) {
      console.error("Error generating or uploading PDF:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  if (backgroundLoaded) {
    console.log("✅ Background loaded. Starting PDF generation...");
    generateAndUploadPDF();
  }
}, [backgroundLoaded]);

  const preloadImage = (url) => {
    return new Promise((resolve) => {
      if (!url) return resolve();
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = resolve;
      img.onerror = resolve;
      img.src = url;
    });
  };

  const waitForImagesToLoad = async (container) => {
    const imgs = container.querySelectorAll("img");
    const promises = [...imgs].map((img) => {
      if (!img.complete) {
        return new Promise((resolve) => {
          img.onload = img.onerror = resolve;
        });
      }
      return Promise.resolve();
    });

    if (backgroundImage) {
      promises.push(preloadImage(backgroundImage));
    }

    return Promise.all(promises);
  };

  return (
    <>
      {contentOrder && (
        <div>
          <div className="flex justify-center mt-4 mb-4 space-x-4">
            {isLoggedIn && (
              <button
                onClick={generateAndUploadPDF}
                disabled={loading || !backgroundLoaded} // Disable button until background is loaded
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Processing..." : "Download Certificate"}
              </button>
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
    </>
  );
};

export default DownloadCertificate;
