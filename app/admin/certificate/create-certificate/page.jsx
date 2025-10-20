"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/config/axios.config";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/provider/Store";
import Logo from "@/public/images/all-img/logo.png";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import toast from "react-hot-toast";

const defaultBackgroundImage = "/images/defaultimage/potrait.png"; // Background image
const defaultBackgroundLandscape = "/images/defaultimage/landscape.png";
const defaultLogo = "/images/defaultimage/logo.png"; // Logo image
const defaultSignature = "/images/defaultimage/signature.png"; // Signature image

const DraggableImage = ({
  src,
  type,
  position,
  setPosition,
  size,
  setSize,
  parentRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const handleMouseMove = (event) => {
      if (isDragging && parentRef.current) {
        const parentRect = parentRef.current.getBoundingClientRect();

        setPosition((prevPosition) => {
          let newX = prevPosition.x + event.movementX;
          let newY = prevPosition.y + event.movementY;

          // Ensure logo stays inside certificate boundaries
          newX = Math.max(0, Math.min(newX, parentRect.width - size.width));
          newY = Math.max(0, Math.min(newY, parentRect.height - size.height));

          return { x: newX, y: newY };
        });
      }
    };

    const handleResize = (event) => {
      if (isResizing && parentRef.current) {
        const parentRect = parentRef.current.getBoundingClientRect();

        setSize((prevSize) => {
          let newWidth = prevSize.width + event.movementX;
          let newHeight = prevSize.height + event.movementY;

          // Restrict resizing within the certificate
          newWidth = Math.max(
            50,
            Math.min(newWidth, parentRect.width - position.x)
          );
          newHeight = Math.max(
            25,
            Math.min(newHeight, parentRect.height - position.y)
          );

          return { width: newWidth, height: newHeight };
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    if (isDragging || isResizing) {
      window.addEventListener(
        "mousemove",
        isResizing ? handleResize : handleMouseMove
      );
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, isResizing]);

  return (
    <div
      className="absolute cursor-move"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition:
          isDragging || isResizing
            ? "none"
            : "left 0.1s ease, top 0.1s ease, width 0.1s ease, height 0.1s ease",
      }}
      onMouseDown={(e) => {
        setIsDragging(true);
        e.preventDefault();
      }}
    >
      <Image src={src} alt={type} width={size.width} height={size.height} />
      {/* Resize Handle */}
      <div
        className="absolute bottom-0 right-0 bg-gray-500 w-4 h-4 cursor-se-resize"
        onMouseDown={(e) => {
          e.stopPropagation();
          setIsResizing(true);
        }}
      />
    </div>
  );
};

const DraggableElement = ({
  item,
  moveItem,
  handleTextChange,
  handleSelect,
  isSelected,
}) => {
  const [, dragRef] = useDrag({
    type: "element",
    item: { id: item.id },
  });

  const [, dropRef] = useDrop({
    accept: "element",
    hover: (draggedItem) => {
      if (draggedItem.id !== item.id) {
        moveItem(draggedItem.id, item.id);
      }
    },
  });

  const ElementTag = item.type === "header" ? "h1" : "p";

  return (
    <ElementTag
      ref={(node) => dragRef(dropRef(node))}
      className={`mt-5 z-10 cursor-move ${item.style} ${
        isSelected ? "outline outline-2 outline-blue-500" : ""
      }`}
      style={{
        textAlign: item.textAlign || "center",
        wordWrap: "break-word",
        whiteSpace: "pre-line", // Ensure new lines are rendered
        color: item.color || "#000",
        fontSize: item.fontSize || "inherit",
        fontWeight: item.fontWeight || "normal",
        fontStyle: item.fontStyle || "normal", // Add this line
        lineHeight: item.lineHeight || "1.5em", // Added line height property

        left: `${item.left}px`,
        top: `${item.top}px`,
      }}
      contentEditable
      suppressContentEditableWarning
      onClick={() => handleSelect(item.id)}
      onInput={(event) => handleTextChange(event, item.id)}
    >
      {item.text}
    </ElementTag>
  );
};

export default function page() {
  const user = useAppSelector((state) => state.user);
  const certificateType = ["on completion", "pass certificate"];
  const certificateRef = useRef(null);

  const [badgeImage, setBadgeImage] = useState(null);
  const [badgeId, setBadgeId] = useState(null);

  const [logoSize, setLogoSize] = useState({ width: 100, height: 50 });
  const [signatureSize, setSignatureSize] = useState({
    width: 100,
    height: 50,
  });
  const [certificateTypeSelect, setCertificateType] = useState("on completion");
  const [orientation, setOrientation] = useState("portrait");
  const [certificateName, setCertificateName] = useState("");
  const [backgroundImage, setBackgroundImage] = useState(
    defaultBackgroundImage
  );
  const [certificateContentData, setCertificateContentData] = useState({
    contentetype: "certificate",
    recipientname: "[Recipient's Full Name]",
    certificateTitle: "[Assessment Title]",
    completionDate:
      "[Completion Date]\nDuration: [Assessment Duration] | Credits: [If Applicable]",
  });
  const [certificateLogoImage, setCertificateLogoImage] = useState(defaultLogo);

  const [logoPosition, setLogoPosition] = useState({ x: 126, y: 836 });
  const [signaturePosition, setSignaturePosition] = useState({
    x: 573,
    y: 868,
  });

  const [contentOrder, setContentOrder] = useState([
    {
      id: 1,
      text: "Certificate of Completion",
      style: "font-bold",
      type: "header",
      left: "",
      top: "",
      textAlign: "center",
      lineHeight: "",
      fontSize: "40px",
    },
    {
      id: 2,
      text: `This is to certify that\n${certificateContentData.recipientname}`,
      style: "",
      type: "paragraph",
      left: "50%",
      top: "30%",
      textAlign: "center",
      lineHeight: "",
      fontSize: "22px",
    },
    {
      id: 3,
      text: `has successfully completed the course\n${certificateContentData.certificateTitle}`,
      style: "",
      type: "paragraph",
      left: "50%",
      top: "45%",
      textAlign: "center",
      lineHeight: "",
      fontSize: "22px",
    },
    {
      id: 4,
      text: `on ${certificateContentData.completionDate}`,
      style: "",
      type: "paragraph",
      left: "50%",
      top: "55%",
      textAlign: "center",
      lineHeight: "",
      fontSize: "22px",
    },
    {
      id: 5,
      text: "This certificate is awarded in recognition of the recipient’s dedication\nand commitment to enhancing their skills and knowledge\nthrough our learning platform.",
      style: "",
      type: "paragraph",
      left: "50%",
      top: "65%",
      textAlign: "center",
      lineHeight: "",
      fontSize: "22px",
    },
    {
      id: 6,
      text: "Awarded by\n[Organization/Institution Name]",
      style: "",
      type: "paragraph",
      left: "50%",
      top: "80%",
      textAlign: "center",
      lineHeight: "",
      fontSize: "25px",
    },
  ]);

  useEffect(() => {
    if (orientation === "portrait") {
      setBackgroundImage(defaultBackgroundImage);
    } else if (orientation === "landscape") {
      setBackgroundImage(defaultBackgroundLandscape);
    }
  }, [orientation]);

  useEffect(() => {
    // Update the content order state when certificateContentData changes
    setContentOrder((prevContentOrder) => {
      return prevContentOrder.map((item) => {
        if (item.id === 2) {
          // Update recipient name
          return {
            ...item,
            text: `This is to certify that\n${certificateContentData.recipientname}`,
          };
        } else if (item.id === 3) {
          // Update certificate title
          return {
            ...item,
            text: `has successfully completed the course\n${certificateContentData.certificateTitle}`,
          };
        } else if (item.id === 4) {
          // Update completion date
          return {
            ...item,
            text: `on ${certificateContentData.completionDate}`,
          };
        }

        // Return other items unchanged
        return item;
      });
    });
  }, [certificateContentData]); // This hook runs whenever certificateContentData changes

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [logo, setLogo] = useState(null); // State for the logo image
  const [logoId, setLogoID] = useState();
  const [signature, setSignature] = useState(defaultSignature); // State for the signature image
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log("certificateTypeSelect", certificateTypeSelect);
    console.log(certificateContentData);
    console.log(contentOrder);
    // Conditionally set the certificate content data based on the certificateTypeSelect
    setCertificateContentData((prevState) => {
      const newTitle =
        certificateTypeSelect !== "pass certificate"
          ? "[Course Title]"
          : "[Assessment Title]";
      const newCompletionDate =
        certificateTypeSelect !== "pass certificate"
          ? "[Completion Date]\nDuration: [Course Duration] | Credits: [If Applicable]"
          : "[Completion Date]\nDuration: [Assessment Duration] | Credits: [If Applicable]";

      // Only update if the values are actually different
      if (
        prevState.certificateTitle !== newTitle ||
        prevState.completionDate !== newCompletionDate
      ) {
        return {
          ...prevState,
          certificateTitle: newTitle,
          completionDate: newCompletionDate,
        };
      }

      // Return prevState if there's no change
      return prevState;
    });
  }, [certificateTypeSelect]); // Dependency array will trigger effect when certificateTypeSelect changes

  useEffect(() => {
    if (orientation === "portrait") {
      setLogoPosition({ x: 126, y: 836 });
      setSignaturePosition({ x: 573, y: 868 });
    } else {
      setLogoPosition({ x: 150, y: 600 });
      setSignaturePosition({ x: 800, y: 620 });
    }
  }, [orientation]);
  useEffect(() => {
    getCourses();
  }, []);

  useEffect(() => {
    // Function to upload the logo
    const uploadLogo = async () => {
      try {
        const response = await fetch(Logo.src); // Fetch the static logo file
        const logoBlob = await response.blob(); // Convert the file to a Blob
        const formData = new FormData();
        formData.append("files", logoBlob, "logo.png"); // Append the Blob as a file

        // Upload to the server
        const logoResponse = await axiosInstance.post(`/api/upload`, formData);
        const uploadedLogoId = logoResponse.data[0]?.id || null; // Get the uploaded logo's ID
        const LogoUrl = logoResponse.data[0]?.url;
        setLogo(LogoUrl); // Update the state with the uploaded logo's ID or URL
        setLogoID(uploadedLogoId);
      } catch (error) {
        console.error("Error uploading the logo:", error);
      }
    };

    uploadLogo(); // Call the upload function on mount
  }, []); // Empty dependency array to ensure this runs only once on mount

  const getCourses = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses`,
        method: "GET",
      });
      setCourses(data.data);
    } catch (error) {
      console.error(error);
    }
  };
  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTextChange = (event, id) => {
    // Get the current cursor position and element
    const selection = window.getSelection();
    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    const offset = range.startOffset;

    const updatedText = event.target.innerText;

    // Update the content order
    setContentOrder((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, text: updatedText } : item
      )
    );

    // Restore cursor position after state update
    requestAnimationFrame(() => {
      try {
        // Find the text node
        let textNode;
        if (currentNode.nodeType === Node.TEXT_NODE) {
          textNode = currentNode;
        } else {
          textNode =
            Array.from(event.target.childNodes).find(
              (node) => node.nodeType === Node.TEXT_NODE
            ) || event.target.firstChild;
        }

        if (textNode) {
          const newRange = document.createRange();
          newRange.setStart(textNode, Math.min(offset, textNode.length));
          newRange.setEnd(textNode, Math.min(offset, textNode.length));

          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      } catch (error) {
        console.error("Error restoring cursor position:", error);
      }
    });
  };

  const handleSelect = (id) => {
    setSelectedItemId(id);
  };

  const handleStyleChange = (property, value) => {
    setContentOrder((prev) =>
      prev.map((item) =>
        item.id === selectedItemId ? { ...item, [property]: value } : item
      )
    );
  };

  const moveItem = (draggedId, targetId) => {
    setContentOrder((prevContentOrder) => {
      const draggedIndex = prevContentOrder.findIndex(
        (item) => item.id === draggedId
      );
      const targetIndex = prevContentOrder.findIndex(
        (item) => item.id === targetId
      );

      if (draggedIndex === -1 || targetIndex === -1) return prevContentOrder;

      const updatedOrder = [...prevContentOrder];
      const [draggedItem] = updatedOrder.splice(draggedIndex, 1);
      updatedOrder.splice(targetIndex, 0, draggedItem);

      return updatedOrder;
    });
  };

  const selectedElement = contentOrder.find(
    (item) => item.id === selectedItemId
  );

  const handleBadgeUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          setBadgeImage(reader.result); // Preview the image

          // Convert the file to a Blob for uploading
          const fileBlob = new Blob([file], { type: file.type });

          // Prepare FormData for API request
          const formData = new FormData();
          formData.append("files", fileBlob, file.name);

          // Upload the badge to Strapi
          const response = await axiosInstance.post(`/api/upload`, formData);
          const uploadedBadgeId = response.data[0]?.id || null;
          setBadgeId(uploadedBadgeId);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error uploading the badge:", error);
      }
    }
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSignature(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCertificateLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setCertificateLogoImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveCertificate = async () => {
    if (
      !certificateName ||
      !certificateTypeSelect ||
      !signature ||
      !backgroundImage ||
      !certificateLogoImage
    ) {
      toast.error("Please complete all required fields.");
      return;
    }

    try {
      setLoading(true);

      // Ensure images are uploaded before saving
      let certificatelogoId = null;
      let signatureId = null;
      let backgroundImageId = null;
      const handleMouseMove = (event) => {
        if (isDragging && parentRef.current) {
          const parentRect = parentRef.current.getBoundingClientRect();

          setPosition((prevPosition) => {
            let newX = event.clientX - parentRect.left - size.width / 2;
            let newY = event.clientY - parentRect.top - size.height / 2;

            // Ensure the image stays within the certificate boundaries
            newX = Math.max(0, Math.min(newX, parentRect.width - size.width));
            newY = Math.max(0, Math.min(newY, parentRect.height - size.height));

            return { x: newX, y: newY };
          });
        }
      };

      const uploadImage = async (image, filename) => {
        if (image) {
          const imageBlob = await fetch(image).then((res) => res.blob());
          const formData = new FormData();
          formData.append("files", imageBlob, filename);
          const response = await axiosInstance.post(`/api/upload`, formData);
          return response.data[0]?.id || null;
        }
        return null;
      };

      certificatelogoId = await uploadImage(
        certificateLogoImage,
        "certificate_logo.png"
      );
      signatureId = await uploadImage(signature, "signature.png");
      backgroundImageId = await uploadImage(backgroundImage, "background.png");

      // Format certificate content
      const formattedContentOrder = contentOrder.map((item) => ({
        id: item.id,
        top: item.top,
        left: item.left,
        text: item.text,
        type: item.type,
        style: item.style,
        textAlign: item.textAlign,
        color: item.color,
        fontSize: item.fontSize,
        fontWeight: item.fontWeight,
        fontStyle: item.fontStyle,
        lineHeight: item.lineHeight,
      }));

      // ✅ Define `formattedData` properly
      const formattedData = {
        data: {
          certificate_name: certificateName,
          content_order: formattedContentOrder,
          logo: certificatelogoId ? { id: certificatelogoId } : null,
          signature_file: signatureId ? { id: signatureId } : null,
          background_img: backgroundImageId ? { id: backgroundImageId } : null,
          certificate_layout: orientation,
          certificate_type: certificateTypeSelect,
          user: user.id,
          logo_position: JSON.stringify(logoPosition), // ✅ Storing as string
          logo_size: JSON.stringify(logoSize), // ✅ Storing as string
          signature_position: JSON.stringify(signaturePosition), // ✅ Storing as string
          signature_size: JSON.stringify(signatureSize),
          certificate_logo: badgeId ? { id: badgeId } : null,
        },
      };

      // Send API request
      const response = await axiosInstance.post(
        `/api/certificates`,
        formattedData
      );
      toast.success("Certificate saved successfully!");
      setLoading(false);
      router.push("/admin/certificate");
    } catch (error) {
      console.error(
        "❌ Strapi API Error:",
        error.response?.data?.error || error.message
      );

      toast.error(
        `Error saving certificate: ${
          error.response?.data?.error?.message || "Unknown Error"
        }`
      );

      setLoading(false);
    }
  };

  const handleSelectCertificate = (type) => {
    setCertificateType(type);
  };

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center flex-wrap justify-between gap-4">
          <div className="text-2xl font-medium text-default-800 ">
            Create Certificate
          </div>
        </div>

        <div className="mb-4 ">
          <div className="bg-card rounded-sm flex w-full p-6 shadow-sm items-end justify-between gap-4">
            <div className="transition-transform">
              <Label className="mb-3" htmlFor="inputId">
                Certificate Type
              </Label>
              <Select
                value={certificateTypeSelect}
                onValueChange={(value) => handleSelectCertificate(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a certificate" />
                </SelectTrigger>
                <SelectContent>
                  {certificateType.map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="transition-transform">
              <Label className="mb-3" htmlFor="inputId">
                Certificate Name
              </Label>
              <Input
                type="text"
                placeholder="Enter Certificate Name"
                id="inputId"
                value={certificateName}
                onChange={(e) => setCertificateName(e.target.value)}
              />
            </div>

            <div className="transition-transform">
              <label className="flex items-center space-x-2">
                <span className="text-sm font-medium">Upload Background:</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBackgroundUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
              />
            </div>

            <div className="transition-transform">
              <label className="flex items-center space-x-2">
                <span className="text-sm font-medium">
                  Upload Certificate Badge:
                </span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleBadgeUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
              />
            </div>

            <div className="transition-transform">
              <label className="flex items-center space-x-2">
                <span className="text-sm font-medium">Upload logo:</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleCertificateLogoUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
              />
            </div>

            <div className="transition-transform">
              <label className="flex mr-32 items-center space-x-2">
                <span className="text-sm font-medium">Upload Signature:</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleSignatureUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
              />
            </div>

            <div className="transition-transform">
              <button
                onClick={toggleOrientation}
                className="px-9 py-2 bg-primary text-white rounded hover:bg-primary-600"
              >
                {orientation === "portrait" ? "Landscape" : "Portrait"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-9">
            {/* Global Editor Panel */}
            <div className="col-span-12 p-6 rounded-sm bg-card shadow-sm relative">
              <div className="mb-4 bg-grey-200">
                <h2 className="text-lg font-bold mb-2">Editor</h2>
                <p className="text-sm text-red-600 mb-5">
                  <b>Note:</b> Don't delete {`[text]`} if you want field on
                  certificate generation. You can remove or hardcode any field
                  also.
                </p>
                {selectedElement ? (
                  <>
                    <div className="flex flex-wrap gap-6">
                      <div className="mb-4 flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Font Size
                        </label>
                        <input
                          type="number"
                          value={
                            selectedElement?.fontSize?.replace("px", "") || ""
                          } // Strip "px" and use a default empty string
                          onChange={(e) => {
                            const newValue = e.target.value
                              ? `${e.target.value}px`
                              : ""; // Convert to px if valid
                            handleStyleChange("fontSize", newValue); // Update the font size
                          }}
                          className="w-full border rounded p-2"
                          placeholder="Enter font size (e.g., 20)"
                        />
                      </div>
                      <div className="mb-4 flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Font Weight
                        </label>
                        <select
                          value={selectedElement.fontWeight || "normal"}
                          onChange={(e) =>
                            handleStyleChange("fontWeight", e.target.value)
                          }
                          className="w-full border rounded p-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="bold">Bold</option>
                          <option value="lighter">Lighter</option>
                        </select>
                      </div>
                      <div className="mb-4 flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Font Style
                        </label>
                        <select
                          value={selectedElement.fontStyle || "normal"}
                          onChange={(e) =>
                            handleStyleChange("fontStyle", e.target.value)
                          }
                          className="w-full border rounded p-2"
                        >
                          <option value="normal">Normal</option>
                          <option value="italic">Italic</option>
                        </select>
                      </div>

                      <div className="mb-4 flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Text Color
                        </label>
                        <input
                          type="color"
                          value={selectedElement.color || "#000000"}
                          onChange={(e) =>
                            handleStyleChange("color", e.target.value)
                          }
                          className="w-full border rounded p-2"
                        />
                      </div>
                      <div className="mb-4 flex-1">
                        <label className="block text-sm font-medium mb-1">
                          Text Alignment
                        </label>
                        <select
                          value={selectedElement.textAlign || "center"}
                          onChange={(e) =>
                            handleStyleChange("textAlign", e.target.value)
                          }
                          className="w-full border rounded p-2"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium mb-1">
                          Line Height
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={
                            selectedElement?.lineHeight?.replace("em", "") ||
                            "1.5"
                          }
                          onChange={(e) => {
                            const newValue = e.target.value
                              ? `${e.target.value}em`
                              : "1.5em";
                            handleStyleChange("lineHeight", newValue);
                          }}
                          className="w-full border rounded p-2"
                          placeholder="Enter line height (e.g., 1.5)"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">
                    Select an element to edit its style.
                  </p>
                )}
              </div>

              {/* Certificate Canvas */}
              <div
                ref={certificateRef}
                className="col-span-12 transition-transform mx-auto"
                style={{
                  width: orientation === "portrait" ? "8.27in" : "11.69in",
                  height: orientation === "portrait" ? "11.69in" : "8.27in",
                  // backgroundImage: `url(${backgroundImage})`,
                  // backgroundSize: "100% 100%",
                  // backgroundPosition: "center",
                  position: "relative",
                }}
              >
                <img
                  src={backgroundImage}
                  alt="Background"
                  className="absolute inset-0 w-full h-full object-fill"
                />
                <div
                  className={cn(
                    "flex flex-col items-center py-10",
                    orientation === "portrait" ? "pt-20" : "pt-16"
                  )}
                  style={{
                    gap: orientation === "portrait" ? "2rem" : "1rem",
                  }}
                >
                  <DndProvider className="mb-3" backend={HTML5Backend}>
                    {contentOrder.map((item) => (
                      <DraggableElement
                        key={item.id}
                        item={item}
                        moveItem={moveItem}
                        handleTextChange={handleTextChange}
                        handleSelect={handleSelect}
                        isSelected={item.id === selectedItemId}
                      />
                    ))}
                  </DndProvider>
                </div>
                {/* Draggable Logo */}
                <DraggableImage
                  src={certificateLogoImage}
                  type="logo"
                  position={logoPosition}
                  setPosition={setLogoPosition}
                  size={logoSize}
                  setSize={setLogoSize}
                  parentRef={certificateRef}
                />

                {/* Draggable Signature */}
                <DraggableImage
                  src={signature}
                  type="signature"
                  position={signaturePosition}
                  setPosition={setSignaturePosition}
                  size={signatureSize}
                  setSize={setSignatureSize}
                  parentRef={certificateRef}
                />
              </div>
            </div>
          </div>
        </div>
        <Button className="mb-3" onClick={saveCertificate}>
          {loading ? "Saving..." : "Save certificate"}
        </Button>
      </div>
    </>
  );
}
