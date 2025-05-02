// "use client";

// import { useParams, useRouter, useSearchParams } from "next/navigation";
// import Image from "next/image";
// import { Button } from "@/components/ui/button";
// import { buttonVariants } from "@/components/ui/button";
// import { Tabs, TabsContent } from "@/components/ui/tabs";
// import { useEffect, useState, useMemo } from "react";
// import {
//   ChevronLeft,
//   Users,
//   FolderKanban,
//   BarChart2,
//   Settings,
//   Clock,
//   DollarSign,
//   ThumbsUp,
//   ThumbsDown,
//   Check,
// } from "lucide-react";
// import { useUser } from "@clerk/nextjs";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { getOrganizationDetails } from "../actions/get-organization-details";
// import { Organization } from "@/types/types.organization";
// import Link from "next/link";
// import { cn } from "@/lib/utils";
// import { RoleDropdown } from "./role-dropdown";
// import { nominateContributor } from "../actions/nominate-contributor";
// import { checkNominationStatus } from "../actions/check-nomination-status";
// import {
//   getContributorVotes,
//   ContributorVotesResponse,
// } from "../actions/get-contributor-votes";
// import { submitContributorVote } from "../actions/submit-contributor-vote";
// import { ContributorVoteCard } from "./contributor-vote-card";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { toast } from "sonner";
// import ProjectsList from "./projects/projects-list";

// const dummyOrg = {
//   id: "123",
//   name: `Organization 123`,
//   description: `This is the detailed description for organization 123. This organization works on various projects and has multiple team members.`,
//   members: [
//     {
//       id: "1",
//       name: "Jane Doe",
//       role: "Admin",
//       ratePerMinute: 0.08,
//       avatar: "/images/avatars/jane-doe.jpg",
//     },
//     {
//       id: "2",
//       name: "John Smith",
//       role: "Member",
//       ratePerMinute: 0.05,
//       avatar: "/images/avatars/john-smith.jpg",
//     },
//     {
//       id: "3",
//       name: "Alice Johnson",
//       role: "Member",
//       ratePerMinute: 0.06,
//       avatar: "/images/avatars/alice-johnson.jpg",
//     },
//   ],
//   projects: [
//     { id: "1", name: "Project Alpha", status: "In Progress" },
//     { id: "2", name: "Project Beta", status: "Completed" },
//     { id: "3", name: "Project Gamma", status: "Planning" },
//   ],
//   payroll: {
//     history: [
//       {
//         id: "p1",
//         date: "2025-04-15",
//         amount: 5000.0,
//         recipient: "Jane Doe",
//         status: "Completed",
//       },
//       {
//         id: "p2",
//         date: "2025-04-01",
//         amount: 4800.0,
//         recipient: "John Smith",
//         status: "Completed",
//       },
//       {
//         id: "p3",
//         date: "2025-03-15",
//         amount: 5200.0,
//         recipient: "Jane Doe",
//         status: "Completed",
//       },
//       {
//         id: "p4",
//         date: "2025-03-01",
//         amount: 4800.0,
//         recipient: "John Smith",
//         status: "Completed",
//       },
//     ],
//     upcomingPayments: [
//       {
//         id: "up1",
//         dueDate: "2025-05-01",
//         amount: 5000.0,
//         recipient: "Jane Doe",
//       },
//       {
//         id: "up2",
//         dueDate: "2025-05-01",
//         amount: 4800.0,
//         recipient: "John Smith",
//       },
//       {
//         id: "up3",
//         dueDate: "2025-05-15",
//         amount: 3500.0,
//         recipient: "Alice Johnson",
//       },
//     ],
//   },
// };

// export default function OrganizationOverview() {
//   const router = useRouter();
//   const params = useParams();
//   const { user } = useUser();

