// import { Asset } from "./types.work";

// export interface UserDashboardData {
//   id: string;
//   firstName: string;
//   lastName: string;
//   username: string;
//   email: string;
//   profilePicture: string;
//   externalId: string;
//   totalAmountEarned: number;
//   totalAmountSpent: number;
//   overview: Overview;
//   workListings: WorkListing[];
//   submittedWork: SubmittedWork[];
// }

// export interface Overview {
//   totalSubmissions: number;
//   totalAnswers: number;
//   totalTaskSubmissions: number;
//   totalBountySubmissions: number;
//   totalUnclaimedSubmissions: number;
//   unclaimedAnswers: number;
//   unclaimedTaskSubmissions: number;
//   unclaimedBountySubmissions: number;
//   totalTasksCreated: number;
//   totalBountiesCreated: number;
//   totalQuestionsCreated: number;
//   totalListings: number;
//   totalOpenListings: number;
// }

// export interface WorkListing {
//   id: string;
//   createdAt: string;
//   type: string;
//   isRefundApproved: boolean;
//   status: string;
//   totalSubmissions: string;
//   approvedSubmissions: string;
//   title: string;
//   isOpen: boolean;
//   slug: string;
//   asset: Asset;
//   rewardedAmount: number;
//   rewardedPrice: number;
// }

// export interface SubmittedWork {
//   id: string;
//   createdAt: string;
//   type: string;
//   claimId: string;
//   work: {
//     id: string;
//     slug: string;
//     title: string;
//     createdAt: string;
//   };
//   status: string;
//   asset: Asset;
//   createdBy: {
//     profilePicture: string;
//     username: string;
//   };
//   paidAmount: number;
// }
