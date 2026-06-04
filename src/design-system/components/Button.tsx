import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";

import { cn } from "../utils/cn";

const buttonVariants = {
  primary: "bg-brand-action text-text-primary active:bg-brand-hover",
  secondary: "bg-fill-muted text-text-primary active:bg-fill-strong",
  ghost: "bg-transparent text-text-secondary active:bg-fill-muted",
  danger: "bg-danger text-text-inverse active:bg-danger-strong"
} as const;

type BaseButtonProps = {
  children: ReactNode;
  className?: string;
  variant?: keyof typeof buttonVariants;
};

type ButtonProps = BaseButtonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = BaseButtonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button({ children, className, variant = "primary", type = "button", ...props }: ButtonProps) {
  return (
    <button
      className={cn("inline-flex h-10 items-center justify-center rounded-pill px-4 text-[14px] font-bold leading-none", buttonVariants[variant], className)}
      type={type}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({ children, className, href, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn("inline-flex h-10 items-center justify-center rounded-pill px-4 text-[14px] font-bold leading-none", buttonVariants[variant], className)}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
