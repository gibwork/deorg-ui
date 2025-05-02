"use client";

import DateComponent from "@/components/date-component";
import dayjs from "dayjs";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

type CountdownProps = {
  deadline: string;
  isFinished: boolean;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

export function Countdown({ deadline, isFinished }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!isFinished) return;

    const calculateTimeLeft = () => {
      const now = dayjs();
      const target = dayjs(deadline);
      const diff = target.diff(now);

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return false;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
      return true;
    };

    const shouldContinue = calculateTimeLeft();
    if (!shouldContinue) return;

    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [deadline, isFinished]);

  const formatTimeLeft = () => {
    const { days, hours, minutes, seconds } = timeLeft;
    const pad = (num: number) => String(num).padStart(2, "0");

    if (days > 0) {
      return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="bg-muted h-8 font-semibold text-sm px-2 flex items-center justify-center">
      {isFinished ? (
        <>
          <Clock className="size-4 inline-block mr-1" />
          <span>{formatTimeLeft()}</span>
        </>
      ) : (
        <>
          <span>ended&nbsp;</span>
          <DateComponent datetime={deadline} type="fromDate" />
        </>
      )}
    </div>
  );
}
