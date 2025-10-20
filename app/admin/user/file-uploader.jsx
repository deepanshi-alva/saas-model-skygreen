"use client";
import { useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import toast from "react-hot-toast";
import {getFilePath} from "../../../config/file.path"

const FileUploaderSingle = ({ onFileChange, initialImage }) => {
  const [files, setFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState(
    initialImage
      ? `${process.env.NEXT_PUBLIC_API_BASE_URL}${initialImage}`
      : ""
  );
  const fileInputRef = useRef(null);
  const validateFile = (file) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
    //const maxSize = 5 * 1024 * 1024; 
  
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only .png, .jpg, .jpeg are allowed.");
      return false;
    }
  
    // if (file.size > maxSize) {
    //   toast.error("File size exceeds 5MB.");
    //   return false;
    // }
  
    return true;
  };

  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg"],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      const isValid = validateFile(file);

      if (isValid) {
        setFiles([file]);
        setPreviewImage(URL.createObjectURL(file));
        onFileChange(file);
      } else {
        setPreviewImage(""); 
        onFileChange(null); 
      }
    },
  });

  const handleRemoveFile = () => {
    setFiles([]);
    setPreviewImage("");
    onFileChange(null);
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFiles([file]);
      setPreviewImage(URL.createObjectURL(file));
      onFileChange(file);
    }
  };

  useEffect(() => {
    if (initialImage) {
      setPreviewImage(
        initialImage.startsWith("http")
          ? initialImage
          : getFilePath(initialImage)
      );
    }
  }, [initialImage]);

  return (
    <div className="w-full">
      {previewImage ? (
        <div className="relative w-[300px] h-[300px] border-dashed border rounded-md">
          <Button
            type="button"
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600"
            onClick={handleRemoveFile}
          >
            <Icon icon="fa6-solid:xmark" />
          </Button>
          <img
            src={previewImage}
            alt="Profile preview"
            className="w-full h-full object-cover rounded-md"
          />
        </div>
      ) : (
        <div
          {...getRootProps({
            className:
              "dropzone w-[300px] h-[300px] border-dashed border rounded-md p-6 text-center",
          })}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <Avatar className="rounded-full">
              <AvatarImage src={`/images/avatar/avatar-user-new.png`} />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
            <p className="text-sm text-gray-400">(Supports .png, .jpg, .jpeg)</p>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-center">
        <Button
          type="button"
          className="gap-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleUploadClick}
        >
          <Upload className="w-4 h-4" />
          Upload
        </Button>
        <input
          type="file"
          accept=".png,.jpg,.jpeg"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileInputChange}
        />
      </div>
    </div>
  );
};

export default FileUploaderSingle;





