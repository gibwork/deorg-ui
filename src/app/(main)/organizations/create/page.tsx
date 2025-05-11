import OrganizationLayoutHeader from "@/features/organizations/components/organization-layout-header";
import { CreateOrganizationForm } from "./create-organization-form";

export default function CreateOrganizationPage() {
  return (
    <section className="h-[20vh] w-screen bg-[radial-gradient(169.40%_89.55%_at_94.76%_6.29%,rgba(129,81,253,0.20)_0%,rgba(255,255,255,0.00)_100%)]">
      <OrganizationLayoutHeader />
      <div className="container py-8 px-1">
        <CreateOrganizationForm />
      </div>
    </section>
  );
}
