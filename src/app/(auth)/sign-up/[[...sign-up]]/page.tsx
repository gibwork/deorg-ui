import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="">
      <SignUp
        path="/sign-up"
        appearance={{
          elements: {
            card: "p-1",
            cardBox: "shadow-none",
            footer: "hidden",
            // header: "hidden",
            logoBox: "hidden",
            socialButtons: "hidden",
            dividerRow: "hidden",
            formFieldInput: "h-[50px] text-lg focus:shadow-none",
            formButtonPrimary: "h-[40px] text-lg",
            input: "h-[50px] max-h-[75px]",
            formField__phoneNumber: "hidden",
            formFieldAction__emailAddress: "hidden",
          },
        }}
      />
    </div>
  );
}
