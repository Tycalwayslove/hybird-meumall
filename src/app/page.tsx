import Link from "next/link";
import { ReplicaIcon, ReplicaImage, ReplicaShell } from "@/components/commerce/ReplicaShell";
import { featuredProducts } from "@/lib/commerce/mock-data";

const categories = ["热门商品", "生鲜蔬菜", "零食饮料", "保健品", "洗护彩妆", "纸品家清", "母婴用品", "厨房家居", "家电3C", "更多分类"];

const iconColors = [
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]",
  "bg-[#f6f6f8]",
  "bg-[#f7f7f9]"
];

export default function HomePage() {
  const recommendedProducts = featuredProducts.slice(0, 2);

  return (
    <ReplicaShell>
      <div className="px-3 pt-3">
        <header className="flex h-9 items-center gap-2.5">
          <Link href="/" className="flex w-[112px] shrink-0 items-center gap-2 max-[340px]:w-[100px] max-[340px]:gap-1.5">
            <span className="relative inline-flex size-[22px] rounded-[5px] bg-[#75e92e]">
              <span className="absolute left-[5px] top-[4px] h-[14px] w-[3px] rotate-[-28deg] rounded-full bg-white" />
              <span className="absolute left-[11px] top-[3px] h-[16px] w-[3px] rotate-[-28deg] rounded-full bg-white" />
            </span>
            <span className="text-[21px] font-black max-[340px]:text-[18px]">喵呜AI</span>
          </Link>
          <Link
            href="/category"
            className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-full border border-[#78de2d] bg-white px-3 text-[14px] text-[#b7b7b7] max-[340px]:px-2 max-[340px]:text-[12px]"
          >
            <span className="relative size-[15px] shrink-0 rounded-full border-2 border-[#111] after:absolute after:-bottom-[3px] after:-right-[3px] after:h-[7px] after:w-0.5 after:rotate-[-45deg] after:rounded-full after:bg-[#111]" />
            <span className="truncate">请输入关键词</span>
          </Link>
          <Link href="/messages" className="relative flex size-[28px] shrink-0 items-center justify-center">
            <span className="h-[18px] w-[17px] rounded-t-full border-2 border-[#111] border-b-0" />
            <span className="absolute bottom-[4px] h-0.5 w-[19px] rounded-full bg-[#111]" />
            <span className="absolute -right-1 -top-0.5 rounded-full bg-[#ff3f62] px-1 text-[9px] font-bold leading-[12px] text-white">22</span>
          </Link>
        </header>

        <Link href="/promotion" className="mt-5 block">
          <ReplicaImage className="h-24 bg-[linear-gradient(110deg,#dfff55_0%,#f7ff76_40%,#fff8b8_68%,#bcfb6c_100%)]">
            <div className="absolute left-4 top-4 rotate-[-6deg] text-[30px] font-black leading-[28px] text-[#111] drop-shadow-[0_2px_0_rgba(255,255,255,0.9)]">
              续航
              <br />
              一套D计划
            </div>
            <div className="absolute bottom-3 left-5 rounded-full bg-white/80 px-3 py-0.5 text-[11px] font-bold">精绩春光，温腻相伴</div>
            <div className="absolute right-5 top-2 size-[clamp(58px,18vw,70px)] rounded-[22px] bg-[#4ca9ff] shadow-[0_12px_22px_rgba(71,156,255,0.25)]" />
            <div className="absolute right-[clamp(68px,21vw,82px)] top-7 h-7 w-12 rotate-[-24deg] rounded-full bg-[#ffe86b]" />
            <div className="absolute bottom-3 right-12 size-8 rounded-full bg-[#ffb335]" />
          </ReplicaImage>
        </Link>

        <section className="mt-4 grid grid-cols-5 gap-x-0 gap-y-3">
          {categories.map((category, index) => (
            <Link key={category} href="/category" className="flex min-w-0 flex-col items-center">
              <ReplicaIcon className={`size-[clamp(38px,12vw,50px)] ${iconColors[index]}`} />
              <span className="mt-2 whitespace-nowrap text-center text-[12px] leading-[18px] text-[#333]">{category}</span>
            </Link>
          ))}
        </section>

        <section className="mt-4 grid grid-cols-2 gap-2.5">
          <Link href="/seckill" className="relative h-[68px] overflow-hidden rounded-[10px] bg-[linear-gradient(105deg,#fff7f4,#ffe5e8)] px-3 py-3">
            <p className="relative z-10 text-[18px] font-black leading-[22px] max-[340px]:text-[16px]">限时秒杀</p>
            <p className="relative z-10 mt-1 text-[14px] leading-[18px] text-[#6f6f6f] max-[340px]:text-[12px]">让实惠飞一会</p>
            <span className="absolute right-2 top-2 size-[clamp(34px,12vw,46px)] rotate-[-12deg] rounded-[12px] bg-[#ff4b73] shadow-[0_8px_18px_rgba(255,75,115,0.25)]" />
            <span className="absolute right-[clamp(30px,11vw,42px)] top-1 h-4 w-10 rotate-[-18deg] rounded-full bg-[#ff9ab0]" />
          </Link>
          <Link href="/promotion" className="relative h-[68px] overflow-hidden rounded-[10px] bg-[linear-gradient(105deg,#fff9ec,#fff1cc)] px-3 py-3">
            <p className="relative z-10 text-[18px] font-black leading-[22px] max-[340px]:text-[16px]">推广带货</p>
            <p className="relative z-10 mt-1 text-[14px] leading-[18px] text-[#6f6f6f] max-[340px]:text-[12px]">佣金至高50%!</p>
            <span className="absolute right-3 top-3 size-[clamp(34px,11vw,44px)] rounded-full bg-[#ffb03b]" />
            <span className="absolute right-1 top-2 rotate-[16deg] rounded-full bg-[#ff5572] px-1.5 py-1 text-[10px] font-black text-white">免费</span>
          </Link>
        </section>

        <section className="mt-4 rounded-t-[12px] bg-white px-2 pb-4 pt-3">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <span className="flex size-[18px] items-center justify-center rounded-[5px] bg-[#7eed2f]">
                <span className="size-[10px] rounded-full bg-[#111]" />
              </span>
              <h2 className="text-[18px] font-black">为您推荐</h2>
            </div>
            <Link href="/category" className="flex items-center gap-1 text-[14px] font-medium">
              更多
              <span className="flex size-[14px] items-center justify-center rounded-full bg-[#111] text-[9px] text-white">›</span>
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {recommendedProducts.map((product, index) => (
              <Link key={product.id} href={product.href} className="overflow-hidden rounded-[7px] bg-white shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
                <ReplicaImage className="h-[clamp(138px,45vw,174px)] rounded-none bg-[#d7d1c2]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_22%,#f4f4f0_0_22%,transparent_23%),linear-gradient(180deg,#8d9f67_0%,#e6dbc6_100%)]" />
                  <span className="absolute left-1 top-1 rounded-[3px] bg-[#111] px-1 text-[10px] font-bold leading-[16px] text-[#fbf347]">
                    {index === 0 ? "热卖" : "推荐"}
                  </span>
                </ReplicaImage>
                <div className="px-2 pb-2 pt-1.5">
                  <p className="line-clamp-2 text-[14px] font-bold leading-[18px]">夏季纯棉短袖的仙男女同款宽松百搭休闲圆领上...</p>
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <span className="rounded-[3px] bg-[#111] px-1 text-[10px] font-bold leading-[16px] text-white">喵呜达人</span>
                    <span className="rounded-[3px] bg-[#97f341] px-1 text-[10px] font-bold leading-[16px]">V2</span>
                    <span className="text-[11px] text-[#8a8a8a]">已售 2300</span>
                  </div>
                  <div className="mt-1 flex items-end gap-1">
                    <span className="text-[13px] font-bold text-[#ff3f5f]">¥</span>
                    <span className="text-[20px] font-black leading-[22px] text-[#ff3f5f]">{index === 0 ? "368" : "928"}</span>
                    <span className="text-[14px] text-[#a7a7a7] line-through">¥998</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </ReplicaShell>
  );
}
