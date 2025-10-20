"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

const ExitConfirmation = ({ open, setOpen }) => {
  const router = useRouter();

  const handleAgree = () => {
    // Perform exit logic
    router.push("/public/all-assignments");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base font-medium">
            Are you sure you want to exit?
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-gray-600">
          Exiting will end your attempt, and you may lose your attempt. Do you
          really want to continue?
        </div>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>

          <Button variant="destructive" onClick={handleAgree}>
            Exit
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExitConfirmation;
