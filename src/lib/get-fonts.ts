export default async function getFonts(): Promise<any[]> {
  // This is unfortunate but I can't figure out how to load local font files
  // when deployed to vercel.
  const [interRegular, interMedium, interSemiBold, interBold] =
    await Promise.all([
      fetch(
        `https://gibwork-media.s3.us-east-1.amazonaws.com/fonts-inter/Inter/static/Inter_18pt-Regular.ttf`
      ).then((res) => res.arrayBuffer()),
      fetch(
        `https://gibwork-media.s3.us-east-1.amazonaws.com/fonts-inter/Inter/static/Inter_18pt-Regular.ttf`
      ).then((res) => res.arrayBuffer()),
      fetch(
        `https://gibwork-media.s3.us-east-1.amazonaws.com/fonts-inter/Inter/static/Inter_18pt-SemiBold.ttf`
      ).then((res) => res.arrayBuffer()),
      fetch(
        `https://gibwork-media.s3.us-east-1.amazonaws.com/fonts-inter/Inter/static/Inter_18pt-Bold.ttf`
      ).then((res) => res.arrayBuffer()),
    ]);

  return [
    {
      name: "Inter",
      data: interRegular,
      style: "normal",
      weight: 400,
    },
    {
      name: "Inter",
      data: interMedium,
      style: "normal",
      weight: 500,
    },
    {
      name: "Inter",
      data: interSemiBold,
      style: "normal",
      weight: 600,
    },
    {
      name: "Inter",
      data: interBold,
      style: "normal",
      weight: 700,
    },
  ];
}
