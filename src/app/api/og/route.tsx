"use server";
import { getUserDataByName } from "@/actions/get/get-user-data";
import { gibworkLogoImgUrl, checkImgUrl } from "@/constants/data";
import getFonts from "@/lib/get-fonts";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getVouchMetadata } from "./vouch/vouch-metadata";
import { StarRating } from "./vouch/star-rating";

export async function POST(request: NextRequest) {
  const { type, details } = await request.json();

  if (type == "bounty") return GetBountyMetadataImg(details);
  else if (type == "task") return GetTaskMetadataImg(details);
  else if (type == "blinks") return GetTaskBlinksImg(details);
  else if (type == "blinksusdc") return GetTaskBlinksUSDCImg(details);
  else return GetLoginScreenMetadata();
}

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("t")!;
  const id = request.nextUrl.searchParams.get("id");
  const vouch = request.nextUrl.searchParams.get("vouch");

  if (type == "profile") {
    if (vouch) {
      return await getVouchMetadata(request.url, id!);
    }

    return GetUserProfileMetadataImg(id!);
  }

  // else if (type == "bounty") {
  // return GetBountyMetadataImg(id);
  // } else if (type == "task") {
  // return GetTaskMetadataImg(id);
  // }
  // else if (type == "taskusdc") {
  //   return GetTaskBlinksUSDCImg(id);
  // }
}

async function GetLoginScreenMetadata() {
  const bountyTokenImageUrl = "https://media.gib.work/token-icons/usdc-lg.png";
  const totalReward = "19k+";

  return new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px 80px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex justify-between">
          <div tw="flex">
            <img
              tw="mt-11"
              src={gibworkLogoImgUrl}
              width={65}
              style={{ marginRight: "15px" }}
            />
            <h1 tw="mt-8" style={{ fontSize: 60, fontWeight: 800 }}>
              gibwork
            </h1>
          </div>
          <div tw="flex mt-4">
            <img tw="mt-11 mr-5" src={bountyTokenImageUrl} width={35} />
            <h1 tw="mt-8" style={{ fontSize: 45, fontWeight: 800 }}>
              {totalReward} Rewarded
            </h1>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div
            tw="flex column mt-4"
            style={{
              display: "flex",
              flexDirection: "column",
              marginLeft: "25px",
            }}
          >
            <div style={{ fontSize: "65px" }}>On-chain Bounties</div>
            <div tw="text-gray-800 text-4xl">
              Join a community-driven platform for crypto bounties and paid Q&A.
              Discover talent, get answers, and drive your crypto initiatives
              forward.
            </div>
            <div tw="flex mt-5 justify-start">
              <img
                tw="ml-2 rounded-full"
                src="https://media.gib.work/token-icons/sol.png"
                width={65}
              />
              <img
                tw="ml-2 rounded-full"
                src={bountyTokenImageUrl}
                width={65}
              />
              <img
                tw="ml-2 rounded-full"
                src="https://media.gib.work/token-icons/bonk.png"
                width={65}
              />
              <img
                tw="ml-2 rounded-full"
                src="https://media.gib.work/token-icons/jup.png"
                width={65}
              />
              <img
                tw="ml-2 rounded-full"
                src="https://media.gib.work/token-icons/popcat.png"
                width={65}
              />
              <img
                tw="ml-2 rounded-full"
                src="https://media.gib.work/token-icons/wif.png"
                width={65}
              />
            </div>
            <div></div>
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

async function GetBountyMetadataImg(bounty: any) {
  const bountyPrice = (
    bounty.asset.amount / Math.pow(10, bounty.asset.decimals)
  ).toFixed(2);
  const bountyTitle = bounty.title; //"Feture: Add a enhnacement to the the modal such that it...."; //55 character display limit
  const bountyTokenImageUrl = bounty.asset.imageUrl;
  const tags = bounty.tags;
  const type = "Submit a Github Pull Request for"; //"Contribute to Open Source For";
  const tokenType = bounty.asset.symbol;
  const isUserVerified =
    bounty?.user?.isPhoneVerified || bounty?.user?.xAccountVerified;

  const image = new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex items-center justify-between ">
          <div tw="flex">
            <img
              tw="rounded-md"
              src={gibworkLogoImgUrl}
              width={90}
              style={{ marginRight: "15px" }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div
            tw="flex column"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "35px",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: 55, fontWeight: 700 }}>{bountyTitle}</div>

            <div tw="bg-round flex mt-8 mb-10">
              <span
                tw="bg-emerald-600 text-emerald-50 border-emerald-600 px-5 py-1.5 rounded-full"
                style={{ fontSize: "35px", fontWeight: 600 }}
              >
                PR Required
              </span>
              <span
                tw="border px-5 py-1.5 rounded-full ml-5"
                style={{
                  fontSize: "35px",
                  fontWeight: 600,
                  border: "1px",
                  borderColor: "gray",
                }}
              >
                {" "}
                {tags[0]}{" "}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "2.25rem",
              color: "#1E293B",
              marginBottom: "2rem",
            }}
          >
            <div tw="flex items-center ">
              <img tw="rounded-full" src={bountyTokenImageUrl} width={60} />
              <h1 tw="pt-1.5 ml-5" style={{ fontSize: 45, fontWeight: 700 }}>
                {bountyPrice}
              </h1>
              <span
                tw="pt-1.5 ml-2 text-gray-600"
                style={{ fontSize: 45, fontWeight: 700 }}
              >
                {tokenType}
              </span>
            </div>
            <div tw="flex items-center ">
              <h1 tw="" style={{ fontSize: 45, fontWeight: 700 }}>
                @{bounty.user.username}
              </h1>

              {isUserVerified && (
                <div tw="flex">
                  <img
                    tw="rounded-md ml-3"
                    src={checkImgUrl}
                    width={40}
                    height={40}
                    style={{ marginRight: "15px" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    { fonts: await getFonts(), width: 1200, height: 650 }
  );

  const base64Image = await streamToBase64(image.body);

  return new Response(
    JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
    }),
    {
      headers: {
        "Content-Type": "image/png", // Ensure this matches the format of the image you're generating
      },
    }
  );
}

