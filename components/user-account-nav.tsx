"use client";

import Link from "next/link";
import { type User } from "next-auth";
import { signOut } from "next-auth/react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";

import { accountConfig } from "@/config/account";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Icons } from "./icons";

interface UserAccountNavProps {
  user: Pick<User, "name" | "image" | "email">;
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const path = usePathname();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="rounded-full">
        <UserAvatar
          user={{ name: user.name ?? null, image: user.image ?? null }}
          className="h-8 w-8"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />

        <div className="flex flex-col gap-1">
          {accountConfig.sidebarNav.map((item, index) => {
            const Icon = Icons[item.icon ?? "arrowRight"];
            return (
              item.href && (
                <DropdownMenuItem
                  asChild
                  key={index}
                  className={cn(
                    "hover:bg-accent hover:text-accent-foreground",
                    path === item.href ? "bg-accent" : "bg-transparent",
                    item.disabled && "cursor-not-allowed opacity-80",
                  )}
                >
                  <Link href={item.disabled ? "/" : item.href}>
                    <span className={cn("group flex items-center rounded-md ")}>
                      <Icon className="mr-2 h-4 w-4" />
                      <span>{item.title}</span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              )
            );
          })}
        </div>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(event: Event) => {
            event.preventDefault();
            void signOut({
              callbackUrl: `${window.location.origin}/login`,
            });
          }}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
