export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture: string;
  externalId: string;
  createdAt: string;
  githubMetadata: any;
  totalAmountEarned: number;
  totalAmountSpent: number;
  percentRank: number;
  isPhoneVerified: boolean;
  xAccount: string;
  xAccountVerified: boolean;
  decafSolWallet: string;
  primaryWallet: string;
  totalReferrals: number;
}
