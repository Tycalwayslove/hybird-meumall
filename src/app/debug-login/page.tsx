import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { DebugTokenLoginForm } from "@/features/debug-login/DebugTokenLoginForm";
import { normalizeDebugRedirect, resolveDebugLoginAccess } from "@/features/debug-login/debug-login-access";

type DebugLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DebugLoginPage({ searchParams }: DebugLoginPageProps) {
  const requestHeaders = await headers();
  const params = await searchParams;
  const redirectTo = normalizeDebugRedirect(params?.redirect);
  const access = resolveDebugLoginAccess({
    cookieHeader: requestHeaders.get("cookie"),
    headers: requestHeaders
  });

  if (access.action === "not_found") {
    notFound();
  }

  if (access.action === "redirect") {
    redirect(redirectTo);
  }

  return <DebugTokenLoginForm redirectTo={redirectTo} />;
}