//   const organizationId = params?.id as string;
//   const [memberToNominate, setMemberToNominate] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);
//   const [isNominationDialogOpen, setIsNominationDialogOpen] = useState(false);
//   const [nominatedMemberIds, setNominatedMemberIds] = useState<string[]>([]);
//   const [isCheckingNominations, setIsCheckingNominations] = useState(false);
//   const [memberVotes, setMemberVotes] = useState<
//     Record<string, ContributorVotesResponse | null>
//   >({});
//   const [loadingVotes, setLoadingVotes] = useState<Record<string, boolean>>({});
//   const [voteModalData, setVoteModalData] = useState<{
//     memberId: string;
//     memberName: string;
//     voteData: ContributorVotesResponse;
//     isOpen: boolean;
//   } | null>(null);

//   const queryClient = useQueryClient();

//   const [payrollTab, setPayrollTab] = useState<string>("payees");
//   const searchParams = useSearchParams();
//   const tabParam = searchParams.get("tab");

//   const {
//     data: organization,
//     isLoading,
//     error,
//   } = useQuery({
//     queryKey: ["organization", organizationId],
//     queryFn: async () => {
//       const organization = await getOrganizationDetails(organizationId);
//       if (organization.error) throw new Error(organization.error);
//       return organization!.success as Organization;
//     },
//   });

//   const [activeTab, setActiveTab] = useState<string>("overview");

//   // Get the current user's role and contributor status early
//   const currentUserRole = useMemo(() => {
//     if (!organization || !user) return "MEMBER";
//     return (
//       organization.members.find((member) => member.user.externalId === user.id)
//         ?.role || "MEMBER"
//     );
//   }, [organization, user]);

//   // Check if current user has contributor role or higher
//   const isContributorOrHigher = useMemo(() => {
//     return currentUserRole === "CONTRIBUTOR" || currentUserRole === "ADMIN";
//   }, [currentUserRole]);

//   // Handle the nomination of a member to contributor role
//   const handleNominateMember = async () => {
//     if (memberToNominate) {
//       nominateContributorMutation.mutate({
//         organizationId,
//         candidateId: memberToNominate.id,
//       });
//       setIsNominationDialogOpen(false);
//       setMemberToNominate(null);
//     }
//   };

//   // Set the active tab based on the URL query parameter
//   useEffect(() => {
//     if (
//       tabParam &&
//       [
//         "overview",
//         "members",
//         "projects",
//         "payroll",
//         "activity",
//         "settings",
//       ].includes(tabParam)
//     ) {
//       setActiveTab(tabParam);
//     } else {
//       setActiveTab("overview");
//     }
//   }, [tabParam]);

//   // Fetch vote data for a nominated member
//   const fetchMemberVotes = async (memberId: string) => {
//     if (!organization) return null;

//     setLoadingVotes((prev) => ({ ...prev, [memberId]: true }));

//     try {
//       const result = await getContributorVotes({
//         organizationId: organization.id,
//         memberId: memberId,
//       });

//       if (result.error) {
//         console.error("Error fetching votes:", result.error);
//         setMemberVotes((prev) => ({ ...prev, [memberId]: null }));
//         return null;
//       }

//       setMemberVotes((prev) => ({ ...prev, [memberId]: result.success }));
//       return result.success;
//     } catch (error) {
//       console.error("Error fetching votes:", error);
//       setMemberVotes((prev) => ({ ...prev, [memberId]: null }));
//       return null;
//     } finally {
//       setLoadingVotes((prev) => ({ ...prev, [memberId]: false }));
//     }
//   };

//   // Refresh votes for a member after voting
//   const handleVoteSuccess = (memberId: string) => {
//     fetchMemberVotes(memberId);
//   };

//   // Check nomination status for each eligible member
//   useEffect(() => {
//     if (!organization || !isContributorOrHigher) return;

//     const checkEligibleMembers = async () => {
//       setIsCheckingNominations(true);
//       const nominatedIds: string[] = [];

//       // Only check members who are not already contributors or admins
//       const eligibleMembers = organization.members.filter(
//         (member) => member.role !== "CONTRIBUTOR" && member.role !== "ADMIN"
//       );

