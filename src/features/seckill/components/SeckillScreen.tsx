import { ProductImagePlaceholder, TransparentNavPage } from "@/design-system";
import { localAssetUrl } from "@/lib/assets";

import { seckillProducts, type SeckillProduct } from "../mock/seckill-page-data";
import styles from "./SeckillScreen.module.css";

export function SeckillScreen() {
  return (
    <TransparentNavPage backHref="/" foreground="light" className={styles.screen} contentClassName={styles.content}>
      <section className={styles.hero} style={{ backgroundImage: `url(${localAssetUrl("seckill.heroBg")})` }} aria-label="限时秒杀">
        <h1 className="sr-only">限时秒杀</h1>
      </section>
      <main className={styles.list} aria-label="秒杀商品列表">
        {seckillProducts.concat(seckillProducts).map((product, index) => (
          <SeckillProductCard key={`${product.id}-${index}`} product={product} />
        ))}
      </main>
    </TransparentNavPage>
  );
}

function SeckillProductCard({ product }: { product: SeckillProduct }) {
  return (
    <article className={styles.card}>
      <ProductImagePlaceholder decorative className={styles.visual} />
      <div className={styles.info}>
        <h2>{product.title}</h2>
        <p className={styles.meta}>
          <span>{product.soldText}</span>
          <span>{product.stockText}</span>
        </p>
        <p className={styles.price}>
          <strong>￥{product.price}</strong>
          <span>￥{product.originalPrice}</span>
        </p>
        <div className={styles.actionPanel}>
          <div>
            <p>剩余时间：{product.countdown}</p>
            <div className={styles.progress}>
              <span style={{ width: `${product.progress}%` }} />
            </div>
          </div>
          <button type="button">
            <strong>秒杀</strong>
            <span>{product.limitText}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
