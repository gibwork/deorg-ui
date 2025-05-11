import { Token } from "./types.work";
import { User } from "./user.types";

export interface Vote {
  id: string;
  memberId: string;
  type: "yes" | "no";
  timestamp: string;
}

export interface OrganizationTask {
  id: string;
  title: string;
  description?: string;
  status: "todo" | "in-progress" | "completed" | "blocked";
  priority: "low" | "medium" | "high";
  assignedTo?: string; // Member ID
  createdBy: string; // Member ID
  createdAt: string;
  dueDate?: string;
  completedAt?: string;
  comments?: TaskComment[];
  effortMinutes?: number; // Effort measurement in minutes
  votes?: Vote[]; // Array of votes for this task
  funded?: boolean; // Whether the task has been funded
  fundedAt?: string; // When the task was funded
}

export interface TaskComment {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Member {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: null;
  user: User;
}

export interface ProjectDetails {
  id: string;
  name: string;
  description: string;
  status: string;
  startDate: string;
  dueDate?: string;
  tasks: OrganizationTask[];
  team: string[]; // Member IDs assigned to this project
  organizationId: string;
  activities?: ProjectActivity[]; // Project activity feed
}

export interface ProjectActivity {
  id: string;
  type: "task_created" | "task_assigned" | "comment_added" | "status_changed";
  timestamp: string;
  userId: string; // Member ID who performed the action
  taskId?: string; // Related task if applicable
  description: string;
  metadata?: Record<string, any>; // Additional data specific to the activity type
}

export interface RequiredToken {
  mintAddress: string;
  symbol: string;
  imageUrl: string;
  amount: number;
  decimals: number;
}

export interface OrganizationMetadata {
  logoUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  telegramUrl?: string | null;
  description?: string | null;
}

export interface Organization {
  id: string;
  uuid?: string;
  slug?: string;
  externalId: string;
  accountAddress: string;
  creator?: string; //public-key
  createdBy?: string;
  name: string;
  description?: string;
  logoUrl?: string;
  members: Member[];
  contributors?: string[]; // public-keys
  projects?: ProjectDetails[];
  createdAt: string;
  updatedAt: string;
  tokenMint: string;
  token?: RequiredToken | null;
  multisigWallet?: string;
  hasTreasuryRegistryAccount: boolean;
  treasuryTokenAccount: string;
  treasuryBalance: {
    raw: string;
    ui: number;
    decimals: number;
  };
  contributorProposalThresholdPercentage?: number;
  contributorProposalValidityPeriod?: number;
  treasuryTransferQuorumPercentage?: number;
  treasuryTransferThresholdPercentage?: number;
  treasuryTransferProposalValidityPeriod?: number;
  minimumTokenRequirement?: number;
  contributorValidityPeriod?: number;
  projectProposalValidityPeriod?: number;
  contributorProposalQuorumPercentage?: number;
  projectProposalThresholdPercentage?: number;
  metadata?: OrganizationMetadata;
}
