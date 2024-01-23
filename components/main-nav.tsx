"use client";

import Link from "next/link";
import { useSelectedLayoutSegment } from "next/navigation";

import { Icons } from "@/components/icons";
import { MobileNav } from "@/components/mobile-nav";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { type MainNavItem } from "@/types";
import type { User } from "next-auth";
import { useState } from "react";
import { buttonVariants } from "./ui/button";
import { UserAccountNav } from "./user-account-nav";

interface MainNavProps {
  items?: MainNavItem[];
  children?: React.ReactNode;
  user:
    | (User & {
        id: string;
      })
    | undefined;
}

export function MainNav({ items, children, user }: MainNavProps) {
  const segment = useSelectedLayoutSegment();
  const [showMobileMenu, setShowMobileMenu] = useState<boolean>(false);

  return (
    <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
      <div className="flex gap-6 md:gap-10">
        <Link href="/" className="hidden items-center space-x-2 md:flex">
          <Icons.logo />
          <span className="hidden font-bold sm:inline-block">
            {siteConfig.name}
          </span>
        </Link>
        {items?.length ? (
          <nav className="hidden gap-6 md:flex">
            {items?.map((item, index) => (
              <Link
                key={index}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "flex items-center text-lg font-medium transition-colors hover:text-foreground/80 sm:text-sm",
                  item.href.startsWith(`/${segment}`)
                    ? "text-foreground"
                    : "text-foreground/60",
                  item.disabled && "cursor-not-allowed opacity-80",
                )}
              >
                {item.title}
              </Link>
            ))}
          </nav>
        ) : null}

        <button
          className="flex items-center space-x-2 md:hidden"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <Icons.close /> : <Icons.logo />}
          <span className="font-bold">Menu</span>
        </button>
        {showMobileMenu && items && (
          <MobileNav
            items={items}
            onClick={() => {
              setShowMobileMenu(false);
            }}
          >
            {children}
          </MobileNav>
        )}
      </div>
      <div className="flex flex-1 items-center space-x-4 sm:justify-end">
        <div className="flex-1 sm:grow-0"></div>
        <nav>
          {user ? (
            <div className="flex items-center justify-center gap-4">
              <UserAccountNav
                user={{
                  name: user.name,
                  image: user.image,
                  email: user.email,
                }}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "secondary", size: "sm" }),
                "px-4",
              )}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </div>
  );
}
