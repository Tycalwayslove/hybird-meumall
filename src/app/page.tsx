import { HomeScreen } from "@/features/home/HomeScreen";

export default function HomePage() {
  const releaseLabel = process.env.H5_RELEASE_LABEL || process.env.H5_VERSION || "H5 unknown";

  return <HomeScreen releaseLabel={releaseLabel} />;
}