//       for (const member of eligibleMembers) {
//         try {
//           const result = await checkNominationStatus({
//             organizationId: organization.id,
//             memberId: member.id,
//           });

//           if (result.success && result.success.nominated) {
//             nominatedIds.push(member.id);
//             // Also fetch vote data for nominated members
//             fetchMemberVotes(member.id);
//           }
//         } catch (error) {
//           console.error("Error checking nomination status:", error);
//         }
//       }

//       setNominatedMemberIds(nominatedIds);
//       setIsCheckingNominations(false);
//     };

//     checkEligibleMembers();
//   }, [organization, isContributorOrHigher]);

//   if (isLoading) {
//     return (
//       <div className="container py-8 flex justify-center items-center min-h-[40vh]">
//         <div className="animate-pulse text-xl">
//           Loading organization details...
//         </div>
//       </div>
//     );
//   }

//   if (!organization) {
//     return (
//       <div className="container py-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold mb-4">Organization not found</h1>
//           <Button onClick={() => router.push("/organizations")}>
//             Back to Organizations
//           </Button>
//         </div>
//       </div>
//     );
//   }

//   // Submit vote for a member
//   const submitVote = async (memberId: string, vote: boolean) => {
//     if (!organization) return;

//     try {
//       const response = await submitContributorVote({
//         organizationId: organization.id,
//         candidateId: memberId,
//         vote,
//       });

//       if (response.error) {
//         throw new Error(response.error.message || "Failed to submit vote");
//       }

//       toast.success(`Vote ${vote ? "approved" : "rejected"} successfully`);

//       // Check if this vote met the threshold to make the member a contributor
//       if (response.success?.thresholdMetByThisVote) {
//         // Invalidate organization data to refresh member roles
//         queryClient.invalidateQueries({
//           queryKey: ["organization", organizationId],
//         });
//       } else {
//         // Just refresh vote data for this member
//         handleVoteSuccess(memberId);
//       }

//       // Close the modal
//       setVoteModalData(null);
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "Failed to submit vote"
//       );
//     }
//   };

//   return (
//     <div className="w-full py-0">
//       {/* Nomination Confirmation Dialog */}
//       <Dialog
//         open={isNominationDialogOpen}
//         onOpenChange={setIsNominationDialogOpen}
//       >
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Nominate as Contributor</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to nominate {memberToNominate?.name} to
//               become a contributor? This will trigger a vote among the
//               organization members.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button
//               variant="outline"
//               onClick={() => setIsNominationDialogOpen(false)}
//             >
//               Cancel
//             </Button>
//             <Button
//               onClick={handleNominateMember}
//               disabled={nominateContributorMutation.isPending}
//             >
//               {nominateContributorMutation.isPending
//                 ? "Nominating..."
//                 : "Confirm Nomination"}
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Vote Modal */}
//       {voteModalData && (
//         <Dialog
//           open={voteModalData.isOpen}
//           onOpenChange={(open) => {
//             if (!open) setVoteModalData(null);
//           }}
//         >
//           <DialogContent>
//             <DialogHeader>
//               <DialogTitle>Vote on Contributor Nomination</DialogTitle>
//               <DialogDescription>
//                 Cast your vote on whether {voteModalData.memberName} should
//                 become a contributor.
//               </DialogDescription>
//             </DialogHeader>
//             <div className="py-4 space-y-4">
//               {/* Progress bar */}
//               <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div
//                   className={cn(
//                     "h-full rounded-full",
//                     voteModalData.voteData.votes.yesPercentage > 50
//                       ? "bg-green-500"
//                       : "bg-red-500"
//                   )}
//                   style={{
//                     width: `${voteModalData.voteData.votes.yesPercentage}%`,
//                   }}
//                 />
//               </div>

//               {/* Vote stats */}
//               <div className="flex justify-between text-sm text-muted-foreground">
//                 <span>
//                   {voteModalData.voteData.votes.yesVotes} Yes (
//                   {voteModalData.voteData.votes.yesPercentage}%)
//                 </span>
//                 <span>
//                   {voteModalData.voteData.votes.noVotes} No (
//                   {100 - voteModalData.voteData.votes.yesPercentage}%)
//                 </span>
//               </div>

