import React from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import relativeTime from "dayjs/plugin/relativeTime";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(utc);
dayjs.extend(tz);
dayjs.extend(relativeTime);
dayjs.extend(LocalizedFormat);
const timeZone = dayjs.tz.guess();
function DateComponent({
  datetime,
  type = "date",
}: {
  datetime: string;
  type?: "date" | "datetime" | "fromDate" | "toDate";
}) {
  return (
    <>
      {type === "date" &&
        dayjs.utc(datetime).tz(timeZone).format("DD MMM YYYY")}
      {type === "datetime" &&
        dayjs.utc(datetime).tz(timeZone).format("DD MMM YYYY LT")}
      {type === "fromDate" && dayjs.utc(datetime).tz(timeZone).fromNow()}
      {type === "toDate" && dayjs.utc(datetime).tz(timeZone).toNow(true)}
    </>
  );
}

export default DateComponent;
