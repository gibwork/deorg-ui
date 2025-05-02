"use client";
import { UserProfile, useUser } from "@clerk/nextjs";
import { useTheme } from "next-themes";
import DecafWallet from "@/features/decaf/components/decaf-wallet";
import VerifyWallet from "@/features/auth/components/verify-wallet";
import PublicApiKey from "@/features/public-api/components/public-api-key";

const UserAccountComponent = () => {
  const { user, isSignedIn, isLoaded } = useUser();
  const { resolvedTheme } = useTheme();

  if (!isLoaded) {
    return null;
  }
  return (
    <div className="w-full lg:max-w-6xl xl:max-w-[1540px] lg:mx-auto px-3 md:p-5 mb-12">
      <h1 className="text-2xl font-semibold pb-5">Account Settings</h1>
      <UserProfile
        path={`/p/${user?.username}/account`}
        appearance={{
          elements: {
            scrollBox: " !h-fit",
            pageScrollBox: "!px-0 md:!px-5",
            navbar: "hidden",
            navbarMobileMenuRow: "hidden",
            card: "p-1 shadow-none md:shadow border-none",
            cardBox: "shadow-none md:shadow  border-none !h-fit",
            footer: "hidden",
            header: "hidden",
            profileSection__profile: "border-none",
            // profileSectionPrimaryButton__emailAddresses: "hidden",
            // menuButton__connectedAccounts: "hidden",
          },
          variables: {
            colorBackground: resolvedTheme === "dark" ? "transparent" : "#fff",
          },
        }}
      />

      <div className="mt-5">
        <VerifyWallet />
      </div>

      {isSignedIn && (
        <div className="mt-5 ">
          <DecafWallet />
        </div>
      )}

      {isSignedIn && (
        <div className="mt-5 ">
          <PublicApiKey />
        </div>
      )}
    </div>
  );
};

export default UserAccountComponent;
