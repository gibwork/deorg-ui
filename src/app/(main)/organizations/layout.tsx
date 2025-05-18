import Banner from "@/features/banner/banner";
import React from "react";

function OrganizationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen w-full overflow-hidden">
      <Banner />
      {children}
    </div>
  );
}

export default OrganizationsLayout;
