import { ReplicaShell } from "@/components/commerce/ReplicaShell";

export function HomeSkeleton() {
  return (
    <ReplicaShell>
      <div className="animate-pulse px-3 pt-3" aria-label="首页加载中">
        <div className="flex h-9 items-center gap-2.5">
          <div className="h-7 w-[112px] rounded-[8px] bg-white" />
          <div className="h-9 flex-1 rounded-full bg-white" />
          <div className="size-7 rounded-full bg-white" />
        </div>
        <div className="mt-5 h-24 rounded-[8px] bg-white" />
        <div className="mt-4 grid grid-cols-5 gap-y-3">
          {Array.from({ length: 10 }, (_, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="size-[46px] rounded-[12px] bg-white" />
              <div className="mt-2 h-3 w-12 rounded-full bg-white" />
            </div>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="h-[68px] rounded-[10px] bg-white" />
          <div className="h-[68px] rounded-[10px] bg-white" />
        </div>
        <div className="mt-4 rounded-t-[12px] bg-white px-2 pb-4 pt-3">
          <div className="h-6 w-28 rounded-full bg-[#f5f6f8]" />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="h-[220px] rounded-[7px] bg-[#f5f6f8]" />
            <div className="h-[220px] rounded-[7px] bg-[#f5f6f8]" />
          </div>
        </div>
      </div>
    </ReplicaShell>
  );
}
