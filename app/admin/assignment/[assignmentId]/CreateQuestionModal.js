"use client";
import React from 'react'
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddQuestion from '../../question-bank/[id]/AddQuestion1'
function CreateQuestionModal({ onClose }) {

    const handleSave = async (data) => {

    }

    return (
        <div className="flex flex-wrap  gap-x-5 gap-y-4 ">
            <Dialog defaultOpen={true} onOpenChange={(value) => { onClose(value) }}>
                <DialogHeader>
                        <DialogTitle className="text-base font-medium text-default-700 ">
                            What is the world's number one tourist destination?
                        </DialogTitle>
                    </DialogHeader>
                <DialogContent size="full">
                    <div className="text-sm text-default-500 space-y-4 overflow-auto justify-center flex max-h-[100vh] min-w-[1024px]">
                        <AddQuestion multiple={false} source={"ASSIGNMENTS"} onSave={handleSave} />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default CreateQuestionModal