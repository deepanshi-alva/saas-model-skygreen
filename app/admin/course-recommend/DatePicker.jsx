"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useTheme } from "next-themes";

export default function DatePickerWithRange({ className, value, onDateChange }) {
  const { theme: mode } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild className="border w-full">
        <Button
          color={mode === "dark" && "secondary"}
          className={cn(" font-normal", {
            " bg-white text-default-600": mode !== "dark",
          })}
        >
          <div className="w-full flex justify-between p-2">
            {value ? format(value, "LLL dd, y") : <span>----- --</span>}
            <CalendarIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          disabled={{ before: new Date() }}
          initialFocus
          mode="single"
          selected={value || new Date()}
          onSelect={onDateChange}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}