async function GetUserProfileMetadataImg(username: string) {
  const profile = (await getUserDataByName(username)).success;
  const avatarImgUrl = profile.profilePicture;
  const avgRating = getAverageRating(profile.vouches) || 5;

  return new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px 40px",
          paddingRight: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex justify-end -mt-4">
          <div tw="flex items-end">
            <img src={gibworkLogoImgUrl} width={85} />
          </div>
        </div>

        <div
          tw="mt-4"
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div style={{ display: "flex" }}>
            <img tw="mt-5 rounded-full" src={avatarImgUrl} width={180} />
          </div>

          <div tw="flex justify-between">
            <div
              tw="flex mt-4 justify-between w-[550px]"
              style={{
                display: "flex",
                flexDirection: "row",
                marginLeft: "15px",
              }}
            >
              <div tw="flex flex-col">
                <div tw="flex" style={{ fontSize: "65px" }}>
                  {profile.firstName}
                </div>
                <div tw="text-gray-500 text-4xl flex">@{profile.username}</div>
              </div>
            </div>
          </div>
        </div>
        <div tw="flex mt-10">
          <div tw="flex flex-col">
            <h3 tw="text-5xl text-gray-800">Total Earnings</h3>
            <div tw="flex items-center">
              <svg
                data-name="86977684-12db-4850-8f30-233a7c267d11"
                width={60}
                height={60}
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
              <span tw="ml-2 text-6xl">
                {profile.totalAmountEarned.toFixed(2)}
              </span>
            </div>
          </div>

          <div tw="w-[10px] h-[120px] bg-zinc-300 rounded-lg mt-8 mx-14" />

          <div tw="flex">
            <div tw="flex flex-col">
              <h3 tw="text-5xl text-gray-800">Ratings</h3>
              <div tw="flex">
                <StarRating rating={avgRating} />
              </div>
            </div>
          </div>

          <div tw="w-[10px] h-[120px] bg-zinc-300 rounded-lg mt-8 mx-14" />

          <div tw="flex flex-col">
            <h3 tw="text-5xl text-gray-800">Top Skill</h3>
            <div tw="flex items-center">
              <span tw="ml-20 text-6xl text-center w-full">-</span>
            </div>
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

async function GetTaskMetadataImg(task: any) {
  const amount = (
    task.asset.amount / Math.pow(10, task.asset.decimals)
  ).toFixed(2);
  const title = task.title;
  const description =
    task.content.replace(/<[^>]+>/g, "").substring(0, 150) + "....";
  const { imageUrl: rewardTokenImageUrl, symbol: tokenType } = task.asset;
  const tags = task.tags;
  const type = "Make a Submission for";
  const isUserVerified =
    task?.user?.isPhoneVerified || task?.user?.xAccountVerified;

  const image = new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex items-center justify-between ">
          <div tw="flex">
            <img
              tw="rounded-md"
              src={gibworkLogoImgUrl}
              width={90}
              style={{ marginRight: "15px" }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div
            tw="flex column"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "35px",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: 55, fontWeight: 700 }}>{title}</div>

            <div tw="bg-round flex mt-8 mb-10">
              <span
                tw="border px-5 py-1.5 rounded-full "
                style={{
                  fontSize: "35px",
                  fontWeight: 600,
                  border: "1px",
                  borderColor: "gray",
                }}
              >
                {" "}
                {tags[0]}{" "}
              </span>
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "2.25rem",
              color: "#1E293B",
              marginBottom: "2rem",
            }}
          >
            <div tw="flex items-center ">
              <img tw="rounded-full" src={rewardTokenImageUrl} width={60} />
              <h1 tw="pt-1.5 ml-5" style={{ fontSize: 45, fontWeight: 700 }}>
                {amount}
              </h1>
              <span
                tw="pt-1.5 ml-2 text-gray-600"
                style={{ fontSize: 45, fontWeight: 700 }}
              >
                {tokenType}
              </span>
            </div>
            <div tw="flex items-center ">
              <h1 tw="" style={{ fontSize: 45, fontWeight: 700 }}>
                @{task.user.username}
              </h1>

              {isUserVerified && (
                <div tw="flex">
                  <img
                    tw="rounded-md ml-3"
                    src={checkImgUrl}
                    width={40}
                    height={40}
                    style={{ marginRight: "15px" }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    ),
    { fonts: await getFonts(), width: 1200, height: 650 }
  );

  const base64Image = await streamToBase64(image.body);

  return new Response(
    JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
    }),
    {
      headers: {
        "Content-Type": "image/png", // Ensure this matches the format of the image you're generating
      },
    }
  );
}

