export interface TeleSwapFormData {
  depositAmount: number;
  taskId: string | null;
  depositQuote: string | null;
  depositAddress: string | null;
  status: TeleswapTransactionStatus;
}

export type TeleswapTransactionStatus =
  | "NONE"
  | "QUOTE_FETCHED"
  | "CREATING"
  | "ESCROW_CREATED"
  | "WAITING_RECEIVE_FUNDS"
  | "DEPOSIT_DETECTED"
  | "CREATED"
  | "CLOSED"
  | "FAILED";

export interface MultichainToken {
  id: string;
  name: string;
  label: string;
  symbol: string;
  img: string;
  network: string;
}
