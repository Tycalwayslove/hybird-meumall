import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { HomeScreen } from "@/features/home/HomeScreen";
import { resolveDebugLoginAccess } from "@/features/debug-login/debug-login-access";

export default async function HomePage() {
  const requestHeaders = await headers();
  const debugLoginAccess = resolveDebugLoginAccess({
    cookieHeader: requestHeaders.get("cookie"),
    headers: requestHeaders
  });

  if (debugLoginAccess.action === "allow") {
    redirect("/debug-login?redirect=/");
  }

  const releaseLabel = process.env.H5_RELEASE_LABEL || process.env.H5_VERSION || "H5 unknown";

  return <HomeScreen releaseLabel={releaseLabel} />;
}