async function streamToBase64(readableStream: any) {
  const reader = readableStream.getReader();
  let chunks = [];
  let done = false;

  while (!done) {
    const { done: readerDone, value } = await reader.read();
    if (readerDone) {
      done = true;
    } else {
      chunks.push(value);
    }
  }

  const byteArray = new Uint8Array(
    chunks.reduce((acc, chunk) => acc.concat(Array.from(chunk)), [])
  );
  return Buffer.from(byteArray).toString("base64");
}

async function GetTaskBlinksImg(task: any) {
  const amount = (
    task.asset.amount / Math.pow(10, task.asset.decimals)
  ).toFixed(2);
  const title = task.title;
  const description =
    task.content.replace(/<[^>]+>/g, "").substring(0, 150) + "....";
  const { imageUrl: rewardTokenImageUrl, symbol: tokenType } = task.asset;
  const tags = task.tags;
  const type = "Make a Submission for";

  const image = new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex items-center justify-between mt-10">
          <div tw="flex">
            <img
              tw="rounded-md"
              src={gibworkLogoImgUrl}
              width={120}
              style={{ marginRight: "15px" }}
            />
          </div>
          <div tw="flex items-center ">
            <h1 tw="pt-1.5" style={{ fontSize: 60, fontWeight: 700 }}>
              <strong>{amount}</strong>
            </h1>
            <img tw="ml-5 rounded-full" src={rewardTokenImageUrl} width={60} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div
            tw="flex column"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "35px",
              marginBottom: "25px",
            }}
          >
            <div style={{ fontSize: "55px" }}>{title}</div>

            <div tw="bg-round flex mt-8 mb-10">
              {tags.map((tag: any, indx: number) => (
                <span
                  key={indx}
                  tw="bg-black text-white px-3 py-1.5 rounded"
                  style={{ fontSize: "35px" }}
                >
                  {" "}
                  {tag}{" "}
                </span>
              ))}
            </div>
            <div
              tw="flex text-slate-700 text-center "
              style={{ fontSize: "35px" }}
            >
              Complete task and claim your earnings effortlessly.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "2.25rem",
              color: "#1E293B",
              marginTop: "3rem",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                display: "flex",
                backgroundColor: "#F1F5F9",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
              }}
            >
              Task | Gibwork
            </span>
            <div
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <img
                  src="https://gibwork-media.s3.us-east-1.amazonaws.com/website-icon.png"
                  width="35"
                />
                <span>app.gib.work</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <img
                  src="https://gibwork-media.s3.us-east-1.amazonaws.com/x-social-media-black-icon.png"
                  width="35"
                />
                <span>gib_work</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { fonts: await getFonts(), width: 1000, height: 800 }
  );

  const base64Image = await streamToBase64(image.body);

  return new Response(
    JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
    }),
    {
      headers: {
        "Content-Type": "image/png", // Ensure this matches the format of the image you're generating
      },
    }
  );
}

