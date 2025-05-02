import React from "react";
import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import { useSignUp } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Icons } from "../../../components/icons";
import { Button } from "../../../components/ui/button";
function SignUpWithGoogleButton({ title }: { title: string }) {
  const { signUp } = useSignUp();
  const [isHovered, setHovered] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const signInWithGoogle = () => {
    setIsLoading(true);
    signUp?.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: "/sso-callback",
      redirectUrlComplete: "/",
    });
  };
  return (
    <motion.div
      onHoverStart={(e) => setHovered(true)}
      onHoverEnd={(e) => setHovered(false)}
    >
      <Button
        onClick={signInWithGoogle}
        variant="outline"
        type="button"
        disabled={isLoading}
        className="w-full flex items-center justify-center"
      >
        {" "}
        <span className="flex grow items-center justify-center">
          {isLoading ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4 animate-spin"
            >
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <Icons.google className="w-5 h-5 mr-2" />
          )}{" "}
          {title}
        </span>
        <span className="w-5 h-5">
          <MoveRight
            className={cn(
              "transition-all duration-300 ease-in-out text-gray-500",
              isHovered && !isLoading ? "w-5 h-5" : "w-0 h-5"
            )}
          />
        </span>
      </Button>
    </motion.div>
  );
}

export default SignUpWithGoogleButton;
