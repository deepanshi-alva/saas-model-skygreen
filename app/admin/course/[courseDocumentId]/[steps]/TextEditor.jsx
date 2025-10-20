"use client"
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button";
function TextEditor({ handleClose, handleSave, initialContent }) {
    const { quillRef, quill } = useQuill();
    const [editorContent, setEditorContent] = useState("");
    useEffect(() => {
        if (quill) {
            quill.clipboard.dangerouslyPasteHTML(initialContent);
            setEditorContent(initialContent);
            quill.on("text-change", () => {
                setEditorContent(quill.root.innerHTML);
            });
        }
        return () => {
            if (quill) {
                quill.off("text-change");
            }
        };
    }, [quill]);

    const saveTextContent = () => {
        if (typeof handleSave === 'function')
            handleSave(editorContent)
    }
    const discardChange = () => {
        if (typeof handleClose === 'function')
            handleClose()
    }


    return (
        <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
            <Dialog defaultOpen={true} onOpenChange={() => discardChange()}>
                <DialogContent size="full">
                    <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            Text Content
                        </DialogTitle>
                    </DialogHeader>
                    <div className="text-sm text-default-500  space-y-4 h-screen overflow-y-auto">
                        <div
                            className="snow-editor border border-default-200 h-[700px]"
                            ref={quillRef}
                        >
                        </div>
                        <div className="flex justify-end space-x-2">
                            <Button color="default" variant="outline" onClick={() => discardChange()}>
                                close
                            </Button>
                            <Button color="default" variant="" onClick={() => saveTextContent()}>
                                Save
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default TextEditor