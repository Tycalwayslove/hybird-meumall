import type { ReactNode } from "react";

type ReplicaShellProps = {
  children: ReactNode;
  className?: string;
};

export function ReplicaShell({ children, className = "bg-[#f5f6f8]" }: ReplicaShellProps) {
  return (
    <main className={`min-h-screen text-[#111111] ${className}`}>
      <div className="mx-auto min-h-screen w-full max-w-[430px] overflow-hidden pb-8">{children}</div>
    </main>
  );
}

type ReplicaBlockProps = {
  className?: string;
  children?: ReactNode;
};

export function ReplicaIcon({ className = "", children }: ReplicaBlockProps) {
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-[12px] ${className}`}>
      {children}
    </span>
  );
}

export function ReplicaImage({ className = "", children }: ReplicaBlockProps) {
  return <div className={`relative overflow-hidden rounded-[8px] ${className}`}>{children}</div>;
}
