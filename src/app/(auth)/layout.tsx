import type { Metadata } from "next";
import Header from "./header";

export const metadata: Metadata = {
  title: "DeOrg",
  description: "Decentralized Organizations",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />

      <div className="min-h-screen w-full overflow-hidden flex items-center justify-center mt-5">
        {children}
      </div>
    </>
  );
}
