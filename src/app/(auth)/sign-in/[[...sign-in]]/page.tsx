import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn
      path="/sign-in"
      appearance={{
        elements: {
          card: "p-1",
          cardBox: "shadow-none",
          footer: "hidden",
          // header: "hidden",
          logoBox: "hidden",
          socialButtons: "hidden",
          dividerRow: "hidden",
          formFieldInput: "md:h-[50px] text-lg focus:shadow-none",
          formButtonPrimary: "h-[40px] text-lg",
          input: "md:h-[50px] max-h-[75px]",
          footerActionLink: "hidden",
        },
      }}
    />
  );
}
