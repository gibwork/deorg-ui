"use client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PRIORITY_FEE_LEVEL_LABEL_MAP } from "../lib/utils";
import { CircleAlert, FuelIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PriorityFeeLevel,
  usePriorityFeeLevelStore,
} from "@/features/priority-fee/lib/use-priority-fee-level";
import { useEffect, useState } from "react";
import { PopoverClose } from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Icons } from "@/components/icons";
import { useTokenPrice } from "@/hooks/use-token-price";
export function PriorityFeePopover() {
  const {
    selectedPriority,
    setPriority,
    exactPriorityFee,
    setExactPriorityFee,
    maxPriorityFee,
    setMaxPriorityFee,
    isPriorityFeeModeMaxCap,
    togglePriorityFeeMode,
  } = usePriorityFeeLevelStore();
  const [selectedPriorityLocal, setSelectedPriorityLocal] =
    useState<PriorityFeeLevel>(selectedPriority);
  const [isSelectedPriorityFeeModeMaxCap, setIsSelectedPriorityFeeModeMaxCap] =
    useState<boolean>(isPriorityFeeModeMaxCap);
  const [priorityFeeValueLocal, setPriorityFeeValueLocal] = useState<number>(
    isSelectedPriorityFeeModeMaxCap ? maxPriorityFee! : exactPriorityFee!
  );

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const {
    data: solPrice,
    isLoading: isSolPriceLoading,
    error: solPriceError,
  } = useTokenPrice("So11111111111111111111111111111111111111112");
  const handlePriorityChange = (value: string) => {
    setPriority(value as PriorityFeeLevel);
    if (isSelectedPriorityFeeModeMaxCap) {
      togglePriorityFeeMode(true);
    } else {
      togglePriorityFeeMode(false);
    }
    setMaxPriorityFee(Number(priorityFeeValueLocal));
    setExactPriorityFee(Number(priorityFeeValueLocal));
  };

  const prorityFeeLabel = PRIORITY_FEE_LEVEL_LABEL_MAP[selectedPriority];

  useEffect(() => {
    if (!isPopoverOpen) {
      setSelectedPriorityLocal(selectedPriority);
      setIsSelectedPriorityFeeModeMaxCap(isPriorityFeeModeMaxCap);
      setPriorityFeeValueLocal(maxPriorityFee!);
    }
  }, [
    isPopoverOpen,
    selectedPriority,
    isPriorityFeeModeMaxCap,
    maxPriorityFee,
    exactPriorityFee,
  ]);

  return (
    <Popover onOpenChange={(open) => setIsPopoverOpen(open)}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="text-sm h-7 md:h-9 flex items-center !p-1 md:!px-4 md:gap-2"
        >
          <FuelIcon className="p-1 md:hidden" />
          <span className="hidden md:block font-normal">
            Priority:{" "}
            <span className=" font-semibold"> {prorityFeeLabel} </span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-full max-w-[90vw] sm:mx-2 sm:max-w-[400px] text-xs sm:text-[13px] "
        align="end"
      >
        <div className="grid gap-4 ">
          <div>
            <p className="text-xl font-medium">Priority Fee</p>
            <p className=" text-muted-foreground pt-1">
              Fee settings are applied across all DeOrg features, including
              Deposit, Withdraw, and Refund.
            </p>
          </div>
          <AnimatePresence>
            {isSelectedPriorityFeeModeMaxCap && (
              <motion.div
                key="max-cap-mode"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <p className="text-sm font-medium pb-1">Priority Level</p>
                <Tabs
                  onValueChange={(value) =>
                    setSelectedPriorityLocal(value as PriorityFeeLevel)
                  }
                  defaultValue={selectedPriority}
                  className=" sm:w-full"
                >
                  <TabsList className="grid  grid-cols-3">
                    <TabsTrigger value="Medium" className=" text-[13px]">
                      Fast
                    </TabsTrigger>
                    <TabsTrigger value="High" className=" text-[13px]">
                      Turbo
                    </TabsTrigger>
                    <TabsTrigger value="VeryHigh" className=" text-[13px]">
                      Ultra
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <p className=" text-muted-foreground pt-1 ">
                  DeOrg submits your transaction through RPC with priority fees.
                </p>
                <Separator className="mt-2" />
              </motion.div>
            )}
          </AnimatePresence>
          <div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium pb-1">Fee Mode</p>
              <Tabs
                onValueChange={(value) =>
                  setIsSelectedPriorityFeeModeMaxCap(value === "maxCap")
                }
                defaultValue={isPriorityFeeModeMaxCap ? "maxCap" : "exactFee"}
                className="w-fit"
              >
                <TabsList className="grid h-8 grid-cols-2 p-0.5">
                  <TabsTrigger
                    value="maxCap"
                    className="py-1 px-2 text-[13px] "
                  >
                    Max Cap
                  </TabsTrigger>
                  <TabsTrigger
                    value="exactFee"
                    className="py-1 px-2 text-[13px] "
                  >
                    Exact Fee
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <p className="text-muted-foreground pt-1">
              {isSelectedPriorityFeeModeMaxCap
                ? `DeOrg auto-optimizes priority fees for your transaction. Set a
              max cap to prevent overpaying.`
                : `DeOrg will use the exact fee you set.`}
            </p>
          </div>

          <div>
            <div>
              <p className="text-sm font-medium pb-1 flex items-center justify-between">
                {isSelectedPriorityFeeModeMaxCap ? "Max cap" : "Exact Fee"}{" "}
                <span className="text-xs text-muted-foreground">
                  ${((solPrice?.price ?? 0) * priorityFeeValueLocal).toFixed(2)}
                </span>
              </p>
              <Input
                id="max-cap"
                className="border-theme "
                type="number"
                placeholder="Enter custom value"
                defaultValue={priorityFeeValueLocal}
                value={priorityFeeValueLocal}
                onChange={(e) => {
                  if (Number(e.target.value) < 0 || Number(e.target.value) > 1)
                    return;
                  setPriorityFeeValueLocal(Number(e.target.value));
                }}
              />

              {priorityFeeValueLocal < 0.0002 && (
                <p className="bg-yellow-100 dark:bg-[#FED33A1A] rounded-lg flex items-center gap-1 p-1 mt-1 text-[13px]">
                  <Icons.warning className="size-8 text-yellow-600 dark:text-yellow-500" />
                  <span className="text-yellow-700 dark:text-yellow-500 1">
                    Your current maximum fee is below the market rate. Please
                    raise it to ensure your transactions are processed.
                  </span>
                </p>
              )}
              {priorityFeeValueLocal === 0 && (
                <p className="text-yellow-600 dark:text-yellow-500 flex items-center gap-1 pt-1">
                  <CircleAlert className="size-3" /> Please enter a value higher
                  than zero
                </p>
              )}

              {priorityFeeValueLocal > 1 && (
                <p className="text-yellow-600 flex items-center gap-1 pt-1">
                  <CircleAlert className="size-3" /> Please enter a value less
                  than 1 SOL
                </p>
              )}
            </div>
          </div>
          <PopoverClose asChild>
            <Button
              className="w-full"
              disabled={
                priorityFeeValueLocal === 0 ||
                priorityFeeValueLocal < 0.0002 ||
                priorityFeeValueLocal > 1
              }
              onClick={() => handlePriorityChange(selectedPriorityLocal)}
            >
              Save
            </Button>
          </PopoverClose>
        </div>
      </PopoverContent>
    </Popover>
  );
}
