import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
  trailing?: ReactNode;
};

export function PageShell({ children, eyebrow, title, description, trailing }: PageShellProps) {
  return (
    <main className="min-h-screen bg-bg text-fg">
      <header className="sticky top-0 z-10 border-b border-border bg-bg/95 px-5 pb-4 pt-[calc(env(safe-area-inset-top)+16px)] backdrop-blur">
        <div className="mx-auto flex max-w-md items-center justify-between gap-3">
          <div className="min-w-0">
            {eyebrow ? <p className="text-xs font-medium uppercase text-muted-fg">{eyebrow}</p> : null}
            <h1 className="truncate text-xl font-semibold">{title}</h1>
            {description ? <p className="mt-1 text-sm leading-5 text-muted-fg">{description}</p> : null}
          </div>
          {trailing}
        </div>
      </header>
      <div className="mx-auto w-full max-w-md px-5 py-5">{children}</div>
    </main>
  );
}

export const H5PageShell = PageShell;
