import { redirect } from 'next/navigation';

export default function SSOCallBack() {
  return redirect("/sign-in/sso-callback")
}