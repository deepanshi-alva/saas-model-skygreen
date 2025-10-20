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
import { getFilePath } from "../../../../../config/file.path";

const DownloadCertificate = ({ orientation, backgroundImage, contentOrder, logo, signature, exitFullscreen, showCertificate, setShowCertificate, docID, showCertificateButton,enrollCertificateLogoId }) => {
    const router = useRouter();
    const certificateRef = useRef(); // Reference for the certificate container
    const [loading, setLoading] = useState(false)

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
        pdf.addImage(imgData, "PNG", 0, 0, element.offsetWidth, element.offsetHeight);

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
        setLoading(true)
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

            const fieldToUpdate = showCertificateButton ? "certificate_enrollment" : "certificate_complection";
            const certificateLogoId = showCertificateButton ? "enrollCertificateLogoId" : "certificateCompletionLogoId"


            // Step 2: Link the uploaded file to a specific `attempt-content` entry
            const updateResponse = await axiosInstance({
                url: `/api/course-enrollments/${docID}`, // Update the specific entry
                method: "PUT",
                data: {
                    data: {
                        [fieldToUpdate]: uploadedFile.id, // Set the correct field dynamically
                        [certificateLogoId] : enrollCertificateLogoId
                    },
                },
            });
            console.log("Attempt content updated with certificate:", updateResponse.data);
            setLoading(false)
        } catch (error) {
            console.error("Error uploading file to Strapi:", error);
        }
    };

    return (
        <>
            <Dialog open={showCertificate} onOpenChange={setShowCertificate}>
                <DialogContent className="p-6" size="full">
                    {contentOrder && (
                        <div>
                            {/* Download Button */}
                            <div className="flex justify-center mt-4 mb-4">
                                <button
                                    onClick={downloadPDF}
                                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                                >
                                    {loading ? "Downloading..." : "Download as PDF"}
                                </button>
                            </div>
                            <div
                                ref={certificateRef} // Attach reference to this container
                                className="col-span-12 transition-transform mx-auto"
                                style={{
                                    width: orientation === "portrait" ? "8.27in" : "11.69in",
                                    height: orientation === "portrait" ? "11.69in" : "8.27in",
                                    backgroundImage: backgroundImage
                                        ? `url(${getFilePath(backgroundImage)})`
                                        : "none",
                                    backgroundSize: "100% 100%",
                                    backgroundPosition: "center",
                                    position: "relative", // Ensures proper positioning of child elements
                                }}
                            >
                                <div className="flex flex-col items-center py-10">
                                    {contentOrder.map((item) => {
                                        const ElementTag = item.type === "header" ? "h1" : "p";
                                        return (
                                            <ElementTag
                                                key={item.id}
                                                className={`mt-5 ${item.style}`}
                                                style={{
                                                    textAlign: item.textAlign || "center",
                                                    wordWrap: "break-word",
                                                    whiteSpace: "pre-line", // Ensure new lines are rendered
                                                    color: item.color || "#000",
                                                    fontSize: item.fontSize || "inherit",
                                                    fontWeight: item.fontWeight || "normal",
                                                    fontStyle: item.fontStyle || "normal",
                                                    left: item.left,
                                                    top: item.top,
                                                }}
                                            >
                                                {item.text}
                                            </ElementTag>
                                        );
                                    })}
                                </div>

                                {/* Logo and Signature */}
                                <div className="flex justify-between mt-8">
                                    <div className={`w-35 h-35 flex items-center justify-center ${!logo ? "border border-dashed" : ""}`}>
                                        {logo && (
                                            <img
                                                src={getFilePath(logo)}
                                                alt="Logo"
                                                className="w-full h-full object-contain ms-10"
                                            />
                                        )}
                                    </div>
                                    <div className={`w-35 h-35 flex items-center justify-center ${!signature ? "border border-dashed" : ""}`}>
                                        {signature && (
                                            <img
                                                src={getFilePath(signature)}
                                                alt="Signature"
                                                className="w-full h-full object-contain me-7"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>


                        </div>
                    )}
                    <DialogFooter className="mt-8 flex justify-between">
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
