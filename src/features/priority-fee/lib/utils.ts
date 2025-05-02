import {
  PriorityFeeLevel,
  PriorityFeeLevelLabel,
} from "./use-priority-fee-level";

export const PRIORITY_FEE_LEVEL_LABEL_MAP: Record<
  PriorityFeeLevel,
  PriorityFeeLevelLabel
> = {
  Medium: "Fast",
  High: "Turbo",
  VeryHigh: "Ultra",
};

export const PRIORITY_FEE_LEVEL_MAP: Record<
  PriorityFeeLevelLabel,
  PriorityFeeLevel
> = {
  Fast: "Medium",
  Turbo: "High",
  Ultra: "VeryHigh",
};
