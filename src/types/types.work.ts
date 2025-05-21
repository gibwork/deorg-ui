// import { User } from "./user.types";

// export interface Question {
//   id: string;
//   title: string;
//   content: string;
//   category: string;
//   status: string;
//   isOpen: boolean;
//   isRefundApproved: boolean;
//   refundTransactionId: string | null;
//   tags: string[];
//   createdAt: string;
//   user: User;
//   asset: Asset;
//   answers: Answer[];
//   isHidden: boolean;
//   isFeatured: boolean;
//   slug: string;
//   deadline: string;
// }

// export interface Answer {
//   id: string;
//   questionId: string;
//   assetId: string;
//   asset: Asset;
//   transactionId: string;
//   content: string;
//   createdAt: string;
//   createdBy: string;
//   status: string;
//   user: User;
//   walletAddress?: string;
// }

// export interface Asset {
//   id: string;
//   mintAddress: string;
//   symbol: string;
//   imageUrl: string;
//   amount: number;
//   decimals: number;
//   price: number;
// }

// export interface NftCollection {
//   id: string;
//   imageUrl: string;
//   isActive: boolean;
//   isVerified: boolean;
//   name: string;
//   symbol: string;
//   address: string;
// }

// export interface Token {
//   amount: number;
//   imageUrl: string;
//   mintAddress: string;
//   symbol: string;
// }

// export interface Github {
//   issue: { url: string; content: string };
// }
// export interface Bounty {
//   id: string;
//   type?: string;
//   title: string;
//   externalUrl: string;
//   overview: string;
//   requirements: string;
//   endsAt: string;
//   tags: string[];
//   isOpen: boolean;
//   isRefundApproved: boolean;
//   refundTransactionId: string | null;
//   createdAt: string;
//   transactionId: string;
//   metadataId: string;
//   user: User;
//   asset: Asset;
//   metadata: Metadata;
//   nftCollectionId?: string;
//   nftCollection?: NftCollection;
//   token?: Token;
//   bountySubmissions: BountySubmission[];
//   isHidden: boolean;
//   isFeatured: boolean;
//   slug: string;
//   deadline: string;
//   remainingAmount?: number;
// }

// export interface BountySubmission {
//   id: string;
//   bountyId: string;
//   status: string;
//   createdBy: string;
//   createdAt: string;
//   user: User;
//   attempts: BountySubmissionAttempts[];
// }

// export interface BountySubmissionAttempts {
//   id: string;
//   bountySubmissionId: string;
//   isApproved: boolean;
//   ghForkDetails: any;
//   ghPullRequestDetails: any;
//   transactionId: string;
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
//   closedAt: string;
//   asset: Asset;
// }

// export interface TaskSubmissionComment {
//   id: string;
//   content: string;
//   taskSubmissionId: string;
//   createdBy: string;
//   createdAt: string;
//   user: User;
// }

// export interface Task {
//   id: string;
//   title: string;
//   content: string;
//   requirements: string;
//   tags: string[];
//   isOpen: boolean;
//   isRefundApproved: boolean;
//   refundTransactionId: string | null;
//   createdAt: string;
//   transactionId: string;
//   user: User;
//   asset: Asset;
//   isHidden: boolean;
//   isFeatured: boolean;
//   isBlinksEnabled: boolean;
//   allowOnlyVerifiedSubmissions: boolean;
//   taskSubmissions: TaskSubmission[];
//   slug: string;
//   deadline: string;
//   type?: string;
//   nftCollectionId?: string;
//   nftCollection?: NftCollection;
//   token?: Token;
//   remainingAmount?: number;
//   taskSubmissionsApprovedCount: number;
//   taskSubmissionsPendingCount: number;
//   taskSubmissionsRejectedCount: number;
// }

// export interface TaskSubmission {
//   id: string;
//   taskId: string;
//   status: string;
//   assetId: string;
//   createdAt: string;
//   content: string;
//   user: User;
//   transaction: Transaction;
//   asset: Asset;
//   rejectReason: string;
//   comments: TaskSubmissionComment[];
// }

// export interface Service {
//   id: string;
//   title: string;
//   content: string;
//   requirements: string;
//   tags: string[];
//   createdAt: string;
//   transactionId: string;
//   user: User;
//   asset: Asset;
//   requests: ServiceRequest[];
//   isOpen?: boolean;
//   isFeatured?: boolean;
//   images: string[];
//   totalAmountEarned: number;
//   slug: string;
// }

// export interface ServiceRequest {
//   id: string;
//   content: string;
//   status: string;
//   statusLabel: string;
//   serviceId: string;
//   assetId: string;
//   createdAt: string;
//   createdBy: string;
//   user: User;
//   transaction: Transaction;
//   asset: Asset;
//   comments: Comment[];
//   service: Service;
//   serviceStatus: string;
//   requirements: string | null;
// }

// export interface Comment {
//   id: string;
//   content: string;
//   createdAt: string;
//   createdBy: string;
//   serviceRequestId: string;
//   user: User;
// }
// export interface UserNft {
//   address: string;
//   symbol: string;
//   name: string;
//   imageURI: string;
//   collectionAddress: string;
//   collectionName: string;
// }

// export interface Transaction {
//   id: string;
//   type: string;
//   statusCode: number;
//   asset: Asset;
// }

// export interface Metadata {
//   id: string;
//   createdAt: string;
//   updatedAt: string;
//   data: any;
// }
