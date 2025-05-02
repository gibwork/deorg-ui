"use client";
import React, { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function GithubAuthButton({
  variant,
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
}) {
  const { user, isLoaded } = useUser();

  const githubData = user?.externalAccounts.find(
    (item) => item.provider === "github"
  );

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
        event.data === "github_auth_success"
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("message", messageListener);

    // Clean up the event listener when the component is unmounted
    return () => window.removeEventListener("message", messageListener);
  };

  const handleAuthorizeGithub = async () => {
    try {
      if (githubData?.verification?.status === "verified") {
        const response2 = await user?.externalAccounts
          .find((item) => item.provider === "github")
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
            "Authorize Github"
          );
        }
      } else {
        const response = await user?.createExternalAccount({
          strategy: "oauth_github",
          redirectUrl: "/authorize/github",
        });

        if (
          response &&
          response.verification?.externalVerificationRedirectURL
        ) {
          popupCenter(
            response.verification.externalVerificationRedirectURL.href,
            "Authorize Github"
          );
        }
      }
    } catch (error) {
      console.log("oauth error", error);
    } finally {
      console.log("");
    }
  };

  if (!isLoaded) return null;

  return (
    <Button
      className={cn(
        variant === "link"
          ? "p-0 m-0 inline !h-0 text-blue-400 font-normal"
          : ""
      )}
      variant={variant}
      onClick={handleAuthorizeGithub}
    >
      Authorize <span className="font-medium tracking-wide pl-1"> Github</span>
    </Button>
  );
}

export default GithubAuthButton;
