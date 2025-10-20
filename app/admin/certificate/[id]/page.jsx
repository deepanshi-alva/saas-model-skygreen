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
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useRef, memo } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Image from "next/image";
import { getFilePath } from "../../../../config/file.path";
import { cn } from "@/lib/utils";

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
        draggedItem.id = item.id; // Ensure React updates
      }
    },
  });

  const ElementTag = item.type === "header" ? "h1" : "p";

  return (
    <ElementTag
      ref={(node) => dragRef(dropRef(node))}
      className={`mt-5 cursor-move ${item.style} ${
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
export default function Certificate() {
  const certificateType = ["on completion", "pass certificate"];
const [certificateContentData, setCertificateContentData] = useState({
      contentetype: "certificate",
      recipientname: "[Recipient's Full Name]",
      certificateTitle: "[Assessment Title]",
      completionDate: "[Completion Date]\nDuration: [Assessment Duration] | Credits: [If Applicable]",
    });
  const [certificateTypeSelect, setCertificateType] = useState("");
  const [orientation, setOrientation] = useState("portrait");
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [contentOrder, setContentOrder] = useState([]);
  const [certificateName, setCertificateName] = useState("");
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [logo, setLogo] = useState(null); // State for the logo image
  const [logoId, setLogoId] = useState(null);
  const [signature, setSignature] = useState(null); // State for the signature image
  const [signatureId, setSignatureId] = useState(null);
  const [backgroundImageID, setBackgroundImageId] = useState(null);
  const [certificateLogoImage, setCertificateLogoImage] = useState(null);
  const [certificateLogoImageID, setCertificateLogoImageID] = useState(null);
  const [logoPosition, setLogoPosition] = useState({ x: 126, y: 836 });
  const [logoSize, setLogoSize] = useState({ width: 100, height: 50 });

  const [signaturePosition, setSignaturePosition] = useState({
    x: 573,
    y: 868,
  });
  const [signatureSize, setSignatureSize] = useState({
    width: 100,
    height: 50,
  });

  const params = useParams();
  const router = useRouter();

  const [selectedSubjectCourses, setSelectedCourses] = useState("");
  const [courses, setCourses] = useState([]);
  const [user, setUser] = useState();

  // useEffect(() => {
  //   if (orientation === "portrait") {
  //     setLogoPosition({ x: 126, y: 836 });
  //     setSignaturePosition({ x: 573, y: 868 });
  //   } else {
  //     setLogoPosition({ x: 150, y: 600 });
  //     setSignaturePosition({ x: 800, y: 620 });
  //   }
  // }, [orientation]);

  useEffect(() => {
    getCourses();
  }, []);

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
  
   useEffect(() => {
    console.log("certificateTypeSelect", certificateTypeSelect);
    console.log(certificateContentData);
    console.log(contentOrder)
    // Conditionally set the certificate content data based on the certificateTypeSelect
    setCertificateContentData((prevState) => {
      const newTitle = certificateTypeSelect !== 'pass certificate' ? "[Course Title]" : "[Assessment Title]";
      const newCompletionDate = certificateTypeSelect !== 'pass certificate' 
        ? "[Completion Date]\nDuration: [Course Duration] | Credits: [If Applicable]" 
        : "[Completion Date]\nDuration: [Assessment Duration] | Credits: [If Applicable]";
  
      // Only update if the values are actually different
      if (prevState.certificateTitle !== newTitle || prevState.completionDate !== newCompletionDate) {
        return {
          ...prevState,
          certificateTitle: newTitle,
          completionDate: newCompletionDate,
        };
      }
      
      // Return prevState if there's no change
      return prevState;
    });
  }, [certificateTypeSelect]);  // Dependency array will trigger effect when certificateTypeSelect changes
  
  useEffect(() => {
    console.log(
      "logoPosition",
      logoPosition,
      logoSize,
      signaturePosition,
      signatureSize
    );
    const timeoutId = setTimeout(async () => {
      try {
        await axiosInstance.put(`/api/certificates/${params.id}`, {
          data: {
            logo_position: JSON.stringify(logoPosition),
            logo_size: JSON.stringify(logoSize),
            signature_position: JSON.stringify(signaturePosition),
            signature_size: JSON.stringify(signatureSize),
          },
        });
        console.log("✅ Logo & Signature Position Updated");
      } catch (error) {
        console.error("❌ Error saving position:", error);
      }
    }, 1000); // Wait 1 second before saving

    return () => clearTimeout(timeoutId);
  }, [logoPosition, logoSize, signaturePosition, signatureSize]);

  useEffect(() => {
    getCertificateDetails();
  }, []);

  useEffect(() => {
    getCourses();
  }, []);

  const getCourses = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/courses`,
        method: "GET",
      });
      setCourses(data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const normalizeContentOrder = (items = []) => {
    return items.map((item, index) => ({
      id: item.id || index + 1,
      text: item.text || "",
      type: item.type || "paragraph",
      style: item.style || "",
      textAlign: item.textAlign || "center",
      color: item.color || "#000000",
      fontSize: item.fontSize || "20px",
      fontWeight: item.fontWeight || "normal",
      fontStyle: item.fontStyle || "normal",
      lineHeight: item.lineHeight || "1.5em",
      left:
        typeof item.left === "string" && item.left.includes("%")
          ? 100
          : parseInt(item.left || 0),
      top:
        typeof item.top === "string" && item.top.includes("%")
          ? 100
          : parseInt(item.top || 0),
    }));
  };

  const getCertificateDetails = async () => {
    try {
      const { data } = await axiosInstance({
        url: `/api/certificates/${params.id}?populate=*`,
        method: "GET",
      });
      const certificate = data?.data;
      // console.log("dddddddddddddddddd", certificate);

      setContentOrder(normalizeContentOrder(certificate?.content_order));

      // setContentOrder(data.data.content_order);
      setCertificateName(certificate?.certificate_name);
      setOrientation(certificate?.certificate_layout);
      setBackgroundImage(certificate?.background_img?.url || null);
      setCertificateLogoImage(certificate?.certificate_logo?.url || null);
      setLogo(certificate.logo?.url || null);
      setSignature(certificate?.signature_file?.url || null);

      certificate?.logo_position &&
        setLogoPosition(JSON.parse(certificate.logo_position));

      certificate?.signature_position &&
        setSignaturePosition(JSON.parse(certificate.signature_position));

      certificate?.logo_size && setLogoSize(JSON.parse(certificate.logo_size));

      certificate?.signature_size &&
        setSignatureSize(JSON.parse(certificate.signature_size));

      setBackgroundImageId(certificate.background_img?.id);
      setCertificateLogoImageID(certificate.certificate_logo?.id);
      setLogoId(certificate.logo?.id);
      setSignatureId(certificate.signature_file?.id);
      setCertificateType(certificate.certificate_type);
      setUser(certificate.user?.id);
    } catch (error) {
      console.error("❌ Error fetching certificate:", error);
    }
  };

  const toggleOrientation = () => {
    setOrientation((prev) => (prev === "portrait" ? "landscape" : "portrait"));
  };

  const handleBackgroundUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBackgroundImage(file);
    }
  };
  const handleCertificateLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCertificateLogoImage(file);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log("Selected Logo File:", file);
      setLogo({ file, preview: URL.createObjectURL(file) });
    }
  };

  const handleSignatureUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSignature({ file, preview: URL.createObjectURL(file) });
    }
  };

  useEffect(() => {
    async function handleBgImg() {
      if (logo) {
        try {
          const uploadedFileData = await uploadFile(
            logo.file,
            logo.name || "logo.png"
          );

          if (uploadedFileData) {
            const { id, url } = uploadedFileData; // Extract ID and URL
            setLogoId(id); // Set the image ID
            setLogo(url); // Set the image URL
          }
        } catch (error) {
          console.error("Error uploading the background image:", error);
        }
      }
    }

    handleBgImg();
  }, [logo]);

  useEffect(() => {
    async function handleBgImg() {
      if (certificateLogoImage) {
        try {
          const uploadedFileData = await uploadFile(
            certificateLogoImage,
            certificateLogoImage.name || "certificateLogoImage.png"
          );

          if (uploadedFileData) {
            const { id, url } = uploadedFileData; // Extract ID and URL
            setCertificateLogoImageID(id); // Set the image ID
            setCertificateLogoImage(url); // Set the image URL
          }
        } catch (error) {
          console.error("Error uploading the background image:", error);
        }
      }
    }

    handleBgImg();
  }, [certificateLogoImage]);

  useEffect(() => {
    async function handleBgImg() {
      if (signature) {
        try {
          const uploadedFileData = await uploadFile(
            signature,
            signature.name || "signature.png"
          );

          if (uploadedFileData) {
            const { id, url } = uploadedFileData; // Extract ID and URL
            setSignatureId(id); // Set the image ID
            setSignature(url); // Set the image URL
          }
        } catch (error) {
          console.error("Error uploading the background image:", error);
        }
      }
    }

    handleBgImg();
  }, [signature]);

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
    setContentOrder((prev) => {
      const draggedIndex = prev.findIndex((item) => item.id === draggedId);
      const targetIndex = prev.findIndex((item) => item.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const updatedOrder = [...prev];
      const [draggedItem] = updatedOrder.splice(draggedIndex, 1);
      updatedOrder.splice(targetIndex, 0, draggedItem);

      return updatedOrder;
    });
  };

  const selectedElement = contentOrder.find(
    (item) => item.id === selectedItemId
  );

  console.log("contentOrder", contentOrder);

  const uploadFile = async (file, filename) => {
    const formData = new FormData();
    formData.append("files", file, filename);

    const response = await axiosInstance.post("/api/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Explicitly set
      },
    });

    return response.data[0] || null; // Return the full response object
  };

  useEffect(() => {
    async function handleBgImg() {
      if (backgroundImage) {
        try {
          const uploadedFileData = await uploadFile(
            backgroundImage,
            backgroundImage.name || "background.png"
          );

          if (uploadedFileData) {
            const { id, url } = uploadedFileData; // Extract ID and URL
            setBackgroundImageId(id); // Set the image ID
            setBackgroundImage(url); // Set the image URL
          }
        } catch (error) {
          console.error("Error uploading the background image:", error);
        }
      }
    }

    handleBgImg();
  }, [backgroundImage]);

  const saveCertificate = async () => {
    console.log("Saving certificate...");

    try {
      const formattedData = {
        data: {
          certificate_name: certificateName,
          content_order: contentOrder,
          logo: logoId ? { id: logoId } : null,
          signature_file: signatureId ? { id: signatureId } : null,
          background_img: backgroundImageID ? { id: backgroundImageID } : null,
          certificate_logo: certificateLogoImageID
            ? { id: certificateLogoImageID }
            : null,
          certificate_layout: orientation,
          certificate_type: certificateTypeSelect,
          user: user,

          // ✅ Store size & position as JSON strings
          logo_position: JSON.stringify(logoPosition),
          logo_size: JSON.stringify(logoSize),
          signature_position: JSON.stringify(signaturePosition),
          signature_size: JSON.stringify(signatureSize),
        },
      };

      console.log("Formatted Data:", formattedData);

      const response = await axiosInstance.put(
        `/api/certificates/${params.id}`,
        formattedData
      );
      router.push("/admin/certificate");
      console.log("✅ Certificate saved successfully:", response.data);
    } catch (error) {
      console.error("❌ Error saving certificate:", error);
    }
  };

  console.log(
    "process.env.NEXT_PUBLIC_STRAPI_URL",
    process.env.NEXT_PUBLIC_STRAPI_URL
  );

  // Define the handler function
  const handleSelectCourses = (documentId) => {
    console.log("Selected Course ID:", documentId);

    // Use the id to perform any action or state update
    setSelectedCourses(documentId);
  };

  const handleSelectCertificate = (type) => {
    setCertificateType(type);
  };
  const certificateRef = useRef(null);

  return (
    <>
      <div className="space-y-5">
        <div className="flex items-center flex-wrap justify-between gap-4">
          <div className="text-2xl font-medium text-default-800 ">
            Edit Certificate
          </div>
        </div>

        <div className="mb-4">
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
                onChange={handleCertificateLogoUpload}
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
                onChange={handleLogoUpload}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded cursor-pointer focus:outline-none"
              />
            </div>

            <div className="transition-transform">
              <label className="flex items-center space-x-2">
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
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-600"
              >
                {orientation === "portrait" ? "Landscape" : "Portrait"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-6 mt-6 ">
            {/* Global Editor Panel */}
            <div className="col-span-12 p-6 rounded-sm bg-card shadow-sm relative">
              <div className="mb-4 bg-grey-200">
                <h2 className="text-lg font-bold mb-4">Editor</h2>
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

                      <div className="mb-4 flex-1">
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
                  backgroundImage: backgroundImage
                    ? `url(${getFilePath(backgroundImage)})`
                    : "none",
                  backgroundSize: "100% 100%",
                  backgroundPosition: "center",
                  position: "relative",
                }}
              >
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

                {/* Logo and Signature */}

                {logo ? (
                  <DraggableImage
                    src={getFilePath(logo)}
                    type="logo"
                    position={logoPosition}
                    setPosition={setLogoPosition}
                    size={logoSize}
                    setSize={setLogoSize}
                    parentRef={certificateRef}
                  />
                ) : (
                  ""
                )}

                {signature ? (
                  <DraggableImage
                    src={getFilePath(signature)}
                    type="signature"
                    position={signaturePosition}
                    setPosition={setSignaturePosition}
                    size={signatureSize}
                    setSize={setSignatureSize}
                    parentRef={certificateRef}
                  />
                ) : (
                  <label className="cursor-pointer text-center">
                    <span>Upload Signature</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSignatureUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>
        </div>

        <Button className="mb-3" onClick={saveCertificate}>
          Save certificate
        </Button>
      </div>
    </>
  );
}