//               <div className="text-sm text-muted-foreground">
//                 {voteModalData.voteData.votes.totalVotes} vote
//                 {voteModalData.voteData.votes.totalVotes !== 1 ? "s" : ""} •
//                 Need {voteModalData.voteData.thresholdPercentage}% to approve
//               </div>

//               {voteModalData.voteData.hasMetThreshold && (
//                 <div className="bg-green-50 text-green-700 p-2 rounded-md text-sm flex items-center gap-2">
//                   <Check className="h-4 w-4" />
//                   This nomination has reached the required threshold
//                 </div>
//               )}
//             </div>

//             <DialogFooter className="gap-2">
//               {voteModalData.voteData.hasVoted ? (
//                 <div className="w-full text-center p-2 bg-gray-50 rounded-md">
//                   <p className="text-sm font-medium">
//                     You have already voted:{" "}
//                     {voteModalData.voteData.userVote ? (
//                       <span className="text-green-600 inline-flex items-center">
//                         <ThumbsUp className="h-4 w-4 mr-1" /> Approve
//                       </span>
//                     ) : (
//                       <span className="text-red-600 inline-flex items-center">
//                         <ThumbsDown className="h-4 w-4 mr-1" /> Reject
//                       </span>
//                     )}
//                   </p>
//                 </div>
//               ) : (
//                 <>
//                   <Button
//                     variant="outline"
//                     className="flex-1 border-green-200 hover:bg-green-50 hover:text-green-800"
//                     onClick={() => submitVote(voteModalData.memberId, true)}
//                   >
//                     <ThumbsUp className="h-4 w-4 mr-2" /> Approve
//                   </Button>
//                   <Button
//                     variant="outline"
//                     className="flex-1 border-red-200 hover:bg-red-50 hover:text-red-800"
//                     onClick={() => submitVote(voteModalData.memberId, false)}
//                   >
//                     <ThumbsDown className="h-4 w-4 mr-2" /> Reject
//                   </Button>
//                 </>
//               )}
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>
//       )}

