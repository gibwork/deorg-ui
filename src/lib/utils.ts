import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const truncate = (str: string, startLength = 10, endLength = 4) => {
  if (str.length <= startLength + endLength) {
    return str;
  }
  const start = str.slice(0, startLength);
  const end = str.slice(str.length - endLength);
  return `${start}...${end}`;
};

export const truncateContent = (content: string, limit = 155) => {
  if (!content) return "";
  const cleanedContent = content.replace(/<[^>]+>/g, "");

  if (cleanedContent.length <= limit) {
    return cleanedContent;
  }

  const truncated = cleanedContent.substring(0, limit);

  const lastSpaceIndex = truncated.lastIndexOf(" ");

  return truncated.substring(0, lastSpaceIndex) + " | Gibwork";
};

export const TipTapEditorCssClasses =
  "prose prose-headings:m-0 prose-headings:text-foreground/85 prose-headings:font-semibold prose-p:m-0 prose-headings:text-lg prose-strong:font-semibold prose-strong:text-foreground/85 antialiased text-base";

export const getDisplayDecimalAmountFromAsset = (
  amount: number,
  decimals: number
) => {
  return amount / Math.pow(10, decimals);
};

//TODO: these mint addresses change based on environment
export const getSupportedTokens = () => {
  return [
    {
      symbol: "WORK",
      imgUrl:
        "https://ipfs.io/ipfs/QmRrXtSRKSjiqaXYdHZVXmNTcoy2FXXR7jPeET97Cu66rx",
      mintAddress: "F7Hwf8ib5DVCoiuyGr618Y3gon429Rnd1r5F9R5upump",
      decimals: 6,
    },
    {
      symbol: "SOL",
      imgUrl: "https://cdn.gib.work/token-images/solana.png",
      mintAddress: "So11111111111111111111111111111111111111112",
      decimals: 9,
    },
    {
      symbol: "USDC",
      imgUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      mintAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      decimals: 6,
    },
    {
      symbol: "BONK",
      imgUrl:
        "https://assets.coingecko.com/coins/images/35814/standard/imresizer-1709790961908.jpg",
      mintAddress: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
      decimals: 5,
    },
    {
      symbol: "DEAN",
      imgUrl: "https://app.mango.markets/icons/dean.svg",
      mintAddress: "Ds52CDgqdWbTWsua1hgT3AuSSy4FNx2Ezge1br3jQ14a",
      decimals: 6,
    },
    {
      symbol: "SEND",
      imgUrl: "https://media.gib.work/token-icons/send.jpg",
      mintAddress: "SENDdRQtYMWaQrBroBrJ2Q53fgVuq95CV9UPGEvpCxa",
      decimals: 6,
    },
  ];
};

export const validateMinimumAmount = (amount: string, symbol: string) => {
  const minimumAmounts: { [key: string]: number } = {
    WORK: 10000,
    SOL: 0.25,
    USDC: 10,
    DEAN: 2000,
    BONK: 1000000,
    SEND: 2000,
  };

  const minAmount = minimumAmounts[symbol];

  if (minAmount !== undefined && Number(amount) < minAmount) {
    return { error: `Minimum amount allowed is ${minAmount} ${symbol}` };
  }

  return null;
};

export const getPlaceholder = (symbol: string) => {
  const placeholders: { [key: string]: string } = {
    WORK: "10000",
    SOL: "0.25",
    USDC: "10",
    DEAN: "2000",
    SEND: "2000",
    BONK: "1000000",
  };

  return placeholders[symbol] || "";
};

type ValidateAmountParams = {
  amount: number;
  availableBalance: number;
  tokenType: string;
};

export const validateApprovalAmount = ({
  amount,
  availableBalance,
  tokenType,
}: ValidateAmountParams): string | null => {
  const isStableCoin = tokenType === "USDC" || tokenType === "USDT";
  const minAmount = tokenType === "SOL" ? 0.01 : isStableCoin ? 0.5 : 100; // Set minimum amount based on token type

  if (amount <= 0) {
    return "Amount must be positive";
  }

  if (amount > availableBalance) {
    return `Amount cannot exceed ${availableBalance}`;
  }

  // if (availableBalance < minAmount) {
  //   if (amount !== availableBalance) {
  //     return `Amount must be exactly ${availableBalance}`;
  //   }
  // } else {
  //   if (amount < minAmount) {
  //     return `Amount must be at least ${minAmount}`;
  //   }
  // }

  return null; // No errors
};
