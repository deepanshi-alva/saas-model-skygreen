import * as React from "react";
import {
  Check,
} from "lucide-react";
import { PlusCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function Filter({ title, options, onChange, clearFilter }) {
  const [selectedValues, setSelectedValues] = React.useState([])

  const onSelect = (value) => {
    if (selectedValues.includes(value)) {
      setSelectedValues(old => old.filter(ele => ele !== value))
    } else
      setSelectedValues((old) => ([...old, value]))
  }

  React.useEffect(() => {
    if (typeof onChange === 'function') {
      onChange(selectedValues)
    }
  }, [selectedValues])

  React.useEffect(() => {
    setSelectedValues([])
  }, [clearFilter])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <PlusCircle className="ltr:mr-2 rtl:ml-2 h-4 w-4" />
          {title}
          {selectedValues?.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                color="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.length}
              </Badge>
              <div className="hidden space-x-1 rtl:space-x-reverse lg:flex">
                {selectedValues.length > 2 ? (
                  <Badge
                    color="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.length} selected
                  </Badge>
                ) : (
                  selectedValues.map((value) => {
                    const option = options.find(ele => ele.value === value)
                    return <Badge
                      color="secondary"
                      key={option.value}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option.label}
                    </Badge>

                  }))
                }
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((ele, index) => {
                const isSelected = selectedValues.includes(ele.value)

                return <CommandItem key={ele.value} onSelect={() => { onSelect(ele.value) }}>
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className={cn("h-4 w-4")} />
                  </div>
                  <span>{ele.label}</span>
                </CommandItem>
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover >
  );
}