//       <Tabs value={activeTab} defaultValue="overview" className="w-full">
//         {/* Overview Tab */}
//         <TabsContent value="overview" className="mt-0">
//           <div className="grid gap-8 md:grid-cols-2">
//             <div className="p-6">
//               <h2 className="text-xl font-semibold mb-4">Members</h2>
//               <div className="space-y-4">
//                 {organization.members.slice(0, 3).map((member) => (
//                   <div
//                     key={member.id}
//                     className="flex justify-between items-center"
//                   >
//                     <div className="flex items-center gap-3">
//                       <div className="h-10 w-10 rounded-full overflow-hidden relative">
//                         <div className="relative h-10 w-10">
//                           <Image
//                             src={member.user.profilePicture}
//                             alt={`${member.user.username}'s avatar`}
//                             fill
//                             className="object-cover"
//                             onError={(e) => {
//                               // Fallback to initials if image fails to load
//                               const target = e.target as HTMLImageElement;
//                               target.style.display = "none";
//                               const parent = target.parentElement;
//                               if (parent) {
//                                 const fallback = document.createElement("div");
//                                 fallback.className =
//                                   "h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium";
//                                 fallback.textContent =
//                                   member.user.username.charAt(0);
//                                 parent.appendChild(fallback);
//                               }
//                             }}
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <p className="font-medium">
//                           {member.user.firstName} {member.user.lastName}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {member.role}
//                         </p>
//                       </div>
//                     </div>
//                     <Link
//                       className={cn(
//                         buttonVariants({ variant: "outline", size: "sm" }),
//                         "w-fit"
//                       )}
//                       href={`/p/${member.user.username}`}
//                       rel="noopener noreferrer"
//                       target="_blank"
//                     >
//                       View Profile
//                     </Link>
//                   </div>
//                 ))}
//                 {organization.members.length > 3 && (
//                   <Button
//                     variant="link"
//                     onClick={() => {
//                       const element = document.querySelector(
//                         '[data-value="members"]'
//                       ) as HTMLElement;
//                       if (element) element.click();
//                     }}
//                   >
//                     View all members
//                   </Button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Members Tab */}
//         <TabsContent value="members" className="mt-0">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold">All Members</h2>
//               <Button>Add Member</Button>
//             </div>
//             <div className="space-y-4">
//               {organization.members.map((member) => (
//                 <div
//                   key={member.id}
//                   className="flex justify-between items-center border-b pb-4"
//                 >
//                   <div className="flex items-center gap-3">
//                     <div className="h-10 w-10 rounded-full overflow-hidden relative">
//                       <div className="relative h-10 w-10">
//                         <Image
//                           src={member.user.profilePicture}
//                           alt={`${member.user.username}'s avatar`}
//                           fill
//                           className="object-cover"
//                           onError={(e) => {
//                             // Fallback to initials if image fails to load
//                             const target = e.target as HTMLImageElement;
//                             target.style.display = "none";
//                             const parent = target.parentElement;
//                             if (parent) {
//                               const fallback = document.createElement("div");
//                               fallback.className =
//                                 "h-full w-full flex items-center justify-center bg-primary/10 text-primary font-medium";
//                               fallback.textContent =
//                                 member.user.username.charAt(0);
//                               parent.appendChild(fallback);
//                             }
//                           }}
//                         />
//                       </div>
//                     </div>
//                     <div>
//                       <p className="font-medium">
//                         {member.user.firstName} {member.user.lastName}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         {member.role}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     {/* Only show Nominate button if:
//                         1. Current user is contributor or admin
//                         2. The member is not already a contributor or admin
//                         3. The member is not the current user
//                         4. The member is not already nominated */}
//                     {isContributorOrHigher &&
//                       member.role !== "CONTRIBUTOR" &&
//                       member.role !== "ADMIN" &&
//                       member.user.externalId !== user?.id &&
//                       !nominatedMemberIds.includes(member.id) && (
//                         <Button
//                           variant="outline"
//                           size="sm"
//                           onClick={() => {
//                             setMemberToNominate({
//                               id: member.id,
//                               name: `${member.user.firstName} ${member.user.lastName}`,
//                             });
//                             setIsNominationDialogOpen(true);
//                           }}
//                         >
//                           Nominate as Contributor
//                         </Button>
//                       )}

//                     {/* Show ContributorVoteCard if this member has a pending nomination */}
//                     {isContributorOrHigher &&
//                       nominatedMemberIds.includes(member.id) && (
//                         <ContributorVoteCard
//                           organizationId={organization.id}
//                           memberId={member.id}
//                           memberName={`${member.user.firstName} ${member.user.lastName}`}
//                           voteData={memberVotes[member.id] || null}
//                           isLoading={loadingVotes[member.id] || false}
//                           onOpenVoteModal={(memberId, memberName, voteData) => {
//                             setVoteModalData({
//                               memberId,
//                               memberName,
//                               voteData,
//                               isOpen: true,
//                             });
//                           }}
//                         />
//                       )}

//                     <Link
//                       className={cn(
//                         buttonVariants({ variant: "outline", size: "sm" }),
//                         "w-fit"
//                       )}
//                       href={`/p/${member.user.username}`}
//                       rel="noopener noreferrer"
//                       target="_blank"
//                     >
//                       View Profile
//                     </Link>

//                     {/* <RoleDropdown
//                       currentRole={member.role}
//                       memberId={member.id}
//                       organizationId={organization.id}
//                       currentUserRole={currentUserRole}
//                       memberExternalId={member.user.externalId}
//                     /> */}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </TabsContent>

//         {/* Projects Tab */}
//         <TabsContent value="projects" className="mt-0">
//           <ProjectsList currentUserRole={currentUserRole} />
//         </TabsContent>

