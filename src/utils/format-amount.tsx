export const formatTokenAmount = (amount: number, decimals: number) => {
  return amount / Math.pow(10, decimals);
};

export const getFormattedAmount = (
  amt: number,
  decimals: number = 2,
  skipThousands: boolean = false
) => {
  if (isNaN(amt)) return null;
  const amount = Number(amt);

  if (amount < 1000) return amount.toFixed(decimals);

  const suffixes = ["", "K", "M", "B"];
  let tier = (Math.log10(amount) / 3) | 0;

  // adjust tier if skipping thousands
  if (skipThousands && tier === 1 && amount < 1000) {
    tier = 0;
  }

  if (tier === 0) return amount.toFixed(decimals).toLocaleString();

  const suffix = suffixes[tier];
  const scale = Math.pow(10, tier * 3);
  const scaled = amount / scale;

  let formattedNumber;
  if (tier === 1) {
    formattedNumber = scaled
      .toFixed(decimals)
      .replace(/\.?0+$/, "")
      .toLocaleString();
  } else {
    formattedNumber =
      scaled % 1 === 0
        ? scaled.toLocaleString()
        : scaled.toFixed(2).replace(/\.0$/, "").toLocaleString();
  }

  return formattedNumber + suffix;
};