async function GetTaskBlinksUSDCImg(task: any) {
  const amount = task.asset.price.toFixed(2);
  const title = task.title;
  const description =
    task.content.replace(/<[^>]+>/g, "").substring(0, 150) + "....";
  const { imageUrl: rewardTokenImageUrl, symbol: tokenType } = task.asset;
  const tags = task.tags;
  const type = "Make a Submission for";

  const image = new ImageResponse(
    (
      <div
        style={{
          color: "black",
          background: "white",
          width: "100%",
          height: "100%",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div tw="flex items-center justify-between mt-10">
          <div tw="flex">
            <img
              tw="rounded-md"
              src={gibworkLogoImgUrl}
              width={120}
              style={{ marginRight: "15px" }}
            />
          </div>
          <div tw="flex items-center ">
            <h1 tw="pt-1.5" style={{ fontSize: 60, fontWeight: 700 }}>
              <strong>{amount}</strong>
            </h1>
            <img
              tw="ml-5 rounded-full"
              src={
                "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png?height=25&width=25&quality=50"
              }
              width={60}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            fontSize: 30,
          }}
        >
          <div
            tw="flex column"
            style={{
              display: "flex",
              flexDirection: "column",
              marginTop: "35px",
              marginBottom: "25px",
            }}
          >
            <div style={{ fontSize: "55px" }}>{title}</div>

            <div tw="bg-round flex mt-8 mb-10">
              {tags.map((tag: any, indx: number) => (
                <span
                  key={indx}
                  tw="bg-black text-white px-3 py-1.5 rounded"
                  style={{ fontSize: "35px" }}
                >
                  {" "}
                  {tag}{" "}
                </span>
              ))}
            </div>
            <div
              tw="flex text-slate-700 text-center "
              style={{ fontSize: "35px" }}
            >
              Complete task and claim your earnings effortlessly.
            </div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            flexGrow: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "2.25rem",
              color: "#1E293B",
              marginTop: "3rem",
              marginBottom: "2rem",
            }}
          >
            <span
              style={{
                display: "flex",
                backgroundColor: "#F1F5F9",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
              }}
            >
              Task | Gibwork
            </span>
            <div
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: "0.5rem",
                paddingLeft: "1rem",
                paddingRight: "1rem",
                paddingTop: "0.5rem",
                paddingBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <img
                  src="https://gibwork-media.s3.us-east-1.amazonaws.com/website-icon.png"
                  width="35"
                />
                <span>app.gib.work</span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <img
                  src="https://gibwork-media.s3.us-east-1.amazonaws.com/x-social-media-black-icon.png"
                  width="35"
                />
                <span>gib_work</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { fonts: await getFonts(), width: 1000, height: 800 }
  );

  const base64Image = await streamToBase64(image.body);

  return new Response(
    JSON.stringify({
      image: `data:image/png;base64,${base64Image}`,
    }),
    {
      headers: {
        "Content-Type": "image/png", // Ensure this matches the format of the image you're generating
      },
    }
  );
}

function getAverageRating(vouches: { rating: number }[]): number {
  if (vouches.length === 0) return 0;

  const total = vouches.reduce((sum, vouch) => sum + vouch.rating, 0);
  const average = total / vouches.length;

  return Math.max(0, Math.min(5, average));
}
