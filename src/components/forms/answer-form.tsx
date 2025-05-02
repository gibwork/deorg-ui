"use client";

import React from "react";
import TiptapEditor from "../tiptap/tiptap-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

import { createAnswer } from "@/actions/post/create-answer";
import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useQueryClient } from "@tanstack/react-query";
import { TipTapEditorCssClasses } from "@/lib/utils";

const formSchema = z.object({
  content: z.string().max(10000).min(4),
});

type FormValues = z.infer<typeof formSchema>;

export function AnswerForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { questionId } = useParams();
  const loadingModal = useLoadingModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    mode: "onChange",
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    loadingModal.onOpen();
    const content = {
      content: data.content,
    };
    const response = await createAnswer(content, questionId as string);

    if (response.success) {
      form.reset({ content: "" });
      await queryClient.invalidateQueries({
        queryKey: [`questions-${questionId}`],
      });
      toast.success("Answer posted successfully!");
      router.refresh();
    } else if (response.error) {
      toast.error("Oops!", {
        description: response.error.message,
      });
    }

    loadingModal.onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem className={TipTapEditorCssClasses}>
              <FormLabel />
              <FormControl>
                <TiptapEditor content={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Post your Answer</Button>
      </form>
    </Form>
  );
}
