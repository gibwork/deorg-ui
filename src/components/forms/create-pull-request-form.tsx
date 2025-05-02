"use client";

import React from "react";
import TiptapEditor from "../tiptap/tiptap-editor";
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
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button, buttonVariants } from "../ui/button";

import { createAnswer } from "@/actions/post/create-answer";
import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useQueryClient } from "@tanstack/react-query";
import { cn, TipTapEditorCssClasses } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import {
  createPullRequest,
  PullRequestErrorRes,
} from "@/actions/post/create-pull-request";
import { useCreatePRModal } from "@/hooks/use-create-pr-modal";
import { Input } from "../ui/input";
import Link from "next/link";
import { Checkbox } from "../ui/checkbox";
import { AlertCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ErrorResponse } from "@/types/types.error";
const formSchema = z.object({
  title: z.string().max(500).min(4),
  description: z.string().max(10000).min(4),
  consent: z
    .boolean()
    .default(false)
    .refine((val) => val === true, {
      message: "You must agree to the repository guidelines before submitting.",
    }),
});

type FormValues = z.infer<typeof formSchema>;

export function CreatePullRequestForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { bountyId } = useParams<{ bountyId: string }>();
  const loadingModal = useLoadingModal();
  const { responseId, attemptId, onClose } = useCreatePRModal();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    mode: "onChange",
  });

  const [prError, setPrError] = React.useState<PullRequestErrorRes | null>(
    null
  );

  async function onSubmit(data: z.infer<typeof formSchema>) {
    loadingModal.onOpen();
    toast.loading("creating pull req..");
    if (!responseId || !attemptId) return;
    const content = {
      title: data.title,
      description: data.description,
      bountyId,
      responseId,
      attemptId,
    };
    const { error } = await createPullRequest(content);

    if (error) {
      toast.error("Something went wrong");
      toast.dismiss();
      if (typeof error !== "string" && error?.statusCode === 422) {
        setPrError(error as PullRequestErrorRes);
      }
      return loadingModal.onClose();
    }

    form.reset({ title: "", description: "" });
    await queryClient.invalidateQueries({
      queryKey: [`bounties-${bountyId}`],
    });
    await queryClient.invalidateQueries({
      queryKey: ["response", { responseId, bountyId }],
    });
    toast.success("PR created🎉");

    toast.dismiss();
    onClose();
    loadingModal.onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem className={TipTapEditorCssClasses}>
              <FormLabel className="dark:text-gray-200">PR Title</FormLabel>
              <FormControl className="dark:text-foreground">
                <Input value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className={TipTapEditorCssClasses}>
              <FormLabel className="dark:text-gray-200">
                PR Description
              </FormLabel>
              <FormControl className="dark:text-foreground">
                {/* <TiptapEditor content={field.value} onChange={field.onChange} /> */}
                <Textarea value={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="consent"
          render={({ field }) => (
            <FormItem className=" ">
              <div className="flex flex-row items-start space-x-3 space-y-0 ">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Submission Adheres to Repository Guidelines
                  </FormLabel>
                  {/* <FormDescription>
                    You can check guidelines{" "}
                    <Link
                      prefetch={false}
                      rel="noopener noreferrer"
                      target="_blank"
                      href="/link-to-guidelines"
                      className={cn(
                        buttonVariants({ variant: "link" }),
                        "!p-0 !h-0 "
                      )}
                    >
                      here
                    </Link>{" "}
                    .
                  </FormDescription> */}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {prError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{prError?.error && prError?.error?.message}</AlertTitle>
            <AlertDescription>
              {prError?.error?.errors[0]?.message}
            </AlertDescription>
          </Alert>
        )}

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
