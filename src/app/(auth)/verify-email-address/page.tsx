import { redirect } from 'next/navigation';

export default function VerifyEmailAddress() {
  return redirect("/sign-up/verify-email-address")
}