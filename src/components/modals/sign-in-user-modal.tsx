import { useUserRegistrationModal } from "@/hooks/use-registration-modall";
import { Dialog, DialogContent, DialogHeader } from "../ui/dialog";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useUserSignInModal } from "@/hooks/use-sign-in-modal";

const UserSignInModal = () => {
  const UserSignInModal = useUserSignInModal();

  if (!UserSignInModal.isOpen) return null;
  return (
    <Dialog
      open={UserSignInModal.isOpen}
      onOpenChange={UserSignInModal.onClose}
    >
      <DialogContent
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="max-w-md pt-2"
      >
        <div className="leading-2">
          <h3 className="font-semibold mt-5 text-2xl">Log in with email</h3>
          <p>
            Enter your email address to receive a OTP you can use to log in.
          </p>
        </div>

        <SignIn
          routing="virtual"
          appearance={{
            elements: {
              card: "p-1 shadow-none ",
              cardBox: "shadow-none ",
              footer: "hidden",
              logoBox: "hidden",
              header: "hidden",
              socialButtons: "hidden",
              dividerRow: "hidden",
              formFieldInput: "h-[50px] text-lg focus:shadow-none",
              formButtonPrimary:
                "h-[40px] bg-theme hover:bg-theme/90 dark:text-white text-lg font-semibold",
            },
          }}
        />
      </DialogContent>
    </Dialog>
  );
};

export default UserSignInModal;
