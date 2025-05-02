import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ImageLoader from "@/components/image-loader";
import React from "react";
import { cn } from "@/lib/utils";

interface UsersParticipantListProps {
  users?: {
    profilePicture: string;
    username: string;
  }[];
  type?: string;
  withoutLabels?: boolean;
  avatarClassName?: string;
}

export const UsersParticipantList = ({
  users,
  type,
  withoutLabels,
  avatarClassName,
}: UsersParticipantListProps) => {
  const hideLabel = withoutLabels && users && users?.length > 4
  
  return (
    <div className="align-bottom flex items-center mt-3  ">
      <div className="flex items-center ">
        {users?.slice(0, 4).map((user, indx) => (
          <Avatar
            className={cn(
              "w-4 h-4 bg-muted",
              indx !== 0 && "-ml-1",
              avatarClassName
            )}
            key={indx}
          >
            <ImageLoader
              src={user.profilePicture}
              alt={user.username}
              height={25}
              width={25}
              quality={50}
            />
            <AvatarFallback></AvatarFallback>
          </Avatar>
        ))}
        {users && users?.length > 4 && (
          <div className=" flex items-center justify-center  rounded-full text-xs text-muted-foreground ml-1">
            +{users.length - 4}
          </div>
        )}
      </div>

      <>
        {users && users.length > 0 ? (
          <div className="opacity-80 pl-1 justify-end flex">
            {!hideLabel && (
              <span className="text-xs ">
                {" "}
                {type === "services" ? "" : " participated"}
              </span>
            )}
          </div>
        ) : (
          <div className="flex opacity-80 justify-end ">
            <span className="text-xs">
              🔥 be the first to{" "}
              {type === "services" ? "request!" : "participate!"}
            </span>
          </div>
        )}
      </>
    </div>
  );
};
