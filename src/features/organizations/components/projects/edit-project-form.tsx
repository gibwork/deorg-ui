"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, FileText } from "lucide-react";
import TiptapEditor from "@/components/tiptap/tiptap-editor";

const editProjectFormSchema = z.object({
  name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(50, "Project name must not be longer than 50 characters"),
  description: z
    .string()
    .max(100, "Description must not be longer than 100 characters")
    .optional(),
  content: z
    .string()
    .refine(
      (content) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || "";
        return textContent.length >= 10;
      },
      {
        message: "Project details must be at least 10 characters",
      }
    )
    .refine(
      (content) => {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || "";
        return textContent.length <= 10000;
      },
      {
        message: "Project details must not exceed 10000 characters",
      }
    ),
  estimatedCompletionDate: z.date({
    required_error: "Estimated completion date is required",
  }),
  budget: z.coerce
    .number({
      required_error: "Budget is required",
    })
    .min(1, "Budget must be greater than 1"),
  votingDeadline: z.date({
    required_error: "Voting deadline is required",
  }),
});

type EditProjectFormDataType = z.infer<typeof editProjectFormSchema>;

interface EditProjectFormProps {
  project: any;
  onClose: () => void;
}

export function EditProjectForm({ project, onClose }: EditProjectFormProps) {
  const router = useRouter();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<EditProjectFormDataType>({
    resolver: zodResolver(editProjectFormSchema),
    mode: "onChange",
    defaultValues: {
      name: project.name,
      description: project.description || "",
      content: project.content || "",
      budget: project.token?.amount || 1,
      estimatedCompletionDate: new Date(project.projectDeadline),
      votingDeadline: new Date(project.votingDeadline),
    },
  });

  const handleSubmit = async (data: EditProjectFormDataType) => {
    setIsLoading(true);
    try {
      // TODO: Implement update project action
      toast.success("Project updated successfully!");
      onClose();
      router.refresh();
    } catch (error) {
      toast.error("Failed to update project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter project title"
                  className="w-full"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a description to help team members understand your project..."
                  className="h-24 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">
                Project Details
              </FormLabel>
              <FormDescription className="text-sm text-muted-foreground mb-3">
                Include information about:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Project goals and objectives</li>
                  <li>Key milestones and deliverables</li>
                  <li>Technical requirements</li>
                  <li>Team structure and roles</li>
                </ul>
              </FormDescription>
              <FormControl>
                <div className="border rounded-lg overflow-hidden">
                  <TiptapEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Project Budget
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="pl-8 w-full"
                      min={1}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "e" || e.key === "E") {
                          e.preventDefault();
                        }
                      }}
                      {...field}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="estimatedCompletionDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Completion Date
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Select date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="votingDeadline"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-medium">
                  Voting Deadline
                </FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP p")
                        ) : (
                          <span>Select date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
