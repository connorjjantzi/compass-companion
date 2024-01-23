import { type Icons } from "@/components/icons";
import { type NavLink } from "react-router-dom";

export type NavItem = {
  title: string;
  href: string;
  disabled?: boolean;
};

export type MainNavItem = NavItem;

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: keyof typeof Icons;
} & (
  | {
      href: string;
      items?: never;
    }
  | {
      href?: string;
      items: NavLink[];
    }
);

export type SiteConfig = {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter: string;
    discord: string;
  };
};

export type HomepageConfig = {
  mainNav: MainNavItem[];
};

export type AccontConfig = {
  mainNav: MainNavItem[];
  sidebarNav: SidebarNavItem[];
};
