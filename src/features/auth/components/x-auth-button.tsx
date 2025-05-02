"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";

function XAuthButton({
  variant,
  className,
  buttonText,
}: {
  variant:
    | "link"
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "ghost"
    | null
    | undefined;
  className?: string;
  buttonText?: string;
}) {
  const { user, isLoaded } = useUser();

  const xData = user?.externalAccounts.find((item) => item.provider === "x");

  const popupCenter = (url: string, title: string) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    // newWindow = window.open(
    //   url,

    //   title,
    //   `width=${500 / systemZoom},height=${
    //     550 / systemZoom
    //   },top=${top},left=${left}`
    // );

    // newWindow?.focus();

    const authWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},height=${
        550 / systemZoom
      },top=${top},left=${left}`
    );

    const messageListener = (event: any) => {
      if (
        event.origin === window.location.origin &&
        event.data === "x_auth_success"
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("message", messageListener);

    // Clean up the event listener when the component is unmounted
    return () => window.removeEventListener("message", messageListener);
  };

  const handleAuthorizeX = async () => {
    try {
      if (xData?.verification?.status === "verified") {
        const response2 = await user?.externalAccounts
          .find((item) => item.provider === "x")
          ?.reauthorize({
            redirectUrl: "/p/username",
            additionalScopes: ["repo"],
          });

        if (
          response2 &&
          response2.verification?.externalVerificationRedirectURL
        ) {
          popupCenter(
            response2.verification.externalVerificationRedirectURL.href,
            "Authorize X"
          );
        }
      } else {
        const response = await user?.createExternalAccount({
          strategy: "oauth_x",
          redirectUrl: "/authorize/x",
        });

        if (
          response &&
          response.verification?.externalVerificationRedirectURL
        ) {
          popupCenter(
            response.verification.externalVerificationRedirectURL.href,
            "Authorize X"
          );
        }
      }
    } catch (error) {
      console.log("oauth error", error);
    } finally {
      console.log("");
    }
  };

  if (!isLoaded || xData?.verification?.status === "verified") return null;

  return (
    <Button
      className={cn(
        variant === "link"
          ? `p-0 m-0 inline !h-0 text-blue-400 font-normal ${className}`
          : `${className}`
      )}
      variant="outline"
      onClick={handleAuthorizeX}
    >
      {buttonText ? buttonText : (
        <>
          Verify Your <Icons.x className="w-4 h-4 mx-1" /> Account
        </>
      )}
    </Button>
  );
}

export default XAuthButton;
