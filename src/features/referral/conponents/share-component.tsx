import React from "react";

import { Button } from "@/components/ui/button";

import { Icons } from "@/components/icons";
import Image from "next/image";

interface ShareComponentProps {
  referralLink: string;
}

const ShareComponent: React.FC<ShareComponentProps> = ({ referralLink }) => {
  const shareText =
    "Join the best bounty platform and earn rewards! 🚀 Use my referral link:";

  const socialShareLinks = {
    twitter: () => {
      const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        shareText
      )}&url=${encodeURIComponent(referralLink)}`;
      window.open(twitterShareUrl, "_blank");
    },
    facebook: () => {
      const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        referralLink
      )}`;
      window.open(facebookShareUrl, "_blank");
    },
    linkedin: () => {
      const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        referralLink
      )}`;
      window.open(linkedinShareUrl, "_blank");
    },
    email: () => {
      const emailSubject = "Check out this amazing referral program!";
      const emailBody = `${shareText}\n\n${referralLink}`;
      window.location.href = `mailto:?subject=${encodeURIComponent(
        emailSubject
      )}&body=${encodeURIComponent(emailBody)}`;
    },
  };

  return (
    <div className=" flex items-center gap-3 py-6">
      <Button
        variant="outline"
        className="h-12 w-12 md:h-14 md:w-14 !p-1"
        onClick={socialShareLinks.email}
      >
        <Icons.gmail className="size-6" />
      </Button>
      <Button
        variant="outline"
        className="h-12 w-12 md:h-14 md:w-14 !p-1"
        onClick={socialShareLinks.twitter}
      >
        <Image
          src="/images/img_ico_x.png"
          width={200}
          height={200}
          alt="gib_work"
          className="size-6 "
        />
      </Button>
    </div>
  );
};

export default ShareComponent;
