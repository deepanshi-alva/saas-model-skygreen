"use client";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Fragment, useState } from "react";
import { Icon } from "@iconify/react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload } from "lucide-react";
const FilePicker = ({ mediaType, multiple = false, closeMediaPiker, handleMediaPicker }) => {
  const accepts = {
    image: { 'image/*': [".png", ".jpg", ".jpeg"] },
    video: { 'video/*': [".mp4", ".mov", ".avi", ".mkv"] },
    audio: { 'audio/*': [".mp3", ".wav", ".aac"] },
    files: { 'application/*': [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip", ".rar"] }
  };
  const [files, setFiles] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    accept: accepts[mediaType],
    multiple,
    onDrop: (acceptedFiles) => {
      setFiles(acceptedFiles);
    },
  });
  const renderFilePreview = (file) => {
    if (file.type.startsWith("image")) {
      return (
        <Image
          width={48}
          height={48}
          alt={file.name}
          src={URL.createObjectURL(file)}
          className=" rounded border p-0.5"
        />
      );
    } else {
      return <Icon icon="tabler:file-description" />;
    }
  };
  const handleRemoveFile = (file) => {
    const uploadedFiles = files;
    const filtered = uploadedFiles.filter((i) => i.name !== file.name);
    setFiles([...filtered]);
  };
  const fileList = files.map((file) => (
    <div
      key={file.name}
      className=" flex justify-between border px-3.5 py-3 my-6 rounded-md"
    >
      <div className="flex space-x-3 items-center">
        <div className="file-preview">{renderFilePreview(file)}</div>
        <div>
          <div className=" text-sm  text-card-foreground">{file.name}</div>
          <div className=" text-xs font-light text-muted-foreground">
            {Math.round(file.size / 100) / 10 > 1000 ? (
              <>{(Math.round(file.size / 100) / 10000).toFixed(1)}</>
            ) : (
              <>{(Math.round(file.size / 100) / 10).toFixed(1)}</>
            )}
            {" kb"}
          </div>
        </div>
      </div>
      <Button
        size="icon"
        color="destructive"
        variant="outline"
        className=" border-none rounded-full"
        onClick={() => handleRemoveFile(file)}
      >
        <Icon icon="tabler:x" className=" h-5 w-5" />
      </Button>
    </div>
  ));
  const handleRemoveAllFiles = () => {
    setFiles([]);
  };

  const handleClose = () => {
    if (typeof closeMediaPiker === 'function')
      closeMediaPiker()
  }

  const handleUpload = () => {
    if (typeof handleMediaPicker === 'function')
      handleMediaPicker(files)
  }


  return (
    <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
      <Dialog defaultOpen={true} onOpenChange={() => handleClose()}>
        <DialogContent size="5xl">
          <DialogHeader>
            <DialogTitle className="text-base font-medium text-default-700 ">
              Upload {mediaType}
            </DialogTitle>
          </DialogHeader>
          <div className="text-sm text-default-500  space-y-4">
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              <div className=" w-full text-center border-dashed border  rounded-md py-[52px] flex  items-center flex-col">
                <div className="h-12 w-12 inline-flex rounded-md bg-muted items-center justify-center mb-3">
                  <Upload className="h-6 w-6 text-default-500" />
                </div>
                <h4 className=" text-2xl font-medium mb-1 text-card-foreground/80">
                  Drop {mediaType}s here or click to upload.
                </h4>
                <div className=" text-xs text-muted-foreground">
                  ( This is just a demo drop zone. Selected {mediaType} are not actually
                  uploaded.)
                </div>
              </div>
            </div>
            {files.length ? (
              <Fragment>
                <div>{fileList}</div>
                <div className=" flex justify-end space-x-2">
                  <Button color="default" variant="outline" onClick={handleRemoveAllFiles}>
                    Remove All
                  </Button>
                  <Button  color="default" variant="" onClick={handleUpload}>
                    Upload
                  </Button>
                </div>
              </Fragment>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FilePicker;