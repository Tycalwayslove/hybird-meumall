export type ProductServiceItem = {
  label: string;
};

export type ProductSelectionItem = {
  label: string;
  value: string;
  href?: string;
  accentPrefix?: string;
};

export type ProductReview = {
  author: string;
  content: string;
};

export type ProductDetailData = {
  id: string;
  title: string;
  subtitle: string;
  talentLevelLabel: string;
  price: string;
  originalPrice: string;
  soldText: string;
  countdown: [string, string, string];
  galleryText: string;
  services: ProductServiceItem[];
  selectionRows: ProductSelectionItem[];
  licenseTags: string[];
  reviewSummary: {
    countText: string;
    positiveRateText: string;
    tags: string[];
    reviews: ProductReview[];
  };
  detail: {
    title: string;
    description: string;
    imageLabel: string;
  };
  consultPlaceholder: string;
  consultHref: string;
  buyHref: string;
};
