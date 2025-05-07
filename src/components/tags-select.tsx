import * as React from "react";

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
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CheckIcon, PlusCircleIcon } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "./ui/scroll-area";

export function TagsSelect({
  title,
  tags,
  availableTags,
  maxSelectedAllowed,
  onChange,
  disabled,
}: {
  title: string;
  tags: string[];
  availableTags: string[];
  maxSelectedAllowed: number;
  onChange: any;
  disabled: boolean;
}) {
  const selectedValues = new Set(tags as string[]);

  return (
    <Popover modal={true}>
      <PopoverTrigger asChild>
        <Button
          disabled={disabled}
          variant="outline"
          size="sm"
          className="flex h-10 w-fit rounded-md border border-input bg-background px-3 py-0.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusCircleIcon className="mr-2 h-4 w-4" />
          Select {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {availableTags
                  .filter((option) => selectedValues.has(option))
                  .map((option) => (
                    <Badge
                      variant="secondary"
                      key={option}
                      className="rounded-sm px-1 font-normal"
                    >
                      {option}
                    </Badge>
                  ))}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-60 md:max-h-80 overflow-y-scroll overflow-x-hidden no-scrollbar">
              {availableTags.map((option) => {
                const isSelected = selectedValues.has(option);
                return (
                  <CommandItem
                    key={option}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option);
                      } else {
                        if (selectedValues.size === maxSelectedAllowed) {
                          toast.warning(
                            `Only ${maxSelectedAllowed} ${title} can be selected.`
                          );
                          return;
                        }
                        selectedValues.add(option);
                      }
                      const filterValues = Array.from(selectedValues);
                      onChange(filterValues.length ? filterValues : []);
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground "
                          : "opacity-50 [&_svg]:invisible "
                      )}
                    >
                      <CheckIcon className={cn("h-4 w-4")} />
                    </div>

                    <span className="">{option}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center"
                  >
                    Remove {title}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
