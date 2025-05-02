"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { validateXaccount } from "@/actions/post/validate-x-account";

const XAuthorizePage = () => {
  const { user, isLoaded } = useUser();
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const xData = user?.externalAccounts.find((item) => item.provider === "x");

  useEffect(() => {
    if (!xData) {
      return;
    }

    const validateUser = async () => {
      const { success: isValid, error } = await validateXaccount(
        xData?.username!
      );

      if (isValid) {
        setIsValid(true);
        setLoading(false);
      }

      if (!isValid) {
        setIsValid(false);
        setLoading(false);
        setError("x account may be associated with another user");
      }

      setTimeout(() => {
        window.opener.postMessage("x_auth_success", window.location.origin);
        // Close the popup window
        window.close();
      }, 1500);
    };

    validateUser();
    // Notify the parent window about the success
  }, [xData]);

  if (!isLoaded || loading) {
    return <p>Loading..</p>;
  }

  if (isValid) {
    return <p>Authorizing, please wait...</p>;
  }

  return <p>Authorization failed. { error ? `error: ${error}.` : ""}please try again</p>;
};

export default XAuthorizePage;
