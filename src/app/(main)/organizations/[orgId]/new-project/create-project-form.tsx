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
import { useRouter, useParams } from "next/navigation";
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
import { CalendarIcon, FileText, DollarSign } from "lucide-react";
import { createProject } from "@/features/organizations/actions/projects/create-project";
import TiptapEditor from "@/components/tiptap/tiptap-editor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const createProjectFormSchema = z.object({
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
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        // Get the text content without HTML tags
        const textContent = tempDiv.textContent || "";
        return textContent.length >= 10;
      },
      {
        message: "Project details must be at least 10 characters",
      }
    )
    .refine(
      (content) => {
        // Create a temporary div to parse HTML
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = content;
        // Get the text content without HTML tags
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

type CreateProjectFormDataType = z.infer<typeof createProjectFormSchema>;

const FORM_STEPS = [
  {
    id: "details",
    name: "Details",
    fields: ["name", "description"],
  },
  {
    id: "content",
    name: "Project Details",
    fields: ["content"],
  },
  {
    id: "budget",
    name: "Budget & Date",
    fields: ["budget", "estimatedCompletionDate", "votingDeadline"],
  },
];

export default function CreateProjectForm() {
  const router = useRouter();
  const params = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState(false);

  const form = useForm<CreateProjectFormDataType>({
    resolver: zodResolver(createProjectFormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      description: "",
      content: "",
      budget: 1,
      votingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // Default to 24 hours from now
    },
  });

  const handleSubmit = async (data: CreateProjectFormDataType) => {
    if (data.budget < 10) {
      setShowBudgetWarning(true);
      setPendingSubmit(true);
      return;
    }
    await submitForm(data);
  };

  const submitForm = async (data: CreateProjectFormDataType) => {
    setIsLoading(true);
    try {
      const requiredTokenData = {
        mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        symbol: "USDC",
        imageUrl:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
        amount: data.budget!,
      };
      const response = await createProject({
        name: data.name,
        description: data.description || "",
        content: data.content,
        token: requiredTokenData,
        votingDeadline: data.votingDeadline.toISOString(),
        projectDeadline: data.estimatedCompletionDate.toISOString(),
        organizationId: params.id as string,
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast.success("Project created successfully!");
      router.push(`/organizations/${params.id}?tab=projects`);
    } catch (error) {
      toast.error("Failed to create project. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = async () => {
    const fieldsToValidate = FORM_STEPS.slice(0, currentStep + 1).flatMap(
      (step) => step.fields
    );

    const output = await form.trigger(fieldsToValidate as any, {
      shouldFocus: true,
    });

    if (!output) return;

    if (currentStep < FORM_STEPS.length - 1) {
      setCurrentStep((step) => step + 1);
    } else {
      await form.handleSubmit(handleSubmit)();
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === FORM_STEPS.length - 1;

  return (
    <>
      <div className="w-full max-w-4xl mx-auto bg-background rounded-lg shadow">
        <div className="p-4 sm:p-6">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 text-muted-foreground mr-2">
              {currentStep === 0 && <FileText className="h-5 w-5" />}
              {currentStep === 1 && <FileText className="h-5 w-5" />}
              {currentStep === 2 && <CalendarIcon className="h-5 w-5" />}
            </div>
            <h2 className="text-lg sm:text-xl font-semibold">
              {currentStep === 0 && "What's your project about?"}
              {currentStep === 1 && "Add detailed project information"}
              {currentStep === 2 && "Set budget and timeline"}
            </h2>
          </div>

          <div className="border-b mb-6 overflow-x-auto">
            <div className="flex min-w-max">
              {FORM_STEPS.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "px-3 sm:px-4 py-2 text-sm font-medium cursor-pointer whitespace-nowrap",
                    index === currentStep
                      ? "text-primary border-b-2 border-primary"
                      : "text-muted-foreground"
                  )}
                  onClick={() => {
                    if (index < currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                >
                  {step.name}
                </div>
              ))}
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {currentStep === 0 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Title
                        </FormLabel>
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
                        <FormLabel className="text-sm font-medium">
                          Description
                        </FormLabel>
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
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
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
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                                  if (
                                    e.key === "-" ||
                                    e.key === "e" ||
                                    e.key === "E"
                                  ) {
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
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
                                  {field.value
                                    ? format(field.value, "PPP p")
                                    : format(
                                        new Date(
                                          Date.now() + 24 * 60 * 60 * 1000
                                        ),
                                        "PPP p"
                                      )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start"
                            >
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date < new Date() ||
                                  date < new Date("1900-01-01")
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

                  <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                    <p className="font-medium mb-1">About Voting Deadline:</p>
                    <p>
                      Set when voting for this project will end. This helps
                      ensure timely decision-making and project progression. The
                      default deadline is set to 24 hours from now.
                    </p>
                  </div>
                </div>
              )}

              <div className="mt-6 flex flex-col sm:flex-row justify-between gap-4 sm:gap-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0 || isLoading}
                  className="w-full sm:w-auto"
                >
                  {currentStep === 0 ? "Cancel" : "Back"}
                </Button>

                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLastStep ? "Create" : "Next"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>

      <Dialog open={showBudgetWarning} onOpenChange={setShowBudgetWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Low Budget Warning</DialogTitle>
            <DialogDescription>
              Your project budget is less than $10. Projects with lower budgets
              may receive less attention from contributors.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowBudgetWarning(false);
                setPendingSubmit(false);
              }}
            >
              Go Back
            </Button>
            <Button
              onClick={async () => {
                setShowBudgetWarning(false);
                if (pendingSubmit) {
                  await submitForm(form.getValues());
                  setPendingSubmit(false);
                }
              }}
            >
              Continue Anyway
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
