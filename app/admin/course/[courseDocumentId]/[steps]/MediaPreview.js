import React, { useState, useCallback, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { getFilePath } from "../../../../../config/file.path";

const renderFilePreview = (file, type) => {
    switch (type) {
        case "images":
            return <Icon icon="material-symbols:image" className="w-8 h-8" />;
        case "videos":
            return <Icon icon="mdi:video" className="w-8 h-8" />;
        case "audios":
            return <Icon icon="i-ant-design:audio-filled" className="w-8 h-8" />;
        default:
            return <Icon icon="mdi:files" className="w-8 h-8" />;
    }
};

// Memoized file size formatter
const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return "0 Bytes";
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
};

const MediaPreview = React.memo(({ files, type, handleMediaRemove, isPublic = false }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Memoized document list
    const docs = useMemo(() => {
        if (type === "files") {
            return files?.map((file) => ({
                uri: getFilePath(file.url),
                fileType: file?.ext?.replace('.', '') || "pdf",
            }));
        }
        return [];
    }, [files, type]);

    // const docs = [
    //     { uri: "https://getsamplefiles.com/download/pptx/sample-1.pptx", fileType: "pptx" },
    //     { uri: "https://wiki.documentfoundation.org/images/4/47/Extlst-test.pptx", fileType: "pptx" },
    //     { uri: "https://pdfobject.com/pdf/sample.pdf" ,fileType: "pdf" },
    //     { uri: "https://www.cmu.edu/blackboard/files/evaluate/tests-example.xls" ,fileType: "xls" },
    //   ];

    // Memoized function to handle file preview
    const handlePreview = useCallback((file) => {
        setSelectedFile(file);
        setIsModalOpen(true);
    }, []);

    // Memoized function to handle file download
    const downloadFile = useCallback((file) => {
        const url = file.id ? getFilePath(file.url) : URL.createObjectURL(file);
        const link = document.createElement("a");
        link.href = url;
        link.target = '_blank';
        link.download = file.name || "download";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, []);
    console.log('files',files, 'type ',type);
    return (
        <>
            {!isPublic && files.map((file, fileIndex) => (
                <div key={file.name} className="col-span-12 lg:col-span-4 inline-flex mr-6">
                    <div className="border border-default-400 py-10 p-6 my-6 rounded-sm showTopicContent">
                        <div className="flex space-x-3 items-center">
                            {renderFilePreview(file, type)}
                            <div>
                                <div className="text-sm text-card-foreground">{file.name}</div>
                                {file.size && (
                                    <div className="text-xs font-light text-muted-foreground">
                                        {formatBytes(file.size || file.fileSize || 0)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="editTopicContent absolute top-1 right-3 gap-1.5">
                            <Button size="icon" variant="outline" className="h-6 w-6 mr-2" onClick={() => downloadFile(file)}>
                                <Icon icon="heroicons:arrow-down-tray" className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-6 w-6 mr-2" onClick={() => handlePreview(file)}>
                                <Icon icon="raphael:view" className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => handleMediaRemove(fileIndex, type)}>
                                <Icon icon="heroicons:trash" className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            ))}

            {isPublic && docs.length > 0 && (
                <div className="w-full h-screen overflow-auto">
                    <DocViewer documents={docs} pluginRenderers={DocViewerRenderers} className="abc" config={{ header: { showToolbar: false } }} theme={{
                        primary: "#FFFFFF",
                        secondary: "#FF8C42",
                    }} />
                </div>
            )}
            {/* {isPublic && files.map((file, fileIndex) => (
                <div className="col-span-12 lg:col-span-12 flex-none mr-6">
                    <div key={file.name} className={`border border-default-400 ${type === 'images' ? "py-0 p-0 border-none" : "py-10 p-6"} my-6 rounded-sm showTopicContent`}>

                        {type === 'images' ?
                            <div className="col-span-12 lg:col-span-4 inline-flex mr-6"><img
                                src={
                                    file.id
                                        ?  + file.url
                                        : URL.createObjectURL(file)
                                }
                                alt={file.name}
                                className="w-full max-h-[500px] object-cover rounded-md shadow-none border-none"
                            /></div> :
                            type !== 'files' ? <div className="flex space-x-3 items-center ">
                                <div className="">
                                    {renderFilePreview(file, type)}
                                </div>
                                <div>
                                    <div className="text-sm text-card-foreground">{file.name}</div>
                                </div>
                            </div>
                                : null}
                        <div className="editTopicContent absolute  top-1 right-3  gap-1.5">

                            <Button size="icon" variant="outline" className=" h-6 w-6 mr-2" onClick={() => downloadFile(file)}>
                                <Icon icon="heroicons:arrow-down-tray" className=" h-4 w-4  " />
                            </Button>

                            <Button size="icon" variant="outline" className=" h-6 w-6 mr-2" onClick={() => handlePreview(file)}>
                                <Icon icon="raphael:view" className=" h-4 w-4  " />
                            </Button>
                        </div>
                    </div>
                </div>
            ))} */}
            {isPublic && Array.isArray(files) && type !== "files"  && files
                .filter(file => file) // Remove null or undefined files
                .map((file, fileIndex) => (
                    <div key={file.name} className="col-span-12 lg:col-span-12 flex-none mr-6">
                        <div className={`border border-default-400 ${type === 'images' ? "py-0 p-0 border-none" : "py-10 p-6"} my-6 rounded-sm showTopicContent`}>

                            {/* Conditional Rendering for Images */}
                            {type === 'images' ? (
                                <div className="col-span-12 lg:col-span-4 inline-flex mr-6">
                                    <img
                                        src={file.id ? getFilePath(file.url) : URL.createObjectURL(file)}
                                        alt={file.name}
                                        className="w-full max-h-[500px] object-cover rounded-md shadow-none border-none"
                                    />
                                </div>
                            ) : type !== 'files' ? (
                                <div className="flex space-x-3 items-center">
                                    {renderFilePreview(file, type)}
                                    <div>
                                        <div className="text-sm text-card-foreground">{file.name}</div>
                                    </div>
                                </div>
                            ) : null}

                            {/* Conditional Rendering for Buttons */}
                            {file && (
                                <div className="editTopicContent absolute top-1 right-3 gap-1.5">
                                    <Button size="icon" variant="outline" className="h-6 w-6 mr-2" onClick={() => downloadFile(file)}>
                                        <Icon icon="heroicons:arrow-down-tray" className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="outline" className="h-6 w-6 mr-2" onClick={() => handlePreview(file)}>
                                        <Icon icon="raphael:view" className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

            {isModalOpen && (
                <Dialog defaultOpen onOpenChange={() => setIsModalOpen(false)}>
                    <DialogContent size={selectedFile?.name?.endsWith(".pdf") ? "full" : "5xl"}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-medium text-default-700">Preview {type}</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-default-500 space-y-4 flex self-center">
                            {type === "images" && (
                                <img src={selectedFile.id ? getFilePath(selectedFile.url) : URL.createObjectURL(selectedFile)}
                                    alt={selectedFile.name} className="rounded-md w-full h-full object-contain" />
                            )}
                            {type === "videos" && (
                                <video controls src={selectedFile.id ? getFilePath(selectedFile.url) : URL.createObjectURL(selectedFile)}
                                    className="w-full max-h-[80vh]" />
                            )}
                            {type === "audios" && (
                                <audio controls src={selectedFile.id ? getFilePath(selectedFile.url) : URL.createObjectURL(selectedFile)}
                                    className="w-full max-h-[80vh]">
                                    Your browser does not support the audio element.
                                </audio>
                            )}
                            {type === "files" && selectedFile?.name?.endsWith(".pdf") && (
                                <div className="h-screen w-full">
                                    <object data={selectedFile.id ? getFilePath(selectedFile.url) : URL.createObjectURL(selectedFile)}
                                        type="application/pdf" width="100%" height="100%" />
                                </div>
                            )}
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    );
});

export default MediaPreview;
