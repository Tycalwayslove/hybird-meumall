"use client";

export default function PromotionError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen bg-[#F7F9FB] px-4 pt-[calc(env(safe-area-inset-top)+48px)] text-[#0F0F0F]">
      <div className="mx-auto flex min-h-[320px] max-w-[430px] flex-col items-center justify-center rounded-[12px] bg-white px-6 text-center">
        <div className="size-12 rounded-[14px] bg-[#FFECE8]" />
        <h1 className="mt-4 text-[17px] font-semibold">页面加载失败</h1>
        <p className="mt-2 text-[13px] leading-5 text-[#86909C]">请稍后重试</p>
        <button className="mt-5 h-10 rounded-[999px] bg-[#0F0F0F] px-5 text-[14px] font-semibold text-white" onClick={reset} type="button">
          重试
        </button>
      </div>
    </main>
  );
}
