import { redirect } from 'next/navigation';

export default function VerifyEmailAddress() {
  return redirect("/sign-in/factor-one")
}