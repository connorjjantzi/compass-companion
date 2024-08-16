import { type User } from "@prisma/client";
import { type AvatarProps } from "@radix-ui/react-avatar";
import Image from "next/image";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Icons } from "@/components/icons";

interface UserAvatarProps extends AvatarProps {
  user: Pick<User, "image" | "name">;
}

// TODO: Maybe ditch AvatarImage and just render the image directly to laod faster
export function UserAvatar({ user, ...props }: UserAvatarProps) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage asChild src={user.image}>
          <Image
            alt="Picture"
            src={user.image}
            width={96}
            height={96}
            sizes="32px"
            priority
          />
        </AvatarImage>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
