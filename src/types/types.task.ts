//enum for status
export enum TaskStatus {
    Proposed = "proposed",
    Approved = "approved",
    Ready = "ready",
    Completed = "completed",
    Rejected = "rejected",
    Paid = "paid",
}
export interface Task {
    accountAddress: string;
    project: string;
    title: string;
    paymentAmount: number;
    assignee: string;
    votesFor: number;
    votesAgainst: number;
    status: TaskStatus;
    vault: string;    
    voters: string[];
    tokenInfo: TokenInfo;
}

export interface TokenInfo {
    mint: string;
    symbol: string;
    decimals: number;
    balance: number;
    uiBalance: number;
}