//         {/* Payroll Tab */}
//         <TabsContent value="payroll" className="mt-0">
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-xl font-semibold">Payroll Management</h2>
//               <Button>Process Payment</Button>
//             </div>

//             {/* Inner navigation for Payroll */}
//             <div className="border-b mb-6">
//               <div className="flex space-x-8">
//                 <button
//                   className={`pb-2 px-1 ${
//                     payrollTab === "payees"
//                       ? "border-b-2 border-primary font-medium"
//                       : "text-muted-foreground"
//                   }`}
//                   onClick={() => setPayrollTab("payees")}
//                 >
//                   All Payees
//                 </button>
//                 <button
//                   className={`pb-2 px-1 ${
//                     payrollTab === "transactions"
//                       ? "border-b-2 border-primary font-medium"
//                       : "text-muted-foreground"
//                   }`}
//                   onClick={() => setPayrollTab("transactions")}
//                 >
//                   Transactions
//                 </button>
//               </div>
//             </div>

//             {/* Conditional content based on selected tab */}
//             {payrollTab === "payees" ? (
//               <div>
//                 <div className="mb-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h3 className="text-lg font-medium">Team Members</h3>
//                     <Button variant="outline" size="sm">
//                       Add Payee
//                     </Button>
//                   </div>

//                   <div className="overflow-hidden rounded-md border">
//                     <table className="w-full text-sm">
//                       <thead>
//                         <tr className="bg-muted/50">
//                           <th className="py-3 px-4 text-left font-medium">
//                             Name
//                           </th>
//                           <th className="py-3 px-4 text-left font-medium">
//                             Role
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Rate
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Total Paid
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Next Payment
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Actions
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {dummyOrg.members.map((member) => {
//                           // Calculate total paid to this member
//                           const totalPaid =
//                             dummyOrg.payroll?.history
//                               .filter(
//                                 (payment) => payment.recipient === member.name
//                               )
//                               .reduce(
//                                 (sum, payment) => sum + payment.amount,
//                                 0
//                               ) || 0;

//                           // Find next payment for this member
//                           const nextPayment =
//                             dummyOrg.payroll?.upcomingPayments.find(
//                               (payment) => payment.recipient === member.name
//                             );

//                           return (
//                             <tr key={member.id} className="border-t">
//                               <td className="py-3 px-4 font-medium">
//                                 {member.name}
//                               </td>
//                               <td className="py-3 px-4">{member.role}</td>
//                               <td className="py-3 px-4 text-right">
//                                 ${member.ratePerMinute?.toFixed(3) || "0.000"}
//                                 /min
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 ${totalPaid.toFixed(2)}
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 {nextPayment ? (
//                                   <div>
//                                     <div>${nextPayment.amount.toFixed(2)}</div>
//                                     <div className="text-xs text-muted-foreground">
//                                       {new Date(
//                                         nextPayment.dueDate
//                                       ).toLocaleDateString()}
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <span className="text-muted-foreground">
//                                     No upcoming payment
//                                   </span>
//                                 )}
//                               </td>
//                               <td className="py-3 px-4 text-right">
//                                 <Button variant="outline" size="sm">
//                                   Pay
//                                 </Button>
//                               </td>
//                             </tr>
//                           );
//                         })}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div>
//                 {/* Payment History Section */}
//                 <div>
//                   <h3 className="text-lg font-medium mb-4">Payment History</h3>
//                   <div className="overflow-hidden rounded-md border">
//                     <table className="w-full text-sm">
//                       <thead>
//                         <tr className="bg-muted/50">
//                           <th className="py-3 px-4 text-left font-medium">
//                             Recipient
//                           </th>
//                           <th className="py-3 px-4 text-left font-medium">
//                             Date
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Amount
//                           </th>
//                           <th className="py-3 px-4 text-right font-medium">
//                             Status
//                           </th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {dummyOrg.payroll?.history.map((payment) => (
//                           <tr key={payment.id} className="border-t">
//                             <td className="py-3 px-4">{payment.recipient}</td>
//                             <td className="py-3 px-4">
//                               {new Date(payment.date).toLocaleDateString()}
//                             </td>
//                             <td className="py-3 px-4 text-right">
//                               ${payment.amount.toFixed(2)}
//                             </td>
//                             <td className="py-3 px-4 text-right">
//                               <span
//                                 className={`inline-flex items-center rounded-full px-2 py-1 text-xs ${
//                                   payment.status === "Completed"
//                                     ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
//                                     : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
//                                 }`}
//                               >
//                                 {payment.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </TabsContent>

//         {/* Activity Tab */}
//         <TabsContent value="activity" className="mt-0">
//           <div className="p-6">
//             <h2 className="text-xl font-semibold mb-6">Recent Activity</h2>
//             <div className="space-y-4">
//               <div className="flex gap-4 border-b pb-4">
//                 <div className="w-16 text-sm text-muted-foreground">
//                   Just now
//                 </div>
//                 <div>
//                   <p>
//                     <span className="font-medium">Jane Doe</span> updated
//                     Project Alpha status to &quot;In Progress&quot;
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-4 border-b pb-4">
//                 <div className="w-16 text-sm text-muted-foreground">2h ago</div>
//                 <div>
//                   <p>
//                     <span className="font-medium">John Smith</span> added a new
//                     task to Project Beta
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-4 border-b pb-4">
//                 <div className="w-16 text-sm text-muted-foreground">1d ago</div>
//                 <div>
//                   <p>
//                     <span className="font-medium">Alice Johnson</span> joined
//                     the organization
//                   </p>
//                 </div>
//               </div>
//               <div className="flex gap-4 border-b pb-4">
//                 <div className="w-16 text-sm text-muted-foreground">3d ago</div>
//                 <div>
//                   <p>
//                     <span className="font-medium">Jane Doe</span> created
//                     Project Gamma
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </TabsContent>

//         {/* Settings Tab */}
//         <TabsContent value="settings" className="mt-0">
//           <div className="p-6">
//             <h2 className="text-xl font-semibold mb-6">
//               Organization Settings
//             </h2>
//             <div className="space-y-6">
//               <div>
//                 <h3 className="text-lg font-medium mb-2">
//                   General Information
//                 </h3>
//                 <div className="space-y-4">
//                   <div>
//                     <label className="block text-sm font-medium text-muted-foreground mb-1">
//                       Organization Name
//                     </label>
//                     <input
//                       type="text"
//                       className="w-full border rounded-md px-3 py-2"
//                       value={organization.name}
//                       readOnly
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium text-muted-foreground mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       className="w-full border rounded-md px-3 py-2"
//                       rows={3}
//                       value={organization.description}
//                       readOnly
//                     />
//                   </div>
//                   <Button>Edit Information</Button>
//                 </div>
//               </div>

//               <div className="border-t pt-6">
//                 <h3 className="text-lg font-medium mb-2">Permissions</h3>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Member Invitations</p>
//                       <p className="text-sm text-muted-foreground">
//                         Allow members to invite others
//                       </p>
//                     </div>
//                     <Button variant="outline">Configure</Button>
//                   </div>
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Project Creation</p>
//                       <p className="text-sm text-muted-foreground">
//                         Who can create new projects
//                       </p>
//                     </div>
//                     <Button variant="outline">Configure</Button>
//                   </div>
//                 </div>
//               </div>

//               <div className="border-t pt-6">
//                 <h3 className="text-lg font-medium mb-2 text-red-500">
//                   Danger Zone
//                 </h3>
//                 <div className="space-y-4">
//                   <div className="flex items-center justify-between">
//                     <div>
//                       <p className="font-medium">Delete Organization</p>
//                       <p className="text-sm text-muted-foreground">
//                         This action cannot be undone
//                       </p>
//                     </div>
//                     <Button variant="destructive">Delete</Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
