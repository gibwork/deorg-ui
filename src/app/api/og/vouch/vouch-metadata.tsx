/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { HTMLAttributes } from "react";

export async function getVouchMetadata(requestUrl: string, username: string) {
  const imageUrl = new URL("/images/vouch-background.png", requestUrl);

  return new ImageResponse(
    (
      <div tw="flex text-black bg-white w-[1200px] h-[675px] overflow-hidden text-black p-10 pt-0 relative">
        <img
          src={imageUrl.toString()}
          tw="absolute bottom-0 left-12 w-[100%]"
          width={1200}
          height={376}
          alt=""
        />
        <Balls />
        <USDC
          tw="flex absolute left-[90px] -top-[30px]"
          width={80}
          height={80}
          style={{ zIndex: 20 }}
        />
        <USDC
          tw="flex absolute left-[420px] bottom-[160px] z-20"
          width={110}
          height={110}
        />
        <USDC
          tw="flex absolute right-[30px] bottom-[290px]"
          width={60}
          height={60}
          style={{ zIndex: 20 }}
        />
        <USDC
          tw="flex absolute right-[140px] top-[30px]"
          width={50}
          height={50}
          style={{ zIndex: 20 }}
        />
        <div tw="flex flex-col mt-14">
          <div
            tw="flex flex-col m-0 whitespace-nowrap"
            style={{ lineHeight: "16px" }}
          >
            <h1 tw="text-[90px]">Leave a Vouch For</h1>
            <p tw="text-[90px] -mt-10">@{username}</p>
          </div>
          <div tw="flex flex-col " style={{ lineHeight: "13px" }}>
            <span tw="flex mt-2 block text-[30px]">
              Show them some appreciation and
            </span>
            <span tw="flex mt-2 block text-[30px]">
              reinforce their reputation with a Vouch.
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 675,
    }
  );
}

function Balls() {
  return (
    <>
      <div
        tw="w-3 h-3 left-[310px] top-[10px] bg-[#2592df] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-2.5 h-2.5 left-[260px] top-[27px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-4 h-4 left-[700px] top-[5px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-2 h-2 left-[900px] top-[45px] bg-[#2592df] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3 h-3 left-[950px] top-[75px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3.5 h-3.5 left-[840px] top-[300px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3 h-3 left-[820px] top-[285px] bg-[#2592df] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3 h-3 left-[1150px] top-[215px] bg-[#2592df] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3 h-3 left-[780px] bottom-[160px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-3 h-3 left-[970px] bottom-[200px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-4 h-4 left-[150px] bottom-[200px] bg-[#2592df] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
      <div
        tw="w-2 h-2 left-[350px] bottom-[200px] bg-[#feb426] rounded-full absolute"
        style={{ zIndex: 10 }}
      />
    </>
  );
}

interface USDCProps extends HTMLAttributes<HTMLDivElement> {
  width: number;
  height: number;
}

function USDC({ width, height, ...rest }: USDCProps) {
  return (
    <div {...rest}>
      <svg
        data-name="86977684-12db-4850-8f30-233a7c267d11"
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 2000 2000"
      >
        <path
          d="M1000 2000c554.17 0 1000-445.83 1000-1000S1554.17 0 1000 0 0 445.83 0 1000s445.83 1000 1000 1000z"
          fill="#2775ca"
        />
        <path
          d="M1275 1158.33c0-145.83-87.5-195.83-262.5-216.66-125-16.67-150-50-150-108.34s41.67-95.83 125-95.83c75 0 116.67 25 137.5 87.5 4.17 12.5 16.67 20.83 29.17 20.83h66.66c16.67 0 29.17-12.5 29.17-29.16v-4.17c-16.67-91.67-91.67-162.5-187.5-170.83v-100c0-16.67-12.5-29.17-33.33-33.34h-62.5c-16.67 0-29.17 12.5-33.34 33.34v95.83c-125 16.67-204.16 100-204.16 204.17 0 137.5 83.33 191.66 258.33 212.5 116.67 20.83 154.17 45.83 154.17 112.5s-58.34 112.5-137.5 112.5c-108.34 0-145.84-45.84-158.34-108.34-4.16-16.66-16.66-25-29.16-25h-70.84c-16.66 0-29.16 12.5-29.16 29.17v4.17c16.66 104.16 83.33 179.16 220.83 200v100c0 16.66 12.5 29.16 33.33 33.33h62.5c16.67 0 29.17-12.5 33.34-33.33v-100c125-20.84 208.33-108.34 208.33-220.84z"
          fill="#fff"
        />
        <path
          d="M787.5 1595.83c-325-116.66-491.67-479.16-370.83-800 62.5-175 200-308.33 370.83-370.83 16.67-8.33 25-20.83 25-41.67V325c0-16.67-8.33-29.17-25-33.33-4.17 0-12.5 0-16.67 4.16-395.83 125-612.5 545.84-487.5 941.67 75 233.33 254.17 412.5 487.5 487.5 16.67 8.33 33.34 0 37.5-16.67 4.17-4.16 4.17-8.33 4.17-16.66v-58.34c0-12.5-12.5-29.16-25-37.5zM1229.17 295.83c-16.67-8.33-33.34 0-37.5 16.67-4.17 4.17-4.17 8.33-4.17 16.67v58.33c0 16.67 12.5 33.33 25 41.67 325 116.66 491.67 479.16 370.83 800-62.5 175-200 308.33-370.83 370.83-16.67 8.33-25 20.83-25 41.67V1700c0 16.67 8.33 29.17 25 33.33 4.17 0 12.5 0 16.67-4.16 395.83-125 612.5-545.84 487.5-941.67-75-237.5-258.34-416.67-487.5-491.67z"
          fill="#fff"
        />
      </svg>
    </div>
  );
}
