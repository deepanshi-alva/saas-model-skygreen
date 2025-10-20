" use client";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload } from "lucide-react";
import { Icon } from '@iconify/react';
import { Button } from "@/components/ui/button";
import { getFilePath } from "../../../../../config/file.path";

const FileUploaderSingle = ({ onChange, mediaType = 'image', initialFile = [] }) => {
    const accepts = {
        image: { 'image/*': [".png", ".jpg", ".jpeg"] },
        video: { 'video/*': [".mp4", ".mov", ".avi", ".mkv"] },
        audio: { 'audio/*': [".mp3", ".wav", ".aac"] },
        files: { 'application/*': [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip", ".rar"] }
    };
    const { getRootProps, getInputProps, } = useDropzone({
        multiple: false,
        accept: accepts[mediaType],
        onDrop: (acceptedFiles) => {
            // setFiles(acceptedFiles);
            onChange(acceptedFiles)
        },
    });
    const media = initialFile?.map((file) => {
        if (mediaType === 'image')
            return <img
                key={file?.name || file}
                alt={file?.name || file}
                className="w-full h-full object-cover rounded-md"
                src={file?.name ? URL.createObjectURL(file) : getFilePath(file)}
            />
        if (mediaType === 'video')
            return <video
                key={file?.name || file}
                alt={file?.name || file}
                className="w-full h-full object-cover rounded-md"
                src={file?.name ? URL.createObjectURL(file) : getFilePath(file)}
            />
    });

    const closeTheFile = () => {
        onChange([])
    }
    return (
        <div className={initialFile?.length && "h-[300px] w-full"}>
            {initialFile?.length ? (
                <div className="w-full h-full relative">
                    <Button
                        type="button"
                        className="absolute top-4 right-4 h-12 w-12 rounded-full bg-default-900 hover:bg-background hover:text-default-900 z-20"
                        onClick={closeTheFile}
                    >
                        <span className="text-xl"><Icon icon="fa6-solid:xmark" /></span>
                    </Button>
                    {media}
                </div>
            ) : (
                <div {...getRootProps({ className: "dropzone" })}>
                    <input {...getInputProps()} />

                    <div className="w-full text-center border-dashed border rounded-md py-[52px] flex items-center flex-col">
                        <div className="h-12 w-12 inline-flex rounded-md bg-muted items-center justify-center mb-3">
                            <Upload className="text-default-500" />
                        </div>
                        <h4 className="text-2xl font-medium mb-1 text-card-foreground/80">
                            Drop {mediaType} here or click to upload.
                        </h4>
                        <div className="text-xs text-muted-foreground">
                            (Upload your {mediaType} by dropping them here.)
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default FileUploaderSingle;