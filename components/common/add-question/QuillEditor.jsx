"use client";
import React, { useEffect, useState } from 'react'
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";

function QuillEditor({onValueChange, value, qna}) {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, false] }], 
            ["bold", "italic", "underline"], 
            [{ list: "ordered" }, { list: "bullet" }],
            ["link", "image"],
            ["clean"],
        ],
    };
    const { quillRef, quill } = useQuill(qna ? {modules} : {});
    useEffect(() => {
        if (quill) {
            quill.clipboard.dangerouslyPasteHTML(value || "");
            quill.on("text-change", () => {
                if(typeof onValueChange === "function")
                onValueChange(quill.root.innerHTML);
            });
        }
        return () => {
            if (quill) {
                quill.off("text-change");
            }
        };
    }, [quill]);

    return (
        <div
            className="bg-card border border-default-200 min-h-[100px] text-base text-default-700 relative"
            ref={quillRef}
        >
            {/* snow-editor  */}
        </div>
    )
}

export default QuillEditor
