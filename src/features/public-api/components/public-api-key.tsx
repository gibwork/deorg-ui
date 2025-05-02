"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUser } from "@clerk/nextjs";

import { Copy, ExternalLink, RefreshCcw } from "lucide-react";

import { toast } from "sonner";
import { LoaderButton } from "@/components/loader-button";
import { getPublicApiKey } from "../actions/get-public-api-key";
import { generatePublicApiKey } from "../actions/generate-public-api-key";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type CardProps = React.ComponentProps<typeof Card>;

const PublicApiKey = ({ className, ...props }: CardProps) => {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const {
    data: apiKeyData,
    error: apiKeyFetchError,
    isLoading: isApiKeyFetchLoading,
  } = useQuery({
    queryKey: [`users-api-key`, { userId: user?.id }],
    queryFn: async () => {
      const apiKey = await getPublicApiKey();
      if (apiKey.error) throw new Error(apiKey.error);
      if (apiKey.success) return apiKey.success;
    },
    enabled: !!user?.id,
  });

  const handleGeneratePublicApiKey = async () => {
    setIsLoading(true);
    setError(null);
    try {
      toast.loading("Generating...");
      const { success, error } = await generatePublicApiKey();

      if (error) {
        setError(error.message);
        throw new Error(error.message);
      }
      await queryClient.invalidateQueries({
        queryKey: [`users-api-key`, { userId: user?.id }],
      });
      toast.success("successfully generated!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      toast.dismiss();
      setIsLoading(false);
    }
  };
  return (
    <Card
      className={cn(
        "max-w-[880px] shadow-none md:shadow border-none",
        className
      )}
      {...props}
    >
      <CardHeader className="!px-5">
        <CardTitle className="flex items-center justify-between">
          <span>API Integration</span>

          <Link
            href="https://gibwork.readme.io/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:underline underline-offset-4"
          >
            <span className="hidden md:block">View API Documentation</span>
            <ExternalLink className="w-4 h-4" />
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div>
          <div className="space-y-4">
            <p className="text-gray-600 dark:text-gray-300">
              Generate an API key to create work directly from your applications
              or bots.
            </p>
          </div>
          {apiKeyData?.apikey ? (
            <div className="space-y-1 mt-5 ">
              <Table className=" border">
                <TableHeader className="bg-muted  ">
                  <TableRow className="">
                    <TableHead>API Key</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium font-mono break-all">
                      {apiKeyData?.apikey}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="xs"
                          title="Copy to Clipboard"
                          onClick={() => {
                            navigator.clipboard
                              .writeText(apiKeyData?.apikey.toString())
                              .then(
                                function () {
                                  /* clipboard successfully set */
                                  toast.success("Copied to clipboard");
                                },
                                function () {
                                  /* clipboard write failed */
                                  toast.error("Failed to copy to clipboard");
                                }
                              );
                          }}
                        >
                          <span className="sr-only">Copy</span>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="xs"
                          title="Regenerate API Key"
                          onClick={handleGeneratePublicApiKey}
                        >
                          <span className="sr-only">Regenerate</span>
                          <RefreshCcw className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <div className="text-sm text-muted-foreground">
                <p>
                  Note: Keep your API key secure. Don&apos;t share it publicly
                  or commit it to version control. Re-generate if compromised.
                </p>
              </div>
            </div>
          ) : (
            <div>
              <LoaderButton
                className="mt-5"
                variant="outline"
                onClick={handleGeneratePublicApiKey}
                isLoading={isLoading}
              >
                {isLoading ? "Generating..." : "Generate API Key"}
              </LoaderButton>

              {error && (
                <p className="text-red-500 text-xs md:text-sm p-1">{error}</p>
              )}
            </div>
          )}

          <Accordion type="multiple" className="w-full mt-5">
            <AccordionItem value="item-1">
              <AccordionTrigger>What does this allow?</AccordionTrigger>
              <AccordionContent>
                <p className=" text-gray-700 dark:text-gray-300">
                  This allows developers to integrate work creation into their
                  own websites, bots, or applications. Any work created using
                  the API will automatically show up on our platform.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicApiKey;
