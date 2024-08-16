import * as React from "react";
import Link from "next/link";

import { type MainNavItem } from "@/types";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { useLockBody } from "@/hooks/use-lock-body";
import { Icons } from "@/components/icons";

interface MobileNavProps extends React.HTMLAttributes<HTMLAnchorElement> {
  items: MainNavItem[];
  children?: React.ReactNode;
  onClick(): void;
}

export function MobileNav({ items, children, onClick }: MobileNavProps) {
  useLockBody();

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClick();
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 top-16 z-50 grid h-[calc(100vh-4rem)] grid-flow-row auto-rows-max overflow-auto bg-slate-600/50 p-6 pb-32 shadow-md  md:hidden",
      )}
      onClick={handleBackgroundClick}
    >
      <div className="relative z-20 grid gap-6 rounded-md bg-popover p-4 text-popover-foreground shadow-md animate-in slide-in-from-top-80">
        <Link href="/" className="flex items-center space-x-2">
          <Icons.logo />
          <span className="font-bold">{siteConfig.name}</span>
        </Link>
        <nav className="grid grid-flow-row auto-rows-max text-sm">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              className={cn(
                "flex w-full items-center border-b p-2 text-sm font-medium last:border-none hover:underline",
                item.disabled && "cursor-not-allowed opacity-60",
              )}
              onClick={onClick}
            >
              {item.title}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  );
}
