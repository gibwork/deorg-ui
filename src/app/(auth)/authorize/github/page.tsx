"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

const GithubAuthorizePage = () => {
  const { user, isLoaded } = useUser();


  const githubData = user?.externalAccounts.find(
    (item) => item.provider === "github"
  );

  useEffect(() => {
    // Notify the parent window about the success
    setTimeout(() => {
      window.opener.postMessage("github_auth_success", window.location.origin);
      // Close the popup window
      window.close();
    }, 1500);
  }, []);

  if (!isLoaded) {
    return <p>Loading..</p>;
  }

  if (githubData?.verification?.status === "verified") {
    return <p>Authorizing, please wait...</p>;
  }

  return <p>Authorization failed please try again</p>;
};

export default GithubAuthorizePage;
