"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  EditTaskFormDataScheme,
  EditTaskFormDataType,
} from "../schema/edit-task-schema";
import { Task } from "@/types/types.work";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import TiptapEditor from "@/components/tiptap/tiptap-editor";
import { LoaderButton } from "@/components/loader-button";
import { EditTaskDetails } from "../actions/edit-task-details";
export default function EditTaskForm({ task }: { task: Task }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const form = useForm<EditTaskFormDataType>({
    resolver: zodResolver(EditTaskFormDataScheme),
    mode: "onChange",
    defaultValues: {
      content: task.content,
      requirements: task.requirements,
    },
  });

  const processForm: SubmitHandler<EditTaskFormDataType> = async (data) => {
    try {
      const { success, error } = await EditTaskDetails(
        task.id,
        data.content,
        data.requirements
      );
      if (error) throw new Error(error.message);
      await queryClient.invalidateQueries({
        queryKey: [`tasks-${task?.id}`],
        exact: true,
      });
      toast.success("Task updated successfully!");
      router.push(`/tasks/${task?.id}`);
    } catch (error) {
      toast.error("Oops!", {
        description: (error as Error).message,
      });
    } finally {
      // transaction.onEnd();
    }
  };

  return (
    <div className=" w-full max-w-4xl px-4 sm:px-6 grid gap-8">
      <Link
        href={`/tasks/${task?.id}`}
        className="flex group items-center text-muted-foreground text-sm gap-1 mr-auto"
      >
        <ArrowLeft className="size-4 group-hover:-translate-x-1 transition-all" />{" "}
        Back
      </Link>

      <div className="flex flex-col gap-6">
        <div>
          <h3 className="font-semibold text-lg  ">Edit Task</h3>
        </div>
      </div>

      <div className="space-y-2">
        {/* <Label className="md:text-base">Title</Label> */}
        <h1 className="font-semibold text-[1.2rem] [overflow-wrap:anywhere]">
          {task.title}
        </h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="space-y-8">
          <div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel className="md:text-base">Content</FormLabel>
                  <FormDescription>
                    Describe the task in detail; the purpose here is for users
                    to understand what the job/task entails. Save the
                    requirements for the next section.
                  </FormDescription>
                  <FormControl aria-disabled={form.formState.isSubmitting}>
                    <TiptapEditor
                      content={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="requirements"
            render={({ field }) => (
              <FormItem className="">
                <FormLabel className="md:text-base">Guidelines</FormLabel>
                <FormDescription>
                  Provide a detailed explanation of what the submission should
                  include.
                </FormDescription>
                <FormControl aria-disabled={form.formState.isSubmitting}>
                  <TiptapEditor
                    content={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-wrap gap-2 justify-end">
            <Button type="button" variant={"secondary"}>
              Cancel
            </Button>
            <LoaderButton isLoading={form.formState.isSubmitting}>
              Update Task{" "}
            </LoaderButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
