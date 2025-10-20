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
export default function DatePickerWithRange({ className, defaultValue, value, onDateChange }) {
  const [date, setDate] = React.useState(value || defaultValue);
  const { theme: mode } = useTheme();

  const onChange = (value) => {
    setDate(value)
    if (typeof onDateChange === 'function')
      onDateChange(value)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          color={mode === "dark" && "secondary"}
          className={cn(" font-normal", {
            " bg-white text-default-600": mode !== "dark",
          })}
        >
          <CalendarIcon className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {date ? format(date, "LLL dd, y") :
            <span>Pick a date</span>
          }
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="end">
        <Calendar
          // min={date || new Date()}
          disabled={{ before: new Date() }}
          initialFocus
          mode="single"
          selected={date || new Date()}
          onSelect={onChange}
          numberOfMonths={1}
        />
      </PopoverContent>
    </Popover>
  );
}